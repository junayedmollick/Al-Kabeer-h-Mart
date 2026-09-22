import { customerFeatures } from './customer-features.js';
import { razorpayGateway } from './payments.js';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { list, get, put, settings, transaction } from './db.js';
import { createUser, publicUser, verifyPassword, sessionUser, startSession, digest, hashPassword } from './auth.js';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
function str(value, field, min = 1, max = 200) { if (typeof value !== 'string' || value.trim().length < min || value.length > max) fail(400, `${field} must contain ${min}–${max} characters`); return value.trim(); }
function num(value, field, min = 0, max = 10000000) { if (value === '' || value === null || typeof value === 'boolean' || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) fail(400, `${field} is invalid`); return Number(value); }
function int(value, field, min = 0, max = 1000000) { const n = num(value, field, min, max); if (!Number.isInteger(n)) fail(400, `${field} must be a whole number`); return n; }
const money = n => Math.round(n * 100) / 100;
const now = () => new Date().toISOString();
const allOrders = db => db.prepare('SELECT data FROM orders ORDER BY rowid DESC').all().map(r => JSON.parse(r.data));
const saveOrder = (db, order) => db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(order), order.id);
function imageUrl(value) {
  if (!value) return '';
  if (typeof value !== 'string') fail(400, 'Image URL must be a string');
  let s = value.trim();
  if (!s) return '';
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/i.test(s)) {
    if (s.length > 1000000) fail(400, 'Image data is too large (max 1 MB)');
    return s;
  }
  if (s.startsWith('assets/') || s.startsWith('public/assets/')) s = '/' + s.replace(/^public\//, '');
  if (s.length > 2000) fail(400, 'Image URL must contain 1–2000 characters');
  if (!(s.startsWith('/') && !s.startsWith('//')) && !/^https?:\/\//i.test(s)) fail(400, 'Image must be an HTTP/HTTPS URL, local path or valid photo');
  return s;
}
function normalizeIdentifier(value) { const s = str(value, 'Email or phone', 5, 254).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && !/^\+?[0-9]{10,13}$/.test(s)) fail(400, 'Enter a valid email address or phone number'); return s; }
function validateCatalog(db, kind, data, id) {
  const old = get(db, kind, id) || {};
  if (kind === 'products') {
    const category = str(data.category, 'Category');
    if (!list(db, 'categories').some(c => c.slug === category)) fail(400, 'Choose an existing category');
    const p = { ...old, id: old.id ?? id, name: str(data.name, 'Product name'), category, price: money(num(data.price, 'Price', 0.01)), oldPrice: money(num(data.oldPrice ?? data.price, 'Original price')), stock: int(data.stock, 'Stock'), image: imageUrl(data.image) };
    for (const field of ['weight', 'subcategory', 'tag', 'deliveryTime']) p[field] = str(data[field] || '', field, 0);
    p.description = str(data.description ?? old.description ?? '', 'Description', 0, 3000);
    p.pricePending = false;
    return p;
  }
  if (kind === 'categories') {
    const slug = old.slug || str(data.slug || id, 'Slug');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(400, 'Use lowercase letters, numbers and hyphens for the category slug');
    if (!Array.isArray(data.subcategories) || data.subcategories.length > 50) fail(400, 'Subcategories must be a list');
    const c = { ...old, id: old.id ?? id, slug, name: str(data.name, 'Category name'), image: imageUrl(data.image), subcategories: data.subcategories.map(s => str(s, 'Subcategory')), iconName: old.iconName || 'ShoppingBag', bannerGradient: old.bannerGradient || 'from-emerald-700 to-teal-800' };
    for (const f of ['bengaliName', 'hindiName', 'tagline', 'shortDesc']) c[f] = str(data[f] || '', f, 0, 500);
    return c;
  }
  const code = str(data.code, 'Coupon code', 2, 40).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(code)) fail(400, 'Coupon code must use letters, numbers, underscores or hyphens');
  if (list(db, kind).some(p => p.code === code && String(p.id) !== String(id))) fail(409, 'Coupon code already exists');
  const amount = Number(String(data.discountValue).replace(/[^\d.]/g, ''));
  if (!['Flat Discount', 'Percentage'].includes(data.discountType)) fail(400, 'Use Flat Discount or Percentage');
  num(amount, 'Discount', 0.01, data.discountType === 'Percentage' ? 100 : 100000);
  if (!Number.isFinite(Date.parse(data.validUntil))) fail(400, 'Enter a valid expiry date');
  return { id, code, title: str(data.title, 'Title'), description: str(data.description || '', 'Description', 0, 1000), discountType: data.discountType, discountValue: String(data.discountValue), amount, minOrder: num(data.minOrder, 'Minimum order'), usageLimit: int(data.usageLimit ?? 1000, 'Usage limit', 1), usageCount: old.usageCount || 0, status: data.status === 'Expired' ? 'Expired' : 'Active', validUntil: data.validUntil, badge: 'Offer' };
}
function quote(db, body) {
  const config = settings(db);
  if (!config.acceptingOrders) fail(409, 'The store is currently closed for orders');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) fail(400, 'Add 1–100 items to your order');
  const quantities = new Map();
  for (const item of body.items) { if (!item || typeof item !== 'object' || item.id === undefined) fail(400, 'Invalid order item'); const id = String(item.id); quantities.set(id, (quantities.get(id) || 0) + int(item.quantity, 'Quantity', 1, 100)); }
  const items = [...quantities].map(([id, quantity]) => {
    const product = get(db, 'products', id);
    if (!product || product.archived || product.pricePending || product.price <= 0) fail(409, 'A product in your cart is no longer available');
    if (quantity > product.stock) fail(409, `${product.name}: only ${product.stock} in stock`);
    return { id: product.id, name: product.name, image: product.image, weight: product.weight, price: product.price, quantity };
  });
  const subtotal = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  if (subtotal < config.minimumOrder) fail(400, `Minimum order is ₹${config.minimumOrder}`);
  let discount = 0, promotion = null;
  if (body.couponCode) {
    promotion = list(db, 'promotions').find(p => p.code === String(body.couponCode).trim().toUpperCase());
    if (!promotion || promotion.status !== 'Active' || Date.parse(promotion.validUntil) + 86400000 <= Date.now() || promotion.usageCount >= promotion.usageLimit) fail(400, 'Coupon is invalid, expired or fully used');
    if (subtotal < promotion.minOrder) fail(400, `This coupon requires an order of ₹${promotion.minOrder}`);
    discount = money(Math.min(subtotal, promotion.discountType === 'Percentage' ? subtotal * promotion.amount / 100 : promotion.amount));
  }
  return { items, subtotal, discount, deliveryFee: config.deliveryFee, total: money(subtotal - discount + config.deliveryFee), couponCode: promotion?.code || '', promotionId: promotion?.id };
}

