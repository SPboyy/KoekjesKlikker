const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Routers importeren
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");
const prestigeRouter = require("./routes/prestige");
const cookiesRouter = require("./routes/cookies");

// Middleware voor POST-requests
app.use(bodyParser.urlencoded({ extended: true }));

// Handlebars view engine instellen
app.engine("handlebars", expressHandlebars.engine({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Statische bestanden serveren
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", cookiesRouter);
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/prestige", prestigeRouter);

// Root route (bijv. homepage)
app.get("/", (req, res) => {
  res.render("home");
});

// Fallback 404-pagina
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// Fallback 500-pagina
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500");
});

// Server starten
app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
