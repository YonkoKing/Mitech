const express = require("express");
const db = require("../db");
const autoAssign = require("../utils/autoAssign");

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  const products = db.prepare(`
    SELECT p.*, e.code as emplacementCode, e.zoneType, e.subZone 
    FROM products p
    LEFT JOIN emplacements e ON p.emplacementId = e.id
  `).all();

  res.json(products);
});

// CREATE PRODUCT
router.post("/", (req, res) => {
  const { 
    ref, lot, netMes, quantity, patch, 
    materialType, classification, 
    dailyConsumption = 0, leadTime = 0, safetyStock = 0 
  } = req.body;

  // 1. Calculate ROP
  const rop = (Number(dailyConsumption) * Number(leadTime)) + Number(safetyStock);

  // 2. Auto Assign Storage based on constraints
  const assigned = autoAssign(materialType, classification, Number(quantity));

  if (!assigned) {
    return res.status(400).json({
      error: "Aucun espace disponible correspondant aux critères de ce type de matériel et classification"
    });
  }

  // 3. Insert Product
  const stmt = db.prepare(`
    INSERT INTO products (
      ref, lot, netMes, quantity, patch, 
      materialType, classification, 
      dailyConsumption, leadTime, safetyStock, rop, 
      emplacementId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    ref, lot, netMes, quantity, patch,
    materialType, classification,
    dailyConsumption, leadTime, safetyStock, rop,
    assigned.id
  );

  res.json({
    message: "Produit créé avec succès",
    productId: result.lastInsertRowid,
    emplacementId: assigned.id,
    emplacementCode: assigned.code,
    rop: rop
  });
});

// DELETE PRODUCT
router.delete("/:id", (req, res) => {
  // First, free up occupancy
  const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
  
  if (product && product.emplacementId) {
    db.prepare(`
      UPDATE emplacements
      SET occupancy = max(0, occupancy - ?)
      WHERE id = ?
    `).run(product.quantity, product.emplacementId);
  }

  // Then delete product
  db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);

  res.json({ message: "Produit supprimé" });
});

module.exports = router;
