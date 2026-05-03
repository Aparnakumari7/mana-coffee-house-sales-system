# ☕ MANA COFFEE HOUSE

**Centralized Sales Analysis System with POS & Real-time Analytics**

A full-stack application for a 4-location coffee chain in Hyderabad, featuring a Point-of-Sale frontend, a real-time analytics dashboard, and a Node.js + SQLite backend.

---

## 🚀 Quick Start

1. Open the project folder in your terminal.
2. Install dependencies: `npm install`
3. Start the backend server: `npm start` (or `node server.js`)
4. Open `index.html` in your browser (directly, or via Live Server).
5. Login with demo credentials below.

---

## 🔑 Demo Credentials

| Role | Email | Password | Redirects To |
|------|-------|----------|-------------|
| Owner | `owner@mana.com` | `owner123` | Dashboard |
| Sales (East) | `east@mana.com` | `sales123` | POS |
| Sales (West) | `west@mana.com` | `sales123` | POS |
| Sales (North) | `north@mana.com` | `sales123` | POS |
| Sales (South) | `south@mana.com` | `sales123` | POS |

**Discount Codes:** `MANA10` (10%), `COFFEE20` (20%), `WELCOME` (15%)

---

## 📸 Screenshots

### Login Page
- Glassmorphism card with animated gradient background
- Role selector (Salesperson / Owner)
- Shop location dropdown for salespersons

### POS Interface
- Split-panel: menu grid (left) + cart (right)
- 35 menu items across 5 categories
- Real-time cart total with GST calculation
- PDF bill generation and download

### Analytics Dashboard
- 4 KPI cards with real % change vs yesterday
- 4 interactive Plotly charts
- Live sales feed with auto-updates
- CSV export functionality

---

## 🏗️ Architecture

```
mana-co-fi/
├── server.js               # Node.js + Express backend API
├── mana.sqlite             # SQLite database (auto-generated)
├── index.html              # Login page
├── pos.html                # POS interface
├── dashboard.html          # Owner dashboard
├── css/
│   ├── global.css          # Design system & tokens
│   ├── login.css           # Login page styles
│   ├── pos.css             # POS page styles
│   └── dashboard.css       # Dashboard styles
└── js/
    ├── utils.js            # Shared utilities
    ├── menu-data.js        # Menu catalog & shop data
    ├── data-service.js     # Data layer (fetch API client)
    ├── auth.js             # Authentication API client
    ├── pdf-generator.js    # PDF bill generation
    ├── pos.js              # POS page controller
    └── dashboard.js        # Dashboard controller
```

---

## ✨ Key Features

### Point of Sale (POS)
- **Menu Browsing** — 35 items across 5 categories (All, Beverages, Cold Drinks, Food, Pastries)
- **Search & Filter** — Instant search across all menu items
- **Cart Management** — Add, update quantity (−/+), remove items
- **Auto Totals** — Subtotal + 5% GST − Discount = Total (live calculation)
- **Discount Codes** — Supports `MANA10`, `COFFEE20`, `WELCOME`
- **Bill Generation** — Professional receipt preview + PDF download via html2pdf.js
- **Customer Details** — Name and phone capture per transaction

### Analytics Dashboard (Owner & Salesperson)
- **Role-based Access** — Owners can view aggregated data for all locations or filter by individual shops. Salespersons view their assigned shop's performance.
- **Date-Range Filtering** — Filter analytics seamlessly by Today, Yesterday, This Month, and This Year.
- **4 KPI Cards** — Revenue, Orders, Avg Order Value, Best Area
- **Real % Changes** — Compared against previous periods based on selected date filters.
- **4 Interactive Charts** (Plotly.js):
  - Sales by Area (bar chart)
  - Popular Items (donut chart)
  - Hourly Sales Trend (line chart)
  - Target Achievement (horizontal bar)
- **Live Sales Feed** — Last 20 transactions, highlights new entries
- **CSV Export** — Download today's sales data
- **Reset Data** — Regenerate demo data

### Real-Time Updates
- **BroadcastChannel API** — POS sales instantly update the dashboard in another tab
- **Storage Event Fallback** — Cross-tab sync for older browsers
- **Toast Notifications** — ⚡ alerts on the dashboard when a new sale arrives

### Authentication
- Role-based access control (Owner vs Salesperson)
- **Role-based Dashboard Views** — Salespersons are automatically restricted to viewing their own shop's data, while Owners have full filtering access.
- Session management with 8-hour timeout
- Auto-redirect based on role

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Structure | HTML5 (semantic) |
| Frontend Styling | Vanilla CSS (custom properties, glassmorphism, animations) |
| Frontend Logic | Vanilla JavaScript (ES6+, async/await) |
| Backend Server | Node.js + Express |
| Database | SQLite3 |
| Charts | Plotly.js 2.27 (CDN) |
| PDF | html2pdf.js 0.10.1 (CDN) |
| Fonts | Inter, Outfit (Google Fonts via CSS) |

---

## 🎨 Design System

- **Theme:** Dark coffee-house aesthetic
- **Colors:** Deep browns (#1a0f0a), caramel (#c8956c), gold (#e8c87a), cream (#f5e6d3)
- **Effects:** Glassmorphism cards, gradient borders, smooth micro-animations
- **Typography:** Outfit (headings), Inter (body)
- **Responsive:** Breakpoints at 1200px, 900px, 600px

---

## 📊 Data Architecture

### Database Schema (SQLite)
| Table | Purpose |
|-----|---------|
| `orders` | Central table for all transactions |
| `users` | Secure user credentials and roles |

### Order Schema
```json
{
  "orderId": "ORD-xxxxx-xxxx",
  "billNumber": "MCH-20260502-001",
  "shopId": "EAST001",
  "salespersonName": "Priya Sharma",
  "customerName": "Rajesh Kumar",
  "customerPhone": "9876543210",
  "items": [
    { "menuId": "C001", "name": "Mana Filter Coffee", "quantity": 2, "unitPrice": 15, "totalPrice": 30 }
  ],
  "subtotal": 30,
  "tax": 1.5,
  "discount": 0,
  "totalAmount": 31.50,
  "paymentMethod": "Cash",
  "status": "completed",
  "timestamp": "2026-05-02T14:30:00.000Z"
}
```

---

## 🧪 Testing

1. **Login Flow** — Test both Owner and Salesperson roles
2. **POS Flow** — Add items → enter customer name → generate bill → download PDF
3. **Real-Time** — Open POS and Dashboard in separate tabs → make a sale → watch dashboard update instantly
4. **Dashboard Filtering** — Change the date filter to 'This Month' or 'Yesterday' and verify KPIs update.
5. **Discount** — Enter `MANA10` in the discount field → verify 10% applied
6. **CSV Export** — Click "Export CSV" on dashboard → verify downloaded file

---

## 🔮 Future Enhancements

- Firebase Realtime Database integration (data-service.js is abstraction-ready)
- Firebase Authentication replacing demo auth
- Multi-day historical analytics and trend reporting
- Inventory management module
- Employee performance tracking
- Mobile-optimized POS layout

---

## 📝 License

This project is for educational/demonstration purposes.

---

**Built with ☕ by Mana Coffee House Team**
