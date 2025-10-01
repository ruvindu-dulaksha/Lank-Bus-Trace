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
    .notEmpty()
    .withMessage('Email or username is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Email or username must be between 3 and 100 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'commuter'])
    .withMessage('Role must be admin, operator, or commuter'),
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
    .isLength({ min: 2, max: 100 })
    .withMessage('Origin must be between 2 and 100 characters'),
  query('destination')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),
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