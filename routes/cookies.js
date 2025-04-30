const express = require("express");
const router = express.Router();

const {MoreCookies, getTotalCookies } = require("../assets/data/TotalCookies.js"); 
router.get("/", function (req, res, next) {
    const totalCookies = getTotalCookies();
    res.render("home", {
        koekies: totalCookies, 
    });
});
router.post("/add-cookie", function (req, res) {
    MoreCookies();
    const totalCookies = getTotalCookies();
    res.json({ total: totalCookies });
});
module.exports = router;