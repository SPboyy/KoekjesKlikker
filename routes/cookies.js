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
    cookiesPerClick: 1,
    cookiesPerClickPrice: 10,
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
    startTime: Date.now(),
    totalPlayTime: 0,
    lastUpdate: Date.now(),
    clickCounter: 0
};

function formatPlayTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}


let gameState = { ...DEFAULT_GAME_STATE };

console.log("DEBUG: [Server Init] Initial gameState in RAM:", JSON.stringify(gameState));

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
            cookiesPerClick: savedState.cookiesPerClick || 1,
            cookiesPerClickPrice: savedState.cookiesPerClickPrice || 10,
            startTime: savedState.startTime || Date.now(),
            totalPlayTime: savedState.totalPlayTime || 0,
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
    }
} catch (err) {
    console.error("Error loading gameState.json:", err);
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
            showToast(data.error);
            return;
        }

        document.getElementById('cookieCount').textContent = data.totalCookies;
        document.getElementById('cpsDisplay').textContent = data.cps;

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
    gameState.totalPlayTime += Date.now() - gameState.startTime;
    gameState.startTime = Date.now();
    
    fs.writeFile(gameStatePath, JSON.stringify(gameState), err => {
        if (err) console.error("Error saving game:", err);
    });
}, 10000);

process.on('SIGINT', () => {
    fs.writeFileSync(gameStatePath, JSON.stringify(gameState));
    process.exit();
});


router.get('/', (req, res) => {
    console.log("DEBUG: [GET /] Request received.");
    const username = req.session.username;

    if (username) {

        db.get("SELECT * FROM player WHERE username = ?", [username], (err, row) => {
            if (err) {
                console.error("DEBUG: [GET /] Database error retrieving user data:", err);
            } else if (row) {
                gameState.currentCookies = row.amountOfCookies;
                gameState.totalCookiesEver = row.totalAmountOfCookies;
                gameState.prestigeLevel = row.amountOfRebirths;
                gameState.heavenlyChips = row.amountOfRebirthTokens;
                gameState.cookiesPerClick = row.cookiesPerClick || 1; 
                gameState.cookiesPerClickPrice = row.cookiesPerClickPrice || 10;
                console.log(`DEBUG: [GET /] Loaded user data for ${username} from DB. Current CPC: ${gameState.cookiesPerClick}, Price: ${gameState.cookiesPerClickPrice}`);
            }

            res.render('home', {
                koekies: gameState.currentCookies.toFixed(1),
                cps: gameState.cps.toFixed(1),
                buildings: gameState.buildings,
                prestigeLevel: gameState.prestigeLevel,
                heavenlyChips: gameState.heavenlyChips,
                multiplierPrice: 50,
                discountPrice: 75,
                cookiesPerClick: gameState.cookiesPerClick.toFixed(0), 
                cookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0)
            });
        });
    } else {

        res.render('home', {
            koekies: gameState.currentCookies.toFixed(1),
            cps: gameState.cps.toFixed(1),
            buildings: gameState.buildings,
            prestigeLevel: gameState.prestigeLevel,
            heavenlyChips: gameState.heavenlyChips,
            multiplierPrice: 50,
            discountPrice: 75,
            cookiesPerClick: gameState.cookiesPerClick.toFixed(0),
            cookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0)
        });
    }
});


