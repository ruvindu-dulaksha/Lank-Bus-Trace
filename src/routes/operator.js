import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/operator/profile:
 *   get:
 *     summary: Get operator profile information
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator profile retrieved successfully
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
 *                     operatorId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       example: "operator_admin"
 *                     email:
 *                       type: string
 *                       example: "admin@sltb.lk"
 *                     companyInfo:
 *                       type: object
 *                       properties:
 *                         companyName:
 *                           type: string
 *                           example: "Sri Lanka Transport Co."
 *                         licenseNumber:
 *                           type: string
 *                           example: "OPR2025001"
 *                 message:
 *                   type: string
 *                   example: "Operator profile retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticate, authorize('operator'), async (req, res) => {
  try {
    const operatorProfile = {
      operatorId: req.user.id,
      username: req.user.username,
      email: req.user.email,
      personalInfo: req.user.personalInfo || {},
      companyInfo: {
        companyName: 'Sri Lanka Transport Co.',
        licenseNumber: 'OPR2025001',
        registrationDate: '2020-01-15',
        operatingLicense: 'valid',
        licenseExpiryDate: '2027-01-15'
      },
      operatingStats: {
        fleetSize: 15,
        totalRoutes: 8,
        activeDrivers: 20,
        activeConductors: 18,
        totalRevenue: 15750000,
        averageOccupancy: 78.2,
        onTimePerformance: 89.5
      },
      businessMetrics: {
        monthlyGrowth: 12.5,
        customerSatisfaction: 4.3,
        maintenanceCosts: 450000,
        fuelCosts: 1250000,
        operatingMargin: 18.7
      }
    };

    res.status(200).json({
      success: true,
      data: operatorProfile,
      message: 'Operator profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving operator profile',
      error: error.message
    });
  }
});

// Get operator dashboard
router.get('/dashboard', authenticate, authorize('operator'), async (req, res) => {
  try {
    const operatorDashboard = {
      operatorId: req.user.id,
      fleetSize: 15,
      activeBuses: 12,
      totalRoutes: 8,
      todaysRevenue: 125000,
      monthlyRevenue: 3250000,
      fleetUtilization: 87.5,
      averageOccupancy: 78.2,
      topPerformingRoutes: [
        { routeId: '1', routeName: 'Colombo - Kandy', revenue: 45000 },
        { routeId: '2', routeName: 'Colombo - Galle', revenue: 38000 }
      ],
      recentIssues: [
        { busId: 'B005', issue: 'Engine maintenance required', priority: 'high' }
      ]
    };

    res.status(200).json({
      success: true,
      data: operatorDashboard,
      message: 'Operator dashboard retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving operator dashboard',
      error: error.message
    });
  }
});

// Get fleet overview
router.get('/fleet', authenticate, authorize('operator'), async (req, res) => {
  try {
    const fleetOverview = {
      totalBuses: 15,
      activeBuses: 12,
      maintenanceBuses: 2,
      breakdownBuses: 1,
      buses: [
        {
          busId: 'B001',
          registrationNumber: 'NB-1001',
          status: 'active',
          currentRoute: 'Colombo - Kandy',
          lastMaintenance: '2025-09-15',
          nextMaintenance: '2025-12-15',
          mileage: 125000
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: fleetOverview,
      message: 'Fleet overview retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving fleet overview',
      error: error.message
    });
  }
});

// Assign bus to route
router.post('/buses/:busId/assign-route', authenticate, authorize('operator'), async (req, res) => {
  try {
    const { busId } = req.params;
    const { routeId } = req.body;

    res.status(200).json({
      success: true,
      message: `Bus ${busId} assigned to route ${routeId} successfully`,
      data: { busId, routeId, assignedAt: new Date() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning bus to route',
      error: error.message
    });
  }
});

export default router;
