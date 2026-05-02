const db = require("../db");

function autoAssign(materialType, classification, quantity) {
  let query = "";
  
  if (materialType === "SMALL_MATERIAL") {
    if (classification === "HIGH_RUNNER") {
      // Prefer Level 1, then Level 2
      query = `SELECT * FROM emplacements WHERE zoneType = 'SMALL_MATERIAL' AND subZone IN ('LEVEL_1', 'LEVEL_2') AND (occupancy + ?) <= capacity ORDER BY isAccessible DESC LIMIT 1`;
    } else {
      // Prefer Level 2, then Level 3
      query = `SELECT * FROM emplacements WHERE zoneType = 'SMALL_MATERIAL' AND subZone IN ('LEVEL_2', 'LEVEL_3') AND (occupancy + ?) <= capacity ORDER BY isAccessible ASC LIMIT 1`;
    }
  } 
  else if (materialType === "ROLL") {
    if (classification === "HIGH_RUNNER") {
      // Prefer Placement 1
      query = `SELECT * FROM emplacements WHERE zoneType = 'ROLL' AND subZone = 'PLACEMENT_1' AND (occupancy + ?) <= capacity LIMIT 1`;
    } else {
      // Prefer Placement 2
      query = `SELECT * FROM emplacements WHERE zoneType = 'ROLL' AND subZone = 'PLACEMENT_2' AND (occupancy + ?) <= capacity LIMIT 1`;
    }
  }
  else if (materialType === "LEATHER_HORSE") {
    if (classification === "HIGH_RUNNER") {
      // High volume -> Mezzanine 1
      query = `SELECT * FROM emplacements WHERE zoneType = 'LEATHER_HORSE' AND subZone = 'MEZZANINE_1' AND (occupancy + ?) <= capacity LIMIT 1`;
    } else {
      // Low volume -> Mezzanine 2
      query = `SELECT * FROM emplacements WHERE zoneType = 'LEATHER_HORSE' AND subZone = 'MEZZANINE_2' AND (occupancy + ?) <= capacity LIMIT 1`;
    }
  }

  if (!query) return null;

  const emplacement = db.prepare(query).get(quantity);

  if (!emplacement) {
    return null; // No available space matching criteria
  }

  // Update occupancy
  db.prepare(`
    UPDATE emplacements
    SET occupancy = occupancy + ?
    WHERE id = ?
  `).run(quantity, emplacement.id);

  return emplacement;
}

module.exports = autoAssign;
