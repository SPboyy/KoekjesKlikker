-- CREATE TABLE player(
--     playerId INTEGER PRIMARY KEY NOT NULL,
--     playerName TEXT NOT NULL,
--     amountOfCookies LONG NOT NULL,
--     amountOfRebirths INTEGER,
--     amountOfUpgrades INTEGER,
--     amountOfRebirthTokens INTEGER,
--     cookiesSpend LONG,
--     totalAmountOfCookies LONG NOT NULL,
--     achAmount1 BOOLEAN,
--     achAmount100 BOOLEAN,
--     achAmount1000 BOOLEAN,
--     achAmount10000 BOOLEAN,
--     achAmount100000 BOOLEAN,
--     achAmount1000000 BOOLEAN,
--     achAmount10000000 BOOLEAN,
--     achAmount100000000 BOOLEAN,
--     achAmount1000000000 BOOLEAN
--     );
-- INSERT INTO player(
-- playerId,
-- playerName,
-- amountOfCookies,
-- amountOfRebirths,
-- amountOfUpgrades,
-- amountOfRebirthTokens,
-- cookiesSpend,
-- totalAmountOfCookies,
-- achAmount1,
-- achAmount100,
-- achAmount1000,
-- achAmount10000,
-- achAmount100000,
-- achAmount1000000,
-- achAmount10000000,
-- achAmount100000000,
-- achAmount1000000000)
-- VALUES(
-- 1,
-- "Bob",
-- 5000,
-- 0,
-- 0,
-- 0,
-- 1000,
-- 6000,
-- true,
-- true,
-- true,
-- true,
-- true,
-- true,
-- true,
-- true,
-- true)
-- CREATE TABLE buildings (buildingId INTEGER NOT NULL PRIMARY KEY,name Text NOT NULL,multiplier INTEGER NOT NULL,price INTEGER NOT NULL,priceIncrease DOUBLE NOT NULL,cops DOUBLE NOT NULL, amount INTEGER NOT NULL);
-- INSERT INTO buildings (buildingId, name,multiplier,price,priceIncrease,cops,amount) VALUES (1,"rolling pin",1,10,1.2,0.1,0)
-- CREATE TABLE login(loginId INTEGER NOT NULL,username TEXT NOT NULL,password TEXT NOT NULL, checkAdmin BOOLEAN);
-- INSERT INTO login (loginId,username,password,checkAdmin) VALUES (1,"admin","admin",true)
-- INSERT INTO buildings (buildingId,name,multiplier,price,priceIncrease,cops,amount) VALUES(3,"Furnace",0,1000,1.2,10,0)
INSERT INTO login(loginId,username,password,checkAdmin) VALUES (1,"admin","admin",1)

--DROP TABLE IF EXISTS login;

CREATE TABLE login (
 loginId INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE,
 password TEXT NOT NULL,
 checkAdmin INTEGER NOT NULL
);

-- INSERT INTO login(loginId,username,password,checkAdmin) VALUES (1,"admin","admin",1)
 CREATE TABLE player(
     playerId INTEGER PRIMARY KEY NOT NULL,
     username TEXT NOT NULL,
     amountOfCookies LONG NOT NULL,
     amountOfRebirths INTEGER,
     amountOfUpgrades INTEGER,
     amountOfRebirthTokens INTEGER,
     cookiesSpend LONG,
     totalAmountOfCookies LONG NOT NULL,
     achAmount1 BOOLEAN,
     achAmount100 BOOLEAN,
     achAmount1000 BOOLEAN,
     achAmount10000 BOOLEAN,
     achAmount100000 BOOLEAN,
     achAmount1000000 BOOLEAN,
     achAmount10000000 BOOLEAN,
     achAmount100000000 BOOLEAN,
     achAmount1000000000 BOOLEAN
     );
-- DROP TABLE login
-- ALTER TABLE player ADD COLUMN unlockedPrestigeNodes TEXT DEFAULT '["node-0"]';