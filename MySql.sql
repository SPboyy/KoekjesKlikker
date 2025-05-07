-- 
-- INSERT INTO player(playerId,playerName,amountOfCookies,amountOfRebirths,amountOfUpgrades,amountOfRebirthTokens,cookiesSpend,totalAmountOfCookies) VALUES (1,"Bob",1000,0,0,0,5000,6000)
-- CREATE TABLE buildings (buildingId INTEGER NOT NULL PRIMARY KEY,name Text NOT NULL,multiplier INTEGER NOT NULL,price INTEGER NOT NULL,priceIncrease DOUBLE NOT NULL,cops DOUBLE NOT NULL, amount INTEGER NOT NULL);
-- INSERT INTO buildings (buildingId, name,multiplier,price,priceIncrease,cops,amount) VALUES (1,"rolling pin",1,10,1.2,0.1,0)
-- CREATE TABLE login(loginId INTEGER NOT NULL,username TEXT NOT NULL,password TEXT NOT NULL, checkAdmin BOOLEAN);
-- INSERT INTO login (loginId,username,password,checkAdmin) VALUES (1,"admin","admin",true)


CREATE TABLE player(
    playerId INTEGER NOT NULL,
    playerName TEXT NOT NULL,
    amountOfCookies LONG NOT NULL,
    amountOfRebirths INTEGER,
    amountOfUpgrades INTEGER,
    amountOfRebirthTokens INTEGER,
    cookiesSpend LONG,
    totalAmountOfCookies LONG NOT NULL,µ
    achAmount1 BOOLEAN,
    achAmount100 BOOLEAN,
    achAmount1000 BOOLEAN,
    achAmount10000 BOOLEAN,
    achAmount100000 BOOLEAN,
    achAmount1000000 BOOLEAN,
    achAmount10000000 BOOLEAN,
    achAmount100000000 BOOLEAN,
    achAmount1000000000 BOOLEAN,
    achAmount10000000000 BOOLEAN,
    PRIMARY KEY (playerId)
    
    );


