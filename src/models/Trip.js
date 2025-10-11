import mongoose from 'mongoose';

const passengerInfoSchema = new mongoose.Schema({
  boardingStop: {
    type: String,
    required: true,
    trim: true
  },
  alightingStop: {
    type: String,
    trim: true
  },
  boardingTime: {
    type: Date,
    default: Date.now
  },
  alightingTime: Date,
  fare: {
    type: Number,
    min: [0, 'Fare cannot be negative']
  },
  ticketNumber: String
}, { _id: true });

const tripStatusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['scheduled', 'boarding', 'departed', 'in-transit', 'arrived', 'completed', 'cancelled', 'delayed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    stopName: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { _id: true });

const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    required: [true, 'Trip number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^T\d{6,8}$/, 'Trip number must be in format T000001 or T00000001']
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  conductorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schedule: {
    plannedDeparture: {
      type: Date,
      required: [true, 'Planned departure time is required']
    },
    actualDeparture: Date,
    plannedArrival: {
      type: Date,
      required: [true, 'Planned arrival time is required']
    },
    actualArrival: Date,
    estimatedArrival: Date // Dynamic estimation based on current location and traffic
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'boarding', 'departed', 'in-transit', 'arrived', 'completed', 'cancelled', 'delayed'],
      message: 'Invalid trip status'
    },
    default: 'scheduled'
  },
  statusHistory: [tripStatusUpdateSchema],
  passengerInfo: {
    capacity: {
      type: Number,
      min: [0, 'Capacity cannot be negative']
    },
    currentCount: {
      type: Number,
      default: 0,
      min: [0, 'Passenger count cannot be negative']
    },
    passengers: [passengerInfoSchema],
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    }
  },
  routeProgress: {
    completedStops: [{
      stopName: String,
      plannedTime: Date,
      actualTime: Date,
      passengersBoarded: { type: Number, default: 0 },
      passengersAlighted: { type: Number, default: 0 }
    }],
    currentStop: {
      type: String,
      trim: true
    },
    nextStop: {
      type: String,
      trim: true
    },
    progressPercentage: {
      type: Number,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
      default: 0
    }
  },
  weather: {
    condition: {
      type: String,
      enum: ['clear', 'cloudy', 'rainy', 'stormy', 'foggy']
    },
    temperature: Number,
    recordedAt: Date
  },
  delays: [{
    reason: {
      type: String,
      enum: ['traffic', 'weather', 'mechanical', 'accident', 'road-work', 'fuel', 'other'],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Delay description cannot exceed 500 characters']
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    location: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      description: String
    },
    estimatedDelay: Number, // minutes
    actualDelay: Number // minutes
  }],
  incidents: [{
    type: {
      type: String,
      enum: ['breakdown', 'accident', 'medical-emergency', 'security', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Incident description cannot exceed 1000 characters']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    location: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      description: String
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date
  }],
  pricing: {
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [0, 'Base fare cannot be negative']
    },
    surcharges: [{
      type: {
        type: String,
        enum: ['holiday', 'night', 'express', 'fuel'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Surcharge amount cannot be negative']
      },
      description: String
    }],
    totalFare: {
      type: Number,
      min: [0, 'Total fare cannot be negative']
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['delay', 'arrival', 'departure', 'cancellation', 'breakdown'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipients: [{
      type: String // Could be phone numbers, email addresses, etc.
    }]
  }],
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

// Virtual for trip duration
tripSchema.virtual('plannedDuration').get(function() {
  if (this.schedule.plannedArrival && this.schedule.plannedDeparture) {
    return Math.ceil((this.schedule.plannedArrival - this.schedule.plannedDeparture) / (1000 * 60)); // minutes
  }
  return null;
});

// Virtual for actual duration
tripSchema.virtual('actualDuration').get(function() {
  if (this.schedule && this.schedule.actualArrival && this.schedule.actualDeparture) {
    return Math.ceil((this.schedule.actualArrival - this.schedule.actualDeparture) / (1000 * 60)); // minutes
  }
  // Fallback to actualArrival and actualDeparture (legacy fields)
  if (this.actualArrival && this.actualDeparture) {
    return Math.ceil((this.actualArrival - this.actualDeparture) / (1000 * 60)); // minutes
  }
  return 180; // Default duration in minutes
});

// Virtual for occupancy rate
tripSchema.virtual('occupancyRate').get(function() {
  if (this.passengerInfo.capacity && this.passengerInfo.currentCount >= 0) {
    return ((this.passengerInfo.currentCount / this.passengerInfo.capacity) * 100).toFixed(2);
  }
  return 0;
});

// Virtual for total delay
tripSchema.virtual('totalDelay').get(function() {
  if (this.delays && this.delays.length > 0) {
    return this.delays.reduce((total, delay) => {
      return total + (delay.actualDelay || delay.estimatedDelay || 0);
    }, 0);
  }
  return 0;
});

// Virtual for is delayed
tripSchema.virtual('isDelayed').get(function() {
  return this.totalDelay > 15; // Consider delayed if more than 15 minutes
});

// Indexes (only for fields that don't have unique: true)
tripSchema.index({ routeId: 1, 'schedule.plannedDeparture': 1 });
tripSchema.index({ busId: 1, 'schedule.plannedDeparture': 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ 'schedule.plannedDeparture': 1 });
tripSchema.index({ driverId: 1 });
tripSchema.index({ isActive: 1 });

// Pre-save middleware
tripSchema.pre('save', function(next) {
  // Calculate total fare including surcharges
  if (this.isModified('pricing')) {
    let total = this.pricing.baseFare || 0;
    if (this.pricing.surcharges && this.pricing.surcharges.length > 0) {
      total += this.pricing.surcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);
    }
    this.pricing.totalFare = total;
  }

  // Update status history when status changes
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }

  // Calculate progress percentage based on completed stops
  if (this.isModified('routeProgress.completedStops') && this.populated('routeId')) {
    const totalStops = this.routeId.stops ? this.routeId.stops.length + 2 : 2; // Including origin and destination
    const completedStops = this.routeProgress.completedStops ? this.routeProgress.completedStops.length : 0;
    this.routeProgress.progressPercentage = Math.min((completedStops / totalStops) * 100, 100);
  }

  next();
});

// Static method to find active trips by route
tripSchema.statics.findActiveByRoute = function(routeId) {
  return this.find({
    routeId,
    status: { $in: ['scheduled', 'boarding', 'departed', 'in-transit'] },
    isActive: true
  }).populate('busId routeId');
};

// Static method to find trips by date range
tripSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'schedule.plannedDeparture': {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  }).sort({ 'schedule.plannedDeparture': 1 });
};

