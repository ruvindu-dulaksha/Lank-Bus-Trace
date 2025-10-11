import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pricing rule name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Pricing rule type is required'],
    enum: {
      values: ['age_discount', 'standard'],
      message: 'Type must be: age_discount or standard'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Age-based discount configuration
  ageDiscount: {
    minAge: {
      type: Number,
      min: [0, 'Minimum age cannot be negative']
    },
    maxAge: {
      type: Number,
      max: [100, 'Maximum age cannot exceed 100']
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%']
    }
  },
  // General settings
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount multiplier
pricingRuleSchema.virtual('discountMultiplier').get(function() {
  if (this.type === 'age_discount' && this.ageDiscount?.discountPercentage) {
    return (100 - this.ageDiscount.discountPercentage) / 100;
  }
  return 1.0;
});

// Static method to get pricing for age
pricingRuleSchema.statics.getPricingForAge = async function(age = null) {
  try {
    // Get active pricing rules
    const rules = await this.find({ 
      isActive: true,
      type: 'age_discount'
    }).sort({ priority: -1 });

    let applicableRule = null;
    let multiplier = 1.0; // Standard price by default

    if (age !== null && age !== undefined) {
      // Find applicable age discount rule
      for (const rule of rules) {
        if (rule.ageDiscount?.minAge !== undefined && 
            rule.ageDiscount?.maxAge !== undefined) {
          if (age >= rule.ageDiscount.minAge && age <= rule.ageDiscount.maxAge) {
            applicableRule = rule;
            multiplier = rule.discountMultiplier;
            break;
          }
        }
      }
    }

    return {
      success: true,
      data: {
        age: age,
        multiplier: multiplier,
        appliedRule: applicableRule ? {
          id: applicableRule._id,
          name: applicableRule.name,
          discountPercentage: applicableRule.ageDiscount?.discountPercentage || 0,
          description: applicableRule.description
        } : null,
        priceType: applicableRule ? 'discounted' : 'standard'
      }
    };
  } catch (error) {
    throw new Error(`Error calculating pricing: ${error.message}`);
  }
};

// Static method to calculate final price
pricingRuleSchema.statics.calculatePrice = async function(basePrice, age = null) {
  try {
    const pricingInfo = await this.getPricingForAge(age);
    const finalPrice = Math.round(basePrice * pricingInfo.data.multiplier);
    
    return {
      success: true,
      data: {
        basePrice: basePrice,
        finalPrice: finalPrice,
        savings: basePrice - finalPrice,
        ...pricingInfo.data
      }
    };
  } catch (error) {
    throw new Error(`Error calculating final price: ${error.message}`);
  }
};

// Index for efficient queries
pricingRuleSchema.index({ type: 1, isActive: 1 });
pricingRuleSchema.index({ priority: -1 });
pricingRuleSchema.index({ 'ageDiscount.minAge': 1, 'ageDiscount.maxAge': 1 });

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);

export default PricingRule;