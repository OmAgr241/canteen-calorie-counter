const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'canteen.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    height REAL DEFAULT 170,
    weight REAL DEFAULT 70,
    age INTEGER DEFAULT 25,
    gender TEXT DEFAULT 'male',
    activityLevel TEXT DEFAULT 'medium',
    dailyCalorieGoal INTEGER DEFAULT 2000,
    isAdmin INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Food items table
  CREATE TABLE IF NOT EXISTS food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fats REAL NOT NULL,
    isVeg INTEGER DEFAULT 1,
    isAvailable INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Daily intake table
  CREATE TABLE IF NOT EXISTS daily_intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    foodId INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    date TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (foodId) REFERENCES food_items(id) ON DELETE CASCADE
  );

  -- Favorites table
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    foodId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (foodId) REFERENCES food_items(id) ON DELETE CASCADE,
    UNIQUE(userId, foodId)
  );
`);

// Seed demo food data if empty
const foodCount = db.prepare('SELECT COUNT(*) as count FROM food_items').get();
if (foodCount.count === 0) {
    console.log('📦 Seeding demo food data...');

    const insertFood = db.prepare(`
    INSERT INTO food_items (name, calories, protein, carbs, fats, isVeg)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const demoFoods = [
        // Veg items
        ['Veg Thali', 450, 15, 60, 18, 1],
        ['Samosa (2pc)', 260, 5, 28, 14, 1],
        ['Paneer Roll', 380, 12, 35, 22, 1],
        ['Masala Dosa', 300, 6, 45, 10, 1],
        ['Chole Bhature', 520, 14, 58, 26, 1],
        ['Idli Sambhar (3pc)', 210, 6, 38, 4, 1],
        ['Grilled Sandwich', 280, 10, 32, 12, 1],
        ['Veg Biryani', 420, 10, 55, 18, 1],
        ['Aloo Paratha', 350, 8, 42, 16, 1],
        ['Pav Bhaji', 380, 9, 48, 16, 1],
        ['Dal Rice', 320, 12, 50, 8, 1],
        ['Poha', 180, 4, 32, 4, 1],
        ['Upma', 200, 5, 35, 5, 1],

        // Non-veg items
        ['Egg Biryani', 480, 18, 55, 20, 0],
        ['Chicken Roll', 420, 22, 38, 20, 0],
        ['Egg Curry with Rice', 450, 16, 52, 18, 0],
        ['Chicken Sandwich', 350, 20, 30, 15, 0],

        // Beverages
        ['Cold Coffee', 190, 5, 28, 6, 1],
        ['Fresh Lime Soda', 80, 0, 20, 0, 1],
        ['Mango Lassi', 220, 6, 35, 6, 1],
        ['Masala Chai', 90, 2, 14, 3, 1],
        ['Buttermilk', 60, 2, 8, 2, 1],

        // Snacks
        ['French Fries', 320, 4, 40, 16, 1],
        ['Veg Momos (6pc)', 250, 6, 35, 10, 1],
        ['Spring Roll (2pc)', 220, 4, 28, 10, 1],
        ['Bread Pakora', 280, 6, 32, 14, 1],
    ];

    const insertMany = db.transaction((foods) => {
        for (const food of foods) {
            insertFood.run(...food);
        }
    });

    insertMany(demoFoods);
    console.log('✅ Demo food data seeded successfully!');
}

// Create admin user if not exists
const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE isAdmin = 1').get();
if (adminExists.count === 0) {
    console.log('👤 Creating admin user...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
    INSERT INTO users (email, password, name, isAdmin)
    VALUES (?, ?, ?, 1)
  `).run('admin@canteen.com', hashedPassword, 'Admin');
    console.log('✅ Admin user created! (admin@canteen.com / admin123)');
}

module.exports = db;
