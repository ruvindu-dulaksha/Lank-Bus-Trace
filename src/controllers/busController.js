import Bus from '../models/Bus.js';
import Location from '../models/Location.js';
import Trip from '../models/Trip.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

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
  
  if (status) filter.operationalStatus = status;
  if (route) filter.assignedRoutes = route;
  if (operator) filter['operatorInfo.companyName'] = new RegExp(operator, 'i');
  if (busType) filter.busType = busType;
  if (search) {
    filter.$or = [
      { registrationNumber: new RegExp(search, 'i') },
      { busNumber: new RegExp(search, 'i') },
      { 'operatorInfo.companyName': new RegExp(search, 'i') }
    ];
  }

  const skip = (page - 1) * limit;
  const buses = await Bus.find(filter)
    .populate('assignedRoutes', 'routeNumber routeName origin destination')
    .populate('currentTrip', 'tripNumber status schedule')
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Bus.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: buses,
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
 * @route   GET /api/buses/:id
 * @access  Public
 */
export const getBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id)
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

  res.status(200).json({
    success: true,
    data: bus
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