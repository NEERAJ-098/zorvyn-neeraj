const db = require('../db/database');
const { NotFoundError, ValidationError } = require('../utils/errors');
const validators = require('../utils/validation');

/**
 * Financial Record Model - Database operations for financial records
 */

const FinancialRecord = {
  /**
   * Create a new financial record
   */
  create: (userId, recordData) => {
    return new Promise((resolve, reject) => {
      validators.validateFinancialRecord(recordData);

      const { amount, type, category, description, record_date } = recordData;

      db.run(
        `INSERT INTO financial_records (user_id, amount, type, category, description, record_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, amount, type, category, description || null, record_date],
        function (err) {
          if (err) reject(err);
          else {
            FinancialRecord.getById(userId, this.lastID)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  },

  /**
   * Get record by ID and user ID
   */
  getById: (userId, recordId) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, user_id, amount, type, category, description, record_date, created_at 
         FROM financial_records WHERE id = ? AND user_id = ?`,
        [recordId, userId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) {
            reject(new NotFoundError(`Record with ID ${recordId} not found`));
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  /**
   * Get all records for a user with optional filtering
   */
  getByUserId: (userId, filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `SELECT id, user_id, amount, type, category, description, record_date, created_at 
                   FROM financial_records WHERE user_id = ?`;
      const params = [userId];

      // Add optional filters
      if (filters.type) {
        query += ` AND type = ?`;
        params.push(filters.type);
      }

      if (filters.category) {
        query += ` AND category = ?`;
        params.push(filters.category);
      }

      if (filters.startDate) {
        validators.validateDateRange(filters.startDate, filters.endDate);
        query += ` AND record_date >= ?`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND record_date <= ?`;
        params.push(filters.endDate);
      }

      query += ` ORDER BY record_date DESC`;

      // Add pagination
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Update a financial record
   */
  update: (userId, recordId, updateData) => {
    return new Promise((resolve, reject) => {
      // Validate only the fields being updated
      const validationData = {};
      if (updateData.amount !== undefined) validationData.amount = updateData.amount;
      if (updateData.type !== undefined) validationData.type = updateData.type;
      if (updateData.category !== undefined) validationData.category = updateData.category;
      if (updateData.record_date !== undefined) validationData.record_date = updateData.record_date;
      if (updateData.description !== undefined) validationData.description = updateData.description;

      if (Object.keys(validationData).length > 0) {
        validators.validateFinancialRecord(validationData);
      }

      // Build dynamic update query
      const allowedFields = ['amount', 'type', 'category', 'description', 'record_date'];
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

      values.push(recordId, userId);

      db.run(
        `UPDATE financial_records 
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND user_id = ?`,
        values,
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new NotFoundError(`Record with ID ${recordId} not found`));
          } else {
            FinancialRecord.getById(userId, recordId)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  },

  /**
   * Delete a financial record
   */
  delete: (userId, recordId) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM financial_records WHERE id = ? AND user_id = ?`,
        [recordId, userId],
        function (err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new NotFoundError(`Record with ID ${recordId} not found`));
          } else {
            resolve({ message: 'Record deleted successfully' });
          }
        }
      );
    });
  },

  /**
   * Get summary statistics for user
   */
  getSummary: (userId, filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          COUNT(*) as total_records
        FROM financial_records 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (filters.startDate) {
        validators.validateDateRange(filters.startDate, filters.endDate);
        query += ` AND record_date >= ?`;
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ` AND record_date <= ?`;
        params.push(filters.endDate);
      }

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else {
          const summary = {
            total_income: row.total_income || 0,
            total_expenses: row.total_expenses || 0,
            net_balance: (row.total_income || 0) - (row.total_expenses || 0),
            total_records: row.total_records || 0
          };
          resolve(summary);
        }
      });
    });
  },

  /**
   * Get category-wise breakdown
   */
  getCategoryBreakdown: (userId, type = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          category,
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM financial_records 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }

      query += ` GROUP BY category, type ORDER BY total DESC`;

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Get recent records
   */
  getRecent: (userId, limit = 10) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, user_id, amount, type, category, description, record_date, created_at 
         FROM financial_records WHERE user_id = ? 
         ORDER BY record_date DESC, created_at DESC LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
};

module.exports = FinancialRecord;
