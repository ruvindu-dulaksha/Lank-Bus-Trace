import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get conductor dashboard
router.get('/dashboard', authenticate, authorize(['conductor']), async (req, res) => {
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
router.post('/tickets/sell', authenticate, authorize(['conductor']), async (req, res) => {
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
router.get('/trips/:tripId/passengers', authenticate, authorize(['conductor']), async (req, res) => {
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
