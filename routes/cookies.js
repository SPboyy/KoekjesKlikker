const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('./DataBase.db');

const gameStatePath = path.join(__dirname, '../gameState.json');

const DEFAULT_GAME_STATE = {
    currentCookies: 0,
    totalCookiesEver: 0,
    cps: 0,
    prestigeLevel: 0,
    heavenlyChips: 0,
    buildings: [
        { id: 0, name: "Rolling pin", basePrice: 10, price: 10, amount: 0, baseCps: 0.1, cps: 0.1, multiplier: 1, discount: 1 },
        { id: 1, name: "Cookie monster", basePrice: 100, price: 100, amount: 0, baseCps: 1, cps: 1, multiplier: 1, discount: 1 },
        { id: 2, name: "Furnace", basePrice: 1000, price: 1000, amount: 0, baseCps: 10, cps: 10, multiplier: 1, discount: 1 }
    ],
    upgrades: [
        { id: 0, buildingId: 0, type: "multiplier", name: "Steel Rolling Pin", price: 50, effect: 2, purchased: false, amount: 0 },
        { id: 1, buildingId: 0, type: "discount", name: "Rolling Pin Discount", price: 75, effect: 0.9, purchased: false, amount: 0 },
        { id: 2, buildingId: 1, type: "multiplier", name: "Super Cookie Monster", price: 500, effect: 2, purchased: false, amount: 0 },
        { id: 3, buildingId: 1, type: "discount", name: "Cookie Monster Discount", price: 750, effect: 0.9, purchased: false, amount: 0 },
        { id: 4, buildingId: 2, type: "multiplier", name: "Iron Furnace Boost", price: 5000, effect: 2, purchased: false, amount: 0 },
        { id: 5, buildingId: 2, type: "discount", name: "Furnace Discount", price: 7500, effect: 0.9, purchased: false, amount: 0 }
    ],
    lastUpdate: Date.now()
};

let gameState = { ...DEFAULT_GAME_STATE };

try {
    if (fs.existsSync(gameStatePath)) {
        const savedState = JSON.parse(fs.readFileSync(gameStatePath, 'utf8'));
        const now = Date.now();
        const timeDiff = (now - (savedState.lastUpdate || now)) / 1000;
        const offlineCookies = (savedState.cps || 0) * timeDiff;

        gameState = {
            ...DEFAULT_GAME_STATE,
            ...savedState,
            currentCookies: savedState.currentCookies + offlineCookies,
            totalCookiesEver: savedState.totalCookiesEver + offlineCookies,
            lastUpdate: now,
            buildings: DEFAULT_GAME_STATE.buildings.map(b => ({
                ...b,
                ...(savedState.buildings.find(sb => sb.id === b.id) || {})
            })),
            upgrades: DEFAULT_GAME_STATE.upgrades.map(u => {
                const savedUpgrade = savedState.upgrades.find(su => su.id === u.id) || {};
                return {
                    ...u,
                    ...savedUpgrade,
                    amount: savedUpgrade.amount || 0,
                    purchased: savedUpgrade.amount > 0
                };
            })
        };

        console.log(`Loaded game state with ${offlineCookies.toFixed(1)} offline cookies`);
    }
} catch {
    console.log("No saved game state found, using defaults");
}

