let buildings = [
    { buildingId: 0, price: 10, name: "Rolling pin", priceIncrease: 1.2, amount: 0, multiplier: 1, cps: 0.1 },
    { buildingId: 1, price: 100, name: "Cookie monster", priceIncrease: 1.2, amount: 0, multiplier: 1, cps: 1 },
    { buildingId: 2, price: 1000, name: "Iron furnace", priceIncrease: 1.2, amount: 0, multiplier: 1, cps: 10 }
];

function getBuildings() {
    return buildings;
}

function buyBuilding(buildingId, totalCookies) {
    const building = buildings.find(b => b.buildingId === buildingId);
    
    if (!building) {
        return { error: "Building not found" };
    }
    
    totalCookies -= building.price;
    building.amount += 1;
    building.price = Math.round(building.price * building.priceIncrease * 10) / 10;
    
    const cps = buildings.reduce((sum, b) => sum + (b.amount * b.cps * b.multiplier), 0);
    
    return { 
        building, 
        totalCookies,
        cps: cps.toFixed(1),
        name: building.name,
        price: building.price,
        amount: building.amount
    };
}

module.exports = { 
    getBuildings, 
    buyBuilding 
};