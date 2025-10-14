import Bus from '../models/Bus.js';
import Location from '../models/Location.js';
import Trip from '../models/Trip.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import { sanitizePublicResponse, isAdminOrOperator } from '../utils/responseUtils.js';

/**
 * @desc    Get all buses
 * @route   GET /api/buses
 * @access  Public
 */
export const getAllBuses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    route,
    operator,
    busType,
    search
  } = req.query;

  // Build filter query
  const filter = {};
  
  // Handle status filtering - support both 'active' status and multiple statuses
  if (status) {
    if (status === 'active') {
      filter.operationalStatus = 'active';
    } else {
      filter.operationalStatus = status;
    }
  }
  
  if (route) filter.assignedRoutes = route;
  
  // Enhanced operator filtering - search in multiple operator fields and handle common abbreviations
  if (operator) {
    const operatorQueries = [
      { 'operatorInfo.companyName': new RegExp(operator, 'i') },
      { 'operatorInfo.operatorName': new RegExp(operator, 'i') }
    ];
    
    // Handle common abbreviations
    const operatorLower = operator.toLowerCase();
    if (operatorLower === 'sltb') {
      operatorQueries.push({ 'operatorInfo.companyName': new RegExp('Sri Lanka Transport Board', 'i') });
    } else if (operatorLower === 'ntc') {
      operatorQueries.push({ 'operatorInfo.companyName': new RegExp('National Transport Commission', 'i') });
    } else if (operatorLower === 'ept') {
      operatorQueries.push({ 'operatorInfo.companyName': new RegExp('Eastern Province Transport', 'i') });
    }
    
    filter.$or = filter.$or || [];
    filter.$or.push(...operatorQueries);
  }
  
  if (busType) filter.busType = busType;
  
  // Enhanced search functionality
  if (search) {
    const searchFilter = {
      $or: [
        { registrationNumber: new RegExp(search, 'i') },
        { busNumber: new RegExp(search, 'i') },
        { 'operatorInfo.companyName': new RegExp(search, 'i') },
        { 'operatorInfo.operatorName': new RegExp(search, 'i') }
      ]
    };
    
    if (filter.$or) {
      // If we already have an $or clause, combine them with $and
      filter.$and = [
        { $or: filter.$or },
        searchFilter
      ];
      delete filter.$or;
    } else {
      filter.$or = searchFilter.$or;
    }
  }

  const skip = (page - 1) * limit;
  const buses = await Bus.find(filter)
    .populate('assignedRoutes', 'routeNumber routeName origin destination')
    .populate('currentTrip', 'tripNumber status schedule')
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Bus.countDocuments(filter);

  // Sanitize response for public users (remove _id and __v)
  const responseData = isAdminOrOperator(req) ? buses : sanitizePublicResponse(buses);

  res.status(200).json({
    success: true,
    data: responseData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  });
});

/**
 * @desc    Get single bus
 * @route   GET /api/buses/:busNumber
 * @access  Public
 */
export const getBus = asyncHandler(async (req, res) => {
  const { busNumber } = req.params;

  // Find bus by busNumber (business identifier) instead of ObjectId
  const bus = await Bus.findOne({ busNumber: busNumber.toUpperCase() })
    .populate('assignedRoutes')
    .populate('currentTrip')
    .populate({
      path: 'currentLocation',
      model: 'Location',
      options: { sort: { timestamp: -1 }, limit: 1 }
    });

  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Sanitize response for public users (remove _id and __v)
  const responseData = isAdminOrOperator(req) ? bus : sanitizePublicResponse(bus);

  res.status(200).json({
    success: true,
    data: responseData
  });
});

/**
 * @desc    Create new bus
 * @route   POST /api/buses
 * @access  Private (Admin/Operator)
 */
export const createBus = asyncHandler(async (req, res) => {
  // Check if bus with registration number already exists
  const existingBus = await Bus.findOne({ 
    registrationNumber: req.body.registrationNumber 
  });

  if (existingBus) {
    throw new AppError('Bus with this registration number already exists', 400);
  }

  const bus = await Bus.create(req.body);

  logger.info(`Bus created: ${bus.registrationNumber} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    data: bus,
    message: 'Bus created successfully'
  });
});

/**
 * @desc    Update bus
 * @route   PUT /api/buses/:id
 * @access  Private (Admin/Operator)
 */
export const updateBus = asyncHandler(async (req, res) => {
  let bus = await Bus.findById(req.params.id);

  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Check if operator is authorized for this bus
  if (req.user.role === 'operator') {
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      busId => busId.toString() === req.params.id
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus', 403);
    }
  }

  bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  logger.info(`Bus updated: ${bus.registrationNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: bus,
    message: 'Bus updated successfully'
  });
});

