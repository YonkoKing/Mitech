const express = require("express");
const db = require("../db");

const router = express.Router();

//
// 📍 GET ALL emplacements
//
router.get("/", (req, res) => {
  const data = db.prepare(`
    SELECT * FROM emplacements
  `).all();

  res.json(data);
});

//
// 📍 GET AVAILABLE emplacements (free space)
//
router.get("/available", (req, res) => {
  const data = db.prepare(`
    SELECT * FROM emplacements
    WHERE occupancy < capacity
    ORDER BY occupancy ASC
  `).all();

  res.json(data);
});

//
// ➕ CREATE emplacement
//
router.post("/", (req, res) => {
  const { code, zone, aisle, shelf, capacity } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO emplacements (code, zone, aisle, shelf, capacity)
      VALUES (?, ?, ?, ?, ?)
    `).run(code, zone, aisle, shelf, capacity);

    res.json({
      message: "Emplacement created",
      id: result.lastInsertRowid
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
router.patch("/:id", (req, res) => {
  const { zone, aisle, shelf, capacity } = req.body;

  db.prepare(`
    UPDATE emplacements
    SET zone = ?, aisle = ?, shelf = ?, capacity = ?
    WHERE id = ?
  `).run(zone, aisle, shelf, capacity, req.params.id);

  res.json({ message: "Emplacement updated" });
});

//
// ❌ DELETE emplacement
//
router.delete("/:id", (req, res) => {
  db.prepare(`
    DELETE FROM emplacements WHERE id = ?
  `).run(req.params.id);

  res.json({ message: "Emplacement deleted" });
});

module.exports = router;
