const { getBuildings } = require("./buildings.js");
const { getTotalCookies } = require("./TotalCookies.js");

const achievements = [
  { achievementId: 1, name: "getting started", description: "you clicked your first cookie", unlocked: 0 },
  { achievementId: 2, name: "getting better", description: "you clicked 1000 times", unlocked: 0 }, 
  { achievementId: 3, name: "Tapping Maniac", description: "you clicked 1.000.000 times", unlocked: 0 },
  { achievementId: 4, name: "baking intern", description: "buy your first rolling pin", unlocked: 0 },
  { achievementId: 5, name: "Keep on rollin", description: "you bought 100 rolling pins", unlocked: 0 },
  { achievementId: 6, name: "Rolling company", description: "you bought 250 rolling pins", unlocked: 0 },
  { achievementId: 7, name: "Cute pet", description: "buy your first Cookie monster", unlocked: 0 },
  { achievementId: 8, name: "getting crowded", description: "you bought 100 Cookie monsters", unlocked: 0 },
  { achievementId: 9, name: "they might take over", description: "you bought 250 Cookie monsters", unlocked: 0 },
  { achievementId: 10, name: "burning baker", description: "buy your first iron furnace", unlocked: 0 },
  { achievementId: 11, name: "gettin hot in here", description: "you bought 100 iron furnaces", unlocked: 0 },
  { achievementId: 12, name: "Running out of fuel", description: "you bought 250 iron furnaces", unlocked: 0 },
  { achievementId: 13, name: "And we do it all again", description: "rebirth for your first time", unlocked: 0 },
  { achievementId: 14, name: "nice seeing you again", description: "you rebirthed for your tenth time", unlocked: 0 },
  { achievementId: 15, name: "Getting a bit repetitive", description: "you rebirthed for your hundredth time", unlocked: 0 },
  { achievementId: 16, name: "what a start", description: "get 100 cookies", unlocked: 0 },
  { achievementId: 17, name: "getting popular", description: "reach 100,000 cookies", unlocked: 0 },
  { achievementId: 18, name: "What is competition anyways", description: "reach 10,000,000 cookies", unlocked: 0 }
];

function checkAchievements({ aantalClicks, totalRebirths }) {
  const buildings = getBuildings();
  const totalCookies = getTotalCookies();

  const hasBuilding = (name, minAmount) => {
    const b = buildings.find(b => b.name === name);
    return b && b.amount >= minAmount;
  };

  if (aantalClicks > 0) achievements[0].unlocked = 1;
  if (aantalClicks >= 1000) achievements[1].unlocked = 1;
  if (aantalClicks >= 1000000) achievements[2].unlocked = 1;

  if (hasBuilding("Rolling pin", 1)) achievements[3].unlocked = 1;
  if (hasBuilding("Rolling pin", 100)) achievements[4].unlocked = 1;
  if (hasBuilding("Rolling pin", 250)) achievements[5].unlocked = 1;

  if (hasBuilding("Cookie monster", 1)) achievements[6].unlocked = 1;
  if (hasBuilding("Cookie monster", 100)) achievements[7].unlocked = 1;
  if (hasBuilding("Cookie monster", 250)) achievements[8].unlocked = 1;

  if (hasBuilding("Iron furnace", 1)) achievements[9].unlocked = 1;
  if (hasBuilding("Iron furnace", 100)) achievements[10].unlocked = 1;
  if (hasBuilding("Iron furnace", 250)) achievements[11].unlocked = 1;

  if (totalRebirths >= 1) achievements[12].unlocked = 1;
  if (totalRebirths >= 10) achievements[13].unlocked = 1;
  if (totalRebirths >= 100) achievements[14].unlocked = 1;

  if (totalCookies >= 100) achievements[15].unlocked = 1;
  if (totalCookies >= 100000) achievements[16].unlocked = 1;
  if (totalCookies >= 10000000) achievements[17].unlocked = 1;
}

module.exports = { checkAchievements, achievements };
