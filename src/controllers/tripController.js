import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all trips
 * @route   GET /api/trips
 * @access  Public
 */
export const getAllTrips = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    routeId,
    busId,
    date,
    upcoming
  } = req.query;

  // Build filter query
  const filter = {};
  
  // Enhanced status filtering - handle both specific statuses and 'active' query
  if (status) {
    if (status === 'active') {
      // When querying for 'active' trips, return scheduled, boarding, and in-transit trips
      filter.status = { $in: ['scheduled', 'boarding', 'in-transit', 'departed'] };
    } else {
      // For specific status queries, use exact match
      filter.status = status;
    }
  }
  
  if (routeId) filter.routeId = routeId;
  if (busId) filter.busId = busId;
  
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    filter['schedule.departureTime'] = {
      $gte: startDate,
      $lt: endDate
    };
  }
  
  if (upcoming === 'true') {
    filter['schedule.departureTime'] = { $gte: new Date() };
    filter.status = { $in: ['scheduled', 'boarding'] };
  }

  const skip = (page - 1) * limit;
  const trips = await Trip.find(filter)
    .populate('routeId', 'routeNumber routeName origin destination')
    .populate('busId', 'busNumber registrationNumber')
    .populate('driverId', 'username profile.firstName profile.lastName')
    .limit(limit * 1)
    .skip(skip)
    .sort({ 'schedule.departureTime': 1 });

  const total = await Trip.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: trips,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  });
});

/**
 * @desc    Get single trip
 * @route   GET /api/trips/:id
 * @access  Public
 */
export const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('routeId')
    .populate('busId')
    .populate('driverId', 'username profile.firstName profile.lastName');

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  res.status(200).json({
    success: true,
    data: trip
  });
});

/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private (Admin/Operator)
 */
export const createTrip = asyncHandler(async (req, res) => {
  const { routeId, busId, driverId, schedule } = req.body;

  // Verify route exists
  const route = await Route.findById(routeId);
  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Verify bus exists and is available
  const bus = await Bus.findById(busId);
  if (!bus) {
    throw new AppError('Bus not found', 404);
  }

  if (bus.operationalStatus !== 'active') {
    throw new AppError('Bus is not available for trips', 400);
  }

  // Check for conflicting trips
  const conflictingTrip = await Trip.findOne({
    busId,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] },
    $or: [
      {
        'schedule.departureTime': {
          $lte: new Date(schedule.arrivalTime),
          $gte: new Date(schedule.departureTime)
        }
      },
      {
        'schedule.arrivalTime': {
          $lte: new Date(schedule.arrivalTime),
          $gte: new Date(schedule.departureTime)
        }
      }
    ]
  });

  if (conflictingTrip) {
    throw new AppError('Bus is already scheduled for another trip during this time', 400);
  }

  // Generate trip number
  const tripCount = await Trip.countDocuments();
  const tripNumber = `T${String(tripCount + 1).padStart(6, '0')}`;

  const trip = await Trip.create({
    tripNumber,
    ...req.body
  });

  // Update bus with current trip
  await Bus.findByIdAndUpdate(busId, { currentTrip: trip._id });

  logger.info(`Trip created: ${tripNumber} by ${req.user.username}`);

  const populatedTrip = await Trip.findById(trip._id)
    .populate('routeId', 'routeNumber routeName')
    .populate('busId', 'busNumber registrationNumber');

  res.status(201).json({
    success: true,
    data: populatedTrip,
    message: 'Trip created successfully'
  });
});

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private (Admin/Operator)
 */
