const express = require("express");
const db = require("../db");

const router = express.Router();

// 📊 GENERAL STATS
router.get("/", async (req, res) => {
  try {
    const totalProducts = await db.query(`
      SELECT COUNT(*) as count FROM products
    `);

    // Low stock is now based on ROP
    const belowRop = await db.query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE quantity <= rop
    `);

    // Capacity breakdown per zone type
    const capacities = await db.query(`
      SELECT 
        "zoneType",
        SUM(capacity) as "totalCapacity",
        SUM(occupancy) as "totalOccupancy"
      FROM emplacements
      GROUP BY "zoneType"
    `);

    const totalEmplacements = await db.query(`
      SELECT COUNT(*) as count FROM emplacements
    `);

    res.json({
      totalProducts: parseInt(totalProducts.rows[0].count, 10),
      belowRop: parseInt(belowRop.rows[0].count, 10),
      totalEmplacements: parseInt(totalEmplacements.rows[0].count, 10),
      capacities: capacities.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
