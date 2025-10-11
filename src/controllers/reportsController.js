import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';

// Trip Reports
export const getTripReports = async (req, res) => {
  try {
    const { 
      period = '30d',
      status,
      routeId,
      busId,
      page = 1,
      limit = 50
    } = req.query;
    
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

    // Build query
    const query = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (status) query.status = status;
    if (routeId) query.routeId = routeId;
    if (busId) query.busId = busId;

    // Get trips with pagination
    const trips = await Trip.find(query)
      .populate('routeId', 'routeName routeNumber origin destination')
      .populate('busId', 'busNumber registrationNumber busType')
      .populate('driverId', 'username personalInfo.firstName personalInfo.lastName')
      .populate('conductorId', 'username personalInfo.firstName personalInfo.lastName')
      .sort({ scheduledDeparture: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalTrips = await Trip.countDocuments(query);

    // Summary statistics
    const summary = await Trip.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          delayedTrips: {
            $sum: { $cond: [{ $gt: ['$delayMinutes', 5] }, 1, 0] }
          },
          totalPassengers: { $sum: '$passengerCount' },
          averageDelay: { $avg: '$delayMinutes' },
          totalRevenue: { $sum: '$totalFare' }
        }
      }
    ]);

    const tripReports = trips.map(trip => ({
      id: trip._id,
      tripNumber: trip.tripNumber,
      route: {
        name: trip.routeId?.routeName,
        number: trip.routeId?.routeNumber,
        origin: trip.routeId?.origin,
        destination: trip.routeId?.destination
      },
      bus: {
        number: trip.busId?.busNumber,
        registration: trip.busId?.registrationNumber,
        type: trip.busId?.busType
      },
      schedule: {
        departure: trip.scheduledDeparture,
        arrival: trip.scheduledArrival,
        actualDeparture: trip.actualDeparture,
        actualArrival: trip.actualArrival
      },
      crew: {
        driver: trip.driverId ? {
          name: `${trip.driverId.personalInfo?.firstName || ''} ${trip.driverId.personalInfo?.lastName || ''}`.trim(),
          username: trip.driverId.username
        } : null,
        conductor: trip.conductorId ? {
          name: `${trip.conductorId.personalInfo?.firstName || ''} ${trip.conductorId.personalInfo?.lastName || ''}`.trim(),
          username: trip.conductorId.username
        } : null
      },
      status: trip.status,
      passengers: trip.passengerCount || 0,
      fare: trip.totalFare || 0,
      delay: trip.delayMinutes || 0,
      createdAt: trip.createdAt
    }));

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalTrips: 0,
          completedTrips: 0,
          cancelledTrips: 0,
          delayedTrips: 0,
          totalPassengers: 0,
          averageDelay: 0,
          totalRevenue: 0
        },
        trips: tripReports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTrips / parseInt(limit)),
          totalItems: totalTrips,
          itemsPerPage: parseInt(limit)
        },
        filters: {
          period,
          status,
          routeId,
          busId,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trip reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating trip reports',
      error: error.message
    });
  }
};

// Revenue Reports
export const getRevenueReports = async (req, res) => {
  try {
    const { 
      period = '30d',
      routeId,
      busId,
      operatorId
    } = req.query;
    
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

    // Build match query
    const matchQuery = {
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (routeId) matchQuery.routeId = routeId;
    if (busId) matchQuery.busId = busId;

    // Revenue aggregation
    const revenueData = await Trip.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalFare' },
          totalTrips: { $sum: 1 },
          totalPassengers: { $sum: '$passengerCount' },
          averageFarePerTrip: { $avg: '$totalFare' },
          averagePassengersPerTrip: { $avg: '$passengerCount' }
        }
      }
    ]);

    // Revenue by route
    const revenueByRoute = await Trip.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$routeId',
          revenue: { $sum: '$totalFare' },
          trips: { $sum: 1 },
          passengers: { $sum: '$passengerCount' }
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
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          routeName: '$route.routeName',
          routeNumber: '$route.routeNumber',
          revenue: 1,
          trips: 1,
          passengers: 1,
          averageFarePerTrip: { $divide: ['$revenue', '$trips'] }
        }
      }
    ]);

    // Revenue by bus type
    const revenueByBusType = await Trip.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'buses',
          localField: 'busId',
          foreignField: '_id',
          as: 'bus'
        }
      },
      {
        $unwind: '$bus'
      },
      {
        $group: {
          _id: '$bus.busType',
          revenue: { $sum: '$totalFare' },
          trips: { $sum: 1 },
          passengers: { $sum: '$passengerCount' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Daily revenue trend
    const dailyRevenue = await Trip.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalFare' },
          trips: { $sum: 1 },
          passengers: { $sum: '$passengerCount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          revenue: 1,
          trips: 1,
          passengers: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: revenueData[0] || {
          totalRevenue: 0,
          totalTrips: 0,
          totalPassengers: 0,
          averageFarePerTrip: 0,
          averagePassengersPerTrip: 0
        },
        breakdown: {
          byRoute: revenueByRoute,
          byBusType: revenueByBusType,
          dailyTrend: dailyRevenue
        },
        filters: {
          period,
          routeId,
          busId,
          operatorId,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating revenue reports',
      error: error.message
    });
  }
};