export const updateTrip = asyncHandler(async (req, res) => {
  let trip = await Trip.findById(req.params.id);

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Check authorization for operators
  if (req.user.role === 'operator') {
    const bus = await Bus.findById(trip.busId);
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      busId => busId.toString() === trip.busId.toString()
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this trip', 403);
    }
  }

  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  .populate('routeId', 'routeNumber routeName')
  .populate('busId', 'busNumber registrationNumber');

  logger.info(`Trip updated: ${trip.tripNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: trip,
    message: 'Trip updated successfully'
  });
});

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private (Admin only)
 */
export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status === 'in_progress') {
    throw new AppError('Cannot delete trip that is in progress', 400);
  }

  // Remove trip reference from bus
  if (trip.busId) {
    await Bus.findByIdAndUpdate(trip.busId, { $unset: { currentTrip: 1 } });
  }

  await Trip.findByIdAndDelete(req.params.id);

  logger.info(`Trip deleted: ${trip.tripNumber} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

/**
 * @desc    Update trip status
 * @route   PATCH /api/trips/:id/status
 * @access  Private (Operator)
 */
export const updateTripStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['scheduled', 'boarding', 'departed', 'in-transit', 'arrived', 'completed', 'cancelled', 'delayed'];

  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid trip status', 400);
  }

  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Check authorization for operators
  if (req.user.role === 'operator') {
    const bus = await Bus.findById(trip.busId);
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      busId => busId.toString() === trip.busId.toString()
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this trip', 403);
    }
  }

  // Update trip status with timestamp
  const updateData = { status };
  
  if (status === 'in_progress') {
    updateData['schedule.actualDepartureTime'] = new Date();
  } else if (status === 'completed') {
    updateData['schedule.actualArrivalTime'] = new Date();
  }

  const updatedTrip = await Trip.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
  .populate('routeId', 'routeNumber routeName')
  .populate('busId', 'busNumber registrationNumber');

  // Clear current trip from bus if completed or cancelled
  if (['completed', 'cancelled'].includes(status)) {
    await Bus.findByIdAndUpdate(trip.busId, { $unset: { currentTrip: 1 } });
  }

  logger.info(`Trip status updated: ${trip.tripNumber} to ${status} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: updatedTrip,
    message: `Trip status updated to ${status}`
  });
});

/**
 * @desc    Add trip delay
 * @route   POST /api/trips/:id/delay
 * @access  Private (Operator)
 */
export const addTripDelay = asyncHandler(async (req, res) => {
  const { reason, estimatedDelay } = req.body;

  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Check authorization for operators
  if (req.user.role === 'operator') {
    const bus = await Bus.findById(trip.busId);
    const hasAccess = req.user.operatorDetails?.assignedBuses?.some(
      busId => busId.toString() === trip.busId.toString()
    );
    
    if (!hasAccess) {
      throw new AppError('You are not authorized to update this trip', 403);
    }
  }

  trip.delays.push({
    reason,
    estimatedDelay,
    reportedAt: new Date(),
    reportedBy: req.user._id
  });

  // Update trip status to delayed
  trip.status = 'delayed';

  await trip.save();

  logger.info(`Delay added to trip: ${trip.tripNumber} - ${reason} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: trip,
    message: 'Trip delay recorded successfully'
  });
});

/**
 * @desc    Get trips by route
 * @route   GET /api/trips/route/:routeId
 * @access  Public
 */
export const getTripsByRoute = asyncHandler(async (req, res) => {
  const { date, upcoming } = req.query;
  const filter = { routeId: req.params.routeId };

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    filter['schedule.departureTime'] = {
      $gte: startDate,
      $lt: endDate
    };
  }

  if (upcoming === 'true') {
    filter['schedule.departureTime'] = { $gte: new Date() };
    filter.status = { $in: ['scheduled', 'boarding'] };
  }

  const trips = await Trip.find(filter)
    .populate('busId', 'busNumber registrationNumber capacity')
    .populate('routeId', 'routeNumber routeName')
    .sort({ 'schedule.departureTime': 1 });

  res.status(200).json({
    success: true,
    data: trips,
    count: trips.length
  });
});

/**
 * @desc    Get trip statistics
 * @route   GET /api/trips/stats
 * @access  Private (Admin)
 */
export const getTripStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = {};

  if (startDate || endDate) {
    dateFilter['schedule.departureTime'] = {};
    if (startDate) dateFilter['schedule.departureTime'].$gte = new Date(startDate);
    if (endDate) dateFilter['schedule.departureTime'].$lte = new Date(endDate);
  }

  const [statusStats, revenueStats, routeStats] = await Promise.all([
    // Trip status statistics
    Trip.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Revenue statistics
    Trip.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          status: 'completed' 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalRevenue' },
          totalPassengers: { $sum: '$passengerInfo.totalPassengers' },
          averageRevenue: { $avg: '$pricing.totalRevenue' }
        }
      }
    ]),
    
    // Route performance
    Trip.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$routeId',
          tripCount: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalRevenue' },
          totalPassengers: { $sum: '$passengerInfo.totalPassengers' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'routes',
          localField: '_id',
          foreignField: '_id',
          as: 'route'
        }
      },
      { $unwind: '$route' }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      statusStats,
      revenueStats: revenueStats[0] || {
        totalRevenue: 0,
        totalPassengers: 0,
        averageRevenue: 0
      },
      topRoutes: routeStats,
      period: { startDate, endDate }
    }
  });
});