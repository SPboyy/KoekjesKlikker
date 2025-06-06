const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database('./DataBase.db'); // <-- Controleer dit pad

const gameStatePath = path.join(__dirname, '../gameState.json'); // <-- Controleer dit pad

// Initial game state in RAM
let gameState = {
    amountOfCookies: 0,
    totalAmountOfCookies: 0,
    cps: 0,
    amountOfRebirths: 0,
    amountOfRebirthTokens: 0,
    cookiesPerClick: 1, // Zorg dat de RAM initieel 1 is
    cookiesPerClickPrice: 10,
    buildings: [
        { id: 0, price: 10, name: "Rolling pin", amount: 0, cps: 0.1 },
        { id: 1, price: 100, name: "Cookie monster", amount: 0, cps: 1 },
        { id: 2, price: 1000, name: "Furnace", amount: 0, cps: 10 }
    ],
    lastUpdate: Date.now(),
    clickCounter:0
};
console.log("DEBUG: [Server Init] Initial gameState in RAM:", JSON.stringify(gameState));

// Load save - Zorg dat cookiesPerClick en cookiesPerClickPrice ook correct worden geladen
try {
    if (fs.existsSync(gameStatePath)) {
        const savedState = JSON.parse(fs.readFileSync(gameStatePath, 'utf8'));
        const now = Date.now();
        const timeDiff = (now - (savedState.lastUpdate || now)) / 1000;
        const offlineCookies = (savedState.cps || 0) * timeDiff;

        gameState = {
            ...savedState,
            amountOfCookies: savedState.amountOfCookies + offlineCookies,
            totalAmountOfCookies: savedState.totalAmountOfCookies + offlineCookies,
            cps:savedState.cps||0,
            amountOfRebirths:savedState.amountOfRebirths||0,
            amountOfRebirthTokens:savedState.amountOfRebirthTokens||0,
            cookiesPerClick: savedState.cookiesPerClick || 1, // Default 1 als niet gevonden in file
            cookiesPerClickPrice: savedState.cookiesPerClickPrice || 10,
            lastUpdate: now

        };
        console.log(`DEBUG: [Server Init] Loaded gameState.json. Offline cookies: ${offlineCookies.toFixed(1)}`);
        console.log("DEBUG: [Server Init] GameState after loading file:", JSON.stringify(gameState));
    } else {
        console.log("DEBUG: [Server Init] gameState.json not found, using default RAM state.");
    }
} catch (err) {
    console.error("DEBUG: [Server Init] Error loading gameState.json:", err);
    console.log("DEBUG: [Server Init] Using default RAM state due to error.");
}

function calculateCPS() {
    return gameState.buildings.reduce((sum, b) => sum + (b.amount * b.cps), 0);
}

function updatePassiveCookies() {
    const now = Date.now();
    const seconds = (now - gameState.lastUpdate) / 1000;
    const generated = gameState.cps * seconds;
    gameState.amountOfCookies += generated;
    gameState.totalAmountOfCookies += generated;
    gameState.lastUpdate = now;
}

setInterval(() => {
    updatePassiveCookies()/2;
    gameState.cps = calculateCPS();
}, 500);

// Auto-save - Deze slaat de huidige gameState in RAM op, dus inclusief cookiesPerClick
setInterval(() => {
    fs.writeFile(gameStatePath, JSON.stringify(gameState), (err) => {
        if (err) console.error("Error saving game:", err);
    });
    
}, 10000);

// Shutdown handling
process.on('SIGINT', () => {
    fs.writeFileSync(gameStatePath, JSON.stringify(gameState));
    process.exit();
});

