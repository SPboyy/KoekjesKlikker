const express = require("express");
const router = express.Router();
const { login } = require("../assets/data/login");

router.get("/", function(req, res, next) {
  res.render("login", { login });
});

module.exports = router;