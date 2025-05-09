const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "DataBase.db"), (err) => {
  if (err) {
    console.error("Fout bij verbinden met database:", err.message);
  } else {
    console.log("Verbonden met SQLite database.");
  }
});

module.exports = db;