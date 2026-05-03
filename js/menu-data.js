/* ============================================================
   MANA COFFEE HOUSE — Menu Data Catalog
   30+ items across 4 categories
   ============================================================ */

const MENU_CATEGORIES = [
  { id: 'all',        name: 'All',        emoji: '🍽️' },
  { id: 'beverages',  name: 'Beverages',  emoji: '☕' },
  { id: 'cold_drinks',name: 'Cold Drinks',emoji: '🧊' },
  { id: 'food',       name: 'Food',       emoji: '🥪' },
  { id: 'pastries',   name: 'Pastries',   emoji: '🍰' },
];

const MENU_ITEMS = [
  // ── Beverages ──
  { id: 'C001', name: 'Mana Filter Coffee',   category: 'beverages',  price: 15,  emoji: '☕',  isPopular: true,  isAvailable: true,  description: 'Traditional South Indian filter coffee' },
  { id: 'C002', name: 'Espresso',             category: 'beverages',  price: 20,  emoji: '⚡',  isPopular: false, isAvailable: true,  description: 'Rich double-shot espresso' },
  { id: 'C003', name: 'Cappuccino',           category: 'beverages',  price: 25,  emoji: '☕',  isPopular: true,  isAvailable: true,  description: 'Classic Italian cappuccino' },
  { id: 'C004', name: 'Latte',                category: 'beverages',  price: 20,  emoji: '🥛',  isPopular: false, isAvailable: true,  description: 'Smooth and creamy latte' },
  { id: 'C005', name: 'Americano',            category: 'beverages',  price: 18,  emoji: '☕',  isPopular: false, isAvailable: true,  description: 'Black coffee with hot water' },
  { id: 'C006', name: 'Caramel Macchiato',    category: 'beverages',  price: 30,  emoji: '🍬',  isPopular: true,  isAvailable: true,  description: 'Espresso with caramel and milk' },
  { id: 'C007', name: 'Mocha',                category: 'beverages',  price: 28,  emoji: '🍫',  isPopular: false, isAvailable: true,  description: 'Chocolate and espresso blend' },
  { id: 'C008', name: 'Masala Chai',          category: 'beverages',  price: 12,  emoji: '🫖',  isPopular: true,  isAvailable: true,  description: 'Spiced Indian chai' },
  { id: 'C009', name: 'Hot Chocolate',        category: 'beverages',  price: 25,  emoji: '🍫',  isPopular: false, isAvailable: true,  description: 'Rich hot chocolate' },
  { id: 'C010', name: 'Green Tea',            category: 'beverages',  price: 15,  emoji: '🍵',  isPopular: false, isAvailable: true,  description: 'Organic Japanese green tea' },

  // ── Cold Drinks ──
  { id: 'D001', name: 'Cold Coffee',          category: 'cold_drinks',price: 22,  emoji: '🧊',  isPopular: true,  isAvailable: true,  description: 'Chilled coffee with ice' },
  { id: 'D002', name: 'Iced Latte',           category: 'cold_drinks',price: 25,  emoji: '🥤',  isPopular: false, isAvailable: true,  description: 'Iced milk and espresso' },
  { id: 'D003', name: 'Frappe',               category: 'cold_drinks',price: 30,  emoji: '🧋',  isPopular: true,  isAvailable: true,  description: 'Blended ice frappe' },
  { id: 'D004', name: 'Cold Brew',            category: 'cold_drinks',price: 28,  emoji: '🫗',  isPopular: false, isAvailable: true,  description: '12-hour cold brew coffee' },
  { id: 'D005', name: 'Mango Smoothie',       category: 'cold_drinks',price: 35,  emoji: '🥭',  isPopular: false, isAvailable: true,  description: 'Fresh mango smoothie' },
  { id: 'D006', name: 'Oreo Milkshake',       category: 'cold_drinks',price: 40,  emoji: '🍦',  isPopular: true,  isAvailable: true,  description: 'Oreo cookie milkshake' },
  { id: 'D007', name: 'Fresh Lime Soda',      category: 'cold_drinks',price: 18,  emoji: '🍋',  isPopular: false, isAvailable: true,  description: 'Refreshing lime soda' },
  { id: 'D008', name: 'Butterscotch Shake',   category: 'cold_drinks',price: 38,  emoji: '🧈',  isPopular: false, isAvailable: false, description: 'Butterscotch milkshake' },

  // ── Food ──
  { id: 'F001', name: 'Veg Sandwich',         category: 'food',       price: 45,  emoji: '🥪',  isPopular: true,  isAvailable: true,  description: 'Grilled vegetable sandwich' },
  { id: 'F002', name: 'Paneer Wrap',          category: 'food',       price: 55,  emoji: '🌯',  isPopular: false, isAvailable: true,  description: 'Spicy paneer wrap' },
  { id: 'F003', name: 'Cheese Toast',         category: 'food',       price: 35,  emoji: '🧀',  isPopular: false, isAvailable: true,  description: 'Melted cheese on toast' },
  { id: 'F004', name: 'Chicken Club',         category: 'food',       price: 65,  emoji: '🥖',  isPopular: true,  isAvailable: true,  description: 'Triple-layer club sandwich' },
  { id: 'F005', name: 'Garlic Bread',         category: 'food',       price: 30,  emoji: '🍞',  isPopular: false, isAvailable: true,  description: 'Herb garlic bread' },
  { id: 'F006', name: 'Pasta',                category: 'food',       price: 60,  emoji: '🍝',  isPopular: false, isAvailable: true,  description: 'Creamy white sauce pasta' },
  { id: 'F007', name: 'French Fries',         category: 'food',       price: 40,  emoji: '🍟',  isPopular: true,  isAvailable: true,  description: 'Crispy salted fries' },
  { id: 'F008', name: 'Veg Burger',           category: 'food',       price: 50,  emoji: '🍔',  isPopular: false, isAvailable: true,  description: 'Classic veggie burger' },

  // ── Pastries ──
  { id: 'P001', name: 'Chocolate Muffin',     category: 'pastries',   price: 40,  emoji: '🧁',  isPopular: true,  isAvailable: true,  description: 'Double chocolate muffin' },
  { id: 'P002', name: 'Blueberry Scone',      category: 'pastries',   price: 35,  emoji: '🫐',  isPopular: false, isAvailable: true,  description: 'Fresh blueberry scone' },
  { id: 'P003', name: 'Croissant',            category: 'pastries',   price: 30,  emoji: '🥐',  isPopular: true,  isAvailable: true,  description: 'Buttery flaky croissant' },
  { id: 'P004', name: 'Brownie',              category: 'pastries',   price: 45,  emoji: '🍫',  isPopular: true,  isAvailable: true,  description: 'Fudge brownie with walnuts' },
  { id: 'P005', name: 'Cheesecake Slice',     category: 'pastries',   price: 55,  emoji: '🍰',  isPopular: false, isAvailable: true,  description: 'New York cheesecake' },
  { id: 'P006', name: 'Cinnamon Roll',        category: 'pastries',   price: 38,  emoji: '🍥',  isPopular: false, isAvailable: true,  description: 'Warm cinnamon roll' },
  { id: 'P007', name: 'Cookie',               category: 'pastries',   price: 20,  emoji: '🍪',  isPopular: false, isAvailable: true,  description: 'Chocolate chip cookie' },
];

/* Shop Data */
const SHOPS = [
  {
    id: 'EAST001',
    name: 'East Hyderabad',
    area: 'East',
    address: '12-3-456, Uppal Main Road, Hyderabad - 500039',
    phone: '040-27201234',
    manager: 'Priya Sharma',
    targetDaily: 5000,
  },
  {
    id: 'WEST001',
    name: 'West Hyderabad',
    area: 'West',
    address: '8-2-293, Road No. 14, Banjara Hills, Hyderabad - 500034',
    phone: '040-23541234',
    manager: 'Rajesh Kumar',
    targetDaily: 5000,
  },
  {
    id: 'NORTH001',
    name: 'North Hyderabad',
    area: 'North',
    address: '15-8-100, Secunderabad Station Road, Hyderabad - 500003',
    phone: '040-27891234',
    manager: 'Ahmed Khan',
    targetDaily: 5000,
  },
  {
    id: 'SOUTH001',
    name: 'South Hyderabad',
    area: 'South',
    address: '4-1-789, Charminar Road, Old City, Hyderabad - 500002',
    phone: '040-24551234',
    manager: 'Srinivas Reddy',
    targetDaily: 5000,
  }
];
