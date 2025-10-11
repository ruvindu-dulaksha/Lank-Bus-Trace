import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import User from '../models/User.js';

// Performance Analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get performance metrics
    const totalTrips = await Trip.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const completedTrips = await Trip.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const onTimeTrips = await Trip.countDocuments({
      status: 'completed',
      delayMinutes: { $lte: 5 },
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const averageDelay = await Trip.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgDelay: { $avg: '$delayMinutes' }
        }
      }
    ]);

    const activeBuses = await Bus.countDocuments({
      operationalStatus: 'active',
      isActive: true
    });

    const totalRoutes = await Route.countDocuments({
      isActive: true
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        performance: {
          totalTrips,
          completedTrips,
          completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0,
          onTimeTrips,
          onTimePerformance: completedTrips > 0 ? ((onTimeTrips / completedTrips) * 100).toFixed(2) : 0,
          averageDelay: averageDelay[0]?.avgDelay?.toFixed(2) || 0
        },
        fleet: {
          activeBuses,
          totalRoutes,
          utilization: totalRoutes > 0 ? ((activeBuses / totalRoutes) * 100).toFixed(2) : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating performance analytics',
      error: error.message
    });
  }
};

// Usage Analytics
export const getUsageAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: startDate }
    });

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Trip usage patterns
    const tripsByStatus = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular routes
    const popularRoutes = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$routeId',
          tripCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'routes',
          localField: '_id',
          foreignField: '_id',
          as: 'route'
        }
      },
      {
        $unwind: '$route'
      },
      {
        $sort: { tripCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          routeName: '$route.routeName',
          routeNumber: '$route.routeNumber',
          tripCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          activityRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
          byRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        trips: {
          byStatus: tripsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        popularRoutes
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating usage analytics',
      error: error.message
    });
  }
};