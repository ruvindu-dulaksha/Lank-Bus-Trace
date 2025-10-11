import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get driver dashboard
router.get('/dashboard', authenticate, authorize(['driver']), async (req, res) => {
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
router.get('/trips', authenticate, authorize(['driver']), async (req, res) => {
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
router.post('/trips/:tripId/start', authenticate, authorize(['driver']), async (req, res) => {
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
router.post('/trips/:tripId/complete', authenticate, authorize(['driver']), async (req, res) => {
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
