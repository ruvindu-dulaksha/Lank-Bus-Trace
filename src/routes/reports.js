import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all available report types
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available reports retrieved successfully
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
 *                     reportTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Trip Reports"
 *                           endpoint:
 *                             type: string
 *                             example: "/api/reports/trips"
 *                           description:
 *                             type: string
 *                             example: "Trip performance and statistics"
 *                     totalReportTypes:
 *                       type: number
 *                       example: 3
 *                     accessLevel:
 *                       type: string
 *                       example: "admin"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Available reports retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, authorize('admin', 'operator'), async (req, res) => {
  try {
    const availableReports = {
      reportTypes: [
        { name: 'Trip Reports', endpoint: '/api/reports/trips', description: 'Trip performance and statistics' },
        { name: 'Revenue Reports', endpoint: '/api/reports/revenue', description: 'Financial performance and revenue analytics' },
        { name: 'Fleet Reports', endpoint: '/api/reports/fleet', description: 'Fleet performance and utilization metrics' }
      ],
      totalReportTypes: 3,
      accessLevel: req.user.role,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: availableReports,
      message: 'Available reports retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving available reports',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/reports/trips:
 *   get:
 *     summary: Get trip performance reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trip reports retrieved successfully
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
 *                     totalTrips:
 *                       type: number
 *                       example: 1250
 *                     completedTrips:
 *                       type: number
 *                       example: 1180
 *                     cancelledTrips:
 *                       type: number
 *                       example: 45
 *                     delayedTrips:
 *                       type: number
 *                       example: 25
 *                     averageDelay:
 *                       type: number
 *                       example: 12.5
 *                     onTimePerformance:
 *                       type: number
 *                       example: 94.4
 *                     revenue:
 *                       type: number
 *                       example: 2850000
 *                     averageOccupancy:
 *                       type: number
 *                       example: 78.5
 *                 message:
 *                   type: string
 *                   example: "Trip reports retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/trips', authenticate, authorize('admin', 'operator'), async (req, res) => {
  try {
    const tripReports = {
      totalTrips: 1250,
      completedTrips: 1180,
      cancelledTrips: 45,
      delayedTrips: 25,
      averageDelay: 12.5,
      onTimePerformance: 94.4,
      revenue: 2850000,
      averageOccupancy: 78.5,
      period: {
        startDate: '2025-10-01',
        endDate: '2025-10-11'
      }
    };

    res.status(200).json({
      success: true,
      data: tripReports,
      message: 'Trip reports retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving trip reports',
      error: error.message
    });
  }
});

// Get revenue reports
router.get('/revenue', authenticate, authorize('admin', 'operator'), async (req, res) => {
  try {
    const revenueReports = {
      totalRevenue: 2850000,
      dailyAverage: 285000,
      monthlyGrowth: 8.5,
      topRoutes: [
        { routeId: '1', routeName: 'Colombo - Kandy', revenue: 850000 },
        { routeId: '2', routeName: 'Colombo - Galle', revenue: 720000 },
        { routeId: '3', routeName: 'Kandy - Jaffna', revenue: 480000 }
      ],
      period: {
        startDate: '2025-10-01',
        endDate: '2025-10-11'
      }
    };

    res.status(200).json({
      success: true,
      data: revenueReports,
      message: 'Revenue reports retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving revenue reports',
      error: error.message
    });
  }
});

// Get fleet performance reports
router.get('/fleet', authenticate, authorize('admin', 'operator'), async (req, res) => {
  try {
    const fleetReports = {
      totalBuses: 45,
      activeBuses: 42,
      maintenanceBuses: 2,
      breakdownBuses: 1,
      averageFuelEfficiency: 4.2,
      totalDistanceCovered: 125000,
      averageSpeed: 58.5,
      utilizationRate: 87.3,
      period: {
        startDate: '2025-10-01',
        endDate: '2025-10-11'
      }
    };

    res.status(200).json({
      success: true,
      data: fleetReports,
      message: 'Fleet performance reports retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving fleet reports',
      error: error.message
    });
  }
});

export default router;
