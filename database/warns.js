const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Set the path for the database
const dbPath = path.join(__dirname, 'warns.db');
const db = new sqlite3.Database(dbPath);

// Create the 'warns' table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS warns (
      warnId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      guildId TEXT,
      reason TEXT,
      timestamp INTEGER
    )
  `);
});

module.exports = db;
