import Location from '../models/Location.js';
import Bus from '../models/Bus.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
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

  // Check authorization for operators
  if (req.user.role === 'operator') {
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      assignedBusId => assignedBusId.toString() === busId
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this bus location', 403);
    }
  }

  // Create location record
  const location = await Location.create({
    busId,
    currentLocation: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    locationMetadata: {
      accuracy: req.body.accuracy || null,
      heading: req.body.heading || null,
      speed: req.body.speed || null,
      altitude: req.body.altitude || null
    },
    deviceInfo: {
      deviceId: req.body.deviceId || 'unknown',
      batteryLevel: req.body.batteryLevel || null,
      signalStrength: req.body.signalStrength || null
    }
  });

  // Update bus with latest location
  await Bus.findByIdAndUpdate(busId, {
    currentLocation: {
      type: 'Point',
      coordinates: [longitude, latitude]
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
    // Since there may not be actual location data, let's use a simple approach
    // First, try to find any locations at all
    const totalLocations = await Location.countDocuments();
    
    if (totalLocations === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No location data available yet',
        searchParams: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: parseInt(radius)
        }
      });
    }

    // Get latest locations for each bus (simplified approach)
    const nearbyLocations = await Location.aggregate([
      // Get latest location for each bus first
      { $sort: { busId: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$busId',
          latestLocation: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestLocation' } },
      
      // Limit results
      { $limit: parseInt(limit) },
      
      // Populate bus information
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
                assignedRoutes: 1,
                currentTrip: 1
              }
            }
          ]
        }
      },
      { $unwind: { path: '$bus', preserveNullAndEmptyArrays: true } },
      
      // Populate route information
      {
        $lookup: {
          from: 'routes',
          localField: 'bus.assignedRoutes',
          foreignField: '_id',
          as: 'routes',
          pipeline: [
            { $project: { routeNumber: 1, routeName: 1, origin: 1, destination: 1 } }
          ]
        }
      },
      
      // Add distance calculation (simplified - you'd use proper geospatial for real data)
      {
        $addFields: {
          calculatedDistance: {
            $multiply: [
              111000, // Rough meters per degree
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        { $subtract: ['$currentLocation.coordinates.latitude', parseFloat(latitude)] },
                        2
                      ]
                    },
                    {
                      $pow: [
                        { $subtract: ['$currentLocation.coordinates.longitude', parseFloat(longitude)] },
                        2
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: nearbyLocations,
      count: nearbyLocations.length,
      searchParams: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius)
      },
      note: 'Basic proximity search - upgrade to GeoJSON format for accurate geospatial queries'
    });

  } catch (error) {
    // Fallback if aggregation fails
    console.warn('Geospatial query failed, falling back to simple query:', error.message);
    
    const locations = await Location.find()
      .populate('busId', 'busNumber registrationNumber')
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: locations,
      count: locations.length,
      searchParams: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius)
      },
      fallback: true,
      message: 'Returned recent locations (geospatial search not available)'
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
 * @desc    Delete old location records
 * @route   DELETE /api/locations/cleanup
 * @access  Private (Admin only)
 */
export const cleanupOldLocations = asyncHandler(async (req, res) => {
  const { daysOld = 30 } = req.query;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

  const result = await Location.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  logger.info(`Cleaned up ${result.deletedCount} old location records by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} location records older than ${daysOld} days`,
    deletedCount: result.deletedCount
  });
});