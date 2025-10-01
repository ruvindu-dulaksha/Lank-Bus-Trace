import express from 'express';
import {
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  searchRoutes,
  getRouteStops,
  getRoutesByProvince,
  getRouteStats
} from '../controllers/routeController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateRouteCreate,
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Routes]
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
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filter by origin city
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination city
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by route number, name, origin, or destination
 *     responses:
 *       200:
 *         description: List of routes
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
 *                     $ref: '#/components/schemas/Route'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', validatePagination, getAllRoutes);

/**
 * @swagger
 * /api/routes/search:
 *   get:
 *     summary: Search routes between cities
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Origin city
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination city
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Travel date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Routes and available trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     routes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Route'
 *                     trips:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Trip'
 *                     searchParams:
 *                       type: object
 *       400:
 *         description: Origin and destination are required
 */
router.get('/search', searchRoutes);

/**
 * @swagger
 * /api/routes/province/{province}:
 *   get:
 *     summary: Get routes by province
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: province
 *         required: true
 *         schema:
 *           type: string
 *         description: Province name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of routes
 *     responses:
 *       200:
 *         description: List of routes in the province
 */
router.get('/province/:province', getRoutesByProvince);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details with assigned buses and active trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     route:
 *                       $ref: '#/components/schemas/Route'
 *                     assignedBuses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bus'
 *                     activeTrips:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Trip'
 *                     stats:
 *                       type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getRoute);

/**
 * @swagger
 * /api/routes/{id}/stops:
 *   get:
 *     summary: Get route stops
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route stops information
 */
router.get('/:id/stops', getRouteStops);

/**
 * @swagger
 * /api/routes/{id}/stats:
 *   get:
 *     summary: Get route statistics
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route statistics including buses, trips, and revenue
 */
router.get('/:id/stats', getRouteStats);

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create new route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteCreate'
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Route number already exists
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', authenticate, authorize('admin'), validateRouteCreate, createRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     summary: Update route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteUpdate'
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authenticate, authorize('admin'), updateRoute);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: Delete route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route deleted successfully
 *       400:
 *         description: Cannot delete route with assigned buses or active trips
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authenticate, authorize('admin'), deleteRoute);

export default router;