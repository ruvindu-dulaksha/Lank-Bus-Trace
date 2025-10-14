import Location from '../models/Location.js';
import Bus from '../models/Bus.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizePublicResponse, isAdminOrOperator } from '../utils/responseUtils.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Public
 */
export const getAllLocations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    busId,
    startDate,
    endDate,
    latest
  } = req.query;

  // Build filter query
  const filter = {};
  
  if (busId) filter.busId = busId;
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  let query = Location.find(filter)
    .populate('busId', 'busNumber registrationNumber operatorInfo.companyName');

  // If latest is requested, get only the most recent location for each bus
  if (latest === 'true') {
    const latestLocations = await Location.aggregate([
      { $match: filter },
      { $sort: { busId: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$busId',
          latestLocation: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestLocation' } },
      {
        $lookup: {
          from: 'buses',
          localField: 'busId',
          foreignField: '_id',
          as: 'busId',
          pipeline: [
            { $project: { busNumber: 1, registrationNumber: 1, 'operatorInfo.companyName': 1 } }
          ]
        }
      },
      { $unwind: '$busId' }
    ]);

    return res.status(200).json({
      success: true,
      data: latestLocations,
      count: latestLocations.length
    });
  }

  const skip = (page - 1) * limit;
  const locations = await query
    .limit(limit * 1)
    .skip(skip)
    .sort({ timestamp: -1 });

  const total = await Location.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: locations,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  });
});

/**
 * @desc    Get single location
 * @route   GET /api/locations/:id
 * @access  Public
 */
export const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id)
    .populate('busId', 'busNumber registrationNumber operatorInfo');

  if (!location) {
    throw new AppError('Location record not found', 404);
  }

  res.status(200).json({
    success: true,
    data: location
  });
});

/**
 * @desc    Create location record
 * @route   POST /api/locations
 * @access  Private (Operator)
 */
export const createLocation = asyncHandler(async (req, res) => {
  const { busId, latitude, longitude } = req.body;

  // Verify bus exists
  const bus = await Bus.findById(busId);
  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Check authorization for operators and drivers
  if (req.user.role === 'operator') {
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      assignedBusId => assignedBusId.toString() === busId
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  }

  if (req.user.role === 'driver') {
    const hasAccess = req.user.driverDetails?.assignedBuses?.some(
      assignedBusId => assignedBusId.toString() === busId
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  }

  // Find existing location record or create new one
  let location = await Location.findOne({ busId });
  
  if (location) {
    // Update existing location
    location.currentLocation.coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: req.body.accuracy || 10
    };
    location.currentLocation.geoLocation = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
    location.currentLocation.speed = req.body.speed || 0;
    location.currentLocation.heading = req.body.heading || 0;
    location.currentLocation.altitude = req.body.altitude;
    location.currentLocation.lastUpdated = new Date();
    location.currentLocation.isMoving = (req.body.speed || 0) > 5;
    
    // Update device info
    if (req.body.deviceId) location.deviceInfo.deviceId = req.body.deviceId;
    if (req.body.batteryLevel) location.deviceInfo.batteryLevel = req.body.batteryLevel;
    if (req.body.signalStrength) location.deviceInfo.signalStrength = req.body.signalStrength;
    
    location.deviceInfo.lastSeen = new Date();
    location.lastHeartbeat = new Date();
    location.isOnline = true;
    
    await location.save();
  } else {
    // Create new location record
    location = await Location.create({
      busId,
      currentLocation: {
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: req.body.accuracy || 10
        },
        geoLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        speed: req.body.speed || 0,
        heading: req.body.heading || 0,
        altitude: req.body.altitude,
        lastUpdated: new Date(),
        isMoving: (req.body.speed || 0) > 5
      },
      deviceInfo: {
        deviceId: req.body.deviceId || 'unknown',
        batteryLevel: req.body.batteryLevel,
        signalStrength: req.body.signalStrength,
        lastSeen: new Date()
      },
      isOnline: true,
      lastHeartbeat: new Date()
    });
  }

  // Update bus with latest location
  await Bus.findByIdAndUpdate(busId, {
    currentLocation: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    lastUpdated: new Date()
  });

  logger.info(`Location updated for bus ${bus.busNumber} by ${req.user.username}`);

  const populatedLocation = await Location.findById(location._id)
    .populate('busId', 'busNumber registrationNumber');

  res.status(201).json({
    success: true,
    data: populatedLocation,
    message: 'Location recorded successfully'
  });
});