// Static method to find delayed trips
tripSchema.statics.findDelayedTrips = function() {
  return this.aggregate([
    {
      $match: {
        status: { $in: ['in-transit', 'delayed'] },
        isActive: true
      }
    },
    {
      $addFields: {
        totalDelay: {
          $sum: {
            $map: {
              input: '$delays',
              as: 'delay',
              in: { $ifNull: ['$$delay.actualDelay', '$$delay.estimatedDelay'] }
            }
          }
        }
      }
    },
    {
      $match: {
        totalDelay: { $gt: 15 }
      }
    }
  ]);
};

// Instance method to add passenger
tripSchema.methods.addPassenger = function(boardingStop, fare) {
  this.passengerInfo.passengers.push({
    boardingStop,
    fare,
    boardingTime: new Date()
  });
  
  this.passengerInfo.currentCount += 1;
  this.passengerInfo.revenue += fare;
  
  return this.save();
};

// Instance method to remove passenger
tripSchema.methods.removePassenger = function(passengerId, alightingStop) {
  const passenger = this.passengerInfo.passengers.id(passengerId);
  if (passenger) {
    passenger.alightingStop = alightingStop;
    passenger.alightingTime = new Date();
    this.passengerInfo.currentCount = Math.max(0, this.passengerInfo.currentCount - 1);
  }
  
  return this.save();
};

// Instance method to update status
tripSchema.methods.updateStatus = function(status, location = null, updatedBy = null, notes = null) {
  this.status = status;
  
  const statusUpdate = {
    status,
    timestamp: new Date(),
    updatedBy,
    notes
  };
  
  if (location) {
    statusUpdate.location = location;
  }
  
  this.statusHistory.push(statusUpdate);
  
  return this.save();
};

// Instance method to add delay
tripSchema.methods.addDelay = function(reason, description, estimatedDelay, location = null) {
  this.delays.push({
    reason,
    description,
    estimatedDelay,
    location,
    startTime: new Date()
  });
  
  if (!this.status === 'delayed') {
    this.status = 'delayed';
  }
  
  return this.save();
};

// Instance method to complete stop
tripSchema.methods.completeStop = function(stopName, passengersBoarded = 0, passengersAlighted = 0) {
  this.routeProgress.completedStops.push({
    stopName,
    actualTime: new Date(),
    passengersBoarded,
    passengersAlighted
  });
  
  // Update current passenger count
  this.passengerInfo.currentCount = Math.max(0, 
    this.passengerInfo.currentCount + passengersBoarded - passengersAlighted
  );
  
  return this.save();
};

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;