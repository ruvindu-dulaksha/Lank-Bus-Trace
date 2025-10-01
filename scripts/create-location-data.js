import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../src/models/Location.js';
import Bus from '../src/models/Bus.js';
import connectDB from '../src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const createSampleLocationData = async () => {
  try {
    console.log('🔄 Creating sample location tracking data...');

    // Clear existing location data first
    await Location.deleteMany({});
    console.log('🗑️ Cleared existing location data');

    // Get some buses to create location records for
    const buses = await Bus.find({ operationalStatus: 'active' }).limit(10);
    
    if (buses.length === 0) {
      console.log('❌ No active buses found for location data');
      process.exit(1);
    }

    const locations = [];
    const now = new Date();
    
    // Create one current location record per bus (unique constraint)
    for (const bus of buses) {
      console.log(`📍 Creating location record for bus ${bus.busNumber}...`);
      
      // Create location history for this bus (last 12 hours)
      const locationHistory = [];
      for (let hour = 12; hour > 0; hour--) {
        const timestamp = new Date(now.getTime() - (hour * 60 * 60 * 1000));
        const lat = 6.9271 + (hour * 0.001) + (Math.random() - 0.5) * 0.002;
        const lng = 79.8612 + (hour * 0.002) + (Math.random() - 0.5) * 0.002;
        
        locationHistory.push({
          coordinates: {
            latitude: lat,
            longitude: lng,
            accuracy: Math.floor(Math.random() * 10) + 5
          },
          speed: Math.floor(Math.random() * 80) + 20,
          heading: Math.floor(Math.random() * 360),
          altitude: Math.floor(Math.random() * 100) + 50,
          timestamp: timestamp,
          source: 'gps',
          quality: 'good'
        });
      }
      
      // Current location with some randomness around Colombo
      const currentLat = 6.9271 + (Math.random() - 0.5) * 0.01;
      const currentLng = 79.8612 + (Math.random() - 0.5) * 0.01;
      
      const locationData = {
        busId: bus._id,
        routeId: bus.assignedRoutes?.[0]?.routeId,
        currentLocation: {
          coordinates: {
            latitude: currentLat,
            longitude: currentLng,
            accuracy: Math.floor(Math.random() * 5) + 3 // 3-8 meters
          },
          speed: Math.floor(Math.random() * 60) + 20, // 20-80 km/h
          heading: Math.floor(Math.random() * 360),
          altitude: Math.floor(Math.random() * 50) + 50, // 50-100 meters
          lastUpdated: now,
          isMoving: Math.random() > 0.3 // 70% chance of moving
        },
        locationHistory: locationHistory,
        routeProgress: {
          nextStopName: `Stop ${Math.floor(Math.random() * 10) + 1}`,
          distanceToNextStop: Math.floor(Math.random() * 5) + 0.5, // 0.5-5.5 km
          progressPercentage: Math.floor(Math.random() * 80) + 10 // 10-90%
        },
        deviceInfo: {
          deviceId: `GPS_${bus.busNumber}_001`,
          deviceType: 'gps-tracker',
          batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
          signalStrength: Math.floor(Math.random() * 40) - 70, // -70 to -30 dBm
          lastSeen: now
        },
        statistics: {
          totalDistance: Math.floor(Math.random() * 200) + 50, // 50-250 km today
          averageSpeed: Math.floor(Math.random() * 30) + 35, // 35-65 km/h average
          maxSpeed: Math.floor(Math.random() * 20) + 80 // 80-100 km/h max
        },
        isOnline: Math.random() > 0.1 // 90% chance of being online
      };
      
      locations.push(locationData);
    }

    // Insert all location records
    const insertedLocations = await Location.insertMany(locations);
    console.log(`✅ Created ${insertedLocations.length} location tracking records`);

    // Get final count
    const totalLocations = await Location.countDocuments();
    console.log(`\n🎉 Location data creation completed!`);
    console.log(`📊 Total location records: ${totalLocations}`);
    console.log(`🚌 Buses with tracking data: ${buses.length}`);
    console.log(`📍 Location history: 12 hours per bus`);
    console.log(`🔄 Real-time tracking: Active`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating location data:', error);
    process.exit(1);
  }
};

createSampleLocationData();