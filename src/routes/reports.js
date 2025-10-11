import express from 'express';
import { getTripReports, getRevenueReports } from '../controllers/reportsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/trips:
 *   get:
 *     summary: Get trip reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 30d
 *         description: Report period
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-transit, completed, cancelled, delayed]
 *         description: Filter by trip status
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: Filter by bus ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Trip reports data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/trips', authenticate, authorize('admin', 'operator'), getTripReports);

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     summary: Get revenue reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 30d
 *         description: Report period
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: Filter by bus ID
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: string
 *         description: Filter by operator ID
 *     responses:
 *       200:
 *         description: Revenue reports data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/revenue', authenticate, authorize('admin', 'operator'), getRevenueReports);

export default router;