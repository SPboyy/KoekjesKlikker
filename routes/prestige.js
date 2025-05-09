const express = require("express");
const router = express.Router();

const prestigeData = {
  level: 2,
  heavenlyChips: 2,
  canAscend: true
};

router.get("/", function(req, res, next) {
  res.render("prestige", { 
    title: "Prestige Menu",
    prestigeData: prestigeData
  });
});

router.post("/reincarnate", function(req, res, next) {
  console.log("Reincarnatie uitgevoerd");
  
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