function calculateCPS() {
    return gameState.buildings.reduce((sum, b) => sum + b.amount * b.baseCps * b.multiplier, 0);
}
function buyUpgrade(id, type) {
    fetch(`/buy-upgrade/${id}/${type}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showToast(data.error); // Je kunt ook gewoon alert(data.error) doen
            return;
        }

        document.getElementById('cookieCount').textContent = data.totalCookies;
        document.getElementById('cpsDisplay').textContent = data.cps;

        // Eventueel DOM updaten met nieuwe prijs
        console.log(`Upgrade ${type} gekocht voor building ${id}`);
    })
    .catch(err => console.error('Upgrade error:', err));
}
function updatePassiveCookies() {
    const now = Date.now();
    const seconds = (now - gameState.lastUpdate) / 1000;
    const generated = gameState.cps * seconds;
    gameState.currentCookies += generated;
    gameState.totalCookiesEver += generated;
    gameState.lastUpdate = now;
}

setInterval(() => {
    updatePassiveCookies();
    gameState.cps = calculateCPS();
}, 500);

setInterval(() => {
    fs.writeFile(gameStatePath, JSON.stringify(gameState), err => {
        if (err) console.error("Error saving game:", err);
    });
}, 10000);

process.on('SIGINT', () => {
    fs.writeFileSync(gameStatePath, JSON.stringify(gameState));
    process.exit();
});

// Routes
router.get('/', (req, res) => {
    res.render('home', {
        koekies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1),
        buildings: gameState.buildings,
        upgrades: gameState.upgrades,
        prestigeLevel: gameState.prestigeLevel,
        heavenlyChips: gameState.heavenlyChips
    });
});

router.post('/add-cookie', (req, res) => {
    gameState.currentCookies += 1;
    gameState.totalCookiesEver += 1;

    res.json({
        total: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.get('/get-prices', (req, res) => {
    // De functie getActivePlayer is niet gedefinieerd. Je moet dit vervangen of implementeren.
    // const player = getActivePlayer(req);
    // if (!player) return res.status(401).json({ error: 'Niet ingelogd' });

    res.json({
        upgrades: gameState.upgrades,
        buildings: gameState.buildings
    });
});

router.post('/buy-building/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const building = gameState.buildings.find(b => b.id === id);

    if (!building) return res.status(404).json({ error: "Building not found" });

    const finalPrice = Math.floor(building.price * building.discount);

    if (gameState.currentCookies < finalPrice) {
        return res.status(400).json(`{ error: Not enough cookies. Needed: ${finalPrice}, Have: ${gameState.currentCookies} }`);
    }

    gameState.currentCookies -= finalPrice;
    building.amount += 1;
    building.price = Math.floor(building.basePrice * Math.pow(1.15, building.amount) * building.discount);
    gameState.cps = calculateCPS();

    res.json({
        success: true,
        amount: building.amount,
        name: building.name,
        price: building.price,
        totalCookies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.get('/get-stats', (req, res) => {
    res.json({
        total: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.post('/buy-upgrade/:buildingId/:type', (req, res) => {
    const buildingId = parseInt(req.params.buildingId);
    const type = req.params.type;

    const upgrade = gameState.upgrades.find(u => 
        u.buildingId === buildingId && u.type === type
    );

    if (!upgrade) return res.status(404).json({ error: "Upgrade not found" });

    if (gameState.currentCookies < upgrade.price) {
        return res.status(400).json({ 
            error: "Not enough cookies", 
            required: upgrade.price, 
            current: gameState.currentCookies 
        });
    }

    const building = gameState.buildings.find(b => b.id === buildingId);
    if (!building) return res.status(404).json({ error: "Building not found" });

    gameState.currentCookies -= upgrade.price;
    upgrade.amount = (upgrade.amount || 0) + 1;
    upgrade.purchased = true;
    upgrade.price = Math.floor(upgrade.price * 1.5);

    if (type === "multiplier") {
        building.multiplier *= upgrade.effect;
    } else if (type === "discount") {
        building.discount = Math.max(0.1, building.discount * upgrade.effect);
    }

    building.cps = building.baseCps * building.multiplier;
    building.price = Math.floor(building.basePrice * Math.pow(1.15, building.amount) * building.discount);
    gameState.cps = calculateCPS();

    res.json({
        success: true,
        currentCookies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1),
        building,
        upgrade,
        buildings: gameState.buildings,
        upgrades: gameState.upgrades
    });
});

router.post('/delete-progress', (req, res) => {
    gameState = { ...DEFAULT_GAME_STATE, lastUpdate: Date.now() };

    fs.writeFile(gameStatePath, JSON.stringify(gameState), err => {
        if (err) {
            console.error("error:", err);
            return res.status(500).json({ error: "couldn't reset game state" });
        }

        res.status(200).json({ message: "Progression reset successfully." });
    });
});

router.get('/api/leaderboard', (req, res) => {
    db.all(`
        SELECT username, amountOfCookies 
        FROM player 
        ORDER BY amountOfCookies DESC 
        LIMIT 50`
    , (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const paddedRows = [...rows];
        while (paddedRows.length < 3) {
            paddedRows.push({ username: 'Niemand', amountOfCookies: 0 });
        }

        res.json({
            topPlayers: paddedRows.slice(0, 3),
            fullLeaderboard: rows
        });
    });
});

// ⚠️ Frontend-functie hoort hier niet thuis. Verplaats autoRefreshPrices naar een JS-bestand op de client.
module.exports = router;