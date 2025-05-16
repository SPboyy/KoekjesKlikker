const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const gameStatePath = path.join(__dirname, '../gameState.json');

// Initial game state in RAM
let gameState = {
    currentCookies: 0,
    totalCookiesEver: 0,
    cps: 0,
    prestigeLevel: 0,
    heavenlyChips: 0,
    buildings: [
        { id: 0, price: 10, name: "Rolling pin", amount: 0, cps: 0.1 },
        { id: 1, price: 100, name: "Cookie monster", amount: 0, cps: 1 },
        { id: 2, price: 1000, name: "Furnace", amount: 0, cps: 10 }
    ],
    lastUpdate: Date.now()
};

// Load save
try {
    if (fs.existsSync(gameStatePath)) {
        const savedState = JSON.parse(fs.readFileSync(gameStatePath, 'utf8'));
        const now = Date.now();
        const timeDiff = (now - (savedState.lastUpdate || now)) / 1000;
        const offlineCookies = (savedState.cps || 0) * timeDiff;

        gameState = {
            ...savedState,
            currentCookies: savedState.currentCookies + offlineCookies,
            totalCookiesEver: savedState.totalCookiesEver + offlineCookies,
            lastUpdate: now
        };

        console.log(`Loaded game state with ${offlineCookies.toFixed(1)} offline cookies`);
    }
} catch (err) {
    console.log("No saved game state found, using defaults");
}

function calculateCPS() {
    return gameState.buildings.reduce((sum, b) => sum + (b.amount * b.cps), 0);
}

function updatePassiveCookies() {
    const now = Date.now();
    const seconds = (now - gameState.lastUpdate) / 1000;
    const generated = gameState.cps * seconds;

    gameState.currentCookies += generated;
    gameState.totalCookiesEver += generated;
    gameState.lastUpdate = now;
}

// Passive income + CPS update
setInterval(() => {
    updatePassiveCookies();
    gameState.cps = calculateCPS();
}, 1000);

// Auto-save
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
    res.render('home', {
        koekies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1),
        buildings: gameState.buildings,
        prestigeLevel: gameState.prestigeLevel,
        heavenlyChips: gameState.heavenlyChips,
        multiplierPrice: 50,
        discountPrice: 75
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

router.post('/buy-building/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const building = gameState.buildings.find(b => b.id === id);

    if (!building) {
        return res.status(404).json({ error: "Building not found" });
    }

    if (gameState.currentCookies < building.price) {
        return res.status(400).json({
            error: `Not enough cookies. Needed: ${building.price}, Have: ${gameState.currentCookies}`
        });
    }

    gameState.currentCookies -= building.price;
    building.amount += 1;
    building.price = Math.floor(building.price * 1.15);

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

module.exports = router;
