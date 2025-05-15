const { getBuildings } = require("./buildings.js");
const { getTotalCookies } = require("./TotalCookies.js");







const achievements = [
    { achievementId: 1, name: "getting started", description: "you clicked your first cookie", unlocked: 0},
    { achievementId: 2, name: "getting better", description: "you clicked 1000 times", unlocked: 0},
    { achievementId: 3, name: "Tapping Maniac", description: "you clicked 1.000.000 times", unlocked: 0},
    { achievementId: 4, name: "baking intern", description: "buy youre first rollin pin", unlocked: 0},
    { achievementId: 5, name: "Keep on rollin", description: "you boutgh 100 rollin pins", unlocked: 0},
    { achievementId: 6, name: "Rolling company", description: "you boutgh 250 rollin pins", unlocked: 0},
    { achievementId: 7, name: "Cute pet", description: "buy youre first Cookie monster", unlocked: 0},
    { achievementId: 8, name: "getting crowded", description: "you boutgh 100 Cookie monsters", unlocked: 0},
    { achievementId: 9, name: "they might take over", description: "you boutgh 250 Cookie monsters", unlocked: 0},
    { achievementId: 10, name: "burning baker", description: "buy youre first iron furnace", unlocked: 0},
    { achievementId: 11, name: "gettin hot in here", description: "you boutgh 100 iron furnaces", unlocked: 0},
    { achievementId: 12, name: "Running out of fuel", description: "you boutgh 250 iron furnaces", unlocked: 0},
    { achievementId: 13, name: "And we do it all again", description: "rebirth for youre first time", unlocked: 0},
    { achievementId: 14, name: "nice seeing you again", description: "you rebirthed for youre tenth time", unlocked: 0},
    { achievementId: 15, name: "Getting a bit repetitive", description: "you rebirthed for your hundredth time", unlocked: 0},
    { achievementId: 16, name: "what a start", description: "get 100 cookie", unlocked: 0},
    { achievementId: 17, name: "getting popular", description: "reach 100.000 cookies", unlocked: 0},
    { achievementId: 18, name: "What is competition anyways", description: "reach 10.000.000 cookies", unlocked: 0}
    ];
function checkAchievements()
{
    switch(achievements.achievementId)
    {
        case 1:
         if(aantalClicks > 0)
         {
            achievements.indexOf[0].unlocked = 1;
         }
         case 2:
        if(aantalClicks > 999)
        {
            achievements.indexOf[1].unlocked = 1;
        }
        case 3:
        if(aantalClicks > 999999)
        {
            achievements.indexOf[2].unlocked = 1;
        }
        case 4:
        if (getBuildings.getBuildings.name == "Rolling pin" && getBuildings.getBuildings.amount > 0)
        {
            achievements.indexOf[3].unlocked = 1;
        }
        case 5:
        if (getBuildings.getBuildings.name == "Rolling pin" && getBuildings.getBuildings.amount > 99)
        {
            achievements.indexOf[4].unlocked = 1;
        }
        case 6:
        if(getBuildings.getBuildings.name == "Rolling pin" && getBuildings.getBuildings.amount > 249)
        {
            achievements.indexOf[5].unlocked = 1;
        }
        case 7:
        if (getBuildings.getBuildings.name == "Cookie monster" && getBuildings.getBuildings.amount > 0)
        {
            achievements.indexOf[6].unlocked = 1;
        }
        case 8:
        if (getBuildings.getBuildings.name == "Cookie monster" && getBuildings.getBuildings.amount > 99)
        {
            achievements.indexOf[7].unlocked = 1;
        }
        case 9:
        if(getBuildings.getBuildings.name == "Cookie monster" && getBuildings.getBuildings.amount > 249)
        {
            achievements.indexOf[8].unlocked = 1;
        }
        case 10:
        if (getBuildings.getBuildings.name == "Iron furnace" && getBuildings.getBuildings.amount > 0)
        {
            achievements.indexOf[9].unlocked = 1;
        }
        case 11:
        if (getBuildings.getBuildings.name == "Iron furnace" && getBuildings.getBuildings.amount > 99)
        {
            achievements.indexOf[10].unlocked = 1;
        }
        case 12:
        if(getBuildings.getBuildings.name == "Iron furnace" && getBuildings.getBuildings.amount > 249)
        {
            achievements.indexOf[11].unlocked = 1;
        }
        case 13:
        if(totalRebirths > 0)
        {
            achievements.indexOf[12].unlocked = 1;
        }
        case 14:
        if(totalRebirths > 9)
        {
            achievements.indexOf[13].unlocked = 1;
        }
        case 15:
        if(totalRebirths > 99)
        {
            achievements.indexOf[14].unlocked = 1;
        }
        case 16:
        if(getTotalCookies.getTotalCookies > 99.99)
        {
            achievements.indexof[15].unlocked = 1;
        }
        case 17:
        if(getTotalCookies.getTotalCookies > 99999.99)
        {
            achievements.indexof[16].unlocked = 1;
        }
        case 18:
        if(getTotalCookies.getTotalCookies > 9999999.99)
        {
            achievements.indexof[17].unlocked = 1;
        }
        
    }
    
  
}
   
    module.exports = 
    {
        checkAchievements,
        achievements
    };