router.post('/add-cookie', (req, res) => {
    const username = req.session.username;


    const addAmount = gameState.cookiesPerClick; 

    console.log(`DEBUG: [add-cookie] Request received. Adding: ${addAmount}. Current cookies BEFORE add: ${gameState.currentCookies.toFixed(1)}`);

    if (isNaN(addAmount) || addAmount <= 0) { 
        console.warn(`DEBUG: [add-cookie] Invalid amount received/determined: ${addAmount}`);
        return res.status(400).json({ error: "Ongeldig aantal cookies om toe te voegen" });
    }
    
    gameState.currentCookies += addAmount;
    gameState.totalCookiesEver += addAmount;


    if (username) { 
        db.run(`
            UPDATE player
            SET amountOfCookies = ?,
                totalAmountOfCookies = ?
            WHERE username = ?
        `, [gameState.currentCookies, gameState.totalCookiesEver, username], function(dbErr) {
            if (dbErr) {
                console.error("DEBUG: [add-cookie] DB error saving cookies after click:", dbErr);
            } else {
                console.log(`DEBUG: [add-cookie] Cookies saved to DB for ${username}. Current: ${gameState.currentCookies.toFixed(1)}, Total Ever: ${gameState.totalCookiesEver.toFixed(1)}`);
            }
        });
    }
    gameState.clickCounter += 0.5;

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
    upgrade.price = Math.floor(upgrade.price * 10);

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

router.post('/buy-building/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const building = gameState.buildings.find(b => b.id === id);
    const username = req.session.username;

    if (!building) {
        return res.status(404).json({ error: "Building not found" });
    }
    if (gameState.currentCookies < building.price) {
        return res.status(400).json({
            error: `Niet genoeg koekjes`
        });
    }
    gameState.currentCookies -= building.price;
    building.amount += 1;
    building.price = Math.floor(building.price * 1.15);


    if (username) {
        db.run(`
            UPDATE player
            SET amountOfCookies = ?,
                amountOfUpgrades = amountOfUpgrades + 1 -- Aanname: elk gebouw is een upgrade (Dit commentaar is hier wel op zijn plek)
            WHERE username = ?
        `, [gameState.currentCookies, username], function(dbErr) {
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
        totalCookies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});

router.get('/get-upgrades', (req, res) => {
    try {
        const upgrades = gameState.upgrades.map(upgrade => {
            const building = gameState.buildings.find(b => b.id === upgrade.buildingId);
            return {
                buildingName: building ? building.name : 'Unknown',
                type: upgrade.type,
                amount: upgrade.amount || 0
            };
        });
        
        res.json(upgrades);
    } catch (error) {
        console.error('Error getting upgrades:', error);
        res.status(500).json({ error: 'Could not retrieve upgrades' });
    }
});

router.get('/get-stats', (req, res) => {
    const totalBuildings = gameState.buildings.reduce((sum, building) => sum + building.amount, 0);
    const currentTime = Date.now();
    const timePlayedMs = gameState.totalPlayTime + (currentTime - gameState.startTime);
    
    res.json({
        total: gameState.currentCookies.toFixed(1),
        amountOfCookies: Number(gameState.currentCookies.toFixed(1)),
        totalAmountOfCookies: Number(gameState.totalCookiesEver.toFixed(1)),
        totalRebirths: Number(gameState.prestigeLevel),
        timePlayed: formatPlayTime(timePlayedMs),
        totalBuildings: Number(totalBuildings),
        cps: Number(gameState.cps.toFixed(1)),
        cookiesPerClick: Number(gameState.cookiesPerClick.toFixed(1)),
        cookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0)
    });
});


const userUpgradeTimestamps = new Map();
const UPGRADE_DEBOUNCE_MS = 500; 


router.post('/upgrade-cookies-per-click', (req, res) => {
    const username = req.session.username;

    if (!username) {
        console.warn("DEBUG: [upgrade-cookies-per-click] Upgrade attempt by unauthenticated user.");
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    const lastUpgradeTime = userUpgradeTimestamps.get(username) || 0;
    const now = Date.now();
    if (now - lastUpgradeTime < UPGRADE_DEBOUNCE_MS) {
        console.warn(`DEBUG: [upgrade-cookies-per-click] Debounced request for ${username}. Too soon.`);
        return res.status(429).json({ error: "Te snel geklikt. Wacht even." }); 
    }
    userUpgradeTimestamps.set(username, now); 

    console.log(`DEBUG: [upgrade-cookies-per-click] Request from ${username}. Before upgrade. Cookies: ${gameState.currentCookies.toFixed(1)}, CPC: ${gameState.cookiesPerClick.toFixed(1)}, Price: ${gameState.cookiesPerClickPrice.toFixed(0)}`);


    if (gameState.currentCookies < gameState.cookiesPerClickPrice) {
        console.warn(`DEBUG: [upgrade-cookies-per-click] Not enough cookies for ${username}. Needed: ${gameState.cookiesPerClickPrice}, Have: ${gameState.currentCookies.toFixed(1)}`);
        return res.status(400).json({
            error: `Not enough cookies.`
        });
    }


    gameState.currentCookies -= gameState.cookiesPerClickPrice;
    gameState.cookiesPerClick *= 2; 
    gameState.cookiesPerClickPrice = Math.floor(gameState.cookiesPerClickPrice * 10); 

    console.log(`DEBUG: [upgrade-cookies-per-click] After upgrade. Cookies: ${gameState.currentCookies.toFixed(1)}, New CPC: ${gameState.cookiesPerClick.toFixed(1)}, New Price: ${gameState.cookiesPerClickPrice.toFixed(0)}`);


    db.run(`
        UPDATE player
        SET cookiesPerClick = ?,
            cookiesPerClickPrice = ?,
            amountOfCookies = ?
        WHERE username = ?
    `, [gameState.cookiesPerClick, gameState.cookiesPerClickPrice, gameState.currentCookies, username], function(dbErr) {
        if (dbErr) {
            console.error("DEBUG: [upgrade-cookies-per-click] DB error:", dbErr);
            return res.status(500).json({ error: "Kon cookies per click niet updaten in database." });
        }
        console.log(`DEBUG: [upgrade-cookies-per-click] DB updated for ${username}. CPC: ${gameState.cookiesPerClick}, Price: ${gameState.cookiesPerClickPrice}, Cookies: ${gameState.currentCookies.toFixed(1)}`);
        
        
        res.status(200).json({ 
            message: "Cookies per click succesvol geüpgraded.",
            newCookiesPerClick: gameState.cookiesPerClick.toFixed(1), 
            newCookiesPerClickPrice: gameState.cookiesPerClickPrice.toFixed(0), 
            totalCookies: gameState.currentCookies.toFixed(1) 
        });
    });
});
router.post('/buy-upgrade/:id/:type', (req, res) => {
    const id = parseInt(req.params.id);
    const type = req.params.type; 
    const building = gameState.buildings.find(b => b.id === id);

    if (!building) {
        return res.status(404).json({ error: "Building not found" });
    }

    let price = type === 'multiplier' ? 50 : 75;

    if (gameState.currentCookies < price) {
        return res.status(400).json({ error: "Not enough cookies for upgrade." });
    }

    gameState.currentCookies -= price;

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
        totalCookies: gameState.currentCookies.toFixed(1),
        cps: gameState.cps.toFixed(1)
    });
});
router.post('/delete-progress', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ error: "Niet ingelogd" });
    }

    // Reset gameState
    const gameState = {
        currentCookies: 0,
        totalCookiesEver: 0,
        cps: 0,
        prestigeLevel: 0,
        heavenlyChips: 0,
        cookiesPerClick: 1,
        cookiesPerClickPrice: 10,
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
        unlockedPrestigeNodes: [],
        lastUpdate: Date.now(),
        clickCounter: 0
    };

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
        cookiesPerClickPrice = 10
    WHERE username = ?
