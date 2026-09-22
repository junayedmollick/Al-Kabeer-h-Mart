import { randomUUID } from 'node:crypto';
import { get } from './db.js';
import { publicUser } from './auth.js';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
export async function customerFeatures({ db, path, method, body, user, res, send }) {
  const match = /^\/api\/products\/([^/]+)\/reviews$/.exec(path);
  if (match) {
    const id = decodeURIComponent(match[1]), product = get(db, 'products', id);
    if (!product || product.archived) fail(404, 'Product not found');
    if (method === 'PUT' || method === 'DELETE') {
      if (!user) fail(401, 'Please sign in to leave feedback');
      if (user.role !== 'customer') fail(403, 'Only customer accounts can write reviews');
      if (method === 'DELETE') db.prepare('DELETE FROM reviews WHERE product_id=? AND user_id=?').run(id, user.id);
      else {
        if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) fail(400, 'Choose a rating from 1 to 5');
        if (typeof body.comment !== 'string' || body.comment.trim().length < 3 || body.comment.length > 2000) fail(400, 'Feedback must contain 3–2000 characters');
        db.prepare('INSERT INTO reviews(product_id,user_id,rating,comment,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(product_id,user_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment,updated_at=excluded.updated_at').run(id, user.id, body.rating, body.comment.trim(), new Date().toISOString());
      }
    } else if (method !== 'GET') fail(405, 'Method not allowed');
    const stats = db.prepare('SELECT COUNT(*) count, AVG(rating) average FROM reviews WHERE product_id=?').get(id);
    const rows = db.prepare('SELECT r.*, u.data FROM reviews r JOIN users u ON u.id=r.user_id WHERE product_id=? ORDER BY updated_at DESC LIMIT 100').all(id);
    const verified = db.prepare('SELECT data FROM orders WHERE user_id=?');
    const format = r => ({rating:r.rating, comment:r.comment, updatedAt:r.updated_at, name:JSON.parse(r.data).name || 'Customer', mine:r.user_id===user?.id, verifiedPurchase:verified.all(r.user_id).some(o=>{ const order=JSON.parse(o.data); return order.status==='Delivered' && order.items.some(i=>String(i.id)===id); })});
    const own = user && db.prepare('SELECT r.*, u.data FROM reviews r JOIN users u ON u.id=r.user_id WHERE product_id=? AND user_id=?').get(id,user.id);
    send({ count:stats.count, average:stats.average, reviews:rows.map(format), ownReview:own ? format(own) : null });
    return true;
  }
  if (path !== '/api/account/avatar') return false;
  if (!user) fail(401, 'Please sign in');
  if (method === 'GET') {
    const photo = db.prepare('SELECT image FROM avatars WHERE user_id=?').get(user.id);
    if (!photo) fail(404, 'No profile photo');
    res.setHeader('Content-Type','image/png'); res.end(photo.image); return true;
  }
  if (!['PUT','DELETE'].includes(method)) fail(405, 'Method not allowed');
  let bytes;
  if (method === 'PUT') {
    if (typeof body.image !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image)) fail(400, 'Upload a PNG profile photo');
    bytes = Buffer.from(body.image,'base64');
    if (bytes.length > 180000 || bytes.length < 45 || bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a' || bytes.toString('ascii',12,16) !== 'IHDR' || bytes.readUInt32BE(8)!==13 || bytes.readUInt32BE(16)<1 || bytes.readUInt32BE(20)<1 || bytes.readUInt32BE(16)>512 || bytes.readUInt32BE(20)>512 || bytes.subarray(-8).toString('hex')!=='49454e44ae426082') fail(400,'Use a PNG photo up to 512 × 512 pixels and 180 KB');
  }
  const row = db.prepare('SELECT * FROM users WHERE id=?').get(user.id), data = JSON.parse(row.data);
  db.exec('BEGIN IMMEDIATE');
  try {
    if (bytes) { db.prepare('INSERT INTO avatars(user_id,image) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET image=excluded.image').run(user.id,bytes); data.avatarUrl='/api/account/avatar?v='+randomUUID(); }
    else { db.prepare('DELETE FROM avatars WHERE user_id=?').run(user.id); delete data.avatarUrl; }
    db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(data),user.id);
    db.exec('COMMIT');
  } catch(e) {db.exec('ROLLBACK');throw e;}
  send({user:publicUser({...row,data:JSON.stringify(data)})}); return true;
}
