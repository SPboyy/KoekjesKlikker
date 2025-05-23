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
  origin: "http://localhost:5173",
  credentials: true
}));

app.set("trust proxy", 1);

app.use(session({
  store: new SQLiteStore({
    db: 'DataBase.db',
    dir: './'
  }),
  secret: "eenGeheimeSleutel",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("handlebars", expressHandlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/prestige", require("./routes/prestige"));
app.use("/", require("./routes/cookies"));
app.use("/api/achievements", require("./routes/achievements"));

app.get("/", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  res.render("home", { username: req.session.username });
});

app.post('/prestige/save', (req, res) => {
  const start = Date.now();
  
  saveToDatabase(req.body.unlockedNodes)
    .then(() => {
      const duration = Date.now() - start;
      console.log(`[⏱️] prestige/save duurde ${duration} ms`);
      res.json({ success: true });
    })
    .catch(err => {
      const duration = Date.now() - start;
      console.error(`[❌] prestige/save faalde na ${duration} ms`, err);
      res.json({ success: false });
    });
});

// 🔧 Dummy implementatie
async function performReincarnation(userId) {
  console.log("Reincarnation gestart voor:", userId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Reincarnation voltooid");
}

app.post('/reincarnate', async (req, res) => {
    const start = Date.now();
    try {
        await performReincarnation(req.session.userId); // of een andere identifier
        const duration = Date.now() - start;
        console.log(`[♻️] /reincarnate duurde ${duration} ms`);
        res.json({
            success: true,
            redirectUrl: "/prestige" // ✅ Hier geef je de redirect door
        });
    } catch (err) {
        const duration = Date.now() - start;
        console.error(`[❌] Fout bij /reincarnate na ${duration} ms`, err);
        res.status(500).json({ success: false });
    }
});

app.use((req, res) => res.status(404).render("errors/404"));
app.use((err, req, res, next) => res.status(500).render("errors/500"));

app.listen(port, () => {
  console.log(`Express gestart op http://localhost:${port}`);
});