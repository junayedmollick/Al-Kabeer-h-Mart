import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, get, put } from '../db.js';
import { createApp } from '../app.js';
import { createUser } from '../auth.js';

test('store API: authorization, persistence, catalog, checkout and fulfilment', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'akm-api-')), filename = join(directory, 'test.sqlite');
  let db = openDatabase(filename), server = createApp(db);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = async (path, {method = 'GET', body, cookie, headers = {}} = {}) => {
    const response = await fetch(base + '/api' + path, { method, headers:{'Content-Type':'application/json', ...(cookie ? {Cookie:cookie} : {}), ...headers}, body:body === undefined ? undefined : JSON.stringify(body) });
    return { status:response.status, data:await response.json(), cookie:response.headers.get('set-cookie')?.split(';')[0], headers:response.headers };
  };
  let admin, customer, other, product, order;
  const key = 'test-order-unique-001';
  const orderBody = () => ({items:[{id:product.id,quantity:2,price:0.01}],paymentMethod:'cod',customerName:'Test Customer',customerPhone:'9000000000',deliveryAddress:'Test house, Test road, Test town',pincode:'712701',expectedTotal:110});
  try {
    await t.test('health and seed; no invented customers, orders or inventory', async () => {
      assert.equal((await request('/health')).data.status, 'ok');
      const catalog = (await request('/catalog')).data;
      assert.ok(catalog.products.length > 0); assert.ok(catalog.products.every(p => p.stock === 0));
      assert.equal((await request('/admin/data')).status,401);
      assert.equal(db.prepare('SELECT count(*) AS n FROM users').get().n,0);
    });
    await createUser(db,{identifier:'admin@test.local',password:'Admin-test-secret-123',name:'Test Admin',role:'admin'});
    await t.test('registration ignores injected administrator roles and hashes passwords',async () => {
      const response = await request('/auth/register',{method:'POST',body:{identifier:'customer@test.local',password:'Customer-test-secret',name:'Test Customer',role:'admin'}});
      assert.equal(response.status,200); customer=response.cookie; assert.equal(response.data.user.role,'customer');
      assert.match(response.headers.get('set-cookie'),/HttpOnly/); assert.match(response.headers.get('set-cookie'),/SameSite=Lax/);
      assert.ok(!db.prepare('SELECT password FROM users WHERE identifier=?').get('customer@test.local').password.includes('Customer-test-secret'));
      const r=await request('/auth/register',{method:'POST',body:{identifier:'other@test.local',password:'Other-test-secret',name:'Other Customer'}}); other=r.cookie;
    });
    await t.test('invalid password, duplicate account, role and CSRF checks',async () => {
      assert.equal((await request('/auth/login',{method:'POST',body:{identifier:'admin@test.local',password:'Incorrect-password'}})).status,401);
      assert.equal((await request('/auth/register',{method:'POST',body:{identifier:'customer@test.local',password:'Customer-test-secret',name:'Duplicate'}})).status,409);
      assert.equal((await request('/admin/data',{cookie:customer})).status,403);
      assert.equal((await request('/account',{method:'PATCH',cookie:customer,headers:{Origin:'https://attacker.example'},body:{name:'Hacked'}})).status,403);
      assert.equal((await request('/auth/login',{method:'POST',body:{identifier:'admin@test.local',password:'short'}})).status,400);
      admin=(await request('/auth/login',{method:'POST',body:{identifier:'admin@test.local',password:'Admin-test-secret-123'}})).cookie;
    });
    await t.test('admin CRUD updates public catalog and validates input',async () => {
      const body={name:'Test Product',price:50,oldPrice:60,stock:10,category:'dairy-eggs',weight:'1 pack',image:''};
      assert.equal((await request('/admin/products',{method:'POST',cookie:customer,body})).status,403);
      assert.equal((await request('/admin/products',{method:'POST',cookie:admin,body:{...body,price:-5}})).status,400);
      const created=await request('/admin/products',{method:'POST',cookie:admin,body}); assert.equal(created.status,201); product=created.data;
      assert.equal((await request('/catalog')).data.products.find(p=>p.id===product.id).stock,10);
      assert.equal((await request('/admin/categories/dairy-eggs',{method:'DELETE',cookie:admin})).status,409);
    });
    await t.test('quote uses database prices and delivery fee, not client totals',async () => {
      const r=await request('/orders/quote',{method:'POST',cookie:customer,body:{items:orderBody().items,total:0.01,deliveryFee:0,isVip:true}});
      assert.equal(r.status,200); assert.equal(r.data.total,110); assert.equal(r.data.items[0].price,50);
    });
    await t.test('reject unavailable stock, invalid quantities, unsupported payments and pincodes',async () => {
      for(const quantity of [-1,0,0.5,1001]) assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:{items:[{id:product.id,quantity}]}})).status,400);
      assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:{items:[{id:product.id,quantity:6},{id:product.id,quantity:6}]}})).status,409);
      const post=body=>request('/orders',{method:'POST',cookie:customer,headers:{'Idempotency-Key':key},body});
      assert.equal((await post({...orderBody(),paymentMethod:'card'})).status,400);
      assert.equal((await post({...orderBody(),pincode:'999999'})).status,400);
      assert.equal((await post({...orderBody(),expectedTotal:0.01})).status,409);
      assert.equal(get(db,'products',product.id).stock,10);
    });
    await t.test('order creation is atomic and duplicate retries return the same order',async () => {
      const post=()=>request('/orders',{method:'POST',cookie:customer,headers:{'Idempotency-Key':key},body:orderBody()});
      const responses=await Promise.all([post(),post()]);
      assert.equal(responses[0].status,201); assert.equal(responses[0].data.id,responses[1].data.id); order=responses[0].data;
      assert.equal(order.total,110); assert.equal(get(db,'products',product.id).stock,8);
      assert.equal((await request('/orders',{cookie:customer})).data.length,1);
      assert.equal((await request('/orders',{cookie:other})).data.length,0);
      assert.equal((await request('/orders/'+order.id+'/cancel',{method:'POST',cookie:other,body:{}})).status,404);
    });
    await t.test('admin sees customer orders; fulfilment is one way and COD is collected on delivery',async () => {
      const data=(await request('/admin/data',{cookie:admin})).data; assert.equal(data.orders[0].id,order.id); assert.equal(data.customers.length,2);
      const change=status=>request('/admin/orders/'+order.id+'/status',{method:'PATCH',cookie:admin,body:{status}});
      assert.equal((await change('Delivered')).status,409);
      assert.equal((await change('Out for Delivery')).status,200);
      assert.equal((await request('/orders/'+order.id+'/cancel',{method:'POST',cookie:customer,body:{}})).status,409);
      const delivered=await change('Delivered'); assert.equal(delivered.data.paymentStatus,'Collected');
      assert.equal((await change('Processing')).status,409);
      assert.equal((await change('Cancelled')).status,409);
    });
    await t.test('customer cancellation restores stock once',async () => {
      const r=await request('/orders',{method:'POST',cookie:customer,headers:{'Idempotency-Key':'test-cancel-unique-002'},body:orderBody()});
      assert.equal(get(db,'products',product.id).stock,6);
      for(let i=0;i<2;i++) assert.equal((await request('/orders/'+r.data.id+'/cancel',{method:'POST',cookie:customer,body:{}})).status,200);
      assert.equal(get(db,'products',product.id).stock,8);
    });
    await t.test('coupons enforce expiry, minimum spend and global usage limits',async () => {
      const promo={code:'TEST10',title:'Test coupon',description:'',discountType:'Percentage',discountValue:'10% OFF',minOrder:100,validUntil:'2099-12-31',usageLimit:1,status:'Active'};
      const r=await request('/admin/promotions',{method:'POST',cookie:admin,body:promo}); assert.equal(r.status,201);
      assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:{...orderBody(),couponCode:'TEST10'}})).data.total,100);
      const placed=await request('/orders',{method:'POST',cookie:customer,headers:{'Idempotency-Key':'test-coupon-unique-003'},body:{...orderBody(),couponCode:'TEST10',expectedTotal:100}}); assert.equal(placed.status,201);
      assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:{...orderBody(),couponCode:'TEST10'}})).status,400);
      await request('/orders/'+placed.data.id+'/cancel',{method:'POST',cookie:customer,body:{}});
      assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:{...orderBody(),couponCode:'TEST10'}})).status,200);
    });
    await t.test('profile and address changes remain scoped to signed-in account',async () => {
      const r=await request('/account',{method:'PATCH',cookie:customer,body:{name:'Updated Customer',role:'admin',phone:'9000000000'}}); assert.equal(r.data.user.name,'Updated Customer'); assert.equal(r.data.user.role,'customer');
      const a={id:'address-1',name:'Test Customer',phone:'9000000000',house:'House 1',street:'Test road',city:'Test town',pincode:'712701',isDefault:true};
      assert.equal((await request('/account/addresses',{method:'PUT',cookie:customer,body:{items:[a]}})).status,200);
      assert.equal((await request('/auth/me',{cookie:customer})).data.user.addresses.length,1);
      assert.equal((await request('/auth/me',{cookie:other})).data.user.addresses.length,0);
    });
    await t.test('settings persist and closed store rejects checkout',async () => {
      assert.equal((await request('/admin/settings',{method:'PUT',cookie:admin,body:{deliveryFee:25,acceptingOrders:false}})).status,200);
      assert.equal((await request('/catalog')).data.settings.deliveryFee,25);
      assert.equal((await request('/orders/quote',{method:'POST',cookie:customer,body:orderBody()})).status,409);
      await request('/admin/settings',{method:'PUT',cookie:admin,body:{deliveryFee:10,acceptingOrders:true}});
    });
    await t.test('simultaneous checkout cannot oversell the last unit',async () => {
      put(db,'products',{...get(db,'products',product.id),stock:1});
      const body={...orderBody(),items:[{id:product.id,quantity:1}],expectedTotal:60};
      const results=await Promise.all(['customer-last-unit','other-last-unit'].map((k,i)=>request('/orders',{method:'POST',cookie:i?other:customer,headers:{'Idempotency-Key':k},body})));
      assert.deepEqual(results.map(r=>r.status).sort(),[201,409]); assert.equal(get(db,'products',product.id).stock,0);
    });
    await t.test('password changes invalidate existing sessions; logout clears access',async () => {
      const r=await request('/account/password',{method:'POST',cookie:customer,body:{currentPassword:'Customer-test-secret',newPassword:'New-customer-secret'}}); assert.equal(r.status,200);
      assert.equal((await request('/auth/me',{cookie:customer})).data.user,null); customer=r.cookie;
      assert.equal((await request('/auth/logout',{method:'POST',cookie:customer,body:{}})).status,200);
      assert.equal((await request('/orders',{cookie:customer})).status,401);
    });
    await t.test('restart preserves catalog, orders and settings without reseeding',async () => {
      const count=db.prepare('SELECT count(*) AS n FROM orders').get().n;
      await new Promise(resolve=>server.close(resolve)); db.close(); db=openDatabase(filename);
      assert.equal(db.prepare('SELECT count(*) AS n FROM orders').get().n,count); assert.equal(get(db,'products',product.id).stock,0);
    });
  } finally { if(server.listening) await new Promise(resolve=>server.close(resolve)); db.close(); rmSync(directory,{recursive:true,force:true}); }
});
