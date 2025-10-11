import express from 'express';
import { liveSearch, generalSearch } from '../controllers/searchController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/live-search:
 *   get:
 *     summary: Smart bus search for journey planning
 *     description: Find buses that actually help users travel from origin to destination (not just nearby buses)
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           example: "Colombo"
 *         description: Origin city/location
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: "Kandy"
 *         description: Destination city/location
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-10-11"
 *         description: Travel date (default today)
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *           example: "09:00"
 *         description: Preferred departure time
 *     responses:
 *       200:
 *         description: Journey-relevant search results
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
 *                   example: "Found 3 available trips"
 *                 data:
 *                   type: array
 *                   description: Routes and trips suitable for user's journey
 *                 searchCriteria:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                     date:
 *                       type: string
 *                     searchTime:
 *                       type: string
 *       400:
 *         description: Missing required parameters (from/to)
 *       401:
 *         description: Authentication required
 *       404:
 *         description: No routes found for this journey
 *     examples:
 *       successful_search:
 *         summary: Successful journey search
 *         value:
 *           from: "Colombo"
 *           to: "Kandy"
 *           date: "2025-10-11"
 *           time: "09:00"
 */
router.get('/live-search', authenticate, authorize('admin', 'operator', 'commuter', 'driver', 'conductor'), liveSearch);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: General search across buses, routes, and locations
 *     description: Search for buses, routes, locations, or all entities. Use 'q' parameter for search query.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query string
 *         schema:
 *           type: string
 *           example: "Colombo"
 *       - in: query
 *         name: type
 *         description: Entity type to search (or 'all' for everything)
 *         schema:
 *           type: string
 *           enum: [bus, route, location, user, all]
 *           example: "route"
 *       - in: query
 *         name: limit
 *         description: Maximum number of results per type
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 5
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     buses:
 *                       type: array
 *                       description: Matching buses
 *                     routes:
 *                       type: array
 *                       description: Matching routes
 *                     locations:
 *                       type: array
 *                       description: Matching locations
 *                     total:
 *                       type: integer
 *                       description: Total results found
 *       400:
 *         description: Missing search query parameter 'q'
 *       401:
 *         description: Authentication required
 *     examples:
 *       route_search:
 *         summary: Search for routes
 *         value:
 *           q: "Colombo"
 *           type: "route"
 *           limit: 5
 *       general_search:
 *         summary: Search all entities
 *         value:
 *           q: "Kandy"
 *           type: "all"
 *           limit: 10
 */
router.get('/search', authenticate, authorize('admin', 'operator', 'commuter', 'driver', 'conductor'), generalSearch);

export default router;