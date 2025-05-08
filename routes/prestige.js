const express = require("express");
const router = express.Router();

// Prestige data model (voorbeeld)
const prestigeData = {
  level: 2,
  heavenlyChips: 2,
  canAscend: true
};

// Route voor het prestige scherm
router.get("/", function(req, res, next) {
  res.render("prestige", { 
    title: "Prestige Menu",
    prestigeData: prestigeData
  });
});

// Route voor het uitvoeren van reïncarnatie
router.post("/reincarnate", function(req, res, next) {
  // Hier zou je de daadwerkelijke prestige logica implementeren
  console.log("Reincarnatie uitgevoerd");
  
  // Voorbeeld: verhoog prestige level en reset heavenly chips
  prestigeData.level += 1;
  prestigeData.heavenlyChips = 0;
  prestigeData.canAscend = false;
  
  res.json({ 
    success: true,
    newLevel: prestigeData.level,
    message: "Reincarnatie succesvol uitgevoerd!" 
  });
});

module.exports = router;