export function createApp(db, { origin = process.env.APP_ORIGIN || 'http://127.0.0.1:3000', production = process.env.NODE_ENV === 'production', distPath = resolve('dist'), gateway = razorpayGateway(), paymentMode = process.env.CHECKOUT_PAYMENT_MODE || 'online' } = {}) {
  if (production && !origin.startsWith('https://')) throw new Error('Production APP_ORIGIN must use HTTPS');
  if (!['preference','online'].includes(paymentMode)) throw new Error('Invalid CHECKOUT_PAYMENT_MODE');
  if (production && paymentMode === 'online' && gateway.enabled && gateway.testMode) throw new Error('Use live Razorpay keys for production; test keys cannot collect real payments');
  const limits = new Map(), paymentStarts = new Map();
  return createServer(async (req, res) => {
    const send = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    try {
      const url = new URL(req.url, origin), path = url.pathname, method = req.method;
      if (!path.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(method)) fail(405, 'Method not allowed');
        let file = resolve(distPath, '.' + decodeURIComponent(path));
        if (!file.startsWith(resolve(distPath) + sep)) file = resolve(distPath, 'index.html');
        try { if (!(await stat(file)).isFile()) file = resolve(distPath, 'index.html'); } catch { file = resolve(distPath, 'index.html'); }
        const content = await readFile(file).catch(() => fail(404, 'Build the frontend with npm run build first'));
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2' })[extname(file)] || 'application/octet-stream');
        res.end(method === 'HEAD' ? undefined : content); return;
      }
      res.setHeader('Cache-Control', 'no-store');
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (req.headers.origin && req.headers.origin !== origin) fail(403, 'Request origin is not allowed');
        if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site requests are not allowed');
        if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Send application/json');
      }
      let body = {}, rawBody = Buffer.alloc(0);
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 2097152) fail(413, 'Request too large'); chunks.push(chunk); }
        rawBody = Buffer.concat(chunks);
        try { body = JSON.parse(rawBody.toString('utf8') || '{}'); } catch { fail(400, 'Invalid JSON'); }
        if (!body || Array.isArray(body) || typeof body !== 'object') fail(400, 'Expected a JSON object');
      }
      // Reservations expire even after a server restart; a late capture requires a refund.
      transaction(db, () => {
        for (const order of allOrders(db)) if (order.paymentStatus === 'Pending' && order.status === 'Processing' && Date.parse(order.paymentExpiresAt) <= Date.now()) changeStatus(db, order, 'Cancelled');
      });
      if (path === '/api/payments/webhook' && method === 'POST') {
        if (!gateway.verifyWebhook(rawBody, req.headers['x-razorpay-signature'])) fail(401, 'Invalid webhook signature');
        const payment = body.payload?.payment?.entity;
        if (body.event === 'payment.captured' && payment) recordPayment(db, payment);
        if (body.event === 'refund.processed') {
          const refund = body.payload?.refund?.entity;
          if (refund?.payment_id) {
            const verified = await gateway.fetchPayment(refund.payment_id);
            const order = allOrders(db).find(o => o.gatewayOrderId && o.gatewayOrderId === verified.order_id);
            if (order) {
              transaction(db, () => {
                const fresh = readOrder(db, order.id);
                if (verified.id !== refund.payment_id || verified.amount !== Math.round(fresh.total * 100) || verified.currency !== 'INR' || verified.method !== fresh.paymentCode || !Number.isInteger(verified.amount_refunded) || verified.amount_refunded <= 0) fail(400, 'Refund does not match this order');
                if (fresh.gatewayPaymentId && fresh.gatewayPaymentId !== verified.id) fail(400, 'Refund payment ID does not match');
                fresh.gatewayPaymentId = verified.id;
                fresh.paymentStatus = verified.amount_refunded >= Math.round(fresh.total * 100) ? 'Refunded' : 'Partially refunded';
                if (fresh.status === 'Processing' || fresh.status === 'Out for Delivery') changeStatus(db, fresh, 'Cancelled');
                saveOrder(db, fresh);
              });
            }
          }
        }
        return send({ok:true});
      }
      const user = sessionUser(db, req);
      if (path === '/api/health' && method === 'GET') { db.prepare('SELECT 1').get(); return send({ status: 'ok', database: 'connected' }); }
      if (path === '/api/catalog' && method === 'GET') {
        const s = settings(db);
        return send({ products: list(db, 'products').filter(p=>!p.archived), categories: list(db, 'categories').filter(c=>!c.archived), settings: {checkoutPaymentMode:paymentMode, onlinePaymentsEnabled:paymentMode === 'online' && gateway.enabled, paymentTestMode:gateway.testMode, ...Object.fromEntries(['storeName','tagline','address','phone','whatsapp','email','deliveryFee','minimumOrder','servicePincodes','acceptingOrders'].map(k => [k, s[k]]))} });
      }
      if (['/api/auth/login', '/api/auth/register', '/api/auth/admin/login'].includes(path) && method === 'POST') {
        const ip = req.socket.remoteAddress, key = `auth:${ip}`, bucket = limits.get(key);
        if (bucket && bucket.until > Date.now() && bucket.count >= 20) fail(429, 'Too many attempts. Try again in 15 minutes');
        if (limits.size > 10000) for (const [k, v] of limits) if (v.until < Date.now()) limits.delete(k);
        limits.set(key, { until: bucket?.until > Date.now() ? bucket.until : Date.now() + 900000, count: bucket?.until > Date.now() ? bucket.count + 1 : 1 });
        const identifier = normalizeIdentifier(body.identifier), password = str(body.password, 'Password', 8, 128);
        let account;
        if (path.endsWith('register')) {
          if (db.prepare('SELECT id FROM users WHERE identifier=?').get(identifier)) fail(409, 'An account with this email or phone already exists');
          try { account = await createUser(db, { identifier, password, name: str(body.name, 'Name', 2, 100) }); }
          catch (e) { if (e.message.includes('UNIQUE')) fail(409, 'Account already exists'); throw e; }
        } else {
          const row = db.prepare('SELECT * FROM users WHERE identifier=?').get(identifier);
          if (!row || !(await verifyPassword(password, row.password))) fail(401, 'Incorrect email/phone or password');
          if (path === '/api/auth/admin/login' && row.role !== 'admin') fail(401, 'Incorrect administrator credentials');
          account = publicUser(row);
        }
        startSession(db, res, account, production, body.rememberMe !== false); return send({ user: account });
      }
      if (path === '/api/auth/me' && method === 'GET') return send({ user });
      if (path === '/api/auth/logout' && method === 'POST') {
        const token = /(?:^|;\s*)akm_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
        if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));
        res.setHeader('Set-Cookie', `akm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${production ? '; Secure' : ''}`); return send({ ok: true });
      }
      if (await customerFeatures({db,path,method,body,user,res,send})) return;
      if (!user) fail(401, 'Please sign in');
      if (path === '/api/account' && method === 'PATCH') {
        const row = db.prepare('SELECT * FROM users WHERE id=?').get(user.id), data = JSON.parse(row.data);
        for (const field of ['name', 'email', 'phone', 'address']) if (body[field] !== undefined) data[field] = str(body[field], field, field === 'name' ? 2 : 0, 500);
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail(400, 'Invalid email');
        if (data.phone && !/^\+?[\d\s-]{10,16}$/.test(data.phone)) fail(400, 'Invalid phone');
        db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(data), user.id); return send({ user: publicUser({ ...row, data: JSON.stringify(data) }) });
      }
      if (path === '/api/account/password' && method === 'POST') {
        const row = db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
        if (!(await verifyPassword(str(body.currentPassword, 'Current password', 8, 128), row.password))) fail(400, 'Current password is incorrect');
        const hash = await hashPassword(str(body.newPassword, 'New password', 8, 128));
        transaction(db, () => { db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, user.id); db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id); });
        startSession(db, res, user, production); return send({ ok: true });
      }
      if (path === '/api/account/addresses' && method === 'PUT') {
        if (!Array.isArray(body.items) || body.items.length > 20) fail(400, 'Save up to 20 addresses');
        if (body.items.some(a => !a || typeof a !== 'object')) fail(400, 'Invalid address');
        const addresses = body.items.map(a => ({ id: str(String(a.id), 'Address ID'), type: ['home','work','other'].includes(a.type) ? a.type : 'home', name: str(a.name, 'Name'), phone: str(a.phone, 'Phone', 10, 16), house: str(a.house, 'House'), street: str(a.street, 'Street'), city: str(a.city, 'City'), landmark: str(a.landmark || '', 'Landmark', 0), pincode: str(a.pincode, 'Pincode', 6, 6), isDefault: !!a.isDefault }));
        if (addresses.some(a => !/^\d{6}$/.test(a.pincode) || !/^\+?[\d\s-]{10,16}$/.test(a.phone))) fail(400, 'Invalid phone or pincode');
        const defaultIndex = Math.max(0, addresses.findIndex(a => a.isDefault));
        addresses.forEach((a, i) => a.isDefault = i === defaultIndex);
        const row = db.prepare('SELECT * FROM users WHERE id=?').get(user.id), data = { ...JSON.parse(row.data), addresses };
        db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(data), user.id); return send({ user: publicUser({ ...row, data: JSON.stringify(data) }) });
      }
      if (path === '/api/orders/quote' && method === 'POST') return send(quote(db, body));
      if (path === '/api/orders' && method === 'GET') return send(db.prepare('SELECT data FROM orders WHERE user_id=? ORDER BY rowid DESC').all(user.id).map(r => JSON.parse(r.data)));
      if (path === '/api/orders' && method === 'POST') {
        const requestKey = str(req.headers['idempotency-key'], 'Order request ID', 10, 100);
        return send(transaction(db, () => {
          const previous = db.prepare('SELECT data FROM orders WHERE user_id=? AND request_key=?').get(user.id, requestKey);
          if (previous) return JSON.parse(previous.data);
          if (!['cod','upi','card'].includes(body.paymentMethod)) fail(400, 'Choose cash on delivery, UPI or card');
          if (paymentMode === 'online' && body.paymentMethod !== 'cod' && !gateway.enabled) fail(503, 'Online payments are not configured. Choose cash on delivery.');
          const customerName = str(body.customerName, 'Name', 2, 100), customerPhone = str(body.customerPhone, 'Phone', 10, 16), deliveryAddress = str(body.deliveryAddress, 'Delivery address', 8, 1000), pincode = str(body.pincode, 'Pincode', 6, 6);
          if (!/^\+?[\d\s-]{10,16}$/.test(customerPhone) || !/^\d{6}$/.test(pincode)) fail(400, 'Invalid phone or pincode');
          const config = settings(db);
          if (!config.servicePincodes.includes(pincode)) fail(400, 'We do not deliver to this pincode yet');
          const pricing = quote(db, body);
          if (body.expectedTotal !== pricing.total) fail(409, 'Your total changed. Review the updated total and place your order again');
          if (paymentMode === 'online' && body.paymentMethod !== 'cod' && pricing.total < 1) fail(400, 'Online payment requires a total of at least ₹1');
          const order = { ...pricing, id: `AKM-${randomUUID().slice(0, 12).toUpperCase()}`, userId: user.id, createdAt: now(), date: new Date().toLocaleDateString('en-GB'), status: 'Processing', statusType: 'active', customerName, customerPhone, deliveryAddress, pincode, paymentMode, paymentCode: body.paymentMethod, paymentMethod: {cod:'Cash on Delivery',upi:'UPI',card:'Card payment'}[body.paymentMethod], paymentStatus: paymentMode === 'preference' || body.paymentMethod === 'cod' ? 'Unpaid' : 'Pending', paymentExpiresAt: paymentMode === 'preference' || body.paymentMethod === 'cod' ? null : new Date(Date.now() + 30 * 60000).toISOString(), storeWhatsapp: config.whatsapp, estDelivery: 'Confirmed by store', rider: '', history: [{ status: 'Processing', at: now() }] };
          for (const item of order.items) { const p = get(db, 'products', item.id); put(db, 'products', { ...p, stock: p.stock - item.quantity }); }
          if (pricing.promotionId) { const p = get(db, 'promotions', pricing.promotionId); put(db, 'promotions', { ...p, usageCount: p.usageCount + 1 }); }
          db.prepare('INSERT INTO orders VALUES(?,?,?,?)').run(order.id, user.id, requestKey, JSON.stringify(order));
          return order;
        }), 201);
      }
      const detailMatch = path.match(/^\/api\/orders\/([^/]+)$/);
      if (detailMatch && method === 'GET') {
        const order = readOrder(db, decodeURIComponent(detailMatch[1]));
        if (!order || order.userId !== user.id) fail(404, 'Order not found');
        return send(order);
      }
      const paymentMatch = path.match(/^\/api\/orders\/([^/]+)\/payment\/(start|verify)$/);
      if (paymentMatch && method === 'POST') {
        const order = readOrder(db, paymentMatch[1]);
        if (!order || order.userId !== user.id) fail(404, 'Order not found');
        if (!['upi','card'].includes(order.paymentCode)) fail(400, 'This order uses cash on delivery');
        if (paymentMatch[2] === 'verify') {
          const paymentId = str(body.razorpay_payment_id, 'Payment ID', 5, 100);
          if (!order.gatewayOrderId || body.razorpay_order_id !== order.gatewayOrderId || !gateway.verify(order.gatewayOrderId, paymentId, body.razorpay_signature)) fail(400, 'Payment signature is invalid');
          const payment = await gateway.fetchPayment(paymentId);
          if (payment.id !== paymentId || payment.order_id !== order.gatewayOrderId) fail(400, 'Payment does not match this order');
          recordPayment(db, payment);
          return send(readOrder(db, order.id));
        }
        if (paymentMode !== 'online' || order.paymentMode === 'preference') fail(409, 'This store records payment preferences only; no payment is collected on the website');
        if (order.paymentStatus === 'Paid') return send({order});
        if (order.status !== 'Processing' || order.paymentStatus !== 'Pending') fail(409, 'This order is no longer awaiting payment');
        if (!gateway.enabled) fail(503, 'Online payments are not configured');
        if (!order.gatewayOrderId) {
          if (!paymentStarts.has(order.id)) {
            paymentStarts.set(order.id, (async () => {
              const created = await gateway.createOrder(order);
              if (!created.id || created.amount !== Math.round(order.total * 100) || created.currency !== 'INR') fail(502, 'Invalid payment provider response');
              transaction(db, () => {const fresh = readOrder(db, order.id); fresh.gatewayOrderId = created.id; saveOrder(db, fresh);});
            })().finally(() => paymentStarts.delete(order.id)));
          }
          await paymentStarts.get(order.id);
        }
        const fresh = readOrder(db, order.id);
        if (fresh.status !== 'Processing' || Date.parse(fresh.paymentExpiresAt) <= Date.now()) fail(409, 'Payment reservation expired. Place a new order.');
        return send({key:gateway.key,gatewayOrderId:fresh.gatewayOrderId,amount:Math.round(fresh.total * 100),currency:'INR'});
      }
      const cancelMatch = path.match(/^\/api\/orders\/([^/]+)\/cancel$/);
      if (cancelMatch && method === 'POST') {
        return send(transaction(db, () => {
          const row = db.prepare('SELECT data FROM orders WHERE id=? AND user_id=?').get(cancelMatch[1], user.id);
          if (!row) fail(404, 'Order not found');
          const order = JSON.parse(row.data);
          if (order.status === 'Cancelled') return order;
          if (order.status !== 'Processing') fail(409, 'This order can no longer be cancelled');
          return changeStatus(db, order, 'Cancelled');
        }));
      }
      if (!path.startsWith('/api/admin/')) fail(404, 'API route not found');
      if (user.role !== 'admin') fail(403, 'Administrator access required');
      if (method !== 'GET') db.prepare('INSERT INTO audit(user_id,action,created_at) VALUES(?,?,?)').run(user.id, `${method} ${path}`, now());
      if (path === '/api/admin/data' && method === 'GET') {
        const orders = allOrders(db), users = db.prepare("SELECT * FROM users WHERE role='customer'").all().map(publicUser);
        const customers = users.map(u => { const os = orders.filter(o => o.userId === u.id); return { ...u, totalOrders: os.length, totalSpent: money(os.filter(o => o.status === 'Delivered').reduce((s,o) => s + o.total, 0)), status: 'Active', joinDate: u.createdAt, lastOrder: os[0]?.date || 'No orders', joinedDate: u.createdAt, vipExpiry: null }; });
        return send({ orders, customers, promotions: list(db, 'promotions'), settings: settings(db), notificationPreferences: user.notificationPreferences || {read:[],hidden:[]} });
      }
      if (path === '/api/admin/notifications/preferences' && method === 'PUT') {
        for (const key of ['read','hidden']) if(!Array.isArray(body[key]) || body[key].length > 500 || body[key].some(id => typeof id !== 'string' || id.length > 100)) fail(400, 'Invalid notification preferences');
        const row = db.prepare('SELECT data FROM users WHERE id=?').get(user.id);
        const data = {...JSON.parse(row.data), notificationPreferences:{read:body.read,hidden:body.hidden}};
        db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(data),user.id); return send(data.notificationPreferences);
      }
      const catalogMatch = path.match(/^\/api\/admin\/(products|categories|promotions)(?:\/([^/]+))?$/);
      if (catalogMatch) {
        const [, kind, rawId] = catalogMatch, id = rawId ? decodeURIComponent(rawId) : kind === 'categories' ? body.slug : randomUUID();
        if (method === 'GET') return send(list(db, kind));
        if (method === 'POST' || method === 'PUT') {
          if (method === 'PUT' && (!rawId || !get(db, kind, id))) fail(404, 'Item not found');
          if (method === 'PUT' && body.revision !== get(db, kind, id).revision) fail(409, 'This item changed since you opened it. Close the form, refresh and try again');
          if (method === 'POST' && get(db, kind, id)) fail(409, 'Item already exists');
          const item = validateCatalog(db, kind, body, id); put(db, kind, item); return send(item, method === 'POST' ? 201 : 200);
        }
        if (method === 'DELETE' && rawId) {
          if (!get(db, kind, id)) fail(404, 'Item not found');
          if (kind === 'categories' && list(db, 'products').some(p => p.category === get(db, kind, id).slug)) fail(409, 'Move or delete products in this category first');
          db.prepare('DELETE FROM catalog WHERE kind=? AND id=?').run(kind, id); return send({ ok: true });
        }
      }
      const paymentRecordMatch = path.match(/^\/api\/admin\/orders\/([^/]+)\/payment-record$/);
      if (paymentRecordMatch && method === 'PATCH') return send(transaction(db, () => {
        const order = readOrder(db, paymentRecordMatch[1]);
        if (!order) fail(404, 'Order not found');
        if (order.paymentMode !== 'preference') fail(409, 'Gateway payments must be verified by the payment provider');
        if (body.confirmed !== true) fail(400, 'Confirm you have verified the payment or refund');
        const reference = str(body.reference, 'Receipt or transaction reference', 4, 100);
        if (body.status === 'Paid') {
          if (order.status === 'Cancelled' || order.paymentStatus !== 'Unpaid') fail(409, 'This order cannot be marked paid');
          order.paidAt = now();
        } else if (body.status === 'Refunded') {
          if (order.paymentStatus !== 'Refund required') fail(409, 'This order is not awaiting a refund');
          order.refundedAt = now();
        } else fail(400, 'Choose Paid or Refunded');
        order.paymentStatus = body.status;
        order.paymentRecord = {reference, verifiedBy:user.id, at:now()};
        saveOrder(db, order); return order;
      }));
      const statusMatch = path.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
      if (statusMatch && method === 'PATCH') return send(transaction(db, () => {
        const row = db.prepare('SELECT data FROM orders WHERE id=?').get(statusMatch[1]); if (!row) fail(404, 'Order not found');
        return changeStatus(db, JSON.parse(row.data), body.status);
      }));
      if (path === '/api/admin/settings' && method === 'PUT') {
        const s = settings(db);
        for (const key of ['storeName','tagline','bengaliSlogan','address','phone','whatsapp','email','currency','deliveryRadiusKm','adminName','adminRole','adminEmail']) if (body[key] !== undefined) s[key] = str(body[key], key, 0, 1000);
        for (const key of ['orderAlerts','stockAlerts','promoAlerts','soundAlerts','acceptingOrders']) if (body[key] !== undefined) { if (typeof body[key] !== 'boolean') fail(400, `Invalid ${key}`); s[key] = body[key]; }
        for (const key of ['deliveryFee','minimumOrder']) if (body[key] !== undefined) s[key] = money(num(body[key], key, 0));
        if (body.servicePincodes !== undefined) { if (!Array.isArray(body.servicePincodes) || !body.servicePincodes.length || body.servicePincodes.length > 500 || body.servicePincodes.some(p => !/^\d{6}$/.test(p))) fail(400, 'Enter valid six-digit service pincodes'); s.servicePincodes = [...new Set(body.servicePincodes)]; }
        db.prepare('UPDATE settings SET data=? WHERE id=1').run(JSON.stringify(s)); return send(s);
      }
      fail(404, 'API route not found');
    } catch (error) { if (!error.status) console.error(error); if (!res.headersSent) send({ error: error.status ? error.message : 'Unexpected server error' }, error.status || 500); else res.end(); }
  });
}
function changeStatus(db, order, status) {
  if (order.status === status) return order;
  const allowed = { Processing: ['Out for Delivery', 'Cancelled'], 'Out for Delivery': ['Delivered', 'Cancelled'], Delivered: [], Cancelled: [] };
  if (!allowed[order.status]?.includes(status)) fail(409, `Cannot change ${order.status} to ${status}`);
  if (status !== 'Cancelled' && order.paymentMode !== 'preference' && ['upi','card'].includes(order.paymentCode) && order.paymentStatus !== 'Paid') fail(409, 'Verify online payment before dispatching this order');
  if (status === 'Cancelled') {
    if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refund required';
    if (order.paymentStatus === 'Pending') order.paymentStatus = 'Not paid';
    for (const item of order.items) { const p = get(db, 'products', item.id); if (p) put(db, 'products', { ...p, stock: p.stock + item.quantity }); }
    if (order.promotionId) { const p = get(db, 'promotions', order.promotionId); if (p) put(db, 'promotions', { ...p, usageCount: Math.max(0, p.usageCount - 1) }); }
    order.cancelledAt = now();
  }
  if (status === 'Delivered') { order.deliveredAt = now(); if (!['upi','card'].includes(order.paymentCode)) order.paymentStatus = 'Collected'; }
  order.status = status; order.statusType = ['Cancelled', 'Delivered'].includes(status) ? 'history' : 'active';
  order.history.push({ status, at: now() }); saveOrder(db, order); return order;
}

function readOrder(db, id) {
  const row = db.prepare('SELECT data FROM orders WHERE id=?').get(id);
  return row ? JSON.parse(row.data) : null;
}
function recordPayment(db, payment) {
  return transaction(db, () => {
    const order = allOrders(db).find(o => o.gatewayOrderId && o.gatewayOrderId === payment.order_id);
    if (!order) return;
    if (!payment.id || payment.amount !== Math.round(order.total * 100) || payment.currency !== 'INR' || payment.method !== order.paymentCode) fail(400, 'Payment amount or method does not match the order');
    if (payment.status !== 'captured') fail(409, 'Payment is awaiting confirmation. Check My Orders shortly; do not pay again if money was deducted.');
    if (order.gatewayPaymentId) {
      if (order.gatewayPaymentId !== payment.id) fail(409, 'A different payment was already recorded');
      return order;
    }
    order.gatewayPaymentId = payment.id;
    order.paymentStatus = order.status === 'Cancelled' ? 'Refund required' : 'Paid';
    order.paidAt = now();
    saveOrder(db, order); return order;
  });
}
