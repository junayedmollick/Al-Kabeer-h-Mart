import { openDatabase } from './db.js';
import { createApp } from './app.js';
const db = openDatabase();
const server = createApp(db);
const port = Number(process.env.PORT || 4000);
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Store API listening on http://${process.env.HOST || '127.0.0.1'}:${port}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
