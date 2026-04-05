#!/usr/bin/env node

/**
 * Script to initialize sample test data
 * Run: node scripts/seed.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data.db');

// Check if database file exists and remove it to start fresh
const fs = require('fs');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🔄 Removed existing database');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('📁 Created new SQLite database');
});

db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
  // Create Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('viewer', 'analyst', 'admin')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('✅ Users table created');
  });

  // Create Financial Records table
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT NOT NULL,
      description TEXT,
      record_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating records table:', err);
    else console.log('✅ Financial Records table created');
  });

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON financial_records(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_records_date ON financial_records(record_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_records_type ON financial_records(type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category)`, (err) => {
    if (err) console.error('Error creating indexes:', err);
    else console.log('✅ Indexes created');
  });

  // Insert sample users
  const users = [
    { username: 'admin_user', email: 'admin@example.com', password: 'admin123', role: 'admin', status: 'active' },
    { username: 'john_analyst', email: 'john@example.com', password: 'john123', role: 'analyst', status: 'active' },
    { username: 'jane_analyst', email: 'jane@example.com', password: 'jane123', role: 'analyst', status: 'active' },
    { username: 'viewer_user', email: 'viewer@example.com', password: 'viewer123', role: 'viewer', status: 'active' }
  ];

  users.forEach((user) => {
    db.run(
      `INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      [user.username, user.email, user.password, user.role, user.status],
      function (err) {
        if (err) console.error('Error inserting user:', err);
      }
    );
  });

  // Insert sample financial records for analyst users
  const records = [
    // John's records
    { user_id: 2, amount: 5000, type: 'income', category: 'Salary', description: 'Monthly salary', record_date: '2024-01-01' },
    { user_id: 2, amount: 1200, type: 'expense', category: 'Rent', description: 'Apartment rent', record_date: '2024-01-05' },
    { user_id: 2, amount: 150, type: 'expense', category: 'Utilities', description: 'Electric and water', record_date: '2024-01-08' },
    { user_id: 2, amount: 200, type: 'expense', category: 'Food', description: 'Grocery shopping', record_date: '2024-01-10' },
    { user_id: 2, amount: 50, type: 'expense', category: 'Entertainment', description: 'Movie ticket', record_date: '2024-01-12' },
    { user_id: 2, amount: 2000, type: 'income', category: 'Freelance', description: 'Web design project', record_date: '2024-01-15' },
    { user_id: 2, amount: 75, type: 'expense', category: 'Transportation', description: 'Gas and parking', record_date: '2024-01-18' },
    { user_id: 2, amount: 100, type: 'expense', category: 'Food', description: 'Restaurant dinner', record_date: '2024-01-20' },
    { user_id: 2, amount: 300, type: 'expense', category: 'Shopping', description: 'Clothing', record_date: '2024-01-22' },
    { user_id: 2, amount: 500, type: 'income', category: 'Bonus', description: 'Performance bonus', record_date: '2024-01-25' },

    // Jane's records
    { user_id: 3, amount: 4500, type: 'income', category: 'Salary', description: 'Monthly salary', record_date: '2024-01-02' },
    { user_id: 3, amount: 1100, type: 'expense', category: 'Rent', description: 'Apartment lease', record_date: '2024-01-06' },
    { user_id: 3, amount: 120, type: 'expense', category: 'Utilities', description: 'Water bill', record_date: '2024-01-09' },
    { user_id: 3, amount: 180, type: 'expense', category: 'Food', description: 'Supermarket', record_date: '2024-01-11' },
    { user_id: 3, amount: 1500, type: 'income', category: 'Freelance', description: 'Consulting work', record_date: '2024-01-16' },
    { user_id: 3, amount: 250, type: 'expense', category: 'Shopping', description: 'Books and supplies', record_date: '2024-01-23' }
  ];

  records.forEach((record) => {
    db.run(
      `INSERT INTO financial_records (user_id, amount, type, category, description, record_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [record.user_id, record.amount, record.type, record.category, record.description, record.record_date],
      function (err) {
        if (err) console.error('Error inserting record:', err);
      }
    );
  });

  // Close database and print summary
  setTimeout(() => {
    db.close((err) => {
      if (err) console.error('Error closing database:', err);
      
      console.log('\n✅ Sample data initialized successfully!\n');
      console.log('📋 Sample Users:');
      console.log('   1. Admin User:');
      console.log('      ID: 1');
      console.log('      Username: admin_user');
      console.log('      Password: admin123');
      console.log('      Role: admin');
      console.log('\n   2. Analyst User (John):');
      console.log('      ID: 2');
      console.log('      Username: john_analyst');
      console.log('      Password: john123');
      console.log('      Role: analyst');
      console.log('\n   3. Analyst User (Jane):');
      console.log('      ID: 3');
      console.log('      Username: jane_analyst');
      console.log('      Password: jane123');
      console.log('      Role: analyst');
      console.log('\n   4. Viewer User:');
      console.log('      ID: 4');
      console.log('      Username: viewer_user');
      console.log('      Password: viewer123');
      console.log('      Role: viewer');
      console.log('\n💡 Use these credentials in the Authorization header:');
      console.log('   Example: Bearer user:2:john_analyst:analyst:active\n');
    });
  }, 500);
});
