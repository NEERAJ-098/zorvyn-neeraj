const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get comprehensive dashboard data
 *     description: Get complete dashboard with summary, recent activity, and category breakdown
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           description: Filter to date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Comprehensive dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, dashboardController.getComprehensiveDashboard);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get financial summary
 *     description: Get financial summary including total income, expenses, net balance, and record count
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Financial summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_income:
 *                   type: number
 *                 total_expenses:
 *                   type: number
 *                 net_balance:
 *                   type: number
 *                 total_records:
 *                   type: integer
 *       400:
 *         description: Validation error (invalid date range)
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', authenticate, dashboardController.getSummary);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get category-wise breakdown
 *     description: Get category-wise breakdown of transactions with totals and counts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           description: Filter by transaction type (optional)
 *     responses:
 *       200:
 *         description: Category breakdown data
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', authenticate, dashboardController.getCategoryBreakdown);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent transactions
 *     description: Get recent financial transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           description: Number of records to return
 *     responses:
 *       200:
 *         description: Recent transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/recent', authenticate, dashboardController.getRecentActivity);

module.exports = router;
