import express from 'express';
import { getDriverTrips, getConductorTrips, getOperatorBuses } from '../controllers/roleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/driver/trips:
 *   get:
 *     summary: Get trips assigned to driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trip status filter
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date filter
 *     responses:
 *       200:
 *         description: Driver trips
 */
router.get('/driver/trips', authenticate, authorize('driver', 'admin'), getDriverTrips);

/**
 * @swagger
 * /api/conductor/trips:
 *   get:
 *     summary: Get trips assigned to conductor
 *     tags: [Conductor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trip status filter
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date filter
 *     responses:
 *       200:
 *         description: Conductor trips
 */
router.get('/conductor/trips', authenticate, authorize('conductor', 'admin'), getConductorTrips);

/**
 * @swagger
 * /api/operator/buses:
 *   get:
 *     summary: Get buses assigned to operator
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Bus status filter
 *     responses:
 *       200:
 *         description: Operator buses
 */
router.get('/operator/buses', authenticate, authorize('operator', 'admin'), getOperatorBuses);

export default router;