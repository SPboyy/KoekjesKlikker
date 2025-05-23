const express = require("express");
const router = express.Router();
const { achievements } = require("../assets/data/achievements");

router.get("/", (req, res) => {
  res.json(achievements);
});

module.exports = router;
