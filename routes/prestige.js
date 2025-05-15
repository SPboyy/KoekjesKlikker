const express = require("express");
const router = express.Router();
const db = require("../db");

// 📥 GET prestige-pagina
router.get("/", function (req, res) {
  const username = req.session.username;

  if (!username) {
    return res.redirect("/login");
  }

  // ⛔️ Zorg dat browser deze pagina niet uit cache haalt
  res.setHeader("Cache-Control", "no-store");

  const query = `
    SELECT amountOfRebirths, amountOfRebirthTokens
    FROM player
    WHERE username = ?
  `;

  db.get(query, [username], (err, row) => {
    if (err || !row) {
      console.error("Fout bij ophalen prestige data:", err);
      return res.status(500).send("Fout bij laden prestige gegevens");
    }

    res.render("prestige", {
      title: "Prestige Menu",
      prestigeData: {
        level: row.amountOfRebirths,
        heavenlyChips: row.amountOfRebirthTokens,
        canAscend: true
      }
    });
  });
});

// 🔁 POST: prestige uitvoeren
router.post("/reincarnate", (req, res) => {
  console.log("Inkomende sessie tijdens prestige:", req.session); // ✅ deze regel toevoegen

  if (!req.session.username) {
    return res.status(401).json({ success: false, message: "Niet ingelogd" });
  }

  const username = req.session.username;

  const updateQuery = `
    UPDATE player
    SET amountOfRebirths = amountOfRebirths + 1,
        amountOfRebirthTokens = 0
    WHERE username = ?
  `;

  db.run(updateQuery, [username], function (err) {
    if (err) {
      console.error("Fout bij opslaan prestige:", err);
      return res.status(500).json({ success: false, message: "Databasefout" });
    }

    // ✅ Geef redirect URL mee naar de prestige-pagina
    return res.json({ success: true, redirectUrl: "/"
    });
  });
});

module.exports = router;