/**
 * @desc    Update GPS location for real-time tracking
 * @route   POST /api/locations/update-gps
 * @access  Private (Driver/Operator)
 */
export const updateGPSLocation = asyncHandler(async (req, res) => {
  const { busId, latitude, longitude, speed, heading, accuracy, altitude, deviceId } = req.body;

  // Validate required fields
  if (!busId || !latitude || !longitude) {
    throw new AppError('Bus ID, latitude, and longitude are required', 400);
  }

  // Verify bus exists
  const bus = await Bus.findById(busId);
  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  // Authorization check
  if (req.user.role === 'driver') {
    const hasAccess = req.user.driverDetails?.assignedBuses?.some(
      assignedBusId => assignedBusId.toString() === busId
    );
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  } else if (req.user.role === 'operator') {
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      assignedBusId => assignedBusId.toString() === busId
    );
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  } else if (req.user.role !== 'admin') {
    throw new AppError('Unauthorized to update GPS location', 403);
  }

  // Update or create location
  const location = await Location.findOneAndUpdate(
    { busId },
    {
      $set: {
        'currentLocation.coordinates.latitude': parseFloat(latitude),
        'currentLocation.coordinates.longitude': parseFloat(longitude),
        'currentLocation.coordinates.accuracy': accuracy || 10,
        'currentLocation.speed': speed || 0,
        'currentLocation.heading': heading || 0,
        'currentLocation.altitude': altitude,
        'currentLocation.lastUpdated': new Date(),
        'currentLocation.isMoving': (speed || 0) > 5,
        'deviceInfo.deviceId': deviceId || 'unknown',
        'deviceInfo.lastSeen': new Date(),
        'lastHeartbeat': new Date(),
        'isOnline': true
      }
    },
    { 
      new: true, 
      upsert: true,
      populate: { path: 'busId', select: 'busNumber registrationNumber' }
    }
  );

  // Update bus collection
  await Bus.findByIdAndUpdate(busId, {
    currentLocation: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    lastUpdated: new Date()
  });

  logger.info(`GPS location updated for bus ${bus.busNumber} - Lat: ${latitude}, Lng: ${longitude}`);

  res.status(200).json({
    success: true,
    data: location,
    message: 'GPS location updated successfully'
  });
});

/**
 * @desc    Bulk update GPS locations
 * @route   POST /api/locations/bulk-update
 * @access  Private (Admin/Operator)
 */
export const bulkUpdateGPSLocations = asyncHandler(async (req, res) => {
  const { locations } = req.body;

  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    throw new AppError('Locations array is required', 400);
  }

  if (locations.length > 100) {
    throw new AppError('Cannot update more than 100 locations at once', 400);
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < locations.length; i++) {
    const locationData = locations[i];
    
    try {
      const { busId, latitude, longitude, speed, heading, accuracy, altitude, deviceId } = locationData;

      if (!busId || !latitude || !longitude) {
        throw new Error(`Invalid data at index ${i}: busId, latitude, and longitude are required`);
      }

      // Verify bus exists
      const bus = await Bus.findById(busId);
      if (!bus) {
        throw new Error(`Bus not found at index ${i}: ${busId}`);
      }

      // Update location
      const location = await Location.findOneAndUpdate(
        { busId },
        {
          $set: {
            'currentLocation.coordinates.latitude': parseFloat(latitude),
            'currentLocation.coordinates.longitude': parseFloat(longitude),
            'currentLocation.coordinates.accuracy': accuracy || 10,
            'currentLocation.speed': speed || 0,
            'currentLocation.heading': heading || 0,
            'currentLocation.altitude': altitude,
            'currentLocation.lastUpdated': new Date(),
            'currentLocation.isMoving': (speed || 0) > 5,
            'deviceInfo.deviceId': deviceId || 'unknown',
            'deviceInfo.lastSeen': new Date(),
            'lastHeartbeat': new Date(),
            'isOnline': true
          }
        },
        { new: true, upsert: true }
      );

      // Update bus collection
      await Bus.findByIdAndUpdate(busId, {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        lastUpdated: new Date()
      });

      results.push({
        busId,
        success: true,
        locationId: location._id
      });

    } catch (error) {
      errors.push({
        index: i,
        busId: locationData.busId,
        error: error.message
      });
    }
  }

  logger.info(`Bulk GPS update: ${results.length} successful, ${errors.length} failed`);

  res.status(200).json({
    success: true,
    message: `Bulk update completed: ${results.length} successful, ${errors.length} failed`,
    results: {
      successful: results.length,
      failed: errors.length,
      details: results,
      errors: errors
    }
  });
});

