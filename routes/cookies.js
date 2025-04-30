const express = require("express");
const router = express.Router();

const { getTotalCookies } = require("../assets/data/TotalCookies.js"); 
router.get("/", function (req, res, next) {
    const totalCookies = getTotalCookies();
    res.render("home", {
        koekies: totalCookies, 
    });
});

module.exports = router;