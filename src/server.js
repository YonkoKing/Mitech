const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de sécurité pour Vercel / API
const ACCESS_CODE = "2024"; 

app.use("/api", (req, res, next) => {
  const code = req.headers["x-access-code"];
  if (code === ACCESS_CODE) {
    next();
  } else {
    res.status(401).json({ error: "Accès non autorisé. Code incorrect." });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Stock API is running 🚀" });
});

const emplacementsRoutes = require("./routes/emplacements");
app.use("/api/emplacements", emplacementsRoutes);

const productsRoutes = require("./routes/products");
app.use("/api/products", productsRoutes);

const statsRoutes = require("./routes/stats");
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
