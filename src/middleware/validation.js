import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

// Handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      errorCount: formattedErrors.length
    });
  }
  
  next();
};

// Common validation rules
export const validateObjectId = (field) => {
  return param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`);
};

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  handleValidationErrors
];

// Authentication validations
export const validateLogin = [
  body('emailOrUsername')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Email or username must be between 3 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  // Custom validation to ensure either email or emailOrUsername is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.emailOrUsername) {
      throw new Error('Either email or emailOrUsername is required');
    }
    return true;
  }),
  handleValidationErrors
];

export const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'commuter'])
    .withMessage('Role must be admin, operator, or commuter'),
  handleValidationErrors
];

// Password reset validations
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Reset token must be at least 10 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  handleValidationErrors
];

// User profile validations
export const validateUserProfile = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('profile.phone')
    .optional()
    .matches(/^(\+94|0)[0-9]{9}$/)
    .withMessage('Please provide a valid Sri Lankan phone number'),
  handleValidationErrors
];

// Location validations
export const validateCoordinates = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('GPS accuracy must be a positive number'),
  handleValidationErrors
];

export const validateLocationUpdate = [
  body('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('speed')
    .optional()
    .isFloat({ min: 0, max: 120 })
    .withMessage('Speed must be between 0 and 120 km/h'),
  body('heading')
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage('Heading must be between 0 and 360 degrees'),
  handleValidationErrors
];

// Bus validations
export const validateBusCreate = [
  body('registrationNumber')
    .notEmpty()
    .withMessage('Registration number is required')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{2,3}-\d{4}$/)
    .withMessage('Registration number must be in format XX-1234 or XXX-1234'),
  body('busNumber')
    .notEmpty()
    .withMessage('Bus number is required')
    .trim()
    .toUpperCase()
    .matches(/^B\d{3,4}$/)
    .withMessage('Bus number must be in format B001 or B0001'),
  body('operatorInfo.operatorName')
    .notEmpty()
    .withMessage('Operator name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Operator name cannot exceed 200 characters'),
  body('vehicleDetails.make')
    .notEmpty()
    .withMessage('Vehicle make is required'),
  body('vehicleDetails.model')
    .notEmpty()
    .withMessage('Vehicle model is required'),
  body('vehicleDetails.year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Vehicle year must be between 1990 and current year'),
  body('capacity.seated')
    .isInt({ min: 20, max: 80 })
    .withMessage('Seated capacity must be between 20 and 80'),
  body('busType')
    .isIn(['standard', 'semi-luxury', 'luxury', 'super-luxury', 'express'])
    .withMessage('Invalid bus type'),
  handleValidationErrors
];

// Route validations
export const validateRouteCreate = [
  body('routeNumber')
    .notEmpty()
    .withMessage('Route number is required')
    .trim()
    .toUpperCase()
    .matches(/^R\d{3,4}$/)
    .withMessage('Route number must be in format R001 or R0001'),
  body('routeName')
    .notEmpty()
    .withMessage('Route name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Route name cannot exceed 200 characters'),
  body('origin.city')
    .notEmpty()
    .withMessage('Origin city is required'),
  body('destination.city')
    .notEmpty()
    .withMessage('Destination city is required'),
  body('origin.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Origin latitude must be between -90 and 90'),
  body('origin.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Origin longitude must be between -180 and 180'),
  body('destination.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Destination latitude must be between -90 and 90'),
  body('destination.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Destination longitude must be between -180 and 180'),
  body('distance')
    .isFloat({ min: 1 })
    .withMessage('Distance must be at least 1 kilometer'),
  body('estimatedDuration')
    .isInt({ min: 15 })
    .withMessage('Estimated duration must be at least 15 minutes'),
  handleValidationErrors
];

// Trip validations
export const validateTripCreate = [
  body('routeId')
    .isMongoId()
    .withMessage('Route ID must be a valid MongoDB ObjectId'),
  body('busId')
    .isMongoId()
    .withMessage('Bus ID must be a valid MongoDB ObjectId'),
  body('schedule.plannedDeparture')
    .isISO8601()
    .withMessage('Planned departure must be in ISO 8601 format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Planned departure must be in the future');
      }
      return true;
    }),
  body('schedule.plannedArrival')
    .isISO8601()
    .withMessage('Planned arrival must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.schedule?.plannedDeparture)) {
        throw new Error('Planned arrival must be after planned departure');
      }
      return true;
    }),
  body('pricing.baseFare')
    .isFloat({ min: 0 })
    .withMessage('Base fare must be a positive number'),
  handleValidationErrors
];

// Search and filter validations
export const validateNearbyQuery = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Radius must be between 0 and 50000 meters'),
  handleValidationErrors
];

export const validateLocationSearch = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 kilometers'),
  handleValidationErrors
];

export const validateRouteSearch = [
  query('origin')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Origin must be between 1 and 100 characters'),
  query('destination')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Destination must be between 1 and 100 characters'),
  query('from')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('From location must be between 1 and 100 characters'),
  query('to')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('To location must be between 1 and 100 characters'),
  query('passengerAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Passenger age must be between 0 and 120'),
  query('passengers')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Number of passengers must be between 1 and 50'),
  query('busType')
    .optional()
    .isIn(['standard', 'semi-luxury', 'luxury', 'super-luxury', 'express'])
    .withMessage('Invalid bus type'),
  query('departureTime')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Departure time must be morning, afternoon, evening, or night'),
  query('minDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum distance must be a positive number'),
  query('maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum distance must be a positive number'),
  handleValidationErrors
];

// Status update validations
export const validateStatusUpdate = [
  body('status')
    .isIn(['scheduled', 'boarding', 'departed', 'in-transit', 'arrived', 'completed', 'cancelled', 'delayed'])
    .withMessage('Invalid status value'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

// Delay reporting validations
export const validateDelayReport = [
  body('reason')
    .isIn(['traffic', 'weather', 'mechanical', 'accident', 'road-work', 'fuel', 'other'])
    .withMessage('Invalid delay reason'),
  body('description')
    .notEmpty()
    .withMessage('Delay description is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('estimatedDelay')
    .isInt({ min: 1 })
    .withMessage('Estimated delay must be at least 1 minute'),
  handleValidationErrors
];

// Generic sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

// Season validation
export const validateSeasonCreate = [
  body('name')
    .notEmpty()
    .withMessage('Season name is required')
    .isLength({ max: 100 })
    .withMessage('Season name cannot exceed 100 characters'),
  body('type')
    .isIn(['peak', 'off_peak', 'festival', 'holiday', 'normal'])
    .withMessage('Season type must be: peak, off_peak, festival, holiday, or normal'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('priceMultiplier')
    .isFloat({ min: 0.1, max: 5.0 })
    .withMessage('Price multiplier must be between 0.1 and 5.0'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Priority must be between 1 and 100'),
  body('applicableRoutes')
    .optional()
    .isArray()
    .withMessage('Applicable routes must be an array'),
  body('applicableBusTypes')
    .optional()
    .isArray()
    .withMessage('Applicable bus types must be an array'),
  body('days')
    .optional()
    .isArray()
    .withMessage('Days must be an array'),
  handleValidationErrors
];

// User validation
export const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('fullName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'commuter', 'driver'])
    .withMessage('Role must be admin, operator, commuter, or driver'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Pricing validation rules
export const validatePricingCalculation = [
  query('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Base price must be a positive number'),
  query('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Age must be between 0 and 120'),
  handleValidationErrors
];

export const validatePricingRule = [
  body('name')
    .notEmpty()
    .withMessage('Pricing rule name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('type')
    .notEmpty()
    .withMessage('Pricing rule type is required')
    .isIn(['age_discount', 'standard'])
    .withMessage('Type must be either age_discount or standard'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('ageDiscount.minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be 0 or greater'),
  body('ageDiscount.maxAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Maximum age must be between 0 and 120'),
  body('ageDiscount.discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

export const validatePricingRuleUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isIn(['age_discount', 'standard'])
    .withMessage('Type must be either age_discount or standard'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('ageDiscount.minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be 0 or greater'),
  body('ageDiscount.maxAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Maximum age must be between 0 and 120'),
  body('ageDiscount.discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be between 1 and 10'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];