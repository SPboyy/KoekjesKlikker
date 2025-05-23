const express = require("express");
const expressHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

// Database initialisatie
const db = new sqlite3.Database('./DataBase.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Verbonden met SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS player (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      amountOfCookies INTEGER DEFAULT 0,
      cookiesPerSecond INTEGER DEFAULT 0,
      lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Middleware
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

// Handlebars engine
app.engine("handlebars", expressHandlebars.engine({
  defaultLayout: "main",
  helpers: {
    json: (context) => JSON.stringify(context),
    add: (a, b) => a + b,
    formatNumber: (num) => {
      if (!num) return "0";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/prestige", require("./routes/prestige"));
app.use("/", require("./routes/cookies"));
app.use("/api/achievements", require("./routes/achievements"));

// Leaderboard op `/`
app.get("/", (req, res) => {
  db.all(`
    SELECT username, amountOfCookies 
    FROM player 
    ORDER BY amountOfCookies DESC
    LIMIT 50
  `, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).render("errors/500");
    }

    const paddedRows = [...rows];
    while (paddedRows.length < 3) {
      paddedRows.push({ username: 'Niemand', amountOfCookies: 0 });
    }

    // Geef leaderboard data mee
    res.render("home", {
      username: req.session.username,
      userId: req.session.userId,
      topPlayers: paddedRows.slice(0, 3),
      fullLeaderboard: rows,
      currentUser: req.session.username
    });
  });
});

// Statistieken ophalen voor de ingelogde gebruiker
app.get('/get-stats', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "Niet ingelogd" });
  }

  db.get(`SELECT amountOfCookies, cookiesPerSecond FROM player WHERE id = ?`, [userId], (err, row) => {
    if (err || !row) {
      return res.status(500).json({ error: "Fout bij ophalen van stats" });
    }

    res.json({
      total: row.amountOfCookies,
      cps: row.cookiesPerSecond
    });
  });
});

// Prestige save dummy
app.post('/prestige/save', (req, res) => {
  const start = Date.now();
  
  saveToDatabase(req.body.unlockedNodes) // Dummy functie, zorg dat je deze zelf definieert
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

// Dummy implementatie voor reincarnatie
async function performReincarnation(userId) {
  console.log("Reincarnation gestart voor:", userId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Reincarnation voltooid");
}

app.post('/reincarnate', async (req, res) => {
  const start = Date.now();
  try {
    await performReincarnation(req.session.userId);
    const duration = Date.now() - start;
    console.log(`[♻️] /reincarnate duurde ${duration} ms`);
    res.json({ success: true, redirectUrl: "/prestige" });
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[❌] Fout bij /reincarnate na ${duration} ms`, err);
    res.status(500).json({ success: false });
  }
});

app.post('/add-cookie', (req, res) => {
  let { amount } = req.body;
  const userId = req.session.userId;

  if (!userId || isNaN(amount)) {
    return res.status(400).json({ error: "Ongeldige input of geen sessie." });
  }

  amount = Math.min(parseInt(amount), 1000000); // limiet om abuse te voorkomen

  db.run(`
    UPDATE player
    SET amountOfCookies = amountOfCookies + ?
    WHERE id = ?
  `, [amount, userId], function(err) {
    if (err) {
      console.error('❌ Fout bij updaten van cookies:', err);
      return res.status(500).json({ error: "Database fout" });
    }

    db.get(`
      SELECT amountOfCookies FROM player WHERE id = ?
    `, [userId], (err, row) => {
      if (err || !row) {
        return res.status(500).json({ error: "Fout bij ophalen van cookies" });
      }
      res.json({ total: row.amountOfCookies });
    });
  });
});

// Errors
app.use((req, res) => res.status(404).render("errors/404"));
app.use((err, req, res, next) => res.status(500).render("errors/500"));

// Server starten
app.listen(port, () => {
  console.log(`Server gestart op http://localhost:${port}`);
});