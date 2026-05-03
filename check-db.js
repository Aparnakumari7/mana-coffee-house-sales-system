const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'mana.sqlite'), (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('\n--- 👥 USERS TABLE ---');
db.all("SELECT * FROM users", (err, rows) => {
  if (err) console.error(err);
  else console.table(rows);

  console.log('\n--- 📦 ORDERS TABLE (Last 5) ---');
  db.all("SELECT id, orderId, shopId, customerName, totalAmount, timestamp FROM orders ORDER BY timestamp DESC LIMIT 5", (err, rows) => {
    if (err) console.error(err);
    else console.table(rows);
    
    db.close();
  });
});
