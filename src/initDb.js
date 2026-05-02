const db = require("./db");

async function init() {
  console.log("Initializing database with strict warehouse constraints...");

  try {
    await db.query(`
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS emplacements;

      CREATE TABLE emplacements (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE,
        "zoneType" TEXT,
        "subZone" TEXT,
        "isAccessible" BOOLEAN DEFAULT false,
        capacity INTEGER DEFAULT 0,
        occupancy INTEGER DEFAULT 0
      );

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        ref TEXT,
        lot TEXT UNIQUE,
        "netMes" REAL,
        quantity INTEGER,
        "materialType" TEXT,
        classification TEXT,
        "dailyConsumption" REAL DEFAULT 0,
        "leadTime" INTEGER DEFAULT 0,
        "safetyStock" INTEGER DEFAULT 0,
        rop INTEGER DEFAULT 0,
        patch TEXT,
        "emplacementId" INTEGER,
        FOREIGN KEY ("emplacementId") REFERENCES emplacements(id)
      );
    `);

    // Helper to insert emplacement
    const insertEmplacement = async (code, zoneType, subZone, isAccessible, capacity) => {
      await db.query(`
        INSERT INTO emplacements (code, "zoneType", "subZone", "isAccessible", capacity, occupancy)
        VALUES ($1, $2, $3, $4, $5, 0)
      `, [code, zoneType, subZone, isAccessible, capacity]);
    };

    // 1. SMALL_MATERIAL (E Section)
    // 4 parts, 3 placements per part = 12 placements total
    for (let part = 1; part <= 4; part++) {
      for (let p = 1; p <= 3; p++) {
        // Level 1: 3 pallets (105 cartons), Accessible (for High Runners)
        await insertEmplacement(`SM-P${part}-PL${p}-L1`, 'SMALL_MATERIAL', 'LEVEL_1', true, 105);
        // Level 2: 3 pallets (105 cartons)
        await insertEmplacement(`SM-P${part}-PL${p}-L2`, 'SMALL_MATERIAL', 'LEVEL_2', false, 105);
        // Level 3: 2 pallets (70 cartons)
        await insertEmplacement(`SM-P${part}-PL${p}-L3`, 'SMALL_MATERIAL', 'LEVEL_3', false, 70);
      }
    }

    // 2. ROLLS
    // Placement 1: 10 lines (200 rolls/line), Accessible
    for (let i = 1; i <= 10; i++) {
      await insertEmplacement(`ROLL-P1-L${i}`, 'ROLL', 'PLACEMENT_1', true, 200);
    }
    // Placement 2: 12 lines (45 rolls/line)
    for (let i = 1; i <= 12; i++) {
      await insertEmplacement(`ROLL-P2-L${i}`, 'ROLL', 'PLACEMENT_2', false, 45);
    }

    // 3. LEATHER_HORSES
    // Mezzanine 1 (Old): 11 lines (10 horses/line), Accessible
    for (let i = 1; i <= 11; i++) {
      await insertEmplacement(`HORSE-M1-L${i}`, 'LEATHER_HORSE', 'MEZZANINE_1', true, 10);
    }
    // Mezzanine 2 (New): 24 lines (4 horses/line)
    for (let i = 1; i <= 24; i++) {
      await insertEmplacement(`HORSE-M2-L${i}`, 'LEATHER_HORSE', 'MEZZANINE_2', false, 4);
    }

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
