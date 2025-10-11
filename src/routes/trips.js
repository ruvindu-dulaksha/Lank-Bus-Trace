import express from 'express';
import {
  getAllTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  addTripDelay,
  getTripsByRoute,
  getTripStats
} from '../controllers/tripController.js';
import { authenticate, authorize, authorizeOperator } from '../middleware/auth.js';
import { 
  validateTripCreate,
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     parameters:
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, boarding, in_progress, completed, cancelled, delayed]
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
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by trip date (YYYY-MM-DD)
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Show only upcoming trips
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', validatePagination, getAllTrips);

/**
 * @swagger
 * /api/trips/search:
 *   get:
 *     summary: Search trips
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Origin city
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Destination city
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Travel date
 *     responses:
 *       200:
 *         description: List of trips matching search criteria
 */
router.get('/search', validatePagination, getAllTrips); // Reuse getAllTrips with query params

/**
 * @swagger
 * /api/trips/stats:
 *   get:
 *     summary: Get trip statistics
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Trip statistics including status distribution, revenue, and top routes
 */
router.get('/stats', authenticate, authorize('admin'), getTripStats);

/**
 * @swagger
 * /api/trips/route/{routeId}:
 *   get:
 *     summary: Get trips by route
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by trip date (YYYY-MM-DD)
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Show only upcoming trips
 *     responses:
 *       200:
 *         description: List of trips for the route
 */
router.get('/route/:routeId', authenticate, getTripsByRoute);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Trip'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, getTrip);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TripCreate'
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Bus is already scheduled for another trip during this time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', authenticate, authorize('admin', 'operator'), validateTripCreate, createTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TripUpdate'
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       403:
 *         description: Not authorized to update this trip
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authenticate, authorize('admin', 'operator'), updateTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       400:
 *         description: Cannot delete trip that is in progress
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authenticate, authorize('admin'), deleteTrip);

/**
 * @swagger
 * /api/trips/{id}/status:
 *   patch:
 *     summary: Update trip status
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, boarding, in_progress, completed, cancelled, delayed]
 *                 description: New trip status
 *     responses:
 *       200:
 *         description: Trip status updated successfully
 *       400:
 *         description: Invalid trip status
 *       403:
 *         description: Not authorized to update this trip
 */
router.patch('/:id/status', authenticate, authorize('admin', 'operator'), updateTripStatus);

/**
 * @swagger
 * /api/trips/{id}/delay:
 *   post:
 *     summary: Add trip delay
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - estimatedDelay
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for the delay
 *               estimatedDelay:
 *                 type: number
 *                 description: Estimated delay in minutes
 *     responses:
 *       200:
 *         description: Trip delay recorded successfully
 *       403:
 *         description: Not authorized to update this trip
 */
router.post('/:id/delay', authenticate, authorize('admin', 'operator'), addTripDelay);

export default router;