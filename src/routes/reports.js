import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get trip reports
router.get('/trips', authenticate, authorize(['admin', 'operator']), async (req, res) => {
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
router.get('/revenue', authenticate, authorize(['admin', 'operator']), async (req, res) => {
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
router.get('/fleet', authenticate, authorize(['admin', 'operator']), async (req, res) => {
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
