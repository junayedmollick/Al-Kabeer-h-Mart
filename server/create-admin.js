import { openDatabase } from './db.js';
import { createUser } from './auth.js';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const db = openDatabase();
const identifier = (process.env.ADMIN_EMAIL || 'admin@alkabeerhmart.com').trim().toLowerCase();
if (db.prepare('SELECT id FROM users WHERE identifier=?').get(identifier)) {
  console.log('Account already exists. No credentials were changed.');
} else {
  const password = process.env.ADMIN_PASSWORD || randomBytes(18).toString('base64url');
  if (password.length < 12) throw new Error('Admin password must have at least 12 characters');
  await createUser(db, { identifier, password, name: process.env.ADMIN_NAME || 'Store Administrator', role: 'admin' });
  if (!process.env.ADMIN_PASSWORD) {
    writeFileSync('data/admin-credentials.txt', `Local administrator login\nEmail: ${identifier}\nPassword: ${password}\n\nChange this password in Account Settings after signing in. Keep this file private.\n`, { flag: 'wx', mode: 0o600 });
    console.log('Admin created. Temporary credentials saved to ignored file data/admin-credentials.txt.');
  } else console.log('Admin created using your environment credentials.');
}
db.close();
