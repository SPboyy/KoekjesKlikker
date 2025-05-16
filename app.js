const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS correct instellen
app.use(cors({
  origin: "http://localhost:5173", // jouw frontend
  credentials: true
}));

app.set("trust proxy", 1); // belangrijk bij localhost + CORS

app.use(session({
  store: new SQLiteStore({
    db: 'DataBase.db',   // gebruik je bestaande databasebestand
    dir: './'            // pad naar het bestand (in dit geval root van het project)
  }),
  secret: "eenGeheimeSleutel",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week geldig
  }
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Views
app.engine("handlebars", expressHandlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ✅ Statische bestanden
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes koppelen
app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/prestige", require("./routes/prestige"));
app.use("/", require("./routes/cookies"));

// ✅ Homepagina
app.get("/", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  res.render("home", { username: req.session.username });
});

// ✅ 404 & 500
app.use((req, res) => res.status(404).render("errors/404"));
app.use((err, req, res, next) => res.status(500).render("errors/500"));

// ✅ Start server
app.listen(port, () => {
  console.log(`Express gestart op http://localhost:${port}`);
});