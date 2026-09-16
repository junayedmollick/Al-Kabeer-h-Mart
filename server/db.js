import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { products } from '../src/data/products.js';
import { categories } from '../src/data/categories.js';
import { storeSettings } from '../src/admin/data/adminMockData.js';

export function openDatabase(filename = process.env.DATABASE_PATH || 'data/store.sqlite') {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, identifier TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS catalog (kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(kind,id));
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), request_key TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(user_id,request_key));
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, action TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires);`);
  if (!db.prepare('SELECT value FROM metadata WHERE key=?').get('seeded')) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const insert = db.prepare('INSERT INTO catalog(kind,id,data) VALUES(?,?,?)');
      for (const c of categories) insert.run('categories', String(c.id), JSON.stringify(c));
      for (const p of products) insert.run('products', String(p.id), JSON.stringify({ ...p, stock: 0 }));
      db.prepare('INSERT INTO settings VALUES(1,?)').run(JSON.stringify({ ...storeSettings, deliveryFee: 10, minimumOrder: 0, servicePincodes: ['712701'], acceptingOrders: true }));
      db.prepare('INSERT INTO metadata VALUES(?,?)').run('seeded', new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  return db;
}

export const list = (db, kind) => db.prepare('SELECT data FROM catalog WHERE kind=? ORDER BY rowid').all(kind).map(r => JSON.parse(r.data));
export const get = (db, kind, id) => { const row = db.prepare('SELECT data FROM catalog WHERE kind=? AND id=?').get(kind, String(id)); return row ? JSON.parse(row.data) : null; };
export const put = (db, kind, item) => { item.revision = randomUUID(); return db.prepare('INSERT INTO catalog(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data').run(kind, String(item.id), JSON.stringify(item)); };
export const settings = db => JSON.parse(db.prepare('SELECT data FROM settings WHERE id=1').get().data);
export const transaction = (db, fn) => { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch (e) { db.exec('ROLLBACK'); throw e; } };
