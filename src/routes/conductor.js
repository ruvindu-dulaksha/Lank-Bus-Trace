import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/conductor/profile:
 *   get:
 *     summary: Get conductor profile information
 *     tags: [Conductor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conductor profile retrieved successfully
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
 *                     conductorId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       example: "conductor_mary"
 *                     email:
 *                       type: string
 *                       example: "mary.conductor@sltb.lk"
 *                     employmentInfo:
 *                       type: object
 *                       properties:
 *                         joinDate:
 *                           type: string
 *                           format: date
 *                           example: "2022-06-20"
 *                         employeeId:
 *                           type: string
 *                           example: "CON001"
 *                 message:
 *                   type: string
 *                   example: "Conductor profile retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticate, authorize('conductor'), async (req, res) => {
  try {
    const conductorProfile = {
      conductorId: req.user.id,
      username: req.user.username,
      email: req.user.email,
      personalInfo: req.user.personalInfo || {},
      employmentInfo: {
        joinDate: '2022-06-20',
        employeeId: 'CON001',
        status: 'active',
        department: 'Passenger Services'
      },
      statistics: {
        totalTrips: 342,
        totalTicketsSold: 12450,
        totalRevenue: 2450000,
        averagePassengersPerTrip: 36.4,
        customerRating: 4.6,
        accuracyRate: 98.7
      },
      certifications: [
        { name: 'Customer Service', issueDate: '2023-03-10', expiryDate: '2026-03-10' },
        { name: 'Ticketing Systems', issueDate: '2022-07-15', expiryDate: '2025-07-15' }
      ]
    };

    res.status(200).json({
      success: true,
      data: conductorProfile,
      message: 'Conductor profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving conductor profile',
      error: error.message
    });
  }
});

// Get conductor dashboard
router.get('/dashboard', authenticate, authorize('conductor'), async (req, res) => {
  try {
    const conductorDashboard = {
      conductorId: req.user.id,
      assignedRoutes: [
        { routeId: '1', routeName: 'Colombo - Kandy' }
      ],
      todaysTrips: [
        {
          tripId: 'TRP001',
          routeName: 'Colombo - Kandy',
          busNumber: 'B001',
          departureTime: '08:00',
          status: 'scheduled'
        }
      ],
      totalTicketsSold: 245,
      totalRevenue: 48500,
      currentTrip: {
        tripId: 'TRP002',
        routeName: 'Kandy - Colombo',
        busNumber: 'B001',
        currentPassengers: 35
      }
    };

    res.status(200).json({
      success: true,
      data: conductorDashboard,
      message: 'Conductor dashboard retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving conductor dashboard',
      error: error.message
    });
  }
});

// Sell ticket
router.post('/tickets/sell', authenticate, authorize('conductor'), async (req, res) => {
  try {
    const { tripId, from, to, passengers, fare } = req.body;

    const ticket = {
      ticketId: `TKT${Date.now()}`,
      tripId,
      from,
      to,
      passengers,
      fare,
      totalAmount: fare * passengers,
      issuedAt: new Date(),
      conductorId: req.user.id
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

// Get trip passengers
router.get('/trips/:tripId/passengers', authenticate, authorize('conductor'), async (req, res) => {
  try {
    const { tripId } = req.params;

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

export default router;
