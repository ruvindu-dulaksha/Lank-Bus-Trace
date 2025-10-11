import User from '../models/User.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import Trip from '../models/Trip.js';

// Dashboard overview data
export const getDashboardOverview = async (req, res) => {
  try {
    // Get current statistics
    const stats = await Promise.all([
      User.countDocuments({ isActive: true }),
      Bus.countDocuments({ operationalStatus: 'active' }),
      Route.countDocuments({ isActive: true }),
      Trip.countDocuments({ 
        scheduledDeparture: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        } 
      })
    ]);

    // Get trip status breakdown for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tripStatuses = await Trip.aggregate([
      {
        $match: {
          scheduledDeparture: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities (last 10 trips)
    const recentTrips = await Trip.find()
      .populate('routeId', 'routeName routeNumber')
      .populate('busId', 'busNumber registrationNumber')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('status scheduledDeparture routeId busId createdAt');

    // Calculate revenue for current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Trip.aggregate([
      {
        $match: {
          scheduledDeparture: { $gte: startOfMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalTrips: { $sum: 1 }
        }
      }
    ]);

    const dashboardData = {
      overview: {
        totalUsers: stats[0],
        activeBuses: stats[1],
        activeRoutes: stats[2],
        todayTrips: stats[3]
      },
      tripStatuses: tripStatuses.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {}),
      monthlyStats: {
        revenue: monthlyRevenue[0]?.totalRevenue || 0,
        completedTrips: monthlyRevenue[0]?.totalTrips || 0
      },
      recentActivity: recentTrips.map(trip => ({
        id: trip._id,
        route: trip.routeId?.routeName || 'Unknown Route',
        bus: trip.busId?.busNumber || 'Unknown Bus',
        status: trip.status,
        departure: trip.scheduledDeparture,
        createdAt: trip.createdAt
      }))
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data',
      error: error.message
    });
  }
};

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get trip statistics
    const tripStats = await Trip.aggregate([
      {
        $match: {
          scheduledDeparture: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDeparture" } },
            status: "$status"
          },
          count: { $sum: 1 },
          revenue: { $sum: "$revenue" },
          passengers: { $sum: "$passengerCount" }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              revenue: "$revenue",
              passengers: "$passengers"
            }
          },
          totalTrips: { $sum: "$count" },
          totalRevenue: { $sum: "$revenue" },
          totalPassengers: { $sum: "$passengers" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get bus utilization stats
    const busUtilization = await Bus.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'busId',
          as: 'trips'
        }
      },
      {
        $project: {
          busNumber: 1,
          registrationNumber: 1,
          operationalStatus: 1,
          tripCount: { $size: '$trips' },
          utilization: {
            $cond: {
              if: { $gt: [{ $size: '$trips' }, 0] },
              then: { $multiply: [{ $divide: [{ $size: '$trips' }, 30] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $sort: { utilization: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get route performance
    const routePerformance = await Route.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'routeId',
          as: 'trips'
        }
      },
      {
        $project: {
          routeName: 1,
          routeNumber: 1,
          tripCount: { $size: '$trips' },
          avgRevenue: { $avg: '$trips.revenue' },
          avgPassengers: { $avg: '$trips.passengerCount' },
          avgDelay: { $avg: '$trips.delayMinutes' }
        }
      },
      {
        $sort: { tripCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        tripStatistics: tripStats,
        busUtilization,
        routePerformance,
        summary: {
          totalTrips: tripStats.reduce((sum, day) => sum + day.totalTrips, 0),
          totalRevenue: tripStats.reduce((sum, day) => sum + day.totalRevenue, 0),
          totalPassengers: tripStats.reduce((sum, day) => sum + day.totalPassengers, 0),
          avgDailyTrips: tripStats.length > 0 ? tripStats.reduce((sum, day) => sum + day.totalTrips, 0) / tripStats.length : 0
        }
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics',
      error: error.message
    });
  }
};