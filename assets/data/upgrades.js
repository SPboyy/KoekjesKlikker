const { getBuildings } = require('./buildings');

let upgrades = [
    { upgradeId: 0, name: "Steel Rolling Pin", buildingId: 0, type: "multiplier", amount: 0, basePrice: 100, price: 100 },
    { upgradeId: 1, name: "Rolling Pin Discount", buildingId: 0, type: "discount", amount: 0, basePrice: 200, price: 200 },
    { upgradeId: 2, name: "Super Cookie Monster", buildingId: 1, type: "multiplier", amount: 0, basePrice: 1000, price: 1000 },
    { upgradeId: 3, name: "Cookie Monster Discount", buildingId: 1, type: "discount", amount: 0, basePrice: 1200, price: 1200 },
    { upgradeId: 4, name: "Iron Furnace Boost", buildingId: 2, type: "multiplier", amount: 0, basePrice: 10000, price: 10000 },
    { upgradeId: 5, name: "Furnace Discount", buildingId: 2, type: "discount", amount: 0, basePrice: 12000, price: 12000 }
];

function getUpgrades() {
    return upgrades;
}

function buyUpgrade(upgradeId, gameState) {
    const upgrade = upgrades.find(u => u.upgradeId === upgradeId);
    if (!upgrade) return { error: "Upgrade not found" };

    if (gameState.currentCookies < upgrade.price) return { error: "Not enough cookies" };

    const building = gameState.buildings.find(b => b.id === upgrade.buildingId);
    if (!building) return { error: "Linked building not found" };

    // Uitvoeren aankoop
    gameState.currentCookies -= upgrade.price;
    upgrade.amount += 1;
    upgrade.price = upgrade.basePrice * Math.pow(10, upgrade.amount);

    // Effect toepassen
    if (upgrade.type === "multiplier") {
        building.multiplier = (building.multiplier || 1) * 2;
    } else if (upgrade.type === "discount") {
        building.discount = (building.discount || 0) + 5; // +5% korting per discount upgrade
    }

    // Herbereken prijs van het building object met korting
    const discountFactor = 1 - (building.discount / 100);
    building.price = Math.floor(building.price * 1.15 * discountFactor);

    // CPS herberekenen
    gameState.cps = gameState.buildings.reduce(
        (sum, b) => sum + (b.amount * b.cps * (b.multiplier || 1)), 0
    );

   return {
    totalCookies: gameState.currentCookies.toFixed(1),
    cps: gameState.cps.toFixed(1),
    name: building.name,
    price: building.price,
    amount: building.amount,
    multiplier: building.multiplier,
    discount: building.discount,
    upgradeId: upgrade.upgradeId,
    upgradePrice: upgrade.price,
    upgradeAmount: upgrade.amount,
    type: upgrade.type
};

}

module.exports = {
    getUpgrades,
    buyUpgrade
};