/**
 * @desc    Delete bus
 * @route   DELETE /api/buses/:id
 * @access  Private (Admin only)
 */
export const deleteBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Check if bus has active trips
  const activeTrips = await Trip.find({
    busId: req.params.id,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] }
  });

  if (activeTrips.length > 0) {
    throw new AppError('Cannot delete bus with active trips', 400);
  }

  await Bus.findByIdAndDelete(req.params.id);

  logger.info(`Bus deleted: ${bus.registrationNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Bus deleted successfully'
  });
});

/**
 * @desc    Update bus location
 * @route   POST /api/buses/:id/location
 * @access  Private (Operator)
 */
export const updateBusLocation = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Check if operator is authorized for this bus
  if (req.user.role === 'operator') {
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      busId => busId.toString() === req.params.id
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  }

  const { latitude, longitude, heading, speed, accuracy } = req.body;

  // Create new location record
  const location = await Location.create({
    busId: req.params.id,
    currentLocation: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    locationMetadata: {
      accuracy,
      heading,
      speed,
      altitude: req.body.altitude || null
    },
    deviceInfo: {
      deviceId: req.body.deviceId || 'unknown',
      batteryLevel: req.body.batteryLevel || null,
      signalStrength: req.body.signalStrength || null
    }
  });

  // Update bus with latest location
  await Bus.findByIdAndUpdate(req.params.id, {
    currentLocation: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    lastUpdated: new Date()
  });

  res.status(200).json({
    success: true,
    data: location,
    message: 'Bus location updated successfully'
  });
});

/**
 * @desc    Get bus location history
 * @route   GET /api/buses/:id/location-history
 * @access  Public
 */
export const getBusLocationHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 100 } = req.query;

  const filter = { busId: req.params.id };
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const locations = await Location.find(filter)
    .sort({ timestamp: -1 })
    .limit(limit * 1);

  res.status(200).json({
    success: true,
    data: locations,
    count: locations.length
  });
});

/**
 * @desc    Get buses by route
 * @route   GET /api/buses/route/:routeId
 * @access  Public
 */
export const getBusesByRoute = asyncHandler(async (req, res) => {
  const buses = await Bus.find({
    'assignedRoutes.routeId': req.params.routeId,
    'assignedRoutes.isActive': true,
    operationalStatus: 'active'
  })
  .populate('assignedRoutes.routeId', 'routeName routeNumber')
  .populate('currentTrip', 'tripNumber status schedule')
  .sort({ busNumber: 1 });

  res.status(200).json({
    success: true,
    data: buses,
    count: buses.length
  });
});

/**
 * @desc    Get nearby buses
 * @route   GET /api/buses/nearby
 * @access  Public
 */
export const getNearbyBuses = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 5000 } = req.query;

  if (!latitude || !longitude) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  const buses = await Bus.find({
    operationalStatus: 'active',
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(radius)
      }
    }
  })
  .populate('assignedRoutes', 'routeNumber routeName')
  .populate('currentTrip', 'tripNumber status');

  res.status(200).json({
    success: true,
    data: buses,
    count: buses.length
  });
});

// Alias for getNearbyBuses for backward compatibility
export const findNearbyBuses = getNearbyBuses;

/**
 * @desc    Get real-time tracking data for a specific bus
 * @route   GET /api/buses/live-tracking/:id
 * @access  Private
 */
export const getLiveTracking = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id)
    .populate('currentTrip.tripId', 'tripNumber status route destination departureTime estimatedArrival')
    .populate('assignedRoutes.routeId', 'routeNumber routeName origin destination');

  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Get recent location history (last 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const locationHistory = await Location.find({
    busId: req.params.id,
    timestamp: { $gte: oneHourAgo }
  }).sort({ timestamp: -1 }).limit(20);

  // Calculate real-time metrics
  const isMoving = bus.currentLocation?.speed > 5;
  const lastUpdate = bus.currentLocation?.lastUpdated;
  const timeSinceLastUpdate = lastUpdate ? Date.now() - lastUpdate.getTime() : null;

  res.status(200).json({
    success: true,
    data: {
      bus: {
        id: bus._id,
        registrationNumber: bus.registrationNumber,
        busNumber: bus.busNumber,
        busType: bus.busType,
        operationalStatus: bus.operationalStatus
      },
      currentLocation: bus.currentLocation,
      currentTrip: bus.currentTrip,
      assignedRoutes: bus.assignedRoutes,
      metrics: {
        isMoving,
        lastUpdate,
        timeSinceLastUpdate,
        dataFreshness: timeSinceLastUpdate < 300000 ? 'fresh' : 'stale' // 5 minutes
      },
      locationHistory: locationHistory.map(loc => ({
        coordinates: loc.coordinates,
        timestamp: loc.timestamp,
        speed: loc.speed,
        heading: loc.heading
      }))
    }
  });
});

/**
 * @desc    Get fleet-wide status overview
 * @route   GET /api/buses/fleet-status
 * @access  Private (Admin/Operator)
 */
export const getFleetStatus = asyncHandler(async (req, res) => {
  // Get overall fleet statistics
  const [totalBuses, activeBuses, busesInMaintenance, busesWithActiveTrips] = await Promise.all([
    Bus.countDocuments({ isActive: true }),
    Bus.countDocuments({ operationalStatus: 'active', isActive: true }),
    Bus.countDocuments({ operationalStatus: 'maintenance', isActive: true }),
    Bus.countDocuments({ 'currentTrip.status': 'in-progress', isActive: true })
  ]);

  // Get buses by type
  const busByType = await Bus.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$busType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get location data freshness
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const busesWithRecentLocation = await Bus.countDocuments({
    'currentLocation.lastUpdated': { $gte: fifteenMinutesAgo },
    isActive: true
  });

  // Get province coverage
  const provinceCoverage = await Bus.aggregate([
    { $match: { isActive: true, operationalStatus: 'active' } },
    { $lookup: {
        from: 'routes',
        localField: 'assignedRoutes.routeId',
        foreignField: '_id',
        as: 'routes'
      }
    },
    { $unwind: '$routes' },
    { $unwind: '$routes.provinces' },
    { $group: { _id: '$routes.provinces', busCount: { $sum: 1 } } },
    { $sort: { busCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalBuses,
        activeBuses,
        busesInMaintenance,
        busesWithActiveTrips,
        utilizationRate: totalBuses > 0 ? Math.round((busesWithActiveTrips / totalBuses) * 100) : 0
      },
      byType: busByType,
      dataQuality: {
        busesWithRecentLocation,
        locationDataFreshness: totalBuses > 0 ? Math.round((busesWithRecentLocation / totalBuses) * 100) : 0
      },
      provinceCoverage,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @desc    Get bus coverage for a specific route
 * @route   GET /api/buses/route-coverage/:routeId
 * @access  Public
 */
export const getRouteCoverage = asyncHandler(async (req, res) => {
  const { routeId } = req.params;

  // Get route details
  const route = await Route.findById(routeId);
  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Get buses assigned to this route
  const assignedBuses = await Bus.find({
    'assignedRoutes.routeId': routeId,
    'assignedRoutes.isActive': true,
    isActive: true
  }).populate('currentTrip.tripId', 'status departureTime estimatedArrival');

  // Get active trips on this route
  const activeTrips = await Trip.find({
    routeId,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] }
  }).populate('busId', 'registrationNumber busNumber currentLocation');

  // Calculate coverage metrics
  const totalBuses = assignedBuses.length;
  const activeBuses = assignedBuses.filter(bus => bus.operationalStatus === 'active').length;
  const busesInService = assignedBuses.filter(bus => bus.currentTrip?.status === 'in-progress').length;

  // Group buses by location along the route
  const routeCoverage = assignedBuses.map(bus => {
    const location = bus.currentLocation;
    const trip = activeTrips.find(t => t.busId?._id.toString() === bus._id.toString());
    
    return {
      busId: bus._id,
      registrationNumber: bus.registrationNumber,
      busNumber: bus.busNumber,
      busType: bus.busType,
      currentLocation: location,
      currentTrip: trip ? {
        tripId: trip._id,
        status: trip.status,
        departureTime: trip.departureTime,
        estimatedArrival: trip.estimatedArrival
      } : null,
      operationalStatus: bus.operationalStatus
    };
  });

  res.status(200).json({
    success: true,
    data: {
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        origin: route.origin,
        destination: route.destination,
        distance: route.distance
      },
      coverage: {
        totalBuses,
        activeBuses,
        busesInService,
        coveragePercentage: totalBuses > 0 ? Math.round((busesInService / totalBuses) * 100) : 0
      },
      buses: routeCoverage,
      activeTrips: activeTrips.length,
      timestamp: new Date().toISOString()
    }
  });
});