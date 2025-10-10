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
    .lean() // Use lean queries to bypass Mongoose transformations
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
  const route = await Route.findById(req.params.id).lean();

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Get assigned buses for this route
  const assignedBuses = await Bus.find({
    'assignedRoutes.routeId': req.params.id,
    'assignedRoutes.isActive': true,
    operationalStatus: 'active'
  }).select('busNumber registrationNumber currentLocation').lean();

  // Get active trips for this route
  const activeTrips = await Trip.find({
    routeId: req.params.id,
    status: { $in: ['scheduled', 'in_progress', 'boarding'] }
  })
  .populate('busId', 'busNumber registrationNumber')
  .sort({ 'schedule.departureTime': 1 })
  .lean();

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
 * @desc    Advanced route search with pricing
 * @route   GET /api/routes/search
 * @access  Public
 */
export const searchRoutes = asyncHandler(async (req, res) => {
  // Extract search parameters from query string
  const { 
    origin, 
    destination, 
    from, 
    to, 
    date, 
    passengers = 1, 
    departureTime, 
    busType,
    sortBy = 'price',
    limit = 10,
    page = 1
  } = req.query;

  // Support both origin/destination and from/to parameter formats
  const searchOrigin = origin || from;
  const searchDestination = destination || to;

  // Validate required parameters
  if (!searchOrigin || !searchDestination) {
    throw new AppError('Origin and destination are required', 400);
  }

  // Find routes between the specified cities
  const routes = await Route.findRoutesBetween(searchOrigin, searchDestination);

  if (routes.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No routes found between ${searchOrigin} and ${searchDestination}`
    });
  }

  // Build search response with metadata
  const searchResults = {
    searchParams: {
      origin: searchOrigin,
      destination: searchDestination,
      date: date || 'today',
      passengers: parseInt(passengers),
      departureTime,
      busType
    },
    routes: [],
    summary: {
      totalRoutes: routes.length,
      totalTrips: 0,
      priceRange: { min: null, max: null },
      availableBusTypes: []
    }
  };

  // Process each route to get detailed information
  for (const route of routes) {
    // Get trips for this route
    let tripQuery = { routeId: route._id };
    
    // Add date filter if specified
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      
      tripQuery['schedule.plannedDeparture'] = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const trips = await Trip.find(tripQuery)
      .populate('busId', 'busNumber busType operator amenities')
      .populate('routeId', 'routeNumber routeName distance estimatedDuration fareStructure')
      .sort({ 'schedule.plannedDeparture': 1 });

    // Calculate enhanced trip information with pricing
    const enhancedTrips = trips.map(trip => {
      const bus = trip.busId;
      const route = trip.routeId;
      
      // Calculate base fare
      let baseFare = route.fareStructure?.baseFare || 150;
      let totalFare = baseFare;

      // Add distance-based fare if available
      if (route.fareStructure?.farePerKm && route.distance) {
        totalFare += route.distance * route.fareStructure.farePerKm;
      }

      // Apply bus type multipliers
      const busTypeMultipliers = {
        'standard': 1.0,
        'semi-luxury': 1.2,
        'luxury': 1.5,
        'super-luxury': 1.8,
        'express': 1.3
      };

      const multiplier = busTypeMultipliers[bus?.busType] || 1.0;
      totalFare *= multiplier;

      // Calculate surcharges
      let surcharges = 0;
      const tripDate = new Date(trip.schedule?.plannedDeparture);
      const isWeekend = tripDate.getDay() === 0 || tripDate.getDay() === 6;
      const isHoliday = false; // You can implement holiday checking logic

      if (isWeekend) surcharges += totalFare * 0.1; // 10% weekend surcharge
      if (isHoliday) surcharges += 20; // Fixed holiday surcharge

      const finalFarePerPerson = Math.round(totalFare + surcharges);
      const totalForAllPassengers = finalFarePerPerson * parseInt(passengers);

      return {
        tripId: trip._id,
        routeInfo: {
          routeId: route._id,
          routeNumber: route.routeNumber,
          routeName: route.routeName,
          distance: route.distance,
          estimatedDuration: route.estimatedDuration
        },
        schedule: {
          plannedDeparture: trip.schedule?.plannedDeparture,
          plannedArrival: trip.schedule?.plannedArrival,
          estimatedDeparture: trip.schedule?.estimatedDeparture || trip.schedule?.plannedDeparture
        },
        bus: {
          busId: bus?._id,
          busNumber: bus?.busNumber,
          busType: bus?.busType || 'standard',
          operator: bus?.operator,
          amenities: bus?.amenities || []
        },
        availability: {
          totalSeats: trip.capacity?.totalSeats || 45,
          availableSeats: trip.capacity?.totalSeats - (trip.passengerInfo?.currentCount || 0),
          currentPassengers: trip.passengerInfo?.currentCount || 0,
          occupancyRate: Math.round(((trip.passengerInfo?.currentCount || 0) / (trip.capacity?.totalSeats || 45)) * 100)
        },
        pricing: {
          farePerPerson: finalFarePerPerson,
          totalForPassengers: totalForAllPassengers,
          currency: 'LKR',
          breakdown: {
            baseFare: Math.round(baseFare),
            distanceFare: route.fareStructure?.farePerKm ? Math.round(route.distance * route.fareStructure.farePerKm) : 0,
            busTypeMultiplier: multiplier,
            surcharges: Math.round(surcharges),
            subtotal: Math.round(totalFare)
          }
        },
        bookingInfo: {
          isBookable: trip.status === 'scheduled' && (trip.capacity?.totalSeats - (trip.passengerInfo?.currentCount || 0)) > 0,
          advanceBookingDays: 30,
          cancellationPolicy: 'Free cancellation up to 2 hours before departure'
        },
        status: trip.status
      };
    });

    // Filter trips based on criteria
    let filteredTrips = enhancedTrips;

    // Filter by bus type if specified
    if (busType) {
      filteredTrips = filteredTrips.filter(trip => 
        trip.bus.busType === busType
      );
    }

    // Filter by departure time if specified
    if (departureTime) {
      const timeRanges = {
        'morning': { start: 6, end: 12 },
        'afternoon': { start: 12, end: 18 },
        'evening': { start: 18, end: 24 },
        'night': { start: 0, end: 6 }
      };

      const range = timeRanges[departureTime];
      if (range) {
        filteredTrips = filteredTrips.filter(trip => {
          const hour = new Date(trip.schedule.plannedDeparture).getHours();
          return hour >= range.start && hour < range.end;
        });
      }
    }

    // Sort trips based on sortBy parameter
    filteredTrips.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricing.farePerPerson - b.pricing.farePerPerson;
        case 'duration':
          return a.routeInfo.estimatedDuration - b.routeInfo.estimatedDuration;
        case 'departure':
        default:
          return new Date(a.schedule.plannedDeparture) - new Date(b.schedule.plannedDeparture);
      }
    });

    // Add route to results (even if no trips available)
    const routeResult = {
      routeId: route._id,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration,
      fareStructure: route.fareStructure,
      trips: filteredTrips,
      // Add basic pricing info when no trips available
      estimatedFare: route.fareStructure ? 
        Math.round((route.fareStructure.baseFare || 150) + 
                   (route.distance || 100) * (route.fareStructure.perKmRate || 1.2)) : 200
    };

    searchResults.routes.push(routeResult);
    searchResults.summary.totalTrips += filteredTrips.length;
  }

  // Calculate overall summary
  if (searchResults.routes.length > 0) {
    const allTrips = searchResults.routes.flatMap(route => route.trips);
    const routeEstimates = searchResults.routes.map(route => route.estimatedFare).filter(Boolean);
    const tripPrices = allTrips.map(trip => trip.pricing?.farePerPerson).filter(Boolean);
    const allPrices = [...routeEstimates, ...tripPrices];
    const busTypes = [...new Set(allTrips.map(trip => trip.bus?.busType).filter(Boolean))];

    if (allPrices.length > 0) {
      searchResults.summary = {
        ...searchResults.summary,
        priceRange: {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
          average: Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length),
          currency: 'LKR'
        },
        availableBusTypes: busTypes,
        availabilityStatus: allTrips.some(trip => trip.availability?.availableSeats > 0) ? 'available' : 'limited',
        averageJourneyTime: Math.round(searchResults.routes.reduce((sum, route) => sum + route.estimatedDuration, 0) / searchResults.routes.length),
        recommendations: [
          allPrices.length > 1 ? 'Multiple options available - compare prices and times' : 'Route available - check schedule',
          busTypes.includes('luxury') ? 'Luxury options available for enhanced comfort' : '',
          allTrips.length > 0 ? 'Check seat availability and book in advance for better prices' : 'Contact operator for current schedule and availability'
        ].filter(Boolean)
      };
    } else {
      // Fallback when no pricing available
      searchResults.summary = {
        ...searchResults.summary,
        priceRange: { min: null, max: null, currency: 'LKR' },
        availableBusTypes: [],
        availabilityStatus: 'contact_operator',
        averageJourneyTime: Math.round(searchResults.routes.reduce((sum, route) => sum + route.estimatedDuration, 0) / searchResults.routes.length),
        recommendations: ['Contact bus operator for current pricing and schedule information']
      };
    }
  }

  res.status(200).json({
    success: true,
    data: searchResults
  });
});

/**
 * @desc    Get route stops with pricing
 * @route   GET /api/routes/:id/stops
 * @access  Public
 */
export const getRouteStops = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new AppError('Route not found', 404);
  }

  // Calculate pricing for each stop
  const stopsWithPricing = route.stops.map((stop, index) => {
    const baseFare = route.fareStructure?.baseFare || 150;
    const perKmRate = route.fareStructure?.perKmRate || 1.2;
    
    // Calculate distance from origin (simple approximation)
    let cumulativeDistance = 0;
    if (index > 0) {
      // Calculate distance based on stop order (simplified)
      const totalDistance = route.distance || 100;
      const stopInterval = totalDistance / (route.stops.length - 1);
      cumulativeDistance = stopInterval * index;
    }

    // Calculate fare from origin to this stop
    const distanceFare = cumulativeDistance * perKmRate;
    const totalFare = Math.round(baseFare + distanceFare);

    // Calculate fare from previous stop
    let fareFromPreviousStop = baseFare;
    if (index > 0) {
      const prevDistance = index > 1 ? (route.distance / (route.stops.length - 1)) : 0;
      fareFromPreviousStop = Math.round(prevDistance * perKmRate + 20); // 20 LKR base segment fare
    }

    return {
      ...stop.toObject(),
      pricing: {
        fareFromOrigin: totalFare,
        fareFromPreviousStop: index === 0 ? 0 : fareFromPreviousStop,
        cumulativeDistance: Math.round(cumulativeDistance),
        fareZone: Math.ceil(index / 2) + 1 // Group stops into fare zones
      }
    };
  });

  // Calculate fare matrix (fare between any two stops)
  const fareMatrix = [];
  for (let i = 0; i < route.stops.length; i++) {
    const row = [];
    for (let j = 0; j < route.stops.length; j++) {
      if (i === j) {
        row.push(0);
      } else {
        const distance = Math.abs(j - i) * (route.distance / (route.stops.length - 1));
        const fare = Math.round((route.fareStructure?.baseFare || 150) * 0.3 + distance * (route.fareStructure?.perKmRate || 1.2));
        row.push(fare);
      }
    }
    fareMatrix.push(row);
  }

  res.status(200).json({
    success: true,
    data: {
      routeId: route._id,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      totalDistance: route.distance,
      estimatedDuration: route.estimatedDuration,
      fareStructure: route.fareStructure,
      stops: stopsWithPricing,
      fareMatrix: fareMatrix,
      fareZones: {
        description: "Fare zones for simplified pricing",
        zones: Math.ceil(route.stops.length / 2),
        zoneBaseFare: route.fareStructure?.baseFare * 0.3 || 50
      }
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
/**
 * @desc    Get available cities and popular routes
 * @route   GET /api/routes/cities
 * @access  Public
 */
export const getAvailableCities = asyncHandler(async (req, res) => {
  // Get all routes and extract cities manually to handle mixed data formats
  const routes = await Route.find({ isActive: true }, 'origin destination');
  
  const citiesSet = new Set();
  
  routes.forEach(route => {
    // Handle string format
    if (typeof route.origin === 'string') {
      citiesSet.add(route.origin);
    }
    // Handle object format  
    else if (route.origin && route.origin.city) {
      citiesSet.add(route.origin.city);
    }
    
    // Handle string format
    if (typeof route.destination === 'string') {
      citiesSet.add(route.destination);
    }
    // Handle object format
    else if (route.destination && route.destination.city) {
      citiesSet.add(route.destination.city);
    }
  });

  const cities = Array.from(citiesSet).sort();

  res.status(200).json({
    success: true,
    data: {
      cities,
      searchTips: [
        "Try popular routes like \"Colombo to Kandy\" or \"Galle to Colombo\"",
        "Use partial city names for better results",
        "Check multiple dates for better pricing and availability"
      ]
    }
  });
});

/**
 * @desc    Get price estimates for a route
 * @route   GET /api/routes/pricing/:from/:to
 * @access  Public
 */
export const getPriceEstimate = asyncHandler(async (req, res) => {
  // Handle both path params (/pricing/:from/:to) and query params (/estimate-price?origin=...&destination=...)
  const from = req.params.from || req.query.origin;
  const to = req.params.to || req.query.destination;
  const { passengers = 1, busType } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      message: 'Origin and destination are required'
    });
  }

  // Find routes between cities
  const routes = await Route.findRoutesBetween(from, to);

  if (routes.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No routes found between ${from} and ${to}`
    });
  }

  // Calculate price estimates
  const priceEstimates = routes.map(route => {
    let baseFare = route.fareStructure?.baseFare || 150;
    let estimatedFare = baseFare;

    if (route.fareStructure?.farePerKm && route.distance) {
      estimatedFare += route.distance * route.fareStructure.farePerKm;
    }

    const busTypeMultipliers = {
      "standard": 1.0,
      "semi-luxury": 1.2,
      "luxury": 1.5,
      "super-luxury": 1.8,
      "express": 1.3
    };

    if (busType && busTypeMultipliers[busType]) {
      estimatedFare *= busTypeMultipliers[busType];
    }

    return {
      routeId: route._id,
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration,
      pricing: {
        baseFare: Math.round(baseFare),
        estimatedFarePerPerson: Math.round(estimatedFare),
        totalForAllPassengers: Math.round(estimatedFare * parseInt(passengers)),
        currency: "LKR"
      }
    };
  });

  res.status(200).json({
    success: true,
    data: {
      searchParams: { from, to, passengers: parseInt(passengers), busType },
      priceEstimates,
      disclaimer: "Prices are estimates and may vary based on date, time, and availability."
    }
  });
});
