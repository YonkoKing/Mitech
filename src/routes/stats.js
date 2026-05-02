const express = require("express");
const db = require("../db");

const router = express.Router();

// 📊 GENERAL STATS
router.get("/", (req, res) => {
  const totalProducts = db.prepare(`
    SELECT COUNT(*) as count FROM products
  `).get();

  // Low stock is now based on ROP
  const belowRop = db.prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE quantity <= rop
  `).get();

  // Capacity breakdown per zone type
  const capacities = db.prepare(`
    SELECT 
      zoneType,
      SUM(capacity) as totalCapacity,
      SUM(occupancy) as totalOccupancy
    FROM emplacements
    GROUP BY zoneType
  `).all();

  const totalEmplacements = db.prepare(`
    SELECT COUNT(*) as count FROM emplacements
  `).get();

  res.json({
    totalProducts: totalProducts.count,
    belowRop: belowRop.count,
    totalEmplacements: totalEmplacements.count,
    capacities: capacities
  });
});

module.exports = router;
