const express = require("express");
const db = require("../db");

const router = express.Router();

//
// 📍 GET ALL emplacements
//
router.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM emplacements`);
    res.json(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//
// 📍 GET AVAILABLE emplacements (free space)
//
router.get("/available", async (req, res) => {
  try {
    const data = await db.query(`
      SELECT * FROM emplacements
      WHERE occupancy < capacity
      ORDER BY occupancy ASC
    `);
    res.json(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//
// ➕ CREATE emplacement
//
router.post("/", async (req, res) => {
  const { code, zoneType, subZone, isAccessible, capacity } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO emplacements (code, "zoneType", "subZone", "isAccessible", capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [code, zoneType, subZone, isAccessible, capacity]);

    res.json({
      message: "Emplacement created",
      id: result.rows[0].id
    });
  } catch (err) {
    res.status(400).json({
      error: "Code already exists or invalid data"
    });
  }
});

//
// ✏️ UPDATE emplacement
//
router.patch("/:id", async (req, res) => {
  const { zoneType, subZone, isAccessible, capacity } = req.body;

  try {
    await db.query(`
      UPDATE emplacements
      SET "zoneType" = $1, "subZone" = $2, "isAccessible" = $3, capacity = $4
      WHERE id = $5
    `, [zoneType, subZone, isAccessible, capacity, req.params.id]);

    res.json({ message: "Emplacement updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//
// ❌ DELETE emplacement
//
router.delete("/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM emplacements WHERE id = $1`, [req.params.id]);
    res.json({ message: "Emplacement deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
