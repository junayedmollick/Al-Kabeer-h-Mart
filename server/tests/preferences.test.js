import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase,get,put} from '../db.js';
import {createApp} from '../app.js';
import {createUser} from '../auth.js';

test('payment preferences accept all three methods without a gateway or an online charge',async()=>{
  const db=openDatabase(':memory:');
  put(db,'products',{...get(db,'products',1),price:20,stock:10});
  const app=createApp(db,{paymentMode:'preference',gateway:{enabled:false,testMode:false}});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+app.address().port+'/api';
  async function request(path,method='GET',body,cookie,headers={}) {
    const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};
  }
  try {
    const cookie=(await request('/auth/register','POST',{identifier:'preference@test.local',password:'Test-password-123',name:'Test Buyer'})).cookie;
    await createUser(db,{identifier:'admin@preference.local',password:'Test-password-123',name:'Admin',role:'admin'});
    const admin=(await request('/auth/admin/login','POST',{identifier:'admin@preference.local',password:'Test-password-123'})).cookie;
    assert.equal((await request('/catalog')).data.settings.checkoutPaymentMode,'preference');
    const orders=[];
    for(const method of ['cod','upi','card']) {
      const created=await request('/orders','POST',{items:[{id:1,quantity:1}],paymentMethod:method,expectedTotal:30,customerName:'Test Buyer',customerPhone:'9000000000',deliveryAddress:'Test house, Test road',pincode:'712701',paymentStatus:'Paid'},cookie,{'Idempotency-Key':'preference-order-'+method});
      assert.equal(created.status,201);assert.equal(created.data.paymentCode,method);
      assert.equal(created.data.paymentMode,'preference');assert.equal(created.data.paymentStatus,'Unpaid');assert.equal(created.data.paymentExpiresAt,null);
      assert.equal((await request('/orders/'+created.data.id,'GET',undefined,cookie)).data.paymentCode,method);
      if(method!=='cod') assert.equal((await request('/orders/'+created.data.id+'/payment/start','POST',{},cookie)).status,409);
      orders.push(created.data);
    }
    assert.equal(get(db,'products',1).stock,7);
    const upi=orders[1], endpoint='/admin/orders/'+upi.id+'/payment-record';
    const paid={status:'Paid',reference:'External-receipt-001',confirmed:true};
    assert.equal((await request(endpoint,'PATCH',paid,cookie)).status,403);
    assert.equal((await request(endpoint,'PATCH',{...paid,confirmed:false},admin)).status,400);
    assert.equal((await request(endpoint,'PATCH',paid,admin)).data.paymentStatus,'Paid');
    assert.equal((await request(endpoint,'PATCH',paid,admin)).status,409);
    assert.equal((await request('/orders/'+upi.id+'/cancel','POST',{},cookie)).data.paymentStatus,'Refund required');
    assert.equal((await request(endpoint,'PATCH',{status:'Refunded',reference:'Refund-receipt-001',confirmed:true},admin)).data.paymentStatus,'Refunded');
    assert.equal(get(db,'products',1).stock,8);
    const card=orders[2];
    for(const status of ['Out for Delivery','Delivered']) assert.equal((await request('/admin/orders/'+card.id+'/status','PATCH',{status},admin)).status,200);
    // Delivery cannot invent a verified card payment.
    assert.equal((await request('/orders/'+card.id,'GET',undefined,cookie)).data.paymentStatus,'Unpaid');
    assert.equal((await request('/admin/orders/'+card.id+'/payment-record','PATCH',paid,admin)).data.paymentStatus,'Paid');
  } finally {await new Promise(r=>app.close(r));db.close();}
});
