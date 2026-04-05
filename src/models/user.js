const db = require('../db/database');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const validators = require('../utils/validation');

/**
 * User Model - Database operations for users
 */

const User = {
  /**
   * Create a new user
   */
  create: (userData) => {
    return new Promise((resolve, reject) => {
      validators.validateUser(userData);

      const { username, email, password, role = 'viewer', status = 'active' } = userData;

      db.run(
        `INSERT INTO users (username, email, password, role, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, password, role, status],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new ConflictError('Username or email already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, username, email, role, status });
          }
        }
      );
    });
  },

  /**
   * Get user by ID
   */
  getById: (userId) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, username, email, role, status, created_at FROM users WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new NotFoundError(`User with ID ${userId} not found`));
          else resolve(row);
        }
      );
    });
  },

  /**
   * Get all users (for admin)
   */
  getAll: (limit = 100, offset = 0) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, username, email, role, status, created_at 
         FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  },

  /**
   * Update user
   */
  update: (userId, updateData) => {
    return new Promise((resolve, reject) => {
      validators.validateUser(updateData, true);

      // Build dynamic update query
      const allowedFields = ['role', 'status'];
      const fields = [];
      const values = [];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (fields.length === 0) {
        reject(new ValidationError('No valid fields to update'));
        return;
      }

      values.push(userId);

      db.run(
        `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        values,
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new NotFoundError(`User with ID ${userId} not found`));
          } else {
            User.getById(userId)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  },

  /**
   * Delete user
   */
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM users WHERE id = ?`,
        [userId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new NotFoundError(`User with ID ${userId} not found`));
          } else {
            resolve({ message: 'User deleted successfully' });
          }
        }
      );
    });
  },

  /**
   * Count total users
   */
  count: () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM users`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
};

module.exports = User;
