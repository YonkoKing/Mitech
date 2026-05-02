const db = require("./db");

console.log("Initializing database with strict warehouse constraints...");

db.exec(`
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS emplacements;

  CREATE TABLE emplacements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    zoneType TEXT,
    subZone TEXT,
    isAccessible BOOLEAN DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    occupancy INTEGER DEFAULT 0
  );

  CREATE TABLE products (
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

// Helper to insert emplacement
const insertEmplacement = db.prepare(`
  INSERT INTO emplacements (code, zoneType, subZone, isAccessible, capacity, occupancy)
  VALUES (?, ?, ?, ?, ?, 0)
`);

db.transaction(() => {
  // 1. SMALL_MATERIAL (E Section)
  // 4 parts, 3 placements per part = 12 placements total
  for (let part = 1; part <= 4; part++) {
    for (let p = 1; p <= 3; p++) {
      // Level 1: 3 pallets (105 cartons), Accessible (for High Runners)
      insertEmplacement.run(`SM-P${part}-PL${p}-L1`, 'SMALL_MATERIAL', 'LEVEL_1', 1, 105);
      // Level 2: 3 pallets (105 cartons)
      insertEmplacement.run(`SM-P${part}-PL${p}-L2`, 'SMALL_MATERIAL', 'LEVEL_2', 0, 105);
      // Level 3: 2 pallets (70 cartons)
      insertEmplacement.run(`SM-P${part}-PL${p}-L3`, 'SMALL_MATERIAL', 'LEVEL_3', 0, 70);
    }
  }

  // 2. ROLLS
  // Placement 1: 10 lines (200 rolls/line), Accessible
  for (let i = 1; i <= 10; i++) {
    insertEmplacement.run(`ROLL-P1-L${i}`, 'ROLL', 'PLACEMENT_1', 1, 200);
  }
  // Placement 2: 12 lines (45 rolls/line)
  for (let i = 1; i <= 12; i++) {
    insertEmplacement.run(`ROLL-P2-L${i}`, 'ROLL', 'PLACEMENT_2', 0, 45);
  }

  // 3. LEATHER_HORSES
  // Mezzanine 1 (Old): 11 lines (10 horses/line), Accessible
  for (let i = 1; i <= 11; i++) {
    insertEmplacement.run(`HORSE-M1-L${i}`, 'LEATHER_HORSE', 'MEZZANINE_1', 1, 10);
  }
  // Mezzanine 2 (New): 24 lines (4 horses/line)
  for (let i = 1; i <= 24; i++) {
    insertEmplacement.run(`HORSE-M2-L${i}`, 'LEATHER_HORSE', 'MEZZANINE_2', 0, 4);
  }
})();

console.log("Database initialized successfully!");
