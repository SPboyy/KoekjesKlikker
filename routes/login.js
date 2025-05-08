const express = require("express");
const router = express.Router();
const { login } = require("../assets/data/login");

router.get("/", function(req, res, next) {
  res.render("login", { login });
});

router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "wachtwoord") {
      res.redirect("/");
  } else {
      res.render("login", { login: [{ Username: "Onjuist", Password: "Onjuist" }] });
  }
});

module.exports = router;