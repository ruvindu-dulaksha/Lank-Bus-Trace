import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Bus from '../models/Bus.js';

// Get trips for driver
export const getDriverTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const driverId = req.user.id;

    // Build query
    const query = { driverId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDeparture = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const trips = await Trip.find(query)
      .populate('routeId', 'routeName routeNumber origin destination')
      .populate('busId', 'busNumber registrationNumber busType')
      .populate('conductorId', 'username personalInfo.firstName personalInfo.lastName')
      .sort({ scheduledDeparture: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      message: 'Driver trips retrieved successfully',
      data: trips,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Driver trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver trips',
      error: error.message
    });
  }
};

// Get trips for conductor
export const getConductorTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const conductorId = req.user.id;

    // Build query
    const query = { conductorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDeparture = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const trips = await Trip.find(query)
      .populate('routeId', 'routeName routeNumber origin destination')
      .populate('busId', 'busNumber registrationNumber busType')
      .populate('driverId', 'username personalInfo.firstName personalInfo.lastName')
      .sort({ scheduledDeparture: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      message: 'Conductor trips retrieved successfully',
      data: trips,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Conductor trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conductor trips',
      error: error.message
    });
  }
};

// Get buses for operator
export const getOperatorBuses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const operatorId = req.user.id;

    // Find buses assigned to this operator
    const user = await User.findById(operatorId).populate('operatorDetails.assignedBuses');
    
    if (!user || !user.operatorDetails) {
      return res.status(404).json({
        success: false,
        message: 'Operator details not found'
      });
    }

    let busIds = user.operatorDetails.assignedBuses.map(bus => bus._id);
    
    // Build query
    const query = { _id: { $in: busIds } };
    
    if (status) {
      query.operationalStatus = status;
    }

    const buses = await Bus.find(query)
      .populate('assignedRoutes', 'routeName routeNumber')
      .sort({ busNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bus.countDocuments(query);

    // Get recent trips for each bus
    const busesWithTrips = await Promise.all(buses.map(async (bus) => {
      const recentTrips = await Trip.find({ busId: bus._id })
        .populate('routeId', 'routeName')
        .sort({ scheduledDeparture: -1 })
        .limit(3);
      
      return {
        ...bus.toObject(),
        recentTrips
      };
    }));

    res.json({
      success: true,
      message: 'Operator buses retrieved successfully',
      data: busesWithTrips,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Operator buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving operator buses',
      error: error.message
    });
  }
};