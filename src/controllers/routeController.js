import Route from '../models/Route.js';
import Bus from '../models/Bus.js';
import Trip from '../models/Trip.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all routes
 * @route   GET /api/routes
 * @access  Public
 */
export const getAllRoutes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    origin,
    destination,
    province,
    status,
    search
  } = req.query;

  // Build filter query
  const filter = {};
  
  if (origin) filter.origin = new RegExp(origin, 'i');
  if (destination) filter.destination = new RegExp(destination, 'i');
  if (province) filter.provinces = { $in: [province] };
  if (status) filter.isActive = status === 'active';
  if (search) {
    filter.$or = [
      { routeNumber: new RegExp(search, 'i') },
      { routeName: new RegExp(search, 'i') },
      { origin: new RegExp(search, 'i') },
      { destination: new RegExp(search, 'i') }
    ];
  }

  const skip = (page - 1) * limit;
  const routes = await Route.find(filter)
    .limit(limit * 1)
    .skip(skip)
    .sort({ routeNumber: 1 });

  const total = await Route.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: routes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  });
});

/**
 * @desc    Get single route
 * @route   GET /api/routes/:id
 * @access  Public
 */
export const getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Get assigned buses for this route
  const assignedBuses = await Bus.find({
    assignedRoutes: req.params.id,
    operationalStatus: 'active'
  }).select('busNumber registrationNumber currentLocation');

  // Get active trips for this route
  const activeTrips = await Trip.find({
    routeId: req.params.id,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] }
  })
  .populate('busId', 'busNumber registrationNumber')
  .sort({ 'schedule.departureTime': 1 });

  res.status(200).json({
    success: true,
    data: {
      route,
      assignedBuses,
      activeTrips,
      stats: {
        totalBuses: assignedBuses.length,
        activeTrips: activeTrips.length
      }
    }
  });
});

/**
 * @desc    Create new route
 * @route   POST /api/routes
 * @access  Private (Admin only)
 */
export const createRoute = asyncHandler(async (req, res) => {
  // Check if route number already exists
  const existingRoute = await Route.findOne({ 
    routeNumber: req.body.routeNumber 
  });

  if (existingRoute) {
    throw new AppError('Route number already exists', 400);
  }

  const route = await Route.create(req.body);

  logger.info(`Route created: ${route.routeNumber} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    data: route,
    message: 'Route created successfully'
  });
});

/**
 * @desc    Update route
 * @route   PUT /api/routes/:id
 * @access  Private (Admin only)
 */
export const updateRoute = asyncHandler(async (req, res) => {
  let route = await Route.findById(req.params.id);

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  route = await Route.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  logger.info(`Route updated: ${route.routeNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: route,
    message: 'Route updated successfully'
  });
});

/**
 * @desc    Delete route
 * @route   DELETE /api/routes/:id
 * @access  Private (Admin only)
 */
export const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Check if route has assigned buses
  const assignedBuses = await Bus.find({
    assignedRoutes: req.params.id
  });

  if (assignedBuses.length > 0) {
    throw new AppError('Cannot delete route with assigned buses', 400);
  }

  // Check if route has active trips
  const activeTrips = await Trip.find({
    routeId: req.params.id,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] }
  });

  if (activeTrips.length > 0) {
    throw new AppError('Cannot delete route with active trips', 400);
  }

  await Route.findByIdAndDelete(req.params.id);

  logger.info(`Route deleted: ${route.routeNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Route deleted successfully'
  });
});

/**
 * @desc    Search routes
 * @route   GET /api/routes/search
 * @access  Public
 */
export const searchRoutes = asyncHandler(async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to) {
    throw new AppError('Origin (from) and destination (to) are required', 400);
  }

  // Find routes that match origin and destination
  const routes = await Route.findRoutesBetween(from, to);

  if (date) {
    // Get trips for specific date
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const routeIds = routes.map(route => route._id);
    
    const trips = await Trip.find({
      routeId: { $in: routeIds },
      'schedule.departureTime': {
        $gte: startDate,
        $lt: endDate
      },
      status: { $in: ['scheduled', 'boarding'] }
    })
    .populate('busId', 'busNumber registrationNumber capacity')
    .populate('routeId', 'routeNumber routeName fareStructure')
    .sort({ 'schedule.departureTime': 1 });

    res.status(200).json({
      success: true,
      data: {
        routes,
        trips,
        searchParams: { from, to, date }
      }
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        routes,
        searchParams: { from, to }
      }
    });
  }
});

/**
 * @desc    Get route stops
 * @route   GET /api/routes/:id/stops
 * @access  Public
 */
export const getRouteStops = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id).select('stops routeNumber routeName');

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      routeId: route._id,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      stops: route.stops
    }
  });
});

/**
 * @desc    Get routes by province
 * @route   GET /api/routes/province/:province
 * @access  Public
 */
export const getRoutesByProvince = asyncHandler(async (req, res) => {
  const { province } = req.params;
  const { limit = 50 } = req.query;

  const routes = await Route.find({
    provinces: { $in: [province] },
    isActive: true
  })
  .limit(limit * 1)
  .sort({ routeNumber: 1 });

  res.status(200).json({
    success: true,
    data: routes,
    count: routes.length
  });
});

/**
 * @desc    Get route statistics
 * @route   GET /api/routes/:id/stats
 * @access  Public
 */
export const getRouteStats = asyncHandler(async (req, res) => {
  const routeId = req.params.id;

  // Get basic route info
  const route = await Route.findById(routeId);
  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Get assigned buses count
  const busCount = await Bus.countDocuments({
    assignedRoutes: routeId,
    operationalStatus: 'active'
  });

  // Get trip statistics for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tripStats = await Trip.aggregate([
    {
      $match: {
        routeId: routeId,
        'schedule.departureTime': { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate total passengers for last 30 days
  const passengerStats = await Trip.aggregate([
    {
      $match: {
        routeId: routeId,
        'schedule.departureTime': { $gte: thirtyDaysAgo },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalPassengers: { $sum: '$passengerInfo.totalPassengers' },
        totalRevenue: { $sum: '$pricing.totalRevenue' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName
      },
      stats: {
        activeBuses: busCount,
        tripStats,
        passengerStats: passengerStats[0] || { totalPassengers: 0, totalRevenue: 0 },
        period: '30 days'
      }
    }
  });
});