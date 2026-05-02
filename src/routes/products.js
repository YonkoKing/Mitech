const express = require("express");
const db = require("../db");
const autoAssign = require("../utils/autoAssign");

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, e.code as "emplacementCode", e."zoneType", e."subZone" 
      FROM products p
      LEFT JOIN emplacements e ON p."emplacementId" = e.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// CREATE PRODUCT
router.post("/", async (req, res) => {
  const { 
    ref, lot, netMes, quantity, patch, 
    materialType, classification, 
    dailyConsumption = 0, leadTime = 0, safetyStock = 0 
  } = req.body;

  // 1. Calculate ROP
  const rop = (Number(dailyConsumption) * Number(leadTime)) + Number(safetyStock);

  try {
    // 2. Auto Assign Storage based on constraints
    const assigned = await autoAssign(materialType, classification, Number(quantity));

    if (!assigned) {
      return res.status(400).json({
        error: "Aucun espace disponible correspondant aux critères de ce type de matériel et classification"
      });
    }

    // 3. Insert Product
    const result = await db.query(`
      INSERT INTO products (
        ref, lot, "netMes", quantity, patch, 
        "materialType", classification, 
        "dailyConsumption", "leadTime", "safetyStock", rop, 
        "emplacementId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      ref, lot, netMes, quantity, patch,
      materialType, classification,
      dailyConsumption, leadTime, safetyStock, rop,
      assigned.id
    ]);

    res.json({
      message: "Produit créé avec succès",
      productId: result.rows[0].id,
      emplacementId: assigned.id,
      emplacementCode: assigned.code,
      rop: rop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création du produit" });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    // First, free up occupancy
    const productResult = await db.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    const product = productResult.rows[0];
    
    if (product && product.emplacementId) {
      await db.query(`
        UPDATE emplacements
        SET occupancy = GREATEST(0, occupancy - $1)
        WHERE id = $2
      `, [product.quantity, product.emplacementId]);
    }

    // Then delete product
    await db.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);

    res.json({ message: "Produit supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
