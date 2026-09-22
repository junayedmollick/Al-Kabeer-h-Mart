import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { openDatabase, get, put } from '../db.js';
import { createApp } from '../app.js';
import { createUser } from '../auth.js';
import { validSignature, razorpayGateway } from '../payments.js';
import { orderWhatsAppUrl } from '../../src/lib/whatsapp.js';

test('signatures reject missing, malformed and altered input', () => {
  const sign = createHmac('sha256','test-secret').update('raw|value').digest('hex');
  assert.equal(validSignature('raw|value',sign,'test-secret'),true);
  assert.equal(validSignature('raw|value ',sign,'test-secret'),false);
  for(const value of ['',undefined,'abc','f'.repeat(64)]) assert.equal(validSignature('raw|value',value,'test-secret'),false);
  assert.equal(razorpayGateway({}).enabled,false);
  assert.equal(razorpayGateway({RAZORPAY_KEY_ID:'key',RAZORPAY_KEY_SECRET:'secret'}).enabled,false);
});

test('admin login, UPI/card verification, webhooks and stock reservations', async t => {
  const db = openDatabase(':memory:');
  put(db,'products',{...get(db,'products',1),stock:30,price:20});
  let createCalls = 0;
  const payments = new Map();
  const sign = value => createHmac('sha256','test-secret').update(value).digest('hex');
  const gateway = {
    enabled:true,key:'rzp_test_fixture',testMode:true,
    async createOrder(order) { createCalls++; await new Promise(r=>setTimeout(r,20)); return {id:'rzp_'+order.id,amount:Math.round(order.total*100),currency:'INR'}; },
    async fetchPayment(id) { return payments.get(id); },
    verify:(order,payment,signature)=>validSignature(order+'|'+payment,signature,'test-secret'),
    verifyWebhook:(raw,signature)=>validSignature(raw,signature,'test-secret'),
  };
  const server = createApp(db,{gateway,paymentMode:'online'});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port+'/api';
  const request=async(path,{method='GET',body,cookie,headers={}}={})=>{
    const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
  };
  const read=id=>JSON.parse(db.prepare('SELECT data FROM orders WHERE id=?').get(id).data);
  const write=order=>db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(order),order.id);
  let customer, admin, other, upi, card;
  let key=0;
  const place=async(method)=>{
    const r=await request('/orders',{method:'POST',cookie:customer,headers:{'Idempotency-Key':'payment-test-'+(++key)},body:{items:[{id:1,quantity:2}],paymentMethod:method,customerName:'Test Buyer',customerPhone:'9000000000',deliveryAddress:'Test house, Test road',pincode:'712701',expectedTotal:50}});
    assert.equal(r.status,201,JSON.stringify(r.data));return r.data;
  };
  const start=(order,cookie=customer)=>request('/orders/'+order.id+'/payment/start',{method:'POST',cookie,body:{}});
  const captured=(order,id='pay_'+order.id)=>({id,order_id:read(order.id).gatewayOrderId,status:'captured',amount:5000,currency:'INR',method:order.paymentCode});
  const webhook=async(entity,event='payment.captured')=>{
    const body={event,payload:event==='refund.processed'?{refund:{entity}}:{payment:{entity}}};
    return request('/payments/webhook',{method:'POST',body,headers:{'x-razorpay-signature':sign(JSON.stringify(body))}});
  };
  try {
    await createUser(db,{identifier:'admin@payments.local',password:'Test-password-123',name:'Admin',role:'admin'});
    customer=(await request('/auth/register',{method:'POST',body:{identifier:'buyer@payments.local',password:'Test-password-123',name:'Buyer'}})).cookie;
    other=(await request('/auth/register',{method:'POST',body:{identifier:'other@payments.local',password:'Test-password-123',name:'Other'}})).cookie;
    await t.test('separate admin sign-in never grants a customer an admin session',async()=>{
      const denied=await request('/auth/admin/login',{method:'POST',body:{identifier:'buyer@payments.local',password:'Test-password-123'}});
      assert.equal(denied.status,401);assert.equal(denied.cookie,undefined);
      const allowed=await request('/auth/admin/login',{method:'POST',body:{identifier:'admin@payments.local',password:'Test-password-123'}});
      assert.equal(allowed.status,200);admin=allowed.cookie;assert.equal(allowed.data.user.role,'admin');
      assert.equal((await request('/admin/data',{cookie:customer})).status,403);
    });
    await t.test('public configuration shows readiness without exposing secrets',async()=>{
      const catalog=(await request('/catalog')).data;
      assert.equal(catalog.settings.onlinePaymentsEnabled,true);assert.equal(catalog.settings.paymentTestMode,true);
      assert.ok(!JSON.stringify(catalog).includes('test-secret'));
    });
    await t.test('UPI reserves stock, limits access, and reuses one gateway order on concurrent retries',async()=>{
      upi=await place('upi');assert.equal(upi.paymentStatus,'Pending');assert.equal(get(db,'products',1).stock,28);
      assert.equal((await start(upi,other)).status,404);
      const starts=await Promise.all([start(upi),start(upi)]);
      assert.equal(starts[0].status,200);assert.equal(starts[0].data.gatewayOrderId,starts[1].data.gatewayOrderId);assert.equal(createCalls,1);
      assert.equal((await request('/admin/orders/'+upi.id+'/status',{method:'PATCH',cookie:admin,body:{status:'Out for Delivery'}})).status,409);
    });
    await t.test('verification requires the signature, correct amount and a captured payment',async()=>{
      const payment=captured(upi);payments.set(payment.id,{...payment,amount:1});
      const body={razorpay_order_id:payment.order_id,razorpay_payment_id:payment.id,razorpay_signature:sign(payment.order_id+'|'+payment.id)};
      const verify=body=>request('/orders/'+upi.id+'/payment/verify',{method:'POST',cookie:customer,body});
      assert.equal((await verify({...body,razorpay_signature:'bad'})).status,400);
      assert.equal((await verify(body)).status,400);
      payments.set(payment.id,{...payment,status:'authorized'});assert.equal((await verify(body)).status,409);
      payments.set(payment.id,payment);assert.equal((await verify(body)).data.paymentStatus,'Paid');
      assert.equal((await verify(body)).data.paymentStatus,'Paid');assert.equal(get(db,'products',1).stock,28);
      for(const status of ['Out for Delivery','Delivered']) assert.equal((await request('/admin/orders/'+upi.id+'/status',{method:'PATCH',cookie:admin,body:{status}})).status,200);
      assert.equal(read(upi.id).paymentStatus,'Paid');
    });
    await t.test('card capture webhook recovers a closed browser and duplicate delivery is harmless',async()=>{
      card=await place('card');await start(card);const payment=captured(card);
      assert.equal((await request('/payments/webhook',{method:'POST',body:{event:'payment.captured',payload:{payment:{entity:payment}}},headers:{'x-razorpay-signature':'bad'}})).status,401);
      assert.equal((await webhook({...payment,method:'upi'})).status,400);
      assert.equal((await webhook(payment)).status,200);assert.equal((await webhook(payment)).status,200);
      assert.equal(read(card.id).paymentStatus,'Paid');assert.equal(get(db,'products',1).stock,26);
    });
    await t.test('paid cancellation requires a refund; signed refund is verified with the provider',async()=>{
      const cancelled=await request('/orders/'+card.id+'/cancel',{method:'POST',cookie:customer,body:{}});
      assert.equal(cancelled.data.paymentStatus,'Refund required');assert.equal(get(db,'products',1).stock,28);
      const payment=captured(card);payments.set(payment.id,{...payment,status:'refunded',amount_refunded:5000});
      assert.equal((await webhook({payment_id:payment.id},'refund.processed')).status,200);
      assert.equal(read(card.id).paymentStatus,'Refunded');
      await webhook(payment);assert.equal(read(card.id).paymentStatus,'Refunded');
      assert.equal(get(db,'products',1).stock,28);
    });
    await t.test('expired reservations release stock once, and late captures require refunds',async()=>{
      const order=await place('card');await start(order);
      write({...read(order.id),paymentExpiresAt:new Date(Date.now()-1000).toISOString()});
      await request('/orders',{cookie:customer});assert.equal(read(order.id).status,'Cancelled');assert.equal(get(db,'products',1).stock,28);
      assert.equal((await start(order)).status,409);
      await webhook(captured(order));assert.equal(read(order.id).paymentStatus,'Refund required');
      await request('/orders',{cookie:customer});assert.equal(get(db,'products',1).stock,28);
    });
    await t.test('refund arriving before capture notification cannot resurrect a paid order',async()=>{
      const order=await place('upi');await start(order);const payment=captured(order);
      payments.set(payment.id,{...payment,status:'refunded',amount_refunded:5000});
      assert.equal((await webhook({payment_id:payment.id},'refund.processed')).status,200);
      assert.equal(read(order.id).status,'Cancelled');assert.equal(read(order.id).paymentStatus,'Refunded');
      await webhook(payment);assert.equal(read(order.id).paymentStatus,'Refunded');assert.equal(get(db,'products',1).stock,28);
    });
    await t.test('WhatsApp message uses stored totals, address and payment state with safe encoding',async()=>{
      const order={...read(upi.id),customerName:'A & B',storeWhatsapp:'+91 90000 00000'};
      const url=new URL(orderWhatsAppUrl(order));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/919000000000');
      const message=url.searchParams.get('text');assert.match(message,/A & B/);assert.match(message,/GRAND TOTAL: ₹50.00/);assert.match(message,/Selected method:\* UPI/);assert.match(message,/Payment status:\* Paid/);assert.match(message,/712701/);
      assert.match(message,/\*ORDER ITEMS · 2 units\*/);assert.match(message,/2 × ₹20.00 = \*₹40.00\*/);assert.match(message,/Items subtotal: ₹40.00/);assert.match(message,/Delivery fee: ₹10.00/);
      assert.equal(orderWhatsAppUrl({...order,storeWhatsapp:'invalid'}),'');
    });
  } finally { await new Promise(r=>server.close(r));db.close(); }
});
