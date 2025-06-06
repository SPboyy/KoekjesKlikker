    const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('DataBase.db');

db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  color TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error('❌ Fout bij maken van messages-tabel:', err.message);
  else console.log('✅ Tabel "messages" is toegevoegd.');
  
  db.close();
});
