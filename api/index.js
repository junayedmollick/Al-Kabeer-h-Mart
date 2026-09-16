import { openDatabase, ensureAdminOnVercel } from '../server/db.js';
import { createHandler } from '../server/app.js';

let dbInstance = null;
let handlerInstance = null;

async function getHandler() {
  if (!handlerInstance) {
    dbInstance = openDatabase();
    await ensureAdminOnVercel(dbInstance);
    handlerInstance = createHandler(dbInstance, {
      origin: process.env.APP_ORIGIN || '',
      production: process.env.NODE_ENV === 'production'
    });
  }
  return handlerInstance;
}

export default async function handler(req, res) {
  const handle = await getHandler();
  return handle(req, res);
}
