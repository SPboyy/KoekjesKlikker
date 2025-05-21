const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { login } = require("../assets/data/login"); // Controleer of dit echt nodig is

// GET /login - Toon loginpagina
router.get("/", function (req, res) {
  res.render("login", { login });
});

// POST /login - Verwerk loginpoging
router.post("/", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM login WHERE username = ?`;
  db.get(query, [username], (err, row) => {
    if (err) {
      console.error("❌ Databasefout:", err);
      return res.status(500).send("Databasefout");
    }

    if (!row) {
      console.log("❌ Gebruiker niet gevonden");
      return res.render("login", {
        login: [{
          Username: "Onjuist",
          Password: "Onjuist"
        }]
      });
    }

    // Vergelijk wachtwoord met hash
    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        console.error("❌ Fout bij bcrypt.compare:", err);
        return res.status(500).send("Fout bij wachtwoordcontrole");
      }

      if (result) {
        // Wachtwoord klopt
        req.session.username = row.username;
        console.log("✅ Ingelogd als:", req.session.username);
        return res.redirect("/");
      } else {
        // Wachtwoord fout
        console.log("❌ Onjuist wachtwoord");
        return res.render("login", {
          login: [{
            Username: "Onjuist",
            Password: "Onjuist"
          }]
        });
      }
    });
  });
});

module.exports = router;
