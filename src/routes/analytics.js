import express from 'express';
import { getPerformanceAnalytics, getUsageAnalytics } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
// Root analytics endpoint: summary of available analytics
router.get('/', authenticate, authorize('admin', 'operator'), (req, res) => {
	res.status(200).json({
		success: true,
		endpoints: [
			'/api/analytics/performance',
			'/api/analytics/usage'
		],
		message: 'Available analytics endpoints: performance, usage.'
	});
});

/**
 * @swagger
 * /api/analytics/performance:
 *   get:
 *     summary: Get performance analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 30d
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Performance analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/performance', authenticate, authorize('admin', 'operator'), getPerformanceAnalytics);

/**
 * @swagger
 * /api/analytics/usage:
 *   get:
 *     summary: Get usage analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 30d
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Usage analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/usage', authenticate, authorize('admin', 'operator'), getUsageAnalytics);

export default router;