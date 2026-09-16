import { randomBytes, scrypt, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export const digest = value => createHash('sha256').update(value).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), await derive(password, salt, 64));
}
export const publicUser = row => row ? { ...JSON.parse(row.data), id: row.id, role: row.role, identifier: row.identifier } : null;
export async function createUser(db, { identifier, password, name, role = 'customer' }) {
  const id = randomUUID();
  const data = { name, email: identifier.includes('@') ? identifier : '', phone: identifier.includes('@') ? '' : identifier, address: '', addresses: [], createdAt: new Date().toISOString() };
  const hash = await hashPassword(password);
  db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(id, identifier, hash, role, JSON.stringify(data));
  return publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(id));
}
export function sessionUser(db, req) {
  const token = /(?:^|;\s*)akm_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return null;
  return publicUser(db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(digest(token), Date.now()));
}
export function startSession(db, res, user, secure, remember = true) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token), user.id, Date.now() + (remember ? 7 * 86400000 : 86400000));
  res.setHeader('Set-Cookie', `akm_session=${token}; Path=/; HttpOnly; SameSite=Lax${remember ? '; Max-Age=604800' : ''}${secure ? '; Secure' : ''}`);
}
