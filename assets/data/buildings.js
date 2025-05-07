const priceIncrease = 1.2;

const buildings = [
    { price: 10, name: "rolling pin", priceIncrease: priceIncrease, amount: 0, multiplier: 1, cps: 0.1 },
    { price: 100, name: "cookie monster", priceIncrease: priceIncrease, amount: 0, multiplier: 1, cps: 1 }

];

function sortedBuildings() 
{

    buildings.sort((a, b) => a.price - b.price);

}

sortedBuildings();

function buyBuilding(building) {
    building.price = building.price * priceIncrease;
    
    building.cps += building.cps / building.amount;

    building.amount += 1;
}

module.exports = {
    buildings,
    buyBuilding
};
