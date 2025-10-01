import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema({
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
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  terminal: {
    type: String,
    required: [true, 'Terminal is required'],
    trim: true,
    maxlength: [200, 'Terminal name cannot exceed 200 characters']
  },
  coordinates: {
    type: coordinatesSchema,
    required: [true, 'Coordinates are required']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  }
}, { _id: false });

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true,
    maxlength: [200, 'Stop name cannot exceed 200 characters']
  },
  coordinates: {
    type: coordinatesSchema,
    required: [true, 'Stop coordinates are required']
  },
  estimatedArrival: {
    type: Number, // Minutes from origin
    required: [true, 'Estimated arrival time is required'],
    min: [0, 'Estimated arrival time cannot be negative']
  },
  stopOrder: {
    type: Number,
    required: [true, 'Stop order is required'],
    min: [1, 'Stop order must be at least 1']
  },
  district: {
    type: String,
    trim: true
  },
  facilities: [{
    type: String,
    enum: ['restroom', 'food', 'fuel', 'parking', 'shelter', 'atm']
  }]
}, { _id: false });

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^R\d{3,4}$/, 'Route number must be in format R001 or R0001']
  },
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [200, 'Route name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  origin: {
    type: locationSchema,
    required: [true, 'Origin location is required']
  },
  destination: {
    type: locationSchema,
    required: [true, 'Destination location is required']
  },
  stops: {
    type: [stopSchema],
    validate: {
      validator: function(stops) {
        // Check if stop orders are unique and sequential
        const orders = stops.map(stop => stop.stopOrder);
        const uniqueOrders = [...new Set(orders)];
        return orders.length === uniqueOrders.length && 
               uniqueOrders.every(order => order > 0);
      },
      message: 'Stop orders must be unique and positive'
    }
  },
  distance: {
    type: Number, // Distance in kilometers
    required: [true, 'Route distance is required'],
    min: [1, 'Distance must be at least 1 kilometer']
  },
  estimatedDuration: {
    type: Number, // Duration in minutes
    required: [true, 'Estimated duration is required'],
    min: [15, 'Estimated duration must be at least 15 minutes']
  },
  routeType: {
    type: String,
    enum: {
      values: ['inter-provincial', 'provincial', 'urban', 'express'],
      message: 'Route type must be inter-provincial, provincial, urban, or express'
    },
    default: 'inter-provincial'
  },
  operatingDays: {
    type: [String],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  fareStructure: {
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [0, 'Base fare cannot be negative']
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    farePerKm: {
      type: Number,
      min: [0, 'Fare per km cannot be negative']
    },
    segments: [{
      fromStop: String,
      toStop: String,
      fare: {
        type: Number,
        min: [0, 'Segment fare cannot be negative']
      }
    }]
  },
  operationalHours: {
    firstDeparture: {
      type: String, // Format: "HH:MM"
      required: [true, 'First departure time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    lastDeparture: {
      type: String, // Format: "HH:MM"
      required: [true, 'Last departure time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    frequency: {
      type: Number, // Minutes between departures
      required: [true, 'Frequency is required'],
      min: [15, 'Frequency must be at least 15 minutes']
    }
  },
  roadConditions: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  trafficPatterns: {
    peakHours: [{
      start: String, // HH:MM format
      end: String,   // HH:MM format
      delayFactor: {
        type: Number,
        min: [1, 'Delay factor must be at least 1'],
        default: 1.2
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stops count
routeSchema.virtual('totalStops').get(function() {
  return this.stops ? this.stops.length + 2 : 2; // Including origin and destination
});

// Virtual for average speed
routeSchema.virtual('averageSpeed').get(function() {
  if (this.distance && this.estimatedDuration) {
    return (this.distance / (this.estimatedDuration / 60)).toFixed(2); // km/h
  }
  return 0;
});

// Indexes
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ routeName: 'text' });
routeSchema.index({ 'origin.city': 1, 'destination.city': 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ routeType: 1 });

// Pre-save middleware to sort stops by order and update lastUpdated
routeSchema.pre('save', function(next) {
  if (this.isModified('stops')) {
    this.stops.sort((a, b) => a.stopOrder - b.stopOrder);
  }
  this.lastUpdated = new Date();
  next();
});

// Static method to find routes between cities
routeSchema.statics.findRoutesBetweenCities = function(originCity, destinationCity) {
  return this.find({
    'origin.city': new RegExp(originCity, 'i'),
    'destination.city': new RegExp(destinationCity, 'i'),
    isActive: true
  }).sort({ routeNumber: 1 });
};

// Static method to find routes by distance range
routeSchema.statics.findRoutesByDistance = function(minDistance, maxDistance) {
  return this.find({
    distance: { $gte: minDistance, $lte: maxDistance },
    isActive: true
  }).sort({ distance: 1 });
};

// Instance method to get estimated fare
routeSchema.methods.getEstimatedFare = function(fromStop = null, toStop = null) {
  if (!fromStop || !toStop) {
    return this.fareStructure.baseFare + (this.distance * (this.fareStructure.farePerKm || 5));
  }
  
  // Find segment-specific fare
  const segment = this.fareStructure.segments.find(seg => 
    seg.fromStop === fromStop && seg.toStop === toStop
  );
  
  return segment ? segment.fare : this.fareStructure.baseFare;
};

// Instance method to calculate estimated arrival time at stop
routeSchema.methods.getEstimatedArrivalAtStop = function(stopName, departureTime = new Date()) {
  const stop = this.stops.find(s => s.name === stopName);
  if (!stop) return null;
  
  const arrivalTime = new Date(departureTime.getTime() + (stop.estimatedArrival * 60 * 1000));
  return arrivalTime;
};

// Static method to find routes between cities
routeSchema.statics.findRoutesBetween = function(fromCity, toCity) {
  const fromRegex = new RegExp(fromCity.trim(), 'i');
  const toRegex = new RegExp(toCity.trim(), 'i');
  
  return this.find({
    $and: [
      {
        $or: [
          { 'origin.city': fromRegex },
          { 'stops.stopName': fromRegex }
        ]
      },
      {
        $or: [
          { 'destination.city': toRegex },
          { 'stops.stopName': toRegex }
        ]
      }
    ],
    isActive: true
  });
};

const Route = mongoose.model('Route', routeSchema);

export default Route;