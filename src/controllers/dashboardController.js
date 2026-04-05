const FinancialRecord = require('../models/financialRecord');

/**
 * Dashboard Controller - Handles dashboard summary data
 */

const dashboardController = {
  /**
   * Get dashboard summary for current user
   * Includes total income, expenses, net balance
   */
  getSummary: async (req, res, next) => {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const summary = await FinancialRecord.getSummary(req.user.id, filters);

      res.json({
        success: true,
        data: summary,
        period: filters
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get category-wise breakdown of records
   * Can be filtered by type (income/expense)
   */
  getCategoryBreakdown: async (req, res, next) => {
    try {
      const type = req.query.type; // optional: 'income' or 'expense'

      const breakdown = await FinancialRecord.getCategoryBreakdown(req.user.id, type);

      res.json({
        success: true,
        data: breakdown,
        type: type || 'all'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent activity/transactions
   */
  getRecentActivity: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const recent = await FinancialRecord.getRecent(req.user.id, limit);

      res.json({
        success: true,
        data: recent
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get comprehensive dashboard data
   * Combines summary, recent activity, and category breakdown
   */
  getComprehensiveDashboard: async (req, res, next) => {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const [summary, recent, breakdown] = await Promise.all([
        FinancialRecord.getSummary(req.user.id, filters),
        FinancialRecord.getRecent(req.user.id, 5),
        FinancialRecord.getCategoryBreakdown(req.user.id)
      ]);

      res.json({
        success: true,
        data: {
          summary,
          recent_activity: recent,
          category_breakdown: breakdown
        },
        period: filters
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
