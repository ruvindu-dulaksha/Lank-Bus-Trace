import express from 'express';
import { liveSearch, generalSearch } from '../controllers/searchController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/live-search:
 *   get:
 *     summary: Live bus search between locations
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Origin location
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination location
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Travel date (default today)
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *         description: Preferred departure time
 *     responses:
 *       200:
 *         description: Live search results
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: No routes found
 */
router.get('/live-search', authenticate, authorize('admin', 'operator', 'commuter', 'driver', 'conductor'), liveSearch);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: General search across buses, routes, and locations
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: Entity type to search (bus, route, location)
 *         schema:
 *           type: string
 *           enum: [bus, route, location]
 *       - in: query
 *         name: limit
 *         description: Maximum number of results
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
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
 *                     buses:
 *                       type: array
 *                     routes:
 *                       type: array
 *                     locations:
 *                       type: array
 *                     total:
 *                       type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/search', authenticate, authorize('admin', 'operator', 'commuter', 'driver', 'conductor'), generalSearch);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: General search across all entities
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bus, route, location, user]
 *         description: Search type filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum results per type
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing search query
 */
router.get('/search', generalSearch);

export default router;