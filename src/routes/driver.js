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

// Conductor functionality (for drivers acting as conductors)

/**
 * @swagger
 * /api/driver/conductor/tickets/sell:
 *   post:
 *     summary: Sell ticket (conductor function)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tripId
 *               - from
 *               - to
 *               - passengers
 *               - fare
 *             properties:
 *               tripId:
 *                 type: string
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               passengers:
 *                 type: integer
 *               fare:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ticket sold successfully
 */
router.post('/conductor/tickets/sell', authenticate, authorize('driver'), async (req, res) => {
  try {
    const { tripId, from, to, passengers, fare } = req.body;

    // Check if driver has conductor info enabled
    if (!req.user.driverDetails?.conductorInfo?.isConductor) {
      return res.status(403).json({
        success: false,
        message: 'Driver is not authorized to perform conductor functions'
      });
    }

    const ticket = {
      ticketId: `TKT${Date.now()}`,
      tripId,
      from,
      to,
      passengers,
      fare,
      totalAmount: fare * passengers,
      issuedAt: new Date(),
      issuedBy: req.user.id
    };

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket sold successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error selling ticket',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/driver/conductor/trips/{tripId}/passengers:
 *   get:
 *     summary: Get trip passengers (conductor function)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip passengers retrieved successfully
 */
router.get('/conductor/trips/:tripId/passengers', authenticate, authorize('driver'), async (req, res) => {
  try {
    const { tripId } = req.params;

    // Check if driver has conductor info enabled
    if (!req.user.driverDetails?.conductorInfo?.isConductor) {
      return res.status(403).json({
        success: false,
        message: 'Driver is not authorized to perform conductor functions'
      });
    }

    const passengers = [
      {
        ticketId: 'TKT001',
        from: 'Colombo',
        to: 'Kandy',
        passengers: 2,
        fare: 250,
        totalAmount: 500,
        issuedAt: new Date()
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        tripId,
        totalPassengers: passengers.reduce((sum, p) => sum + p.passengers, 0),
        totalRevenue: passengers.reduce((sum, p) => sum + p.totalAmount, 0),
        passengers
      },
      message: 'Trip passengers retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving trip passengers',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/driver/conductor/revenue:
 *   get:
 *     summary: Get conductor revenue summary
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conductor revenue retrieved successfully
 */
router.get('/conductor/revenue', authenticate, authorize('driver'), async (req, res) => {
  try {
    // Check if driver has conductor info enabled
    if (!req.user.driverDetails?.conductorInfo?.isConductor) {
      return res.status(403).json({
        success: false,
        message: 'Driver is not authorized to perform conductor functions'
      });
    }

    const revenue = {
      today: {
        ticketsSold: 125,
        totalRevenue: 31250,
        passengers: 125
      },
      thisWeek: {
        ticketsSold: 876,
        totalRevenue: 219000,
        passengers: 876
      },
      thisMonth: {
        ticketsSold: 3542,
        totalRevenue: 885500,
        passengers: 3542
      }
    };

    res.status(200).json({
      success: true,
      data: revenue,
      message: 'Conductor revenue retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving conductor revenue',
      error: error.message
    });
  }
});

export default router;
