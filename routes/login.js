const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { login } = require("../assets/data/login"); 


router.get("/", function (req, res) {
  res.render("login", { login, hasError: false, enteredUsername: "" });
});


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
        login,
        hasError: true,
        UsernameError: "Gebruiker niet gevonden",
        PasswordError: null,
        enteredUsername: username
      });
    }


    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        console.error("❌ Fout bij bcrypt.compare:", err);
        return res.status(500).send("Fout bij wachtwoordcontrole");
      }

      if (result) {

        req.session.username = row.username;
        console.log("✅ Ingelogd als:", req.session.username);
        return res.redirect("/");
      } else {

        console.log("❌ Onjuist wachtwoord");
        return res.render("login", {
          login,
          hasError: true,
          UsernameError: null,
          PasswordError: "Onjuist wachtwoord",
          enteredUsername: username
        });
      }
    });
  });
});

module.exports = router;