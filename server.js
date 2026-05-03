const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'mana.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT,
        shopId TEXT
      )`);

      // Create Orders table
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT UNIQUE,
        billNumber TEXT,
        shopId TEXT,
        salespersonName TEXT,
        customerName TEXT,
        customerPhone TEXT,
        items TEXT, -- JSON string
        subtotal REAL,
        tax REAL,
        discount REAL,
        totalAmount REAL,
        paymentMethod TEXT,
        status TEXT,
        timestamp TEXT
      )`);

      // Seed default users if empty
      db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (!err && row.count === 0) {
          console.log('Seeding initial users...');
          const stmt = db.prepare("INSERT INTO users (email, password, name, role, shopId) VALUES (?, ?, ?, ?, ?)");
          stmt.run('owner@mana.com', 'owner123', 'Vikram Patel', 'owner', null);
          stmt.run('east@mana.com', 'sales123', 'Priya Sharma', 'salesperson', 'EAST001');
          stmt.run('west@mana.com', 'sales123', 'Rajesh Kumar', 'salesperson', 'WEST001');
          stmt.run('north@mana.com', 'sales123', 'Ahmed Khan', 'salesperson', 'NORTH001');
          stmt.run('south@mana.com', 'sales123', 'Srinivas Reddy', 'salesperson', 'SOUTH001');
          stmt.finalize();
        }
      });
    });
  }
});

// API Routes

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT email, name, role, shopId FROM users WHERE LOWER(email) = LOWER(?) AND password = ?", [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get all orders (with optional filters)
app.get('/api/orders', (req, res) => {
  const { date, shopId } = req.query;
  let query = "SELECT * FROM orders WHERE 1=1";
  const params = [];

  if (date) {
    query += " AND timestamp LIKE ?";
    params.push(`${date}%`);
  }
  
  if (shopId && shopId !== 'all') {
    query += " AND shopId = ?";
    params.push(shopId);
  }

  query += " ORDER BY timestamp DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Parse JSON items
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
    res.json(orders);
  });
});

// Save new order
app.post('/api/orders', (req, res) => {
  const o = req.body;
  const stmt = db.prepare(`INSERT INTO orders 
    (orderId, billNumber, shopId, salespersonName, customerName, customerPhone, items, subtotal, tax, discount, totalAmount, paymentMethod, status, timestamp) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(
    o.orderId, o.billNumber, o.shopId, o.salespersonName, o.customerName, 
    o.customerPhone, JSON.stringify(o.items), o.subtotal, o.tax, o.discount, 
    o.totalAmount, o.paymentMethod, o.status, o.timestamp,
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving order: ' + err.message });
      }
      res.status(201).json({ success: true, order: o });
    }
  );
  stmt.finalize();
});

// Reset data (for demo purposes)
app.post('/api/reset', (req, res) => {
  db.run("DELETE FROM orders", (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
