import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import logger from '../config/logger.js';

/**
 * Create test data for active trips and bus locations
 */
export const createTestActiveData = async () => {
  try {
    logger.info('🚀 Creating test active data...');

    // Update some trips to have active status with future dates
    const colomboKandyRoute = await Route.findOne({ origin: 'Colombo', destination: 'Kandy' });
    let tripsToUpdate;
    
    if (colomboKandyRoute) {
      // Update trips for Colombo-Kandy route
      tripsToUpdate = await Trip.find({ routeId: colomboKandyRoute._id }).limit(3);
    } else {
      // Fallback: update any completed trips
      tripsToUpdate = await Trip.find({ status: 'completed' }).limit(3);
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 0; i < tripsToUpdate.length; i++) {
      const trip = tripsToUpdate[i];
      const newStatus = i === 0 ? 'in-transit' : i === 1 ? 'scheduled' : 'boarding';
      
      // Set departure time to today + some hours in the future
      const departureTime = new Date();
      departureTime.setHours(departureTime.getHours() + 1 + i * 2, 0, 0, 0); // 1 hour from now, then +2 hours each
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 3); // 3 hours later

      await Trip.findByIdAndUpdate(trip._id, {
        status: newStatus,
        'schedule.plannedDeparture': departureTime,
        'schedule.plannedArrival': arrivalTime,
        'schedule.actualDeparture': newStatus === 'in-transit' ? new Date() : null,
        'routeProgress.progressPercentage': newStatus === 'in-transit' ? 45 : 0
      });

      logger.info(`✅ Updated trip ${trip.tripNumber} to status: ${newStatus} at ${departureTime.toISOString()}`);
    }

    // Update all buses with locations near Colombo
    const busesToUpdate = await Bus.find({});

    for (let i = 0; i < busesToUpdate.length; i++) {
      const bus = busesToUpdate[i];
      // Generate locations within 10km of Colombo (6.9271, 79.8612)
      const latOffset = (Math.random() - 0.5) * 0.2; // ±0.1 degrees ≈ ±11km
      const lngOffset = (Math.random() - 0.5) * 0.2;
      
      const location = {
        type: 'Point',
        coordinates: [
          79.8612 + lngOffset, // longitude
          6.9271 + latOffset   // latitude
        ],
        speed: Math.floor(Math.random() * 60) + 20,
        heading: Math.floor(Math.random() * 360),
        lastUpdated: new Date(),
        isMoving: true
      };

      await Bus.findByIdAndUpdate(bus._id, {
        currentLocation: location,
        lastLocationUpdate: new Date()
      });

      logger.info(`✅ Updated bus ${bus.busNumber} with location near Colombo`);
    }

    logger.info('✅ Test active data creation completed');

  } catch (error) {
    logger.error('❌ Error creating test active data:', error);
  }
};

export default createTestActiveData;