const express = require("express");
const router = express.Router();
const { achievements, checkAchievements } = require("../assets/data/achievements");
const gameState = require("../gameState");

router.get("/", (req, res) => {
  checkAchievements({
    aantalClicks: gameState.clickCounter,
    totalRebirths: gameState.prestigeLevel
  });
  res.json(achievements);
});

module.exports = router;