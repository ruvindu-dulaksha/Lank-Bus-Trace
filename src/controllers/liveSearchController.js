import { asyncHandler } from '../middleware/errorHandler.js';
import Route from '../models/Route.js';
import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Enhanced search for routes with live buses and upcoming schedules
 * @route   GET /api/routes/live-search
 * @access  Public
 */
export const liveRouteSearch = asyncHandler(async (req, res) => {
  const { 
    from, 
    to, 
    date, 
    adults = 1,
    children = 0,
    time,
    busType
  } = req.query;

  // Validate required parameters
  if (!from || !to) {
    throw new AppError('Origin (from) and destination (to) are required', 400);
  }

  const numAdults = parseInt(adults) || 1;
  const numChildren = parseInt(children) || 0;
  const totalPassengers = numAdults + numChildren;

  if (totalPassengers === 0) {
    throw new AppError('At least one passenger is required', 400);
  }

  // Find routes between cities
  const routes = await Route.findRoutesBetween(from, to);

  if (routes.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No routes found between ${from} and ${to}`,
      searchParams: { from, to, date, totalPassengers }
    });
  }

  const searchDate = date ? new Date(date) : new Date();
  const currentTime = new Date();
  
  // Get current date boundaries
  const startOfDay = new Date(searchDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(searchDate);
  endOfDay.setHours(23, 59, 59, 999);

  const results = [];

  for (const route of routes) {
    // 1. GET CURRENTLY RUNNING BUSES
    const runningTrips = await Trip.find({
      routeId: route._id,
      status: { $in: ['departed', 'in-transit'] },
      'schedule.plannedDeparture': { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('busId', 'registrationNumber busNumber busType capacity currentLocation')
    .populate('routeId', 'routeNumber routeName estimatedDuration')
    .sort({ 'schedule.plannedDeparture': 1 });

    // 2. GET UPCOMING SCHEDULED TRIPS
    const upcomingTrips = await Trip.find({
      routeId: route._id,
      status: { $in: ['scheduled', 'boarding'] },
      'schedule.plannedDeparture': { 
        $gte: currentTime,
        $lte: endOfDay
      }
    })
    .populate('busId', 'registrationNumber busNumber busType capacity currentLocation')
    .populate('routeId', 'routeNumber routeName estimatedDuration')
    .sort({ 'schedule.plannedDeparture': 1 })
    .limit(10); // Show next 10 upcoming trips

    // Calculate pricing
    const baseFare = route.fareStructure?.baseFare || 300;
    const childDiscount = 0.5; // 50% discount for children
    
    const adultPrice = baseFare;
    const childPrice = baseFare * childDiscount;
    const totalPrice = (numAdults * adultPrice) + (numChildren * childPrice);

    // Process running buses
    const currentlyRunning = runningTrips.map(trip => {
      const bus = trip.busId || {};
      const estimatedArrival = new Date(
        trip.schedule.plannedDeparture.getTime() + 
        (route.estimatedDuration * 60 * 1000)
      );
      
      // Calculate estimated time to arrival
      const timeToArrival = Math.max(0, estimatedArrival.getTime() - currentTime.getTime());
      const minutesToArrival = Math.floor(timeToArrival / (1000 * 60));

      return {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        bus: {
          id: bus._id || null,
          registrationNumber: bus.registrationNumber || 'N/A',
          busNumber: bus.busNumber || 'N/A',
          busType: bus.busType || 'N/A',
          capacity: bus.capacity
        },
        status: trip.status,
        currentLocation: bus.currentLocation,
        schedule: {
          departedAt: trip.schedule.actualDeparture || trip.schedule.plannedDeparture,
          estimatedArrival: estimatedArrival,
          minutesToArrival: minutesToArrival
        },
        progress: trip.routeProgress?.progressPercentage || 0,
        pricing: {
          adultPrice,
          childPrice,
          totalPrice,
          availability: minutesToArrival > 30 ? 'available' : 'limited'
        }
      };
    });

    // Process upcoming buses
    const upcomingBuses = upcomingTrips.map(trip => {
      const bus = trip.busId || {};
      const departureTime = trip.schedule.plannedDeparture;
      const estimatedArrival = new Date(
        departureTime.getTime() + (route.estimatedDuration * 60 * 1000)
      );
      
      // Calculate time until departure
      const timeToDeparture = Math.max(0, departureTime.getTime() - currentTime.getTime());
      const minutesToDeparture = Math.floor(timeToDeparture / (1000 * 60));

      return {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        bus: {
          id: bus._id || null,
          registrationNumber: bus.registrationNumber || 'N/A',
          busNumber: bus.busNumber || 'N/A',
          busType: bus.busType || 'N/A',
          capacity: bus.capacity || null
        },
        status: trip.status,
        schedule: {
          plannedDeparture: departureTime,
          estimatedArrival: estimatedArrival,
          minutesToDeparture: minutesToDeparture,
          departureTime: departureTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        },
        pricing: {
          adultPrice,
          childPrice,
          totalPrice,
          availability: 'available'
        }
      };
    });

    results.push({
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        origin: route.origin,
        destination: route.destination,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        operationalHours: route.operationalHours
      },
      liveStatus: {
        currentlyRunning: currentlyRunning,
        runningCount: currentlyRunning.length,
        upcomingBuses: upcomingBuses,
        upcomingCount: upcomingBuses.length,
        nextDeparture: upcomingBuses.length > 0 ? upcomingBuses[0].schedule.plannedDeparture : null
      },
      pricing: {
        adults: { count: numAdults, unitPrice: adultPrice, total: numAdults * adultPrice },
        children: { count: numChildren, unitPrice: childPrice, total: numChildren * childPrice },
        totalPrice: totalPrice,
        currency: 'LKR'
      }
    });
  }

  // Sort results by next available bus
  results.sort((a, b) => {
    const aNext = a.liveStatus.upcomingBuses[0]?.schedule.plannedDeparture || new Date('2099-12-31');
    const bNext = b.liveStatus.upcomingBuses[0]?.schedule.plannedDeparture || new Date('2099-12-31');
    return aNext - bNext;
  });

  // Calculate summary statistics
  const totalRunning = results.reduce((sum, r) => sum + r.liveStatus.runningCount, 0);
  const totalUpcoming = results.reduce((sum, r) => sum + r.liveStatus.upcomingCount, 0);
  const priceRange = results.length > 0 ? {
    min: Math.min(...results.map(r => r.pricing.totalPrice)),
    max: Math.max(...results.map(r => r.pricing.totalPrice))
  } : { min: 0, max: 0 };

  res.status(200).json({
    success: true,
    message: `Found ${results.length} routes between ${from} and ${to}`,
    searchParams: {
      from,
      to,
      date: searchDate.toISOString().split('T')[0],
      passengers: { adults: numAdults, children: numChildren, total: totalPassengers },
      searchTime: currentTime.toISOString()
    },
    summary: {
      totalRoutes: results.length,
      currentlyRunning: totalRunning,
      upcomingBuses: totalUpcoming,
      priceRange: priceRange
    },
    routes: results,
    lastUpdated: currentTime.toISOString()
  });
});

/**
 * @desc    Get live bus tracking for a specific route
 * @route   GET /api/routes/:routeId/live-buses
 * @access  Public
 */
export const getLiveBusesOnRoute = asyncHandler(async (req, res) => {
  const { routeId } = req.params;

  // Get the route
  const route = await Route.findById(routeId);
  if (!route) {
    throw new AppError('Route not found', 404);
  }

  const currentTime = new Date();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get all active trips on this route
  const activeTrips = await Trip.find({
    routeId: routeId,
    status: { $in: ['scheduled', 'boarding', 'departed', 'in-transit'] },
    'schedule.plannedDeparture': { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('busId', 'registrationNumber busNumber busType capacity currentLocation')
  .sort({ 'schedule.plannedDeparture': 1 });

  const liveBuses = activeTrips.map(trip => {
    const bus = trip.busId || {};
    const isRunning = ['departed', 'in-transit'].includes(trip.status);
    
    return {
      tripId: trip._id,
      tripNumber: trip.tripNumber,
      bus: {
        id: bus._id || null,
        registrationNumber: bus.registrationNumber || 'N/A',
        busNumber: bus.busNumber || 'N/A',
        busType: bus.busType || 'N/A'
      },
      status: trip.status,
      isRunning,
      currentLocation: isRunning ? bus.currentLocation : null,
      schedule: {
        plannedDeparture: trip.schedule.plannedDeparture,
        actualDeparture: trip.schedule.actualDeparture,
        estimatedArrival: trip.schedule.estimatedArrival
      },
      progress: trip.routeProgress?.progressPercentage || 0,
      passengerInfo: {
        currentCount: trip.passengerInfo?.currentCount || 0,
        capacity: bus.capacity?.seated || 0
      }
    };
  });

  res.status(200).json({
    success: true,
    data: {
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName
      },
      liveBuses,
      summary: {
        total: liveBuses.length,
        running: liveBuses.filter(b => b.isRunning).length,
        scheduled: liveBuses.filter(b => !b.isRunning).length
      },
      lastUpdated: currentTime.toISOString()
    }
  });
});