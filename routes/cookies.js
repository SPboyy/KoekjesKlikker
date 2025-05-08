const express = require('express');
const router = express.Router();
const { getBuildings, buyBuilding } = require('../assets/data/buildings'); 

let koekjes = 0; 

function addCookie() {
    koekjes += 1;
    return koekjes;
}

router.post('/add-cookie', (req, res) => {
    const totalCookies = addCookie();  
    res.json({ total: totalCookies });
});

router.post('/buy-building/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const buildings = getBuildings();

  if (index < 0 || index >= buildings.length) {
      return res.status(400).json({ error: 'Invalid building index' });
  }

  if (koekjes >= buildings[index].price) {
      const result = buyBuilding(index, koekjes);
      koekjes = result.totalCookies; 
      buildings[index] = result.building;
  }

  res.json({
      totalCookies: koekjes,
      amount: buildings[index].amount,
      price: buildings[index].price.toFixed(1),
      name: buildings[index].name
  });
});


router.get('/', (req, res) => {
    const buildings = getBuildings();  
    res.render('home', {
        koekjes: koekjes,
        buildings: buildings
    });
});

module.exports = router;
