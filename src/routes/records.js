const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const recordController = require('../controllers/recordController');

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a new financial record
 *     description: Create a new financial transaction record. Analyst and Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - record_date
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               record_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst or Admin role required
 *   get:
 *     summary: Get user's financial records
 *     description: Get all financial records for the authenticated user with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of records
 *       400:
 *         description: Validation error (invalid date range)
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorize('analyst', 'admin'), recordController.createRecord);
router.get('/', authenticate, recordController.getUserRecords);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a specific financial record
 *     description: Get details of a specific financial record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *   put:
 *     summary: Update a financial record
 *     description: Update financial record details. Analyst and Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               record_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst or Admin role required
 *       404:
 *         description: Record not found
 *   delete:
 *     summary: Delete a financial record
 *     description: Delete a financial record. Analyst and Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Analyst or Admin role required
 *       404:
 *         description: Record not found
 */
router.get('/:id', authenticate, recordController.getRecord);
router.put('/:id', authenticate, authorize('analyst', 'admin'), recordController.updateRecord);
router.delete('/:id', authenticate, authorize('analyst', 'admin'), recordController.deleteRecord);

module.exports = router;
