import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {openDatabase,get,put,list} from '../db.js';
import {createApp} from '../app.js';
import {importPhotoCatalog} from '../import-product-images.js';
import {photoProducts} from '../photo-catalog.js';

test('photo import covers product photos, preserves stocked inventory and never invents prices',()=>{
  const db=openDatabase(':memory:');put(db,'products',{...get(db,'products',1),price:29,stock:17});
  const result=importPhotoCatalog(db);assert.equal(result.preserved,1);assert.equal(get(db,'products',1).price,29);assert.equal(get(db,'products',1).stock,17);
  assert.equal(get(db,'products',2).archived,true);
  const images=photoProducts.flatMap(p=>p.images.map(x=>x.split('/').pop()));
  const excluded=[203,204,205].map(n=>'IMG-20260921-WA0'+n+'.jpg');
  assert.deepEqual([...images,...excluded].sort(),readdirSync('public/assets/products').filter(n=>n.endsWith('.jpg')).sort());
  assert.equal(new Set(images).size,images.length);
  assert.ok(photoProducts.every(p=>p.price===0&&p.stock===0&&p.pricePending));
  const p=get(db,'products','photo-0133');put(db,'products',{...p,price:30,stock:4,pricePending:false});
  assert.equal(importPhotoCatalog(db).alreadyImported,true);assert.equal(get(db,'products',p.id).price,30);db.close();
});

test('customer reviews, private avatars and safe payment readiness',async t=>{
  const db=openDatabase(':memory:');const app=createApp(db,{gateway:{enabled:false,testMode:false}});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port+'/api';
  async function request(path,method='GET',body,cookie){const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID(),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=response.headers.get('content-type')?.includes('application/json')?await response.json():Buffer.from(await response.arrayBuffer());return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};}
  try{
    const register=async n=>request('/auth/register','POST',{identifier:n+'@features.local',password:'Test-password-123',name:n});
    const a=await register('Alice'),b=await register('Bob');
    await t.test('empty reviews are real, writes require customer identity, edits do not inflate counts',async()=>{
      assert.equal((await request('/products/1/reviews')).data.count,0);
      assert.equal((await request('/products/1/reviews','PUT',{rating:5,comment:'Great product'})).status,401);
      assert.equal((await request('/products/1/reviews','PUT',{rating:8,comment:'Great product'},a.cookie)).status,400);
      let review=await request('/products/1/reviews','PUT',{rating:5,comment:'Great product',userId:b.data.user.id,verifiedPurchase:true},a.cookie);
      assert.equal(review.data.count,1);assert.equal(review.data.reviews[0].name,'Alice');assert.equal(review.data.reviews[0].verifiedPurchase,false);
      await request('/products/1/reviews','PUT',{rating:3,comment:'Updated feedback'},a.cookie);
      await request('/products/1/reviews','PUT',{rating:5,comment:'My own feedback'},b.cookie);
      review=await request('/products/1/reviews');assert.equal(review.data.count,2);assert.equal(review.data.average,4);assert.equal(review.data.ownReview,null);assert.ok(!JSON.stringify(review.data).includes('@features.local'));
      await request('/products/1/reviews','DELETE',undefined,b.cookie);
      assert.equal((await request('/products/1/reviews','GET',undefined,a.cookie)).data.ownReview.comment,'Updated feedback');
      assert.equal((await request('/products/1/reviews')).data.count,1);
    });
    await t.test('profile photos reject non-images and cannot be fetched by another account',async()=>{
      const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1cAAAAASUVORK5CYII=';
      assert.equal((await request('/account/avatar','PUT',{image:Buffer.from('<svg/>').toString('base64')},a.cookie)).status,400);
      const saved=await request('/account/avatar','PUT',{image:png},a.cookie);assert.equal(saved.status,200);assert.match(saved.data.user.avatarUrl,/^\/api\/account\/avatar\?v=/);
      assert.equal((await request('/account/avatar')).status,401);assert.equal((await request('/account/avatar','GET',undefined,b.cookie)).status,404);
      assert.deepEqual((await request('/account/avatar','GET',undefined,a.cookie)).data,Buffer.from(png,'base64'));
      assert.equal((await request('/account/avatar','DELETE',undefined,a.cookie)).data.user.avatarUrl,undefined);
      assert.equal((await request('/account/avatar','GET',undefined,a.cookie)).status,404);
    });
    await t.test('unpriced or archived products cannot be ordered; missing keys never create online orders',async()=>{
      put(db,'products',{...get(db,'products',1),price:20,stock:10,archived:false,pricePending:false});
      const input={items:[{id:1,quantity:1}],paymentMethod:'upi',expectedTotal:30,customerName:'Alice Buyer',customerPhone:'9000000000',deliveryAddress:'Test house, Test road',pincode:'712701'};
      const config=(await request('/catalog')).data.settings;assert.equal(config.checkoutPaymentMode,'online');assert.equal(config.onlinePaymentsEnabled,false);
      for(const paymentMethod of ['upi','card'])assert.equal((await request('/orders','POST',{...input,paymentMethod},a.cookie)).status,503);
      assert.equal(get(db,'products',1).stock,10);
      put(db,'products',{...get(db,'products',1),pricePending:true});assert.equal((await request('/orders/quote','POST',input,a.cookie)).status,409);
      put(db,'products',{...get(db,'products',1),pricePending:false,archived:true});assert.equal((await request('/orders/quote','POST',input,a.cookie)).status,409);
      assert.ok(!(await request('/catalog')).data.products.some(p=>p.id===1));
    });
  }finally{await new Promise(r=>app.close(r));db.close();}
});
