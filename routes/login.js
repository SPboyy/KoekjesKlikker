const express = require("express");
const router = express.Router();
const db = require("../db");
const { login } = require("../assets/data/login"); // Zorg dat dit bestand klopt of haal dit weg

// 🔓 GET /login - Toon inlogpagina
router.get("/", function (req, res) {
  res.render("login", { login }); // Gebruik evt. gewoon: res.render("login");
});

// 🔐 POST /login - Verwerk inlogpoging
router.post("/", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM login WHERE username = ? AND password = ?`;
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error("❌ Databasefout:", err);
      return res.status(500).send("Databasefout");
    }

    if (row) {
      req.session.username = row.username; // ✅ Belangrijk!
      console.log("✅ Ingelogd als:", req.session.username);

      return res.redirect("/");
    } else {
      console.log("❌ Onjuiste inloggegevens");
      return res.render("login", {
        login: [{
          Username: "Onjuist",
          Password: "Onjuist"
        }]
      });
    }
  });
});

module.exports = router;