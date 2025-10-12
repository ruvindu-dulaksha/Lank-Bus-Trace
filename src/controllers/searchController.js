import Route from '../models/Route.js';
import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import Location from '../models/Location.js';
import User from '../models/User.js';

// Live search functionality for real-time bus tracking
export const liveSearch = async (req, res) => {
  try {
    const { from, to, date, time } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'From and to locations are required'
      });
    }

    // Get current time or specified time
    const searchTime = date ? new Date(date) : new Date();
    
    // Find routes between locations - enhanced to handle mixed data formats
    const routes = await Route.find({
      $or: [
        // Handle string format origins/destinations
        { 
          $and: [
            { 'origin': { $regex: from, $options: 'i' } },
            { 'destination': { $regex: to, $options: 'i' } }
          ]
        },
        // Handle object format origins/destinations
        { 
          $and: [
            { 'origin.city': { $regex: from, $options: 'i' } },
            { 'destination.city': { $regex: to, $options: 'i' } }
          ]
        },
        // Handle stops (existing logic)
        {
          $and: [
            { 'stops.name': { $regex: from, $options: 'i' } },
            { 'stops.name': { $regex: to, $options: 'i' } }
          ]
        }
      ],
      isActive: true
    });

    if (!routes.length) {
      return res.status(404).json({
        success: false,
        message: 'No routes found between specified locations',
        data: []
      });
    }

    // Find current and upcoming trips
    const now = new Date();
    const endOfDay = new Date(searchTime);
    endOfDay.setHours(23, 59, 59, 999);

    const trips = await Trip.find({
      routeId: { $in: routes.map(r => r._id) },
      scheduledDeparture: {
        $gte: now,
        $lte: endOfDay
      },
      status: { $in: ['scheduled', 'in-transit', 'delayed'] }
    })
    .populate('routeId', 'routeName routeNumber origin destination')
    .populate('busId', 'busNumber registrationNumber capacity busType')
    .populate('driverId', 'username personalInfo.firstName personalInfo.lastName')
    .populate('conductorId', 'username personalInfo.firstName personalInfo.lastName')
    .sort({ scheduledDeparture: 1 })
    .limit(20);

    // Format response data
    const liveResults = trips.map(trip => ({
      tripId: trip._id,
      tripNumber: trip.tripNumber || `${trip.routeId?.routeNumber}-${trip.busId?.busNumber}`,
      route: {
        id: trip.routeId?._id,
        name: trip.routeId?.routeName,
        number: trip.routeId?.routeNumber,
        origin: trip.routeId?.origin,
        destination: trip.routeId?.destination
      },
      bus: {
        id: trip.busId?._id,
        number: trip.busId?.busNumber,
        registration: trip.busId?.registrationNumber,
        type: trip.busId?.busType,
        capacity: trip.busId?.capacity
      },
      schedule: {
        departure: trip.scheduledDeparture,
        arrival: trip.scheduledArrival,
        estimatedDeparture: trip.actualDeparture || trip.scheduledDeparture,
        estimatedArrival: trip.actualArrival || trip.scheduledArrival
      },
      status: trip.status,
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
      availability: {
        seatsAvailable: (trip.busId?.capacity?.seating || 0) - (trip.passengerCount || 0),
        totalSeats: trip.busId?.capacity?.seating || 0
      },
      fare: trip.estimatedFare || null,
      delay: trip.delayMinutes || 0
    }));

    res.json({
      success: true,
      message: `Found ${liveResults.length} available trips`,
      data: liveResults,
      searchCriteria: {
        from,
        to,
        date: searchTime.toISOString().split('T')[0],
        searchTime: now.toISOString()
      },
      meta: {
        totalRoutes: routes.length,
        totalTrips: liveResults.length,
        searchRadius: '50km'
      }
    });

  } catch (error) {
    console.error('Live search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing live search',
      error: error.message
    });
  }
};

// General search functionality
export const generalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    // Search buses if no type specified or type is 'bus' or type is 'all'
    if (!type || type === 'bus' || type === 'all') {
      const busQueries = [
        { busNumber: searchRegex },
        { registrationNumber: searchRegex },
        { 'operatorInfo.companyName': searchRegex },
        { 'operatorInfo.operatorName': searchRegex }
      ];
      
      // Handle common operator abbreviations
      const queryLower = q.toLowerCase();
      if (queryLower === 'sltb') {
        busQueries.push({ 'operatorInfo.companyName': /Sri Lanka Transport Board/i });
      } else if (queryLower === 'ntc') {
        busQueries.push({ 'operatorInfo.companyName': /National Transport Commission/i });
      } else if (queryLower === 'ept') {
        busQueries.push({ 'operatorInfo.companyName': /Eastern Province Transport/i });
      }
      
      const buses = await Bus.find({
        $or: busQueries
      }).limit(parseInt(limit));
      
      results.buses = buses;
    }

    // Search routes if no type specified or type is 'route' or type is 'all'
    if (!type || type === 'route' || type === 'all') {
      const routes = await Route.find({
        $or: [
          { routeName: searchRegex },
          { routeNumber: searchRegex },
          { origin: searchRegex },
          { destination: searchRegex },
          { 'origin.city': searchRegex },
          { 'destination.city': searchRegex }
        ]
      }).limit(parseInt(limit));
      
      results.routes = routes;
    }

    // Search locations if no type specified or type is 'location' or type is 'all'
    if (!type || type === 'location' || type === 'all') {
      const locations = await Location.find({
        $or: [
          { name: searchRegex },
          { city: searchRegex },
          { province: searchRegex }
        ]
      }).limit(parseInt(limit));
      
      results.locations = locations;
    }

    // Search users if no type specified or type is 'user' or type is 'all' (admin only)
    if ((!type || type === 'user' || type === 'all') && req.user?.role === 'admin') {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { 'personalInfo.firstName': searchRegex },
          { 'personalInfo.lastName': searchRegex }
        ]
      }).select('-password -refreshTokens').limit(parseInt(limit));
      
      results.users = users;
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      message: `Found ${totalResults} results for "${q}"`,
      data: results,
      meta: {
        query: q,
        type: type || 'all',
        totalResults,
        searchTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('General search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};