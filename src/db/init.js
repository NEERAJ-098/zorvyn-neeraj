const db = require('./database');

/**
 * Initialize database schema
 * Creates tables for users and financial records
 */
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
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
        if (err) reject(err);
      });

      // Financial Records table
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
        if (err) reject(err);
      });

      // Create indexes for better query performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_records_user_id ON financial_records(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_records_date ON financial_records(record_date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_records_type ON financial_records(type)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category)`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { initializeDatabase };
