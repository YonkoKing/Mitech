const Database = require("better-sqlite3");

const db = new Database("database.db");

// Tables definition
db.exec(`
CREATE TABLE IF NOT EXISTS emplacements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE,
  zoneType TEXT,
  subZone TEXT,
  isAccessible BOOLEAN DEFAULT 0,
  capacity INTEGER DEFAULT 0,
  occupancy INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT,
  lot TEXT UNIQUE,
  netMes REAL,
  quantity INTEGER,
  materialType TEXT,
  classification TEXT,
  dailyConsumption REAL DEFAULT 0,
  leadTime INTEGER DEFAULT 0,
  safetyStock INTEGER DEFAULT 0,
  rop INTEGER DEFAULT 0,
  patch TEXT,
  emplacementId INTEGER,
  FOREIGN KEY (emplacementId) REFERENCES emplacements(id)
);
`);

module.exports = db;
