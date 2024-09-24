const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Specify the database file in the `database` directory
const dbPath = path.join(__dirname, 'prefixes.db');
const db = new sqlite3.Database(dbPath);

// Create the table to store server IDs and prefixes
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS prefixes (server_id TEXT PRIMARY KEY, prefix TEXT)');
});

module.exports = db;
