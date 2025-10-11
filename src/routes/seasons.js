import express from 'express';
import {
  getAllSeasons,
  getSeason,
  createSeason,
  updateSeason,
  deleteSeason,
  getActiveSeasons,
  getSeasonalPricing,
  getSeasonStats,
  toggleSeasonStatus
} from '../controllers/seasonController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateSeasonCreate,
  validatePagination 
} from '../middleware/validation.js';
import { setCacheControl } from '../middleware/conditionalGET.js';

const router = express.Router();

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get all seasons
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [peak, off_peak, festival, holiday, normal]
 *         description: Filter by season type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *     responses:
 *       200:
 *         description: List of seasons
 */
router.get('/', authenticate, authorize('admin', 'operator'), validatePagination, getAllSeasons);

/**
 * @swagger
 * /api/seasons/active:
 *   get:
 *     summary: Get currently active seasons
 *     tags: [Seasons]
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *       - in: query
 *         name: busType
 *         schema:
 *           type: string
 *           enum: [standard, luxury, semi_luxury, air_conditioned, super_luxury]
 *         description: Filter by bus type
 *     responses:
 *       200:
 *         description: List of active seasons
 */
router.get('/active', setCacheControl(300), getActiveSeasons);

/**
 * @swagger
 * /api/seasons/stats:
 *   get:
 *     summary: Get season statistics
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics
 *     responses:
 *       200:
 *         description: Season statistics
 */
router.get('/stats', authenticate, authorize('admin'), getSeasonStats);

/**
 * @swagger
 * /api/seasons/pricing/{routeId}:
 *   get:
 *     summary: Get seasonal pricing for a route
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *       - in: query
 *         name: busType
 *         schema:
 *           type: string
 *           default: standard
 *         description: Bus type
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for pricing (defaults to today)
 *     responses:
 *       200:
 *         description: Seasonal pricing information
 */
router.get('/pricing/:routeId', setCacheControl(300), getSeasonalPricing);

/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     summary: Get season by ID
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Season details
 *       404:
 *         description: Season not found
 */
router.get('/:id', authenticate, authorize('admin', 'operator'), getSeason);

/**
 * @swagger
 * /api/seasons:
 *   post:
 *     summary: Create new season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - startDate
 *               - endDate
 *               - priceMultiplier
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [peak, off_peak, festival, holiday, normal]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priceMultiplier:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 5.0
 *               applicableRoutes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     routeId:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *               applicableBusTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [standard, luxury, semi_luxury, air_conditioned, super_luxury]
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     endTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               priority:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 1
 *     responses:
 *       201:
 *         description: Season created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, authorize('admin'), validateSeasonCreate, createSeason);

/**
 * @swagger
 * /api/seasons/{id}:
 *   put:
 *     summary: Update season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [peak, off_peak, festival, holiday, normal]
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priceMultiplier:
 *                 type: number
 *               applicableRoutes:
 *                 type: array
 *               applicableBusTypes:
 *                 type: array
 *               priority:
 *                 type: number
 *     responses:
 *       200:
 *         description: Season updated successfully
 *       404:
 *         description: Season not found
 */
router.put('/:id', authenticate, authorize('admin'), updateSeason);

/**
 * @swagger
 * /api/seasons/{id}:
 *   delete:
 *     summary: Delete season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Season deleted successfully
 *       404:
 *         description: Season not found
 */
router.delete('/:id', authenticate, authorize('admin'), deleteSeason);

/**
 * @swagger
 * /api/seasons/{id}/toggle:
 *   patch:
 *     summary: Toggle season active status
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Season status toggled successfully
 *       404:
 *         description: Season not found
 */
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleSeasonStatus);

export default router;