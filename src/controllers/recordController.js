const FinancialRecord = require('../models/financialRecord');
const { AuthorizationError } = require('../utils/errors');

/**
 * Financial Record Controller - Handles record management business logic
 */

const recordController = {
  /**
   * Create a new financial record
   * Analysts and Admins can create records
   */
  createRecord: async (req, res, next) => {
    try {
      const record = await FinancialRecord.create(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a specific record
   * Users can only view their own records
   */
  getRecord: async (req, res, next) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await FinancialRecord.getById(req.user.id, recordId);

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all records for current user with optional filtering
   * All authenticated users can view their own records
   */
  getUserRecords: async (req, res, next) => {
    try {
      const filters = {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
      };

      const records = await FinancialRecord.getByUserId(req.user.id, filters);

      res.json({
        success: true,
        data: records,
        filters: {
          applied: Object.keys(filters).reduce((acc, key) => {
            if (filters[key] !== undefined && filters[key] !== null) {
              acc[key] = filters[key];
            }
            return acc;
          }, {})
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a financial record
   * Users can only update their own records, Analysts and Admins
   */
  updateRecord: async (req, res, next) => {
    try {
      const recordId = parseInt(req.params.id);

      const record = await FinancialRecord.update(req.user.id, recordId, req.body);

      res.json({
        success: true,
        message: 'Record updated successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a financial record
   * Users can only delete their own records, Analysts and Admins
   */
  deleteRecord: async (req, res, next) => {
    try {
      const recordId = parseInt(req.params.id);

      const result = await FinancialRecord.delete(req.user.id, recordId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recordController;
