const priceIncrease = 1.2;


const buildings = [
    { price: 10, name: "rolling pin", priceIncrease: priceIncrease, amount: 0, multiplier: 1, cps: 0.1}
];


function buyBuilding(building) 
{
    
    building.price = building.price * priceIncrease;
    building.amount += 1;
    
};


module.exports = 
{

buildings, buyBuilding

};