/**
 * @desc    Get locations by bus
 * @route   GET /api/locations/bus/:busId
 * @access  Public
 */
export const getLocationsByBus = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit = 100 } = req.query;
  const filter = { busId: req.params.busId };

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
 * @desc    Get nearby buses
 * @route   GET /api/locations/nearby
 * @access  Public
 */
export const getNearbyBuses = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 5000, limit = 20 } = req.query;

  if (!latitude || !longitude) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  try {
    // Use the Bus model's findNearbyBuses method
    const nearbyBuses = await Bus.findNearbyBuses(
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseFloat(radius)
    )
    .populate('assignedRoutes.routeId', 'routeNumber routeName origin destination')
    .limit(parseInt(limit));

    // Format the response
    const formattedBuses = nearbyBuses.map(bus => {
      const baseData = {
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        busType: bus.busType,
        currentLocation: bus.currentLocation,
        distance: null, // Would need to calculate if needed
        assignedRoutes: bus.assignedRoutes,
        operationalStatus: bus.operationalStatus,
        lastUpdated: bus.lastLocationUpdate || bus.updatedAt
      };

      // Add busId based on user role
      return { ...baseData, busId: bus.busNumber }; // Always use busNumber for public endpoint
    });

    // Sanitize response for public access (remove ObjectIds from nested data)
    const responseData = isAdminOrOperator(req) ? formattedBuses : sanitizePublicResponse(formattedBuses);

    res.status(200).json({
      success: true,
      data: responseData,
      count: formattedBuses.length,
      searchParams: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius)
      },
      message: `Found ${formattedBuses.length} nearby buses`
    });

  } catch (error) {
    console.warn('Nearby buses query failed:', error.message);
    
    // Fallback: return some buses if geospatial query fails
    const fallbackBuses = await Bus.find({ operationalStatus: 'active' })
      .limit(parseInt(limit))
      .populate('assignedRoutes.routeId', 'routeNumber routeName origin destination');

    const formattedFallback = fallbackBuses.map(bus => {
      const baseData = {
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        busType: bus.busType,
        currentLocation: bus.currentLocation,
        assignedRoutes: bus.assignedRoutes,
        operationalStatus: bus.operationalStatus,
        note: 'Approximate location (geospatial query unavailable)'
      };

      // Add busId based on user role
      return { ...baseData, busId: bus.busNumber }; // Always use busNumber for public endpoint
    });

    // Sanitize response for public access (remove ObjectIds)
    const responseData = isAdminOrOperator(req) ? formattedFallback : sanitizePublicResponse(formattedFallback);

    res.status(200).json({
      success: true,
      data: responseData,
      count: formattedFallback.length,
      searchParams: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius)
      },
      fallback: true,
      message: `Returned ${formattedFallback.length} active buses (fallback mode)`
    });
  }
});

/**
 * @desc    Get location statistics
 * @route   GET /api/locations/stats
 * @access  Private (Admin)
 */
