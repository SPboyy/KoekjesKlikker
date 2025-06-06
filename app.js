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

// ✅ Database
const db = new sqlite3.Database('./DataBase.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Verbonden met SQLite database');

    // ✅ Spelertabel
    db.run(`CREATE TABLE IF NOT EXISTS player (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      amountOfCookies INTEGER DEFAULT 0,
      cookiesPerSecond INTEGER DEFAULT 0,
      lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // ✅ Chatberichtentabel
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      color TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.set("trust proxy", 1);
app.use(session({
  store: new SQLiteStore({ db: 'DataBase.db', dir: './' }),
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
app.engine("handlebars", expressHandlebars.engine({
  defaultLayout: "main",
  helpers: {
    json: context => JSON.stringify(context),
    add: (a, b) => a + b,
    formatNumber: (num) => {
      if (!num) return "0";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ ROUTES
app.get("/chatbox", (req, res) => {
  res.render("chatbox");
});
app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/prestige", require("./routes/prestige"));
app.use("/", require("./routes/cookies"));
app.use("/api/achievements", require("./routes/achievements"));

// ✅ Home/Leaderboard
app.get("/", (req, res) => {
  db.all(`
    SELECT username, amountOfCookies 
    FROM player 
    ORDER BY amountOfCookies DESC
    LIMIT 50
  `, (err, rows) => {
    if (err) return res.status(500).render("errors/500");

    const padded = [...rows];
    while (padded.length < 3) {
      padded.push({ username: 'Niemand', amountOfCookies: 0 });
    }

    res.render("home", {
      username: req.session.username,
      userId: req.session.userId,
      topPlayers: padded.slice(0, 3),
      fullLeaderboard: rows,
      currentUser: req.session.username
    });
  });
});

// ✅ Chat API
app.get('/api/chat', (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY timestamp ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Databasefout bij ophalen" });
    res.json(rows);
  });
});

app.post('/api/chat', (req, res) => {
  const { text, color } = req.body;
  if (!text || !color) return res.status(400).json({ error: 'Tekst en kleur verplicht' });

  db.run(`INSERT INTO messages (text, color) VALUES (?, ?)`, [text, color], function (err) {
    if (err) return res.status(500).json({ error: 'Fout bij opslaan' });
    res.status(201).json({ success: true, id: this.lastID });
  });
});

app.delete('/api/chat', (req, res) => {
  db.run(`DELETE FROM messages`, [], (err) => {
    if (err) return res.status(500).json({ error: 'Fout bij verwijderen' });
    res.json({ success: true });
  });
});

// ✅ Statistieken ophalen
app.get('/get-stats', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });

  db.get(`SELECT amountOfCookies, cookiesPerSecond FROM player WHERE id = ?`, [userId], (err, row) => {
    if (err || !row) return res.status(500).json({ error: "Fout bij stats" });
    res.json({ total: row.amountOfCookies, cps: row.cookiesPerSecond });
  });
});

// ✅ Chat functionaliteit behouden
app.post('/add-cookie', (req, res) => {
  let { amount } = req.body;
  const userId = req.session.userId;
  if (!userId || isNaN(amount)) return res.status(400).json({ error: "Ongeldige input" });

  amount = Math.min(parseInt(amount), 1000000);
  db.run(`UPDATE player SET amountOfCookies = amountOfCookies + ? WHERE id = ?`, [amount, userId], (err) => {
    if (err) return res.status(500).json({ error: "Fout bij update" });
    db.get(`SELECT amountOfCookies FROM player WHERE id = ?`, [userId], (err, row) => {
      if (err || !row) return res.status(500).json({ error: "Fout bij ophalen" });
      res.json({ total: row.amountOfCookies });
    });
  });
});

// ✅ Uitloggen
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Fout bij uitloggen");
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// ✅ Error handling
app.use((req, res) => res.status(404).render("errors/404"));
app.use((err, req, res, next) => res.status(500).render("errors/500"));

// ✅ Server starten
app.listen(port, () => {
  console.log(`🚀 Server gestart op http://localhost:${port}`);
});
