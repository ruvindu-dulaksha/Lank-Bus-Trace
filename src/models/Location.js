import mongoose from 'mongoose';

const locationHistorySchema = new mongoose.Schema({
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    accuracy: {
      type: Number,
      min: [0, 'GPS accuracy cannot be negative'],
      default: 10 // meters
    }
  },
  speed: {
    type: Number,
    min: [0, 'Speed cannot be negative'],
    max: [120, 'Speed cannot exceed 120 km/h'],
    default: 0
  },
  heading: {
    type: Number,
    min: [0, 'Heading must be between 0 and 360'],
    max: [360, 'Heading must be between 0 and 360'],
    default: 0
  },
  altitude: {
    type: Number // meters above sea level
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  source: {
    type: String,
    enum: ['gps', 'network', 'manual', 'estimated'],
    default: 'gps'
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  }
}, { _id: true });

const geofenceEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['enter', 'exit', 'dwell'],
    required: true
  },
  geofenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence'
  },
  geofenceName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  dwellTime: Number // milliseconds for dwell events
}, { _id: true });

const locationSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus ID is required'],
    unique: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentLocation: {
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Current latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Current longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      },
      accuracy: {
        type: Number,
        min: [0, 'GPS accuracy cannot be negative'],
        default: 10
      }
    },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function(coords) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;     // latitude
          },
          message: 'Invalid GeoJSON coordinates'
        }
      }
    },
    address: {
      type: String,
      trim: true
    },
    nearestLandmark: {
      type: String,
      trim: true
    },
    speed: {
      type: Number,
      min: [0, 'Speed cannot be negative'],
      max: [120, 'Speed cannot exceed 120 km/h'],
      default: 0
    },
    heading: {
      type: Number,
      min: [0, 'Heading must be between 0 and 360'],
      max: [360, 'Heading must be between 0 and 360'],
      default: 0
    },
    altitude: Number,
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true
    },
    isMoving: {
      type: Boolean,
      default: false
    }
  },
  locationHistory: {
    type: [locationHistorySchema],
    validate: {
      validator: function(history) {
        // Limit history to last 1000 entries to prevent unbounded growth
        return history.length <= 1000;
      },
      message: 'Location history cannot exceed 1000 entries'
    }
  },
  geofenceEvents: [geofenceEventSchema],
  routeProgress: {
    nextStopName: {
      type: String,
      trim: true
    },
    nextStopETA: {
      type: Date
    },
    distanceToNextStop: {
      type: Number, // kilometers
      min: [0, 'Distance cannot be negative']
    },
    completedStops: [{
      stopName: String,
      arrivalTime: Date,
      departureTime: Date
    }],
    progressPercentage: {
      type: Number,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
      default: 0
    }
  },
  deviceInfo: {
    deviceId: {
      type: String,
      trim: true
    },
    deviceType: {
      type: String,
      enum: ['smartphone', 'gps-tracker', 'obd-device', 'tablet'],
      default: 'gps-tracker'
    },
    batteryLevel: {
      type: Number,
      min: [0, 'Battery level cannot be negative'],
      max: [100, 'Battery level cannot exceed 100%']
    },
    signalStrength: {
      type: Number,
      min: [-120, 'Signal strength too weak'],
      max: [0, 'Invalid signal strength']
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['speeding', 'idle-timeout', 'route-deviation', 'panic', 'maintenance', 'low-battery'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    location: {
      latitude: Number,
      longitude: Number
    }
  }],
  statistics: {
    totalDistance: {
      type: Number,
      min: [0, 'Total distance cannot be negative'],
      default: 0
    },
    averageSpeed: {
      type: Number,
      min: [0, 'Average speed cannot be negative'],
      default: 0
    },
    maxSpeed: {
      type: Number,
      min: [0, 'Max speed cannot be negative'],
      default: 0
    },
    idleTime: {
      type: Number, // minutes
      min: [0, 'Idle time cannot be negative'],
      default: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for connection status age
locationSchema.virtual('connectionAge').get(function() {
  return Date.now() - this.lastHeartbeat.getTime();
});

// Virtual for location data freshness
locationSchema.virtual('locationFreshness').get(function() {
  const age = Date.now() - this.currentLocation.lastUpdated.getTime();
  if (age < 30000) return 'fresh'; // < 30 seconds
  if (age < 300000) return 'recent'; // < 5 minutes
  if (age < 1800000) return 'stale'; // < 30 minutes
  return 'outdated'; // > 30 minutes
});

// Virtual for is device online
locationSchema.virtual('isDeviceOnline').get(function() {
  const maxOfflineTime = 5 * 60 * 1000; // 5 minutes
  return (Date.now() - this.lastHeartbeat.getTime()) < maxOfflineTime;
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ 'currentLocation.geoLocation': '2dsphere' });

// Other indexes (excluding busId which has unique: true)
locationSchema.index({ tripId: 1 });
locationSchema.index({ routeId: 1 });
locationSchema.index({ 'currentLocation.lastUpdated': 1 });
locationSchema.index({ isOnline: 1 });
locationSchema.index({ lastHeartbeat: 1 });

// TTL index for location history cleanup (keep for 30 days)
locationSchema.index({ 
  'locationHistory.timestamp': 1 
}, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

// Pre-save middleware
locationSchema.pre('save', function(next) {
  // Sync coordinates: ensure geoLocation is updated when coordinates change
  if (this.currentLocation.coordinates.latitude && this.currentLocation.coordinates.longitude) {
    this.currentLocation.geoLocation = {
      type: 'Point',
      coordinates: [this.currentLocation.coordinates.longitude, this.currentLocation.coordinates.latitude]
    };
  }
  
  // Update isMoving based on speed
  this.currentLocation.isMoving = (this.currentLocation.speed || 0) > 5;
  
  // Add current location to history if coordinates changed
  if (this.isModified('currentLocation.coordinates') && !this.isNew) {
    this.locationHistory.push({
      coordinates: this.currentLocation.coordinates,
      speed: this.currentLocation.speed,
      heading: this.currentLocation.heading,
      altitude: this.currentLocation.altitude,
      timestamp: this.currentLocation.lastUpdated,
      source: 'gps'
    });
    
    // Keep only last 1000 history entries
    if (this.locationHistory.length > 1000) {
      this.locationHistory = this.locationHistory.slice(-1000);
    }
  }
  
  // Update statistics
  if (this.isModified('currentLocation') && this.locationHistory.length > 1) {
    this.calculateStatistics();
  }
  
  next();
});

// Static method to find locations within radius
locationSchema.statics.findNearby = function(latitude, longitude, radiusInKm = 10) {
  return this.find({
    'currentLocation.geoLocation': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000
      }
    },
    isOnline: true
  });
};

// Static method to find stale locations
locationSchema.statics.findStaleLocations = function(minutesOld = 30) {
  const cutoffTime = new Date(Date.now() - (minutesOld * 60 * 1000));
  return this.find({
    'currentLocation.lastUpdated': { $lt: cutoffTime },
    isOnline: true
  });
};

// Static method to find offline devices
locationSchema.statics.findOfflineDevices = function() {
  const cutoffTime = new Date(Date.now() - (5 * 60 * 1000)); // 5 minutes
  return this.find({
    lastHeartbeat: { $lt: cutoffTime }
  });
};

// Instance method to update location
locationSchema.methods.updateLocation = function(locationData) {
  const { latitude, longitude, speed = 0, heading = 0, accuracy = 10, altitude } = locationData;
  
  // Add to history before updating current
  if (this.currentLocation.coordinates.latitude !== latitude || 
      this.currentLocation.coordinates.longitude !== longitude) {
    this.locationHistory.push({
      coordinates: {
        latitude: this.currentLocation.coordinates.latitude,
        longitude: this.currentLocation.coordinates.longitude,
        accuracy: this.currentLocation.coordinates.accuracy
      },
      speed: this.currentLocation.speed,
      heading: this.currentLocation.heading,
      altitude: this.currentLocation.altitude,
      timestamp: this.currentLocation.lastUpdated
    });
  }
  
  // Update current location
  this.currentLocation.coordinates = { latitude, longitude, accuracy };
  this.currentLocation.speed = speed;
  this.currentLocation.heading = heading;
  this.currentLocation.altitude = altitude;
  this.currentLocation.lastUpdated = new Date();
  this.currentLocation.isMoving = speed > 5;
  
  // Update heartbeat
  this.lastHeartbeat = new Date();
  this.isOnline = true;
  
  return this.save();
};

// Instance method to add alert
locationSchema.methods.addAlert = function(alertData) {
  const alert = {
    ...alertData,
    triggeredAt: new Date(),
    location: {
      latitude: this.currentLocation.coordinates.latitude,
      longitude: this.currentLocation.coordinates.longitude
    }
  };
  
  this.alerts.push(alert);
  
  return this.save();
};

// Instance method to acknowledge alert
locationSchema.methods.acknowledgeAlert = function(alertId, userId) {
  const alert = this.alerts.id(alertId);
  if (alert) {
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;
  }
  
  return this.save();
};

// Instance method to calculate statistics
locationSchema.methods.calculateStatistics = function() {
  if (this.locationHistory.length < 2) return;
  
  const history = this.locationHistory.slice(-100); // Last 100 points
  let totalDistance = 0;
  let totalTime = 0;
  let maxSpeed = 0;
  let idleTime = 0;
  
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      prev.coordinates.latitude,
      prev.coordinates.longitude,
      curr.coordinates.latitude,
      curr.coordinates.longitude
    );
    
    totalDistance += distance;
    
    const timeDiff = (curr.timestamp - prev.timestamp) / (1000 * 60 * 60); // hours
    totalTime += timeDiff;
    
    maxSpeed = Math.max(maxSpeed, curr.speed || 0);
    
    // Count idle time (speed < 2 km/h)
    if ((curr.speed || 0) < 2) {
      idleTime += timeDiff * 60; // convert to minutes
    }
  }
  
  this.statistics.totalDistance += totalDistance;
  this.statistics.averageSpeed = totalTime > 0 ? (totalDistance / totalTime) : 0;
  this.statistics.maxSpeed = Math.max(this.statistics.maxSpeed, maxSpeed);
  this.statistics.idleTime += idleTime;
  this.statistics.lastCalculated = new Date();
};

// Instance method to calculate distance between two points
locationSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Location = mongoose.model('Location', locationSchema);

export default Location;
