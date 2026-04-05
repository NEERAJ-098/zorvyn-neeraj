const db = require('./db/database');

/**
 * Sample data initialization script
 * Creates sample users and financial records for testing
 */

const initializeSampleData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert sample users
      const users = [
        { username: 'admin_user', email: 'admin@example.com', password: 'password123', role: 'admin', status: 'active' },
        { username: 'analyst_user', email: 'analyst@example.com', password: 'password123', role: 'analyst', status: 'active' },
        { username: 'viewer_user', email: 'viewer@example.com', password: 'password123', role: 'viewer', status: 'active' }
      ];

      let userIds = [];
      let completedUsers = 0;

      users.forEach((user, index) => {
        db.run(
          `INSERT OR IGNORE INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
          [user.username, user.email, user.password, user.role, user.status],
          function (err) {
            if (err) console.error('Error inserting user:', err);
            userIds[index] = this.lastID;
            completedUsers++;

            // Once all users are inserted, add sample records
            if (completedUsers === users.length) {
              insertSampleRecords(userIds);
            }
          }
        );
      });

      function insertSampleRecords(userIds) {
        const records = [
          { user_id: userIds[1], amount: 5000, type: 'income', category: 'Salary', description: 'Monthly salary', record_date: '2024-01-01' },
          { user_id: userIds[1], amount: 1200, type: 'expense', category: 'Rent', description: 'Monthly rent', record_date: '2024-01-05' },
          { user_id: userIds[1], amount: 150, type: 'expense', category: 'Utilities', description: 'Electric bill', record_date: '2024-01-10' },
          { user_id: userIds[1], amount: 300, type: 'expense', category: 'Food', description: 'Groceries', record_date: '2024-01-12' },
          { user_id: userIds[1], amount: 50, type: 'expense', category: 'Entertainment', description: 'Movie tickets', record_date: '2024-01-15' },
          { user_id: userIds[1], amount: 2000, type: 'income', category: 'Freelance', description: 'Project payment', record_date: '2024-01-20' },
          { user_id: userIds[1], amount: 75, type: 'expense', category: 'Transportation', description: 'Gas', record_date: '2024-01-22' },
          { user_id: userIds[1], amount: 500, type: 'expense', category: 'Food', description: 'Restaurant', record_date: '2024-01-25' }
        ];

        records.forEach(record => {
          db.run(
            `INSERT OR IGNORE INTO financial_records (user_id, amount, type, category, description, record_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [record.user_id, record.amount, record.type, record.category, record.description, record.record_date],
            function (err) {
              if (err) console.error('Error inserting record:', err);
            }
          );
        });

        console.log('✅ Sample data initialized successfully!');
        console.log('\nSample users created:');
        console.log('- Admin User: username=admin_user, password=password123');
        console.log('- Analyst User: username=analyst_user, password=password123');
        console.log('- Viewer User: username=viewer_user, password=password123');
        resolve();
      }
    });
  });
};

module.exports = { initializeSampleData };
