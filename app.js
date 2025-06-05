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

// Static bestanden
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
app.get("/chatbox", (req, res) => {
  res.render("chatbox");
});

app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));
app.use("/prestige", require("./routes/prestige"));
app.use("/", require("./routes/cookies"));
app.use("/api/achievements", require("./routes/achievements"));

// Home route + leaderboard
app.get("/", (req, res) => {
    const userId = req.session.userId; // Gebruik consistent userId

    db.get(`SELECT * FROM player WHERE id = ?`, [userId], (playerErr, playerRow) => {
        if (playerErr) {
            console.error("❌ Fout bij ophalen spelerdata voor home route:", playerErr);
            return res.status(500).render("errors/500");
        }

        let koekies = 0;
        let cps = 0;
        let cookiesPerClick = 1;
        let cookiesPerClickPrice = 10;
        let buildingsData = [];
        let upgradesData = [];

        if (playerRow) {
            koekies = playerRow.amountOfCookies;
            cps = playerRow.cookiesPerSecond;
            cookiesPerClick = playerRow.cookiesPerClick;
            cookiesPerClickPrice = playerRow.cookiesPerClickPrice;

            // Gebruik de helperfunctie voor het parsen en initialiseren
            ({ buildings: buildingsData, upgrades: upgradesData } = initializePlayerGameData(playerRow));

        } else {
            console.log("ℹ️ Geen spelerdata gevonden (niet ingelogd of nieuwe sessie). Gebruik standaardwaarden en initialiseer items.");
            // Voor niet-ingelogde gebruikers of nieuwe sessies, geef standaardwaarden mee
            buildingsData = initialBuildings.map(b => ({ ...b, amount: 0, price: b.price, cps: b.cps }));
            upgradesData = initialUpgrades.map(u => ({ ...u, level: 0, price: u.price }));
        }

        // Nu de leaderboard data ophalen
        db.all(`
            SELECT username, amountOfCookies
            FROM player
            ORDER BY amountOfCookies DESC
            LIMIT 50
        `, (leaderboardErr, rows) => {
            if (leaderboardErr) {
                console.error("❌ Fout bij ophalen leaderboard data:", leaderboardErr);
                // Render home met lege leaderboard als er een fout is
                return res.status(500).render("home", {
                    username: req.session.username,
                    userId: req.session.userId,
                    koekies: koekies,
                    cps: cps,
                    cookiesPerClick: cookiesPerClick,
                    cookiesPerClickPrice: cookiesPerClickPrice,
                    buildings: buildingsData,
                    upgrades: upgradesData,
                    topPlayers: [],
                    fullLeaderboard: [],
                    currentUser: req.session.username
                });
            }

            const paddedRows = [...rows];
            while (paddedRows.length < 3) {
                paddedRows.push({ username: 'Niemand', amountOfCookies: 0 });
            }

            console.log("DEBUG: Volledige Data naar Handlebars:", {
                username: req.session.username,
                userId: req.session.userId,
                koekies: koekies,
                cps: cps,
                cookiesPerClick: cookiesPerClick,
                cookiesPerClickPrice: cookiesPerClickPrice,
                buildings: buildingsData,
                upgrades: upgradesData,
                topPlayers: paddedRows.slice(0, 3),
                fullLeaderboard: rows,
                currentUser: req.session.username
            });

            res.render("home", {
                username: req.session.username,
                userId: req.session.userId,
                koekies: koekies,
                cps: cps,
                cookiesPerClick: cookiesPerClick,
                cookiesPerClickPrice: cookiesPerClickPrice,
                buildings: buildingsData,
                upgrades: upgradesData,
                topPlayers: paddedRows.slice(0, 3),
                fullLeaderboard: rows,
                currentUser: req.session.username
            });
        });
    });
});

// API: Get stats
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

// Uitloggen
app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error("Fout bij uitloggen:", err);
      return res.status(500).send("Kon sessie niet beëindigen");
    }

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// Prestige opslaan (dummy)
app.post('/prestige/save', (req, res) => {
  const start = Date.now();
  
  saveToDatabase(req.body.unlockedNodes) // Dummy functie
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

// Dummy reincarnatie functie
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

// Cookies toevoegen (API)
app.post('/add-cookie', (req, res) => {
  let { amount } = req.body;
  const userId = req.session.userId;

  if (!userId || isNaN(amount)) {
    return res.status(400).json({ error: "Ongeldige input of geen sessie." });
  }

  amount = Math.min(parseInt(amount), 1000000); // Limiet tegen abuse

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

// Error handling
app.use((req, res) => res.status(404).render("errors/404"));
app.use((err, req, res, next) => res.status(500).render("errors/500"));

// Server starten
app.listen(port, () => {
  console.log(`🚀 Server gestart op http://localhost:${port}`);
});
