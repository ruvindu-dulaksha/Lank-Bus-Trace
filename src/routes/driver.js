import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/driver/profile:
 *   get:
 *     summary: Get driver profile information
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile retrieved successfully
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
 *                     driverId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       example: "driver_john"
 *                     email:
 *                       type: string
 *                       example: "john.driver@sltb.lk"
 *                     licenseInfo:
 *                       type: object
 *                       properties:
 *                         licenseNumber:
 *                           type: string
 *                           example: "DL123456789"
 *                         expiryDate:
 *                           type: string
 *                           format: date
 *                           example: "2026-12-31"
 *                         category:
 *                           type: string
 *                           example: "Heavy Vehicle"
 *                 message:
 *                   type: string
 *                   example: "Driver profile retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticate, authorize('driver'), async (req, res) => {
  try {
    const driverProfile = {
      driverId: req.user.id,
      username: req.user.username,
      email: req.user.email,
      personalInfo: req.user.personalInfo || {},
      licenseInfo: {
        licenseNumber: 'DL123456789',
        expiryDate: '2026-12-31',
        category: 'Heavy Vehicle',
        issueDate: '2021-01-15'
      },
      employmentInfo: {
        joinDate: '2022-03-15',
        employeeId: 'EMP001',
        status: 'active',
        department: 'Transport Operations'
      },
      statistics: {
        totalTrips: 456,
        totalDistance: 45600,
        averageRating: 4.7,
        onTimePerformance: 95.2,
        accidentFree: true,
        lastTripDate: '2025-10-11'
      },
      certifications: [
        { name: 'Defensive Driving', issueDate: '2023-06-15', expiryDate: '2026-06-15' },
        { name: 'First Aid', issueDate: '2023-09-10', expiryDate: '2025-09-10' }
      ]
    };

    res.status(200).json({
      success: true,
      data: driverProfile,
      message: 'Driver profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver profile',
      error: error.message
    });
  }
});

// Get driver dashboard
router.get('/dashboard', authenticate, authorize('driver'), async (req, res) => {
  try {
    const driverDashboard = {
      driverId: req.user.id,
      assignedBuses: [
        { busId: '1', busNumber: 'B001', registrationNumber: 'NB-1001' }
      ],
      todaysTrips: [
        {
          tripId: 'TRP001',
          routeName: 'Colombo - Kandy',
          departureTime: '08:00',
          status: 'scheduled'
        }
      ],
      completedTrips: 45,
      totalDistance: 12500,
      averageRating: 4.8,
      upcomingTrip: {
        tripId: 'TRP002',
        routeName: 'Kandy - Colombo',
        departureTime: '14:30'
      }
    };

    res.status(200).json({
      success: true,
      data: driverDashboard,
      message: 'Driver dashboard retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver dashboard',
      error: error.message
    });
  }
});

// Get driver trips
router.get('/trips', authenticate, authorize('driver'), async (req, res) => {
  try {
    const driverTrips = [
      {
        tripId: 'TRP001',
        routeName: 'Colombo - Kandy',
        busNumber: 'B001',
        departureTime: '08:00',
        arrivalTime: '11:30',
        status: 'completed',
        distance: 115,
        passengers: 42,
        revenue: 8500
      }
    ];

    res.status(200).json({
      success: true,
      data: driverTrips,
      message: 'Driver trips retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver trips',
      error: error.message
    });
  }
});

// Start trip
router.post('/trips/:tripId/start', authenticate, authorize('driver'), async (req, res) => {
  try {
    const { tripId } = req.params;

    res.status(200).json({
      success: true,
      message: `Trip ${tripId} started successfully`,
      data: { tripId, status: 'in-progress', startTime: new Date() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting trip',
      error: error.message
    });
  }
});

// Complete trip
router.post('/trips/:tripId/complete', authenticate, authorize('driver'), async (req, res) => {
  try {
    const { tripId } = req.params;

    res.status(200).json({
      success: true,
      message: `Trip ${tripId} completed successfully`,
      data: { tripId, status: 'completed', endTime: new Date() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing trip',
      error: error.message
    });
  }
});

export default router;
