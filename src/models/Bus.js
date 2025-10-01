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
  },
  accuracy: {
    type: Number,
    min: [0, 'GPS accuracy cannot be negative'],
    default: 10 // meters
  }
}, { _id: false });

const maintenanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'emergency'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Maintenance description cannot exceed 1000 characters']
  },
  cost: {
    type: Number,
    min: [0, 'Maintenance cost cannot be negative']
  },
  performedBy: {
    type: String,
    trim: true
  },
  nextScheduledDate: Date
}, { _id: true });

const busSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,3}-\d{4}$/, 'Registration number must be in format XX-1234 or XXX-1234']
  },
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^B\d{3,4}$/, 'Bus number must be in format B001 or B0001']
  },
  operatorInfo: {
    operatorName: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true,
      maxlength: [200, 'Operator name cannot exceed 200 characters']
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: String,
      trim: true,
      match: [/^(\+94|0)[0-9]{9}$/, 'Please enter a valid Sri Lankan phone number']
    }
  },
  vehicleDetails: {
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1990, 'Vehicle year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Vehicle year cannot be in the future']
    },
    engineNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    chassisNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    }
  },
  capacity: {
    seated: {
      type: Number,
      required: [true, 'Seated capacity is required'],
      min: [20, 'Seated capacity must be at least 20'],
      max: [80, 'Seated capacity cannot exceed 80']
    },
    standing: {
      type: Number,
      default: 0,
      min: [0, 'Standing capacity cannot be negative'],
      max: [40, 'Standing capacity cannot exceed 40']
    }
  },
  busType: {
    type: String,
    enum: {
      values: ['standard', 'semi-luxury', 'luxury', 'super-luxury', 'express'],
      message: 'Bus type must be standard, semi-luxury, luxury, super-luxury, or express'
    },
    required: [true, 'Bus type is required']
  },
  features: {
    type: [String],
    enum: ['AC', 'WiFi', 'USB Charging', 'Reclining Seats', 'Entertainment System', 'GPS', 'CCTV', 'Fire Extinguisher', 'First Aid Kit'],
    default: ['GPS', 'Fire Extinguisher', 'First Aid Kit']
  },
  currentLocation: {
    coordinates: coordinatesSchema,
    address: {
      type: String,
      trim: true
    },
    speed: {
      type: Number,
      min: [0, 'Speed cannot be negative'],
      max: [120, 'Speed cannot exceed 120 km/h']
    },
    heading: {
      type: Number,
      min: [0, 'Heading must be between 0 and 360'],
      max: [360, 'Heading must be between 0 and 360']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    isMoving: {
      type: Boolean,
      default: false
    }
  },
  operationalStatus: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'maintenance', 'breakdown', 'retired'],
      message: 'Status must be active, inactive, maintenance, breakdown, or retired'
    },
    default: 'active'
  },
  currentTrip: {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'delayed'],
      default: 'scheduled'
    },
    departureTime: Date,
    estimatedArrival: Date,
    actualArrival: Date,
    passengerCount: {
      type: Number,
      min: [0, 'Passenger count cannot be negative']
    }
  },
  assignedRoutes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  safety: {
    insuranceNumber: {
      type: String,
      trim: true
    },
    insuranceExpiry: Date,
    fitnessExpiry: Date,
    lastInspection: Date,
    nextInspection: Date,
    certificateNumber: {
      type: String,
      trim: true
    }
  },
  maintenance: {
    records: [maintenanceRecordSchema],
    lastService: Date,
    nextService: Date,
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
      default: 0
    },
    fuelEfficiency: {
      type: Number,
      min: [0, 'Fuel efficiency cannot be negative']
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Virtual for total capacity
busSchema.virtual('totalCapacity').get(function() {
  return this.capacity.seated + (this.capacity.standing || 0);
});

// Virtual for location age (how old is the current location data)
busSchema.virtual('locationAge').get(function() {
  if (this.currentLocation?.lastUpdated) {
    return Date.now() - this.currentLocation.lastUpdated.getTime();
  }
  return null;
});

// Virtual for maintenance status
busSchema.virtual('maintenanceStatus').get(function() {
  const now = new Date();
  
  if (this.maintenance.nextService && this.maintenance.nextService <= now) {
    return 'overdue';
  }
  
  if (this.maintenance.nextService) {
    const daysUntilService = Math.ceil((this.maintenance.nextService - now) / (1000 * 60 * 60 * 24));
    if (daysUntilService <= 7) {
      return 'due-soon';
    }
  }
  
  return 'up-to-date';
});

// Indexes
busSchema.index({ registrationNumber: 1 });
busSchema.index({ busNumber: 1 });
busSchema.index({ 'operatorInfo.operatorId': 1 });
busSchema.index({ operationalStatus: 1 });
busSchema.index({ 'currentLocation.coordinates': '2dsphere' });
busSchema.index({ 'assignedRoutes.routeId': 1, 'assignedRoutes.isActive': 1 });
busSchema.index({ 'currentTrip.tripId': 1 });

// Pre-save middleware
busSchema.pre('save', function(next) {
  // Update location timestamp if coordinates changed
  if (this.isModified('currentLocation.coordinates')) {
    this.currentLocation.lastUpdated = new Date();
    
    // Determine if bus is moving based on speed
    this.currentLocation.isMoving = (this.currentLocation.speed || 0) > 5; // km/h threshold
  }
  
  next();
});

// Static method to find buses by location (within radius)
busSchema.statics.findNearbyBuses = function(latitude, longitude, radiusInKm = 10) {
  return this.find({
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    operationalStatus: 'active',
    isActive: true
  });
};

// Static method to find buses by route
busSchema.statics.findByRoute = function(routeId) {
  return this.find({
    'assignedRoutes.routeId': routeId,
    'assignedRoutes.isActive': true,
    isActive: true
  }).populate('assignedRoutes.routeId');
};

// Static method to find available buses
busSchema.statics.findAvailableBuses = function() {
  return this.find({
    operationalStatus: 'active',
    'currentTrip.status': { $nin: ['in-progress'] },
    isActive: true
  });
};

// Instance method to update location
busSchema.methods.updateLocation = function(latitude, longitude, speed = 0, heading = 0, accuracy = 10) {
  this.currentLocation = {
    coordinates: { latitude, longitude, accuracy },
    speed,
    heading,
    lastUpdated: new Date(),
    isMoving: speed > 5
  };
  
  return this.save();
};

// Instance method to start trip
busSchema.methods.startTrip = function(tripId, routeId) {
  this.currentTrip = {
    tripId,
    routeId,
    status: 'in-progress',
    departureTime: new Date()
  };
  
  return this.save();
};

// Instance method to complete trip
busSchema.methods.completeTrip = function() {
  if (this.currentTrip && this.currentTrip.status === 'in-progress') {
    this.currentTrip.status = 'completed';
    this.currentTrip.actualArrival = new Date();
  }
  
  return this.save();
};

// Instance method to add maintenance record
busSchema.methods.addMaintenanceRecord = function(maintenanceData) {
  this.maintenance.records.push(maintenanceData);
  this.maintenance.lastService = new Date();
  
  return this.save();
};

const Bus = mongoose.model('Bus', busSchema);

export default Bus;