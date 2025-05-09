const express = require("express");
const router = express.Router();
const db = require("../db");
const { signup } = require("../assets/data/signup");

router.get("/", function (req, res) {
    res.render("signup", { signup, hasError: false });
});

router.post("/", (req, res) => {
    const { username, password, confirmPassword } = req.body;
  
    // Controleer of velden zijn ingevuld
    if (!username || !password || !confirmPassword) {
      return res.render("signup", {
        signup: [{
          Image: "images/cookie.png",
          UsernameError: "Vul een gebruikersnaam in",
          PasswordError: "Vul een wachtwoord in",
          ConfirmError: "Vul wachtwoordbevestiging in"
        }],
        hasError: true
      });
    }
  
    // Controleer of wachtwoorden overeenkomen
    if (password !== confirmPassword) {
      return res.render("signup", {
        signup: [{
          Image: "images/cookie.png",
          ConfirmError: "Wachtwoorden komen niet overeen"
        }],
        hasError: true
      });
    }
  
    // Controleer of username al bestaat
    const query = `SELECT * FROM login WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) {
        console.error("Database fout:", err);
        return res.render("signup", {
          signup: [{
            Image: "images/cookie.png",
            UsernameError: "Er is een fout opgetreden bij het controleren"
          }],
          hasError: true
        });
      }
  
      if (row) {
        // Username bestaat al
        return res.render("signup", {
          signup: [{
            Image: "images/cookie.png",
            UsernameError: "Gebruikersnaam is al in gebruik"
          }],
          hasError: true
        });
      }
  
      // Username is vrij, voeg toe aan database
      const insertQuery = `INSERT INTO login (username, password, checkAdmin) VALUES (?, ?, 0)`;
      db.run(insertQuery, [username, password], (err) => {
        if (err) {
          console.error("Fout bij opslaan gebruiker:", err);
          return res.render("signup", {
            signup: [{
              Image: "images/cookie.png",
              UsernameError: "Opslaan mislukt"
            }],
            hasError: true
          });
        }
  
        console.log("Nieuwe gebruiker toegevoegd:", username);
        res.redirect("/login");
      });
    });
  });

module.exports = router;