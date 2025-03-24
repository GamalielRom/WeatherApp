const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar SQLite
const db = new sqlite3.Database("./weather.db", (err) => {
  if (err) console.error("Error Trying to connect to the database", err);
  else console.log("Connected to SQLite");
});

// Save the search in the database
app.post("/searches", (req, res) => {
    const { city, country, temperature, condition } = req.body;
    db.run(
      `INSERT INTO searches (city, country, temperature, condition) VALUES (?, ?, ?, ?)`,
      [city, country, temperature, condition],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, city, country, temperature, condition });
      }
    );
  });
  
  // Take all the searches
  app.get("/searches", (req, res) => {
    db.all("SELECT * FROM searches", [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Delete a search by ID
  app.delete("/searches/:id", (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM searches WHERE id = ?`, id, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Serch deleted", id });
    });
  });
  

// Create the table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    country TEXT,
    temperature REAL,
    condition TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
);

// Testing route
app.get("/", (req, res) => {
  res.send("Backend functional ");
});

// Server Initializer
app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
