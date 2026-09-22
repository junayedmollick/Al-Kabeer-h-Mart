import {openDatabase,list,put,transaction} from './db.js';
import {photoCategories,photoProducts} from './photo-catalog.js';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {backup} from 'node:sqlite';

export function importPhotoCatalog(db){
  const key='photo-catalog-20260921-v1';
  if(db.prepare('SELECT value FROM metadata WHERE key=?').get(key))return {alreadyImported:true};
  return transaction(db,()=>{
    const existing=list(db,'products');
    // Preserve stocked products and their prices. Keep old sample records for order history.
    const preserved=existing.filter(p=>p.stock>0);
    for(const p of existing)if(p.stock<=0)put(db,'products',{...p,archived:true});
    for(const c of list(db,'categories'))put(db,'categories',{...c,archived:!preserved.some(p=>p.category===c.slug)});
    for(const c of photoCategories){const old=list(db,'categories').find(x=>x.slug===c.slug);put(db,'categories',{...c,id:old?.id||c.id,archived:false});}
    let matched=0;
    for(const p of photoProducts){
      // Only exact names AND known pack sizes may inherit selling prices.
      const old=existing.find(x=>p.weight && x.weight===p.weight && x.name.toLowerCase()===p.name.toLowerCase());
      put(db,'products',old?{...old,...p,id:old.id,price:old.price,oldPrice:old.oldPrice,stock:old.stock,pricePending:false,archived:false}:p);
      if(old)matched++;
    }
    const summary={created:photoProducts.length,matched,preserved:preserved.length,unpriced:photoProducts.length-matched};
    db.prepare('INSERT INTO metadata VALUES(?,?)').run(key,JSON.stringify(summary));return summary;
  });
}
if(process.argv[1] && resolve(process.argv[1])===resolve('server/import-product-images.js')){
  for(const p of photoProducts)for(const image of p.images)if(!existsSync(resolve('public','.'+image)))throw new Error('Missing photo: '+image);
  const db=openDatabase();mkdirSync('data/backups',{recursive:true});
  const file='data/backups/before-photo-catalog-'+Date.now()+'.sqlite';await backup(db,file);
  console.log('Backup: '+file);console.log(importPhotoCatalog(db));db.close();
}
