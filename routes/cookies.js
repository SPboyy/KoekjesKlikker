const express = require('express');
const router = express.Router();
const fs = require('fs');

const gameStatePath = './gameState.json';
let gameState = {
    currentCookies: 0,
    totalCookiesEver: 0,
    cps: 0,
    prestigeLevel: 0,
    heavenlyChips: 0,
    buildings: [
        { id: 1, price: 10, name: "Rolling pin", amount: 0, cps: 0.1 },
        { id: 2, price: 100, name: "Cookie monster", amount: 0, cps: 1 },
        { id: 3, price: 1000, name: "Furnace", amount: 0, cps: 10 }
    ]
};

// Probeer game state te laden
try {
    const savedState = fs.readFileSync(gameStatePath, 'utf8');
    gameState = JSON.parse(savedState);
} catch (err) {
    console.log("No saved game state found, using defaults");
}

// Sla game state op
function saveGameState() {
    fs.writeFileSync(gameStatePath, JSON.stringify(gameState));
}

// Bereken CPS
function calculateCPS() {
    return gameState.buildings.reduce((sum, building) => {
        return sum + (building.amount * building.cps);
    }, 0);
}

// Routes
router.get('/', (req, res) => {
    gameState.cps = calculateCPS();
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
    gameState.cps = calculateCPS();
    saveGameState();

    res.json({ 
        total: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.post('/add-passive-cookies', (req, res) => {
    const amount = parseFloat(req.body.amount || 0);
    gameState.currentCookies += amount;
    gameState.totalCookiesEver += amount;
    gameState.cps = calculateCPS();
    saveGameState();

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
    gameState.cps = calculateCPS();
    saveGameState();

    res.json({
        success: true,
        amount: building.amount,
        name: building.name,
        price: building.price,
        totalCookies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

// route voor live stats ophalen
router.get('/get-stats', (req, res) => {
    gameState.cps = calculateCPS();
    res.json({
        total: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

// Elke seconde automatisch cookies toevoegen op basis van CPS
setInterval(() => {
    const cps = calculateCPS();
    gameState.currentCookies += cps;
    gameState.totalCookiesEver += cps;
    saveGameState();
}, 1000);

module.exports = router;
