const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", function (req, res) {
  const username = req.session.username;
  if (!username) return res.redirect("/login");

  res.setHeader("Cache-Control", "no-store");

  const query = `
    SELECT amountOfRebirths, amountOfRebirthTokens, unlockedPrestigeNodes
    FROM player
    WHERE username = ?
  `;

  db.get(query, [username], (err, row) => {
    if (err || !row) {
      console.error("Fout bij ophalen prestige data:", err);
      return res.status(500).send("Fout bij laden prestige gegevens");
    }

    console.log("Prestige data uit database:", row);

    let unlockedNodes = ['node-0'];
if (row.unlockedPrestigeNodes) {
  try {
    unlockedNodes = JSON.parse(row.unlockedPrestigeNodes);
  } catch (parseErr) {
    console.error("Kon prestigeNodes niet parsen:", parseErr);
  }
}

    res.render("prestige", {
      title: "Prestige Menu",
      prestigeData: {
        level: row.amountOfRebirths,
        heavenlyChips: row.amountOfRebirthTokens,
        unlockedNodes: unlockedNodes,
        unlockedNodesJSON: JSON.stringify(unlockedNodes),
        canAscend: true
      }
    });
  });
});


router.post("/reincarnate", (req, res) => {
  console.log("🚀 Reincarnate called");
  console.log("Session ID:", req.sessionID);
  console.log("Session inhoud:", req.session);
  if (!req.session.username) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.session.username;
  const updateQuery = `
    UPDATE player
    SET 
      amountOfRebirths = amountOfRebirths + 1,
      amountOfRebirthTokens = amountOfRebirthTokens + 1,
      unlockedPrestigeNodes = ?
    WHERE username = ?
  `;

  db.run(updateQuery, [JSON.stringify(['node-0']), username], function (err) {
    if (err) {
      console.error("Fout bij opslaan prestige:", err);
      return res.status(500).json({ success: false, message: "Databasefout" });
    }

    return res.json({ success: true, redirectUrl: "/prestige" });
  });
});

router.post("/save", (req, res) => {
  const username = req.session.username;
  const unlockedNodes = req.body.unlockedNodes;

  if (!username || !Array.isArray(unlockedNodes)) {
    return res.status(400).json({ success: false });
  }

  const update = `UPDATE player SET unlockedPrestigeNodes = ? WHERE username = ?`;
  db.run(update, [JSON.stringify(unlockedNodes), username], function (err) {
    if (err) {
      console.error("Fout bij opslaan nodes:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});

module.exports = router;