export const getLocationStats = asyncHandler(async (req, res) => {
  const { busId, startDate, endDate } = req.query;
  const filter = {};

  if (busId) filter.busId = busId;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const [totalRecords, busStats, recentActivity] = await Promise.all([
    // Total location records
    Location.countDocuments(filter),
    
    // Per-bus statistics
    Location.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$busId',
          recordCount: { $sum: 1 },
          lastUpdate: { $max: '$timestamp' },
          avgSpeed: { $avg: '$locationMetadata.speed' },
          avgAccuracy: { $avg: '$locationMetadata.accuracy' }
        }
      },
      {
        $lookup: {
          from: 'buses',
          localField: '_id',
          foreignField: '_id',
          as: 'bus',
          pipeline: [
            { $project: { busNumber: 1, registrationNumber: 1 } }
          ]
        }
      },
      { $unwind: '$bus' },
      { $sort: { recordCount: -1 } }
    ]),
    
    // Recent activity (last 24 hours)
    Location.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$timestamp'
            }
          },
          recordCount: { $sum: 1 },
          uniqueBuses: { $addToSet: '$busId' }
        }
      },
      {
        $project: {
          _id: 1,
          recordCount: 1,
          uniqueBusCount: { $size: '$uniqueBuses' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRecords,
        activeBuses: busStats.length,
        period: { startDate, endDate }
      },
      busStats,
      recentActivity
    }
  });
});

/**
 * @desc    Get real-time bus locations
 * @route   GET /api/locations/realtime
 * @access  Public
 */
export const getRealTimeLocations = asyncHandler(async (req, res) => {
  const { limit = 50, activeOnly = true } = req.query;
  
  // Get latest location for each bus
  const pipeline = [
    // Match online buses if activeOnly is true
    ...(activeOnly === 'true' ? [{ $match: { isOnline: true } }] : []),
    
    // Sort by bus and timestamp
    { $sort: { busId: 1, 'currentLocation.lastUpdated': -1 } },
    
    // Group by bus to get latest location
    {
      $group: {
        _id: '$busId',
        latestLocation: { $first: '$$ROOT' }
      }
    },
    
    // Replace root with latest location
    { $replaceRoot: { newRoot: '$latestLocation' } },
    
    // Limit results
    { $limit: parseInt(limit) },
    
    // Populate bus details
    {
      $lookup: {
        from: 'buses',
        localField: 'busId',
        foreignField: '_id',
        as: 'bus',
        pipeline: [
          {
            $project: {
              busNumber: 1,
              registrationNumber: 1,
              'operatorInfo.companyName': 1,
              busType: 1,
              capacity: 1
            }
          }
        ]
      }
    },
    { $unwind: { path: '$bus', preserveNullAndEmptyArrays: true } }
  ];
  
  const realTimeLocations = await Location.aggregate(pipeline);
  
  // Sanitize response for public access (remove ObjectIds from bus data)
  const responseData = isAdminOrOperator(req) ? realTimeLocations : sanitizePublicResponse(realTimeLocations);

  res.status(200).json({
    success: true,
    data: responseData,
    count: realTimeLocations.length,
    message: 'Real-time locations retrieved successfully'
  });
});

/**
 * @desc    Get location analytics
 * @route   GET /api/locations/analytics
 * @access  Private (Admin/Operator)
 */
