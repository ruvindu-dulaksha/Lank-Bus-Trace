import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in query results by default
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'operator', 'commuter'],
      message: 'Role must be either admin, operator, or commuter'
    },
    default: 'commuter'
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+94|0)[0-9]{9}$/, 'Please enter a valid Sri Lankan phone number']
    },
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String
    }
  },
  operatorDetails: {
    licenseNumber: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    ntcRegistrationNumber: {
      type: String,
      trim: true
    },
    assignedRoutes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    }],
    assignedBuses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    }]
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ apiKey: 1 });
userSchema.index({ 'operatorDetails.assignedRoutes': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds from env or default to 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(emailOrUsername, password) {
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername }
    ],
    isActive: true
  }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Static method to cleanup expired refresh tokens
userSchema.statics.cleanupExpiredTokens = function() {
  return this.updateMany(
    { 'refreshTokens.expiresAt': { $lt: new Date() } },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  
  // Hash the token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiration time (15 minutes)
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  
  return resetToken;
};

// Instance method to reset password
userSchema.methods.resetPassword = async function(newPassword) {
  this.password = newPassword;
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;