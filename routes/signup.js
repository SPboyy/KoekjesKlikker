const express = require("express");
const router = express.Router();
const { signup } = require("../assets/data/signup");

router.get("/", function (req, res) {
    res.render("signup", { signup, hasError: false });
});

router.post("/", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  const errors = {
    UsernameError: "",
    PasswordError: "",
    ConfirmError: ""
  };

  let hasError = false;

  if (!username) {
    errors.UsernameError = "Vul gebruikersnaam in";
    hasError = true;
  }

  if (!password) {
    errors.PasswordError = "Vul wachtwoord in";
    hasError = true;
  }

  if (!confirmPassword) {
    errors.ConfirmError = "Bevestig wachtwoord";
    hasError = true;
  } else if (password && password !== confirmPassword) {
    errors.ConfirmError = "Wachtwoorden komen niet overeen";
    hasError = true;
  }

  if (hasError) {
    return res.render("signup", {
      signup: [{
        Image: "images/cookie.png",
        ...errors
      }],
      hasError: true
    });
  }
  
  res.redirect("/login");
});

module.exports = router;