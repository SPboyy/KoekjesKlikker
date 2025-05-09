const express = require("express");
const router = express.Router();
const db = require("../db");
const { signup } = require("../assets/data/signup");

router.get("/", function (req, res) {
    res.render("signup", { signup, hasError: false });
});

router.post("/", (req, res) => {
    const { username, password, confirmPassword } = req.body;
  
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
  
    if (password !== confirmPassword) {
        return res.render("signup", {
            signup: [{
                Image: "images/cookie.png",
                ConfirmError: "Wachtwoorden komen niet overeen"
            }],
            hasError: true
        });
    }

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
            return res.render("signup", {
                signup: [{
                    Image: "images/cookie.png",
                    UsernameError: "Gebruikersnaam is al in gebruik"
                }],
                hasError: true
            });
        }

        const insertLoginQuery = `INSERT INTO login (username, password, checkAdmin) VALUES (?, ?, 0)`;
        db.run(insertLoginQuery, [username, password], (err) => {
            if (err) {
                console.error("Fout bij opslaan gebruiker in login tabel:", err);
                return res.render("signup", {
                    signup: [{
                        Image: "images/cookie.png",
                        UsernameError: "Opslaan mislukt in login tabel"
                    }],
                    hasError: true
                });
            }

            const insertPlayerQuery = `INSERT INTO player (
                playerName, amountOfCookies, amountOfRebirths, amountOfUpgrades, amountOfRebirthTokens,
                cookiesSpend, totalAmountOfCookies, achAmount1, achAmount100, achAmount1000, 
                achAmount10000, achAmount100000, achAmount1000000, achAmount10000000, 
                achAmount100000000, achAmount1000000000
            ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`;

            db.run(insertPlayerQuery, [username], (err) => {
                if (err) {
                    console.error("Fout bij opslaan gebruiker in player tabel:", err);
                    return res.render("signup", {
                        signup: [{
                            Image: "images/cookie.png",
                            UsernameError: "Opslaan mislukt in player tabel"
                        }],
                        hasError: true
                    });
                }

                console.log("Nieuwe gebruiker toegevoegd:", username);
                res.redirect("/login");
            });
        });
    });
});

module.exports = router;
