const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const pool = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", userRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "user-service", port: PORT });
});

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              email VARCHAR(150) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL
    );
`);

    console.log("Users table ready");
  }

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ user-service running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database initialization failed:", err);
  });
