const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS emplacements (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE,
      "zoneType" TEXT,
      "subZone" TEXT,
      "isAccessible" BOOLEAN DEFAULT false,
      capacity INTEGER DEFAULT 0,
      occupancy INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
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
}

initDb().catch(console.error);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