// Routes
router.get('/', (req, res) => {
    console.log("DEBUG: [GET /] Request received.");
    const username = req.session.username;

    if (username) {
        // Laad de gebruikersdata uit de database
        db.get("SELECT * FROM player WHERE username = ?", [username], (err, row) => {
            if (err) {
                console.error("DEBUG: [GET /] Database error retrieving user data:", err);
            } else if (row) {
                // Update gameState in RAM met database waarden
                gameState.amountOfCookies = row.amountOfCookies;
                gameState.totalAmountOfCookies = row.totalAmountOfCookies;
                gameState.amountOfRebirths = row.amountOfRebirths;
                gameState.amountOfRebirthTokens = row.amountOfRebirthTokens;
                gameState.cookiesPerClick = row.cookiesPerClick || 1; // Default 1 als niet gevonden in DB
                gameState.cookiesPerClickPrice = row.cookiesPerClickPrice || 10;
                console.log(`DEBUG: [GET /] Loaded user data for ${username} from DB. Current CPC: ${gameState.cookiesPerClick}, Price: ${gameState.cookiesPerClickPrice}`);
            }
            // Render de pagina na het (eventueel) updaten van gameState
            res.render('home', {
                cookies: gameState.amountOfCookies.toFixed(1),
                cps: gameState.cps.toFixed(1),
                buildings: gameState.buildings,
                prestigeLevel: gameState.amountOfRebirths,
                heavenlyChips: gameState.amountOfRebirthTokens,
                multiplierPrice: 50,
                discountPrice: 75,
                cookiesPerClick: gameState.cookiesPerClick.toFixed(0), // Afronden op 0 decimalen voor weergave
                cookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0)
            });
        });
    } else {
        // Als er geen gebruiker is ingelogd, gebruik dan de standaard gameState
        res.render('home', {
            cookies: gameState.amountOfCookies.toFixed(1),
            cps: gameState.cps.toFixed(1),
            buildings: gameState.buildings,
            prestigeLevel: gameState.amountOfRebirths,
            heavenlyChips: gameState.amountOfRebirthTokens,
            multiplierPrice: 50,
            discountPrice: 75,
            cookiesPerClick: gameState.cookiesPerClick.toFixed(0), // Afronden op 0 decimalen voor weergave
            cookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0)
        });
    }
});

