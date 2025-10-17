import express from 'express';
import Bus from '../models/Bus.js';
import {
  getAllBuses,
  getBus,
  getBusById,
  getBusByObjectId,
  createBus,
  updateBus,
  deleteBus,
  updateBusLocation,
  getBusLocationHistory,
  getBusesByRoute,
  getNearbyBuses,
  getLiveTracking,
  getFleetStatus,
  getRouteCoverage,
  findNearbyBuses
} from '../controllers/busController.js';
import { authenticate, authorize, authorizeOperator, optionalAuth } from '../middleware/auth.js';
import { 
  validateBusCreate,
  validateCoordinates,
  validateLocationSearch,
  validatePagination,
  validateNearbyQuery,
  validateBusNumber
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
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
 *           enum: [active, maintenance, out_of_service]
 *         description: Filter by operational status
 *       - in: query
 *         name: route
 *         schema:
 *           type: string
 *         description: Filter by assigned route ID
 *       - in: query
 *         name: operator
 *         schema:
 *           type: string
 *         description: Filter by operator company name
 *       - in: query
 *         name: busType
 *         schema:
 *           type: string
 *           enum: [standard, luxury, semi-luxury, air_conditioned]
 *         description: Filter by bus type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by registration number, bus number, or operator
 *     responses:
 *       200:
 *         description: List of buses
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
 *                     $ref: '#/components/schemas/Bus'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', optionalAuth, validatePagination, getAllBuses);

/**
 * @swagger
 * /api/buses/search:
 *   get:
 *     summary: Search buses
 *     tags: [Buses]
 *     parameters:
 *       - in: query
 *         name: busType
 *         schema:
 *           type: string
 *           enum: [standard, luxury, semi_luxury, air_conditioned, super_luxury]
 *         description: Filter by bus type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by registration number, bus number, or operator
 *     responses:
 *       200:
 *         description: List of buses matching search criteria
 */
router.get('/search', validatePagination, getAllBuses); // Reuse getAllBuses with query params

/**
 * @swagger
 * /api/buses/nearby:
 *   get:
 *     summary: Get nearby buses
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: List of nearby buses
 */
router.get('/nearby', authenticate, validateNearbyQuery, findNearbyBuses);

/**
 * @swagger
 * /api/buses/live-tracking/{id}:
 *   get:
 *     summary: Get real-time tracking data for a bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     responses:
 *       200:
 *         description: Real-time tracking data
 */
router.get('/live-tracking/:id', authenticate, getLiveTracking);

/**
 * @swagger
 * /api/buses/fleet-status:
 *   get:
 *     summary: Get fleet-wide status overview
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet status overview
 */
router.get('/fleet-status', authenticate, authorize('admin', 'operator'), getFleetStatus);

/**
 * @swagger
 * /api/buses/route-coverage/{routeId}:
 *   get:
 *     summary: Get bus coverage for a specific route
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route coverage data
 */
router.get('/route-coverage/:routeId', authenticate, getRouteCoverage);

/**
 * @swagger
 * /api/buses/route/{routeId}:
 *   get:
 *     summary: Get buses by route
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: List of buses assigned to the route
 */
router.get('/route/:routeId', authenticate, getBusesByRoute);

/**
 * @swagger
 * /api/buses/active:
 *   get:
 *     summary: Get all active buses
 *     tags: [Buses]
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
 *     responses:
 *       200:
 *         description: List of active buses
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
 *                     $ref: '#/components/schemas/Bus'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/active', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
      operationalStatus: 'active',
      isActive: true
    };

    const [buses, total] = await Promise.all([
      Bus.find(filter)
        .select('registrationNumber busNumber operatorInfo.operatorName vehicleDetails capacity busType operationalStatus currentLocation isActive')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bus.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: buses,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      message: `Found ${total} active buses`
    });
  } catch (error) {
    console.error('Error fetching active buses:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving active buses',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/buses/id/{id}:
 *   get:
 *     summary: Get bus by ObjectId (Authenticated)
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bus
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Bus details with full ObjectId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bus'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         description: Authentication required
 */
router.get('/id/:id', authenticate, getBusById);

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: Get bus by ObjectId
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bus
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Bus details (public data, sanitized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bus'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getBusByObjectId);

/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: Create new bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusCreate'
 *     responses:
 *       201:
 *         description: Bus created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', authenticate, authorize('admin', 'operator'), validateBusCreate, createBus);

/**
 * @swagger
 * /api/buses/{id}:
 *   put:
 *     summary: Update bus (Admin/Operator)
 *     tags: [Buses]
 *     description: Update bus details using MongoDB ObjectId. Requires admin or operator authentication.
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bus
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusUpdate'
 *     responses:
 *       200:
 *         description: Bus updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bus'
 *                 message:
 *                   type: string
 *                   example: "Bus updated successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         description: Not authorized to update this bus
 */
router.put('/:id', authenticate, authorize('admin', 'operator'), authorizeOperator('bus'), updateBus);

/**
 * @swagger
 * /api/buses/{id}:
 *   delete:
 *     summary: Delete bus (Admin only)
 *     tags: [Buses]
 *     description: Delete a bus using MongoDB ObjectId. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bus
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Bus deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bus deleted successfully"
 *       400:
 *         description: Cannot delete bus with active trips
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', authenticate, authorize('admin'), deleteBus);

/**
 * @swagger
 * /api/buses/{id}/location:
 *   post:
 *     summary: Update bus location
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               heading:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 360
 *               speed:
 *                 type: number
 *                 minimum: 0
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *               altitude:
 *                 type: number
 *               deviceId:
 *                 type: string
 *               batteryLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               signalStrength:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       403:
 *         description: Not authorized to update this bus location
 */
router.post('/:id/location', authenticate, authorize('admin', 'operator'), authorizeOperator('bus'), validateCoordinates, updateBusLocation);

/**
 * @swagger
 * /api/buses/{id}/location-history:
 *   get:
 *     summary: Get bus location history
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Bus location history
 */
router.get('/:id/location-history', authenticate, getBusLocationHistory);

export default router;
