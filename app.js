const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
const port = process.env.PORT || 3000;

// Sessies met SQLite opslag
app.use(session({
  secret: "geheimenaam",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine
app.engine("handlebars", expressHandlebars.engine({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Static bestanden
app.use(express.static(path.join(__dirname, "public")));

// Routes importeren
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");
const prestigeRouter = require("./routes/prestige");
const cookiesRouter = require("./routes/cookies");

// Routes koppelen
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/prestige", prestigeRouter);
app.use("/", cookiesRouter);

// Homepagina
app.get("/", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  res.render("home", {
    username: req.session.username
  });
});

// 404 pagina
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// Foutafhandeling
app.use((err, req, res, next) => {
  res.status(500).render("errors/500");
});

// Server starten
app.listen(port, () => console.log(
  `Express gestart op http://localhost:${port}; ` +
  `press Ctrl-C to terminate.`
));