`, [username], function(dbErr) {
    if (dbErr) {
        console.error("Database reset error:", dbErr);
        return res.status(500).json({ error: "Database reset failed" });
    }

    if (this.changes === 0) {
        console.warn("⚠️ Geen gebruiker gevonden voor reset:", username);
        return res.status(404).json({ error: "Gebruiker niet gevonden" });
    }

    fs.writeFile(gameStatePath, JSON.stringify(gameState), (err) => {
        if (err) {
            console.error("File save error:", err);
            return res.status(500).json({ error: "File save failed" });
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

    let existingState = {};
    if (fs.existsSync(getUserGameStatePath(username))) {
        try {
            existingState = JSON.parse(fs.readFileSync(getUserGameStatePath(username), 'utf8'));
        } catch (err) {
            console.error("Fout bij inlezen bestaande game state:", err);
        }
    }

    const gameState = {
        currentCookies: 0,
        totalCookiesEver: 0,
        cps: 0,
        cookiesPerClick: 1,
        cookiesPerClickPrice: 10,
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
        lastUpdate: Date.now(),
        clickCounter: 0
    };

    fs.writeFile(getUserGameStatePath(username), JSON.stringify(gameState), (err) => {
        if (err) {
            console.error("DEBUG: [prestigeSuccessfully] error saving gameState:", err);
            return res.status(500).json({ error: "Kon game state niet resetten" });
        }

        db.run(`
            UPDATE player
            SET
                amountOfCookies = 0,
                amountOfUpgrades = 0,
                cookiesSpend = 0,
                totalAmountOfCookies = 0,
                cookiesPerClick = 1,
                cookiesPerClickPrice = 10,
                amountOfRebirths = amountOfRebirths + 1,
                amountOfRebirthTokens = amountOfRebirthTokens + 1
            WHERE username = ?
        `, [username], function (dbErr) {
            if (dbErr) {
                console.error("DEBUG: [prestigeSuccessfully] DB error:", dbErr);
                return res.status(500).json({ error: "Kon prestige progressie niet opslaan in de database." });
            }

            console.log(`DEBUG: [prestigeSuccessfully] Prestige succesvol verwerkt voor gebruiker ${username}.`);
            res.status(200).json({ message: "Prestige succesvol uitgevoerd." });
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


        const processedRows = paddedRows.map(row => ({
            username: row.username,
            totalAmountOfCookies: Math.floor(row.totalAmountOfCookies) 
        }));

        res.json({
            topPlayers: processedRows.slice(0, 3),
            fullLeaderboard: processedRows 
        });
    });
});
router.get('/building-prices', (req, res) => {
    const prices = gameState.buildings.map(b => ({
        id: b.id,
        price: b.price.toFixed(1),
        amount: b.amount
    }));

    const upgrades = gameState.upgrades.map(u => ({
        id: u.id,
        buildingId: u.buildingId,
        type: u.type,
        price: u.price.toFixed(1),
        purchased: u.purchased
    }));

    res.json({ prices, upgrades });
});

module.exports = router;