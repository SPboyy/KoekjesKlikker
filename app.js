const port = process.env.PORT || 3000;

const express = require("express");
const expressHandlebars = require("express-handlebars");
const loginRouter = require("./routes/login");
const prestigeRouter = require("./routes/prestige");
const app = express();
const bodyParser = require('body-parser');

// configure Handlebars view engine
app.engine("handlebars", expressHandlebars.engine({
    defaultLayout: "main",
}));
app.set("view engine", "handlebars");

const cookiesRouter = require("./routes/cookies");
app.use("/", cookiesRouter);  // Cookies route
app.use("/login", loginRouter);  // Login route
app.use("/prestige", prestigeRouter);  // Prestige route

// Specifieke routes voor login, prestige en home
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/prestige", (req, res) => {
    res.render("prestige");
});
app.get("/", (req, res) => {
    res.render("home");
});

// Statische bestanden
app.use(express.static(__dirname + "/public"));

// Custom 404 pagina
app.use((req, res) => {
    res.render("errors/404");
});

// Custom 500 pagina
app.use((err, req, res, next) => {
    console.error(err.message);
    res.render("errors/500");
});

// Start de server
app.listen(port, () => console.log(
    `Express started on http://localhost:${port};  ` +
    `press Ctrl-C to terminate.`
));