// Route voor het toevoegen van cookies door te klikken (server bepaalt hoeveelheid)
router.post('/add-cookie', (req, res) => {
    const username = req.session.username;

    // De hoeveelheid die wordt toegevoegd, is nu direct afkomstig van de server's gameState
    const addAmount = gameState.cookiesPerClick; // <<-- HIER IS DE BELANGRIJKE VERANDERING

    console.log(`DEBUG: [add-cookie] Request received. Adding: ${addAmount}. Current cookies BEFORE add: ${gameState.currentCookies.toFixed(1)}`);

    if (isNaN(addAmount) || addAmount <= 0) { // Dit zou nu niet meer getriggerd moeten worden met addAmount=gameState.cookiesPerClick
        console.warn(`DEBUG: [add-cookie] Invalid amount received/determined: ${addAmount}`);
        return res.status(400).json({ error: "Ongeldig aantal cookies om toe te voegen" });
    }
    
    gameState.amountOfCookies += addAmount;
    gameState.totalAmountOfCookies += addAmount;

    // NIEUW: Update de database na elke klik
    if (username) { // Alleen opslaan als er een gebruiker is ingelogd
        db.run(`
            UPDATE player
            SET amountOfCookies = ?,
                totalAmountOfCookies = ?
            WHERE username = ?
        `, [gameState.amountOfCookies, gameState.totalAmountOfCookies, username], function(dbErr) {
            if (dbErr) {
                console.error("DEBUG: [add-cookie] DB error saving cookies after click:", dbErr);
            } else {
                console.log(`DEBUG: [add-cookie] Cookies saved to DB for ${username}. Current: ${gameState.amountOfCookies.toFixed(1)}, Total Ever: ${gameState.totalAmountOfCookies.toFixed(1)}`);
            }
        });
    }
    gameState.clickCounter += 0.5;

    res.json({
        total: gameState.amountOfCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});
router.post('/buy-upgrade/:id/:type', (req, res) => {
    const id = parseInt(req.params.id);
    const type = req.params.type; // 'multiplier' of 'discount'
    const building = gameState.buildings.find(b => b.id === id);

    if (!building) {
        return res.status(404).json({ error: "Building not found" });
    }

    let price = type === 'multiplier' ? 50 : 75;

    if (gameState.amountOfCookies < price) {
        return res.status(400).json({ error: "Not enough cookies for upgrade." });
    }

    gameState.amountOfCookies -= price;

    if (type === 'multiplier') {
        building.cps *= 2;
    } else if (type === 'discount') {
        building.price = Math.floor(building.price * 0.9);
    } else {
        return res.status(400).json({ error: "Invalid upgrade type." });
    }

    gameState.cps = calculateCPS();

    return res.status(200).json({
        message: "Upgrade purchased",
        buildingId: building.id,
        newPrice: building.price,
        newCps: building.cps,
        totalAmountOfCookies: gameState.amountOfCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.post('/buy-upgrade/:id/:type', (req, res) => {
    const userId = req.session.userId;
    const gameState = loadGameState();
    const player = gameState.activePlayers.find(p => p.userId === userId);

    if (!player) return res.status(404).json({ error: 'Player not found' });

    const id = parseInt(req.params.id);
    const type = req.params.type;

    const upgrade = player.upgrades?.[id]?.[type];
    if (!upgrade) return res.status(400).json({ error: 'Invalid upgrade type or building' });

    const price = upgrade.price;
    if (player.totalAmountOfCookies < price) {
        return res.status(400).json({ error: 'Not enough cookies' });
    }

    // Koop de upgrade
    player.totalAmountOfCookies -= price;
    upgrade.level = (upgrade.level || 1) + 1;

    if (type === 'multiplier') {
        // Multiplier groeit exponentieel
        upgrade.multiplier = (upgrade.multiplier || 1) * 2;
    } else if (type === 'discount') {
        // 10% korting op buildings
        const building = player.buildings[id];
        building.price = Math.floor(building.price * 0.9);
    }

    // Verhoog de upgradeprijs exponentieel
    upgrade.price = Math.floor(upgrade.price * 10);

    // Recalculate CPS
    player.cps = calculateCPS(player);

    saveGameState(gameState);

    res.json({
        totalAmountOfCookies: player.totalAmountOfCookies,
        cps: player.cps,
        newPrice: upgrade.price
    });
});

router.post('/buy-building/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const building = gameState.buildings.find(b => b.id === id);
    const username = req.session.username;

    if (!building) {
        return res.status(404).json({ error: "Building not found" });
    }
    if (gameState.amountOfCookies < building.price) {
        return res.status(400).json({
            error: `Niet genoeg koekjes`
        });
    }
    gameState.amountOfCookies -= building.price;
    building.amount += 1;
    building.price = Math.floor(building.price * 1.15);

    // NIEUW: Update de database na aankoop van een gebouw
    if (username) {
        db.run(`
            UPDATE player
            SET amountOfCookies = ?,
                amountOfUpgrades = amountOfUpgrades + 1 -- Aanname: elk gebouw is een upgrade (Dit commentaar is hier wel op zijn plek)
            WHERE username = ?
        `, [gameState.amountOfCookies, username], function(dbErr) {
            if (dbErr) {
                console.error("DEBUG: [buy-building] DB error saving after purchase:", dbErr);
            } else {
                console.log(`DEBUG: [buy-building] Cookies and upgrades saved to DB for ${username}.`);
            }
        });
    }

    res.json({
        success: true,
        amount: building.amount,
        name: building.name,
        price: building.price,
        totalAmountOfCookies: gameState.amountOfCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

// Aangepaste GET /get-stats route om cookiesPerClick en cookiesPerClickPrice mee te sturen
router.get('/get-stats', (req, res) => {
    try {
        // Sum the amount of each building
        const totalBuildings = gameState.buildings.reduce((sum, building) => sum + (building.amount || 0), 0);

        res.json({
            amountOfCookies: gameState.amountOfCookies?.toFixed(1) ?? "0.0",
            totalAmountOfCookies: gameState.totalAmountOfCookies?.toFixed(1) ?? "0.0",
            amountOfRebirths: gameState.amountOfRebirths?.toFixed(1) ?? "0.0",
            timePlayed: gameState.timePlayed ?? 0,
            totalBuildings: totalBuildings.toFixed(1),
            cps: gameState.cps?.toFixed(1) ?? "0.0",
            cookiesPerClick: gameState.cookiesPerClick?.toFixed(0) ?? "0",
            cookiesPerClickPrice: gameState.cookiesPerClickPrice?.toFixed(0) ?? "0"
        });
    } catch (error) {
        console.error("Error in /get-stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Tijdstempel map om debounce per gebruiker te beheren
const userUpgradeTimestamps = new Map();
const UPGRADE_DEBOUNCE_MS = 500; // 0.5 seconde debounce

// NIEUWE ROUTE: Upgrade cookiesPerClick
router.post('/upgrade-cookies-per-click', (req, res) => {
    const username = req.session.username;

    if (!username) {
        console.warn("DEBUG: [upgrade-cookies-per-click] Upgrade attempt by unauthenticated user.");
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    // Debounce check
    const lastUpgradeTime = userUpgradeTimestamps.get(username) || 0;
    const now = Date.now();
    if (now - lastUpgradeTime < UPGRADE_DEBOUNCE_MS) {
        console.warn(`DEBUG: [upgrade-cookies-per-click] Debounced request for ${username}. Too soon.`);
        return res.status(429).json({ error: "Te snel geklikt. Wacht even." }); // 429 Too Many Requests
    }
    userUpgradeTimestamps.set(username, now); // Update de timestamp

    console.log(`DEBUG: [upgrade-cookies-per-click] Request from ${username}. Before upgrade. Cookies: ${gameState.currentCookies.toFixed(1)}, CPC: ${gameState.cookiesPerClick.toFixed(1)}, Price: ${gameState.cookiesPerClickPrice.toFixed(0)}`);

    // BELANGRIJK: Check op genoeg koekjes
    if (gameState.amountOfCookies < gameState.cookiesPerClickPrice) {
        console.warn(`DEBUG: [upgrade-cookies-per-click] Not enough cookies for ${username}. Needed: ${gameState.cookiesPerClickPrice}, Have: ${gameState.currentCookies.toFixed(1)}`);
        return res.status(400).json({
            error: `Not enough cookies.`
        });
    }

    // Trek de prijs af en verdubbel de cookiesPerClick
    gameState.amountOfCookies -= gameState.cookiesPerClickPrice;
    gameState.cookiesPerClick *= 2; // Hier verdubbelt het
    gameState.cookiesPerClickPrice = Math.floor(gameState.cookiesPerClickPrice * 1.15); // Verhoog de prijs voor de volgende upgrade

    console.log(`DEBUG: [upgrade-cookies-per-click] After upgrade. Cookies: ${gameState.amountOfCookies.toFixed(1)}, New CPC: ${gameState.cookiesPerClick.toFixed(1)}, New Price: ${gameState.cookiesPerClickPrice.toFixed(0)}`);

    // Werk de database bij met de nieuwe cookiesPerClick en cookiesPerClickPrice waarde
    db.run(`
        UPDATE player
        SET cookiesPerClick = ?,
            cookiesPerClickPrice = ?,
            amountOfCookies = ?
        WHERE username = ?
    `, [gameState.cookiesPerClick, gameState.cookiesPerClickPrice, gameState.amountOfCookies, username], function(dbErr) {
        if (dbErr) {
            console.error("DEBUG: [upgrade-cookies-per-click] DB error:", dbErr);
            return res.status(500).json({ error: "Kon cookies per click niet updaten in database." });
        }
        console.log(`DEBUG: [upgrade-cookies-per-click] DB updated for ${username}. CPC: ${gameState.cookiesPerClick}, Price: ${gameState.cookiesPerClickPrice}, Cookies: ${gameState.amountOfCookies.toFixed(1)}`);
        
        // Stuur de nieuwe waarden terug naar de client
        res.status(200).json({ 
            message: "Cookies per click succesvol geüpgraded.",
            newCookiesPerClick: gameState.cookiesPerClick.toFixed(1), // Stuur als string voor weergave
            newCookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0), // Stuur als string voor weergave
            totalAmountOfCookies: gameState.amountOfCookies.toFixed(1) // Stuur als string voor weergave
        });
    });
});

router.post('/delete-progress', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    // Reset gameState
    gameState = {
        amountOfCookies: 0,
        totalAmountOfCookies: 0,
        cps: 0,
        amountOfRebirths: 0,
        amountOfRebirthTokens: 0,
        cookiesPerClick: 1,
        cookiesPerClickPrice: 10,
        buildings: [
            { id: 0, price: 10, name: "Rolling pin", amount: 0, cps: 0.1 },
            { id: 1, price: 100, name: "Cookie monster", amount: 0, cps: 1 },
            { id: 2, price: 1000, name: "Furnace", amount: 0, cps: 10 }
        ],
        lastUpdate: Date.now()
    };

    // First update the database
    db.run(`
        UPDATE player
        SET
            amountOfCookies = 0,
            amountOfRebirths = 0,
            amountOfUpgrades = 0,
            amountOfRebirthTokens = 0,
            cookiesSpend = 0,
            totalAmountOfCookies = 0,
            unlockedPrestigeNodes = '[]',
            cookiesPerClick = 1,
            cookiesPerClickPrice = 10,
            achAmount1 = 0,
            achAmount100 = 0,
            achAmount1000 = 0,
            achAmount10000 = 0,
            achAmount100000 = 0,
            achAmount1000000 = 0,
            achAmount10000000 = 0,
            achAmount100000000 = 0,
            achAmount1000000000 = 0
        WHERE username = ?
    `, [username], function(dbErr) {
        if (dbErr) {
            console.error("Database reset error:", dbErr);
            return res.status(500).json({ error: "Database reset failed" });
        }

        // Then save to file
        fs.writeFile(gameStatePath, JSON.stringify(gameState), (err) => {
            if (err) {
                console.error("File save error:", err);
                return res.status(500).json({ error: "File save failed but database was reset" });
            }
            
            res.status(200).json({ message: "Progress reset successfully" });
        });
    });
});

router.post('/prestigeSuccessfully', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    // Let op: Bij prestige reset je waarschijnlijk niet ALLES naar 0, maar dit is de huidige logica.
    gameState = {
        amountOfCookies: 0,
        totalAmountOfCookies: 0,
        cps: 0,
        amountOfRebirths: gameState.amountOfRebirths + 1, // Voorbeeld: verhoog prestige level
        amountOfRebirthTokens: gameState.amountOfRebirthTokens + 1, // Voorbeeld: geef 1 chip per prestige
        cookiesPerClick: 1, // Reset naar 1
        cookiesPerClickPrice: 10, // Reset deze ook naar 10
        buildings: [
            { id: 0, price: 10, name: "Rolling pin", amount: 0, cps: 0.1 },
            { id: 1, price: 100, name: "Cookie monster", amount: 0, cps: 1 },
            { id: 2, price: 1000, name: "Furnace", amount: 0, cps: 10 }
        ],
        lastUpdate: Date.now()
    };
    
    fs.writeFile(gameStatePath, JSON.stringify(gameState), (err) => {
        if (err) {
            console.error("DEBUG: [prestigeSuccessfully] error saving gameState:", err);
            return res.status(500).json({ error: "couldn't reset game state" });
        }
        console.log("DEBUG: [prestigeSuccessfully] gameState.json succesvol gereset voor prestige.");

        // Update ook de database voor de prestiged user
        db.run(`
            UPDATE player
            SET
                amountOfCookies = ?,
                amountOfRebirths = ?,
                amountOfRebirthTokens = ?,
                cookiesPerClick = ?,
                cookiesPerClickPrice = ?
            WHERE username = ?
        `, [gameState.amountOfCookies, gameState.amountOfRebirths, gameState.amountOfRebirthTokens, gameState.cookiesPerClick, gameState.cookiesPerClickPrice, username], function(dbErr) {
            if (dbErr) {
                console.error("DEBUG: [prestigeSuccessfully] DB error:", dbErr);
                return res.status(500).json({ error: "Kon prestige progressie in de database niet updaten." });
            }
            console.log(`DEBUG: [prestigeSuccessfully] Database prestige progressie voor gebruiker ${username} succesvol geüpdatet.`);
            res.status(200).json({ message: "successfully prestiged." });
        });
    });
});

router.get('/api/leaderboard', (req, res) => {
    db.all(`
        SELECT username, totalAmountOfCookies
        FROM player
        ORDER BY totalAmountOfCookies DESC
        LIMIT 50
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        const paddedRows = [...rows];
        while (paddedRows.length < 3) {
            paddedRows.push({ username: 'Niemand', totalAmountOfCookies: 0 });
        }

        // Convert amountOfCookies to an integer for display
        const processedRows = paddedRows.map(row => ({
            username: row.username,
            totalAmountOfCookies: Math.floor(row.totalAmountOfCookies) // Use Math.floor to get an integer
        }));

        res.json({
            topPlayers: processedRows.slice(0, 3),
            fullLeaderboard: processedRows // Use processedRows for the full leaderboard as well
        });
    });
});
router.get('/get-stats', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    db.get(
      `SELECT 
         amountOfCookies, 
         totalAmountOfCookies, 
         totalCookiesThisRebirth,
         totalRebirths,
         timePlayed,
         totalBuildings,
         cookiesPerClick
       FROM player WHERE username = ?`, 
      [username], 
      (err, row) => {
        if (err) {
            console.error("[get-stats] DB error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (!row) {
            return res.status(404).json({ error: "User not found" });
        }
        // If you don't store these in DB, fallback to defaults
        const statsResponse = {
        amountOfCookies: Number(row.amountOfCookies || 0).toFixed(0),
        totalAmountOfCookies: Number(row.totalAmountOfCookies || 0).toFixed(0),
        totalRebirths: Number(row.totalRebirths || 0),
        timePlayed: row.timePlayed || "0h 0m",
        totalBuildings: Number(row.totalBuildings || 0),
        cps: 0, // Replace with real CPS calculation if needed
        cpc: Number(row.cookiesPerClick || 1),
};

        res.json(statsResponse);       
    });
    });
module.exports = router;