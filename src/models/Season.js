import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Season name is required'],
    trim: true,
    maxlength: [100, 'Season name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Season type is required'],
    enum: {
      values: ['peak', 'off_peak', 'festival', 'holiday', 'normal'],
      message: 'Season type must be: peak, off_peak, festival, holiday, or normal'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  priceMultiplier: {
    type: Number,
    required: [true, 'Price multiplier is required'],
    min: [0.1, 'Price multiplier must be at least 0.1'],
    max: [5.0, 'Price multiplier cannot exceed 5.0'],
    default: 1.0
  },
  applicableRoutes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    routeNumber: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  applicableBusTypes: [{
    type: String,
    enum: ['standard', 'luxury', 'semi_luxury', 'air_conditioned', 'super_luxury']
  }],
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  timeSlots: [{
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [100, 'Priority cannot exceed 100']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    totalRoutes: {
      type: Number,
      default: 0
    },
    averageImpact: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
seasonSchema.index({ startDate: 1, endDate: 1 });
seasonSchema.index({ type: 1, isActive: 1 });
seasonSchema.index({ priority: -1 });
seasonSchema.index({ 'applicableRoutes.routeId': 1 });

// Add pagination plugin
seasonSchema.plugin(mongoosePaginate);

// Virtuals
seasonSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

seasonSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

seasonSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (now > this.endDate) return 0;
  if (now < this.startDate) return Math.ceil((this.startDate - now) / (1000 * 60 * 60 * 24));
  return Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
});

// Validation
seasonSchema.pre('validate', function(next) {
  if (this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Pre-save middleware
seasonSchema.pre('save', function(next) {
  this.metadata.lastUpdated = new Date();
  this.metadata.totalRoutes = this.applicableRoutes.length;
  next();
});

// Static methods
seasonSchema.statics.findActiveSeasons = function(date = new Date()) {
  return this.find({
    isActive: true,
    startDate: { $lte: date },
    endDate: { $gte: date }
  }).sort({ priority: -1 });
};

seasonSchema.statics.findBySeason = function(seasonType) {
  return this.find({ type: seasonType, isActive: true });
};

seasonSchema.statics.getApplicableMultiplier = async function(routeId, busType, date = new Date()) {
  const seasons = await this.findActiveSeasons(date);
  
  let maxMultiplier = 1.0;
  
  for (const season of seasons) {
    // Check if route is applicable
    const routeApplies = season.applicableRoutes.length === 0 || 
      season.applicableRoutes.some(route => 
        route.routeId.toString() === routeId.toString() && route.isActive
      );
    
    // Check if bus type is applicable
    const busTypeApplies = season.applicableBusTypes.length === 0 || 
      season.applicableBusTypes.includes(busType);
    
    // Check if current day is applicable
    const currentDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayApplies = season.days.length === 0 || season.days.includes(currentDay);
    
    if (routeApplies && busTypeApplies && dayApplies) {
      maxMultiplier = Math.max(maxMultiplier, season.priceMultiplier);
    }
  }
  
  return maxMultiplier;
};

export default mongoose.model('Season', seasonSchema);