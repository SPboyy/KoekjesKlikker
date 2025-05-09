const express = require("express");
const router = express.Router();
const db = require("../db"); // importeer je db bestand
const { login } = require("../assets/data/login");

router.get("/", function (req, res) {
  res.render("login", { login });
});

router.post("/", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM login WHERE username = ? AND password = ?`;
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Databasefout");
    }

    if (row) {
      // Succesvolle login
      console.log("Ingelogd als:", row.username);
      return res.redirect("/");
    } else {
      // Foute inloggegevens
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