import express from 'express';
import {
  getAllLocations,
  getLocation,
  createLocation,
  getLocationsByBus,
  getNearbyBuses,
  getLocationStats,
  cleanupOldLocations
} from '../controllers/locationController.js';
import { authenticate, authorize, authorizeOperator } from '../middleware/auth.js';
import { 
  validateCoordinates,
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all location records
 *     tags: [Locations]
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
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: Filter by bus ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for location records
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for location records
 *       - in: query
 *         name: latest
 *         schema:
 *           type: boolean
 *         description: Get only the latest location for each bus
 *     responses:
 *       200:
 *         description: List of location records
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
 *                     $ref: '#/components/schemas/Location'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', validatePagination, getAllLocations);

/**
 * @swagger
 * /api/locations/nearby:
 *   get:
 *     summary: Get nearby buses based on location
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Search radius in meters
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of buses to return
 *     responses:
 *       200:
 *         description: List of nearby buses with their latest locations
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       busId:
 *                         type: string
 *                       currentLocation:
 *                         $ref: '#/components/schemas/GeoLocation'
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       bus:
 *                         $ref: '#/components/schemas/Bus'
 *                       routes:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Route'
 *                 count:
 *                   type: integer
 *                 searchParams:
 *                   type: object
 *       400:
 *         description: Latitude and longitude are required
 */
router.get('/nearby', validateCoordinates, getNearbyBuses);

/**
 * @swagger
 * /api/locations/stats:
 *   get:
 *     summary: Get location statistics
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: Filter by specific bus ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Location tracking statistics
 */
router.get('/stats', authenticate, authorize('admin'), getLocationStats);

/**
 * @swagger
 * /api/locations/bus/{busId}:
 *   get:
 *     summary: Get location history for a specific bus
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for location history
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for location history
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of location records
 *     responses:
 *       200:
 *         description: Location history for the bus
 */
router.get('/bus/:busId', getLocationsByBus);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location record by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location record ID
 *     responses:
 *       200:
 *         description: Location record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getLocation);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create location record
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busId
 *               - latitude
 *               - longitude
 *             properties:
 *               busId:
 *                 type: string
 *                 description: Bus ID
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitude coordinate
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 description: GPS accuracy in meters
 *               heading:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 360
 *                 description: Direction of travel in degrees
 *               speed:
 *                 type: number
 *                 minimum: 0
 *                 description: Speed in km/h
 *               altitude:
 *                 type: number
 *                 description: Altitude in meters
 *               deviceId:
 *                 type: string
 *                 description: GPS device identifier
 *               batteryLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Device battery level percentage
 *               signalStrength:
 *                 type: number
 *                 description: GPS signal strength
 *     responses:
 *       201:
 *         description: Location recorded successfully
 *       400:
 *         description: Invalid location data
 *       403:
 *         description: Not authorized to update this bus location
 *       404:
 *         description: Bus not found
 */
router.post('/', authenticate, authorize('admin', 'operator'), validateCoordinates, createLocation);

/**
 * @swagger
 * /api/locations/cleanup:
 *   delete:
 *     summary: Clean up old location records
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysOld
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Delete records older than this many days
 *     responses:
 *       200:
 *         description: Old location records deleted successfully
 */
router.delete('/cleanup', authenticate, authorize('admin'), cleanupOldLocations);

export default router;