export const getLocationAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '24h' } = req.query;
  
  // Calculate time filter
  let timeFilter = new Date();
  switch (timeRange) {
    case '1h':
      timeFilter.setHours(timeFilter.getHours() - 1);
      break;
    case '24h':
      timeFilter.setDate(timeFilter.getDate() - 1);
      break;
    case '7d':
      timeFilter.setDate(timeFilter.getDate() - 7);
      break;
    case '30d':
      timeFilter.setDate(timeFilter.getDate() - 30);
      break;
    default:
      timeFilter.setDate(timeFilter.getDate() - 1);
  }
  
  const analytics = await Promise.all([
    // Total active buses
    Location.countDocuments({ isOnline: true }),
    
    // Buses by connection status
    Location.aggregate([
      {
        $group: {
          _id: '$isOnline',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Recent activity
    Location.aggregate([
      {
        $match: {
          'currentLocation.lastUpdated': { $gte: timeFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$currentLocation.lastUpdated'
            }
          },
          locationUpdates: { $sum: 1 },
          uniqueBuses: { $addToSet: '$busId' }
        }
      },
      {
        $project: {
          _id: 1,
          locationUpdates: 1,
          uniqueBusCount: { $size: '$uniqueBuses' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    
    // Speed statistics
    Location.aggregate([
      { $match: { isOnline: true } },
      {
        $group: {
          _id: null,
          avgSpeed: { $avg: '$currentLocation.speed' },
          maxSpeed: { $max: '$currentLocation.speed' },
          movingBuses: {
            $sum: {
              $cond: [{ $gt: ['$currentLocation.speed', 5] }, 1, 0]
            }
          },
          stoppedBuses: {
            $sum: {
              $cond: [{ $lte: ['$currentLocation.speed', 5] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalActiveBuses: analytics[0],
        timeRange,
        generatedAt: new Date()
      },
      connectionStatus: analytics[1],
      activityTrend: analytics[2],
      speedStats: analytics[3][0] || { avgSpeed: 0, maxSpeed: 0, movingBuses: 0, stoppedBuses: 0 }
    },
    message: 'Location analytics retrieved successfully'
  });
});

/**
 * @desc    Get location heatmap data
 * @route   GET /api/locations/heatmap
 * @access  Public
 */
export const getLocationHeatmap = asyncHandler(async (req, res) => {
  const { 
    bounds,
    timeRange = '24h',
    busType,
    limit = 1000
  } = req.query;
  
  // Parse bounds if provided (format: "latitude1,longitude1,latitude2,longitude2")
  let geoFilter = {};
  if (bounds) {
    const [lat1, lng1, lat2, lng2] = bounds.split(',').map(parseFloat);
    geoFilter = {
      'currentLocation.coordinates.latitude': { $gte: Math.min(lat1, lat2), $lte: Math.max(lat1, lat2) },
      'currentLocation.coordinates.longitude': { $gte: Math.min(lng1, lng2), $lte: Math.max(lng1, lng2) }
    };
  }
  
  // Time filter
  let timeFilter = {};
  if (timeRange !== 'all') {
    const timeAgo = new Date();
    switch (timeRange) {
      case '1h':
        timeAgo.setHours(timeAgo.getHours() - 1);
        break;
      case '24h':
        timeAgo.setDate(timeAgo.getDate() - 1);
        break;
      case '7d':
        timeAgo.setDate(timeAgo.getDate() - 7);
        break;
    }
    timeFilter = { 'currentLocation.lastUpdated': { $gte: timeAgo } };
  }
  
  const pipeline = [
    { $match: { ...geoFilter, ...timeFilter, isOnline: true } },
    
    // Populate bus info for filtering
    {
      $lookup: {
        from: 'buses',
        localField: 'busId',
        foreignField: '_id',
        as: 'bus'
      }
    },
    { $unwind: { path: '$bus', preserveNullAndEmptyArrays: true } },
    
    // Filter by bus type if specified
    ...(busType ? [{ $match: { 'bus.busType': busType } }] : []),
    
    // Project only needed fields
    {
      $project: {
        latitude: '$currentLocation.coordinates.latitude',
        longitude: '$currentLocation.coordinates.longitude',
        speed: '$currentLocation.speed',
        busNumber: '$bus.busNumber',
        busType: '$bus.busType',
        lastUpdated: '$currentLocation.lastUpdated'
      }
    },
    
    { $limit: parseInt(limit) }
  ];
  
  const heatmapData = await Location.aggregate(pipeline);
  
  res.status(200).json({
    success: true,
    data: heatmapData,
    count: heatmapData.length,
    filters: { bounds, timeRange, busType },
    message: 'Heatmap data retrieved successfully'
  });
});

/**
 * @desc    Delete old location records
 * @route   DELETE /api/locations/cleanup
 * @access  Private (Admin only)
 */
export const cleanupOldLocations = asyncHandler(async (req, res) => {
  const { daysOld = 30 } = req.query;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

  const result = await Location.deleteMany({
    'currentLocation.lastUpdated': { $lt: cutoffDate }
  });

  logger.info(`Cleaned up ${result.deletedCount} old location records by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} location records older than ${daysOld} days`,
    deletedCount: result.deletedCount
  });
});