
const achievements = [
    { name: "the grind begins", description: "you bought 1 rolling pin", unlocked: 0},
    { name: "getting started", description: "you clicked your first cookie", unlocked: 0},
    ];



    function multiply(achievements) {
        let i = 0;
        for (let achievement of achievements) {
            if (achievement.unlocked == 1) {
                i++;
            }
        }
        return i;
    }
    
    const multiplier = multiply(achievements);

    module.exports = 
    {
        achievements,
        multiplier
    };
