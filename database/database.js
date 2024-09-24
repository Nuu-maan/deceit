const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'prefixes.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS prefixes (server_id TEXT PRIMARY KEY, prefix TEXT)');
});

module.exports = db;
