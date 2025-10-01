import logger from '../config/logger.js';

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error Handler:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Mongoose connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    error = {
      message: 'Database connection error',
      statusCode: 500
    };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  
  logger.warn('404 Error:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: 'Please check the API documentation at /api-docs for available endpoints'
  });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const handleValidationError = (errors) => {
  const formattedErrors = errors.map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));

  throw new AppError('Validation failed', 400, true, formattedErrors);
};

// Database error handler
export const handleDBError = (error) => {
  logger.error('Database Error:', error);
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    throw new AppError(`${field} already exists`, 400);
  }
  
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(e => e.message).join(', ');
    throw new AppError(message, 400);
  }
  
  throw new AppError('Database operation failed', 500);
};

// Security error handler
export const handleSecurityError = (type, details = {}) => {
  logger.warn('Security Event:', {
    type,
    ...details,
    timestamp: new Date().toISOString()
  });

  switch (type) {
    case 'INVALID_API_KEY':
      throw new AppError('Invalid API key provided', 401);
    case 'EXPIRED_TOKEN':
      throw new AppError('Token has expired', 401);
    case 'INSUFFICIENT_PERMISSIONS':
      throw new AppError('Insufficient permissions for this operation', 403);
    case 'ACCOUNT_LOCKED':
      throw new AppError('Account is locked due to security reasons', 423);
    case 'SUSPICIOUS_ACTIVITY':
      throw new AppError('Suspicious activity detected', 429);
    default:
      throw new AppError('Security validation failed', 403);
  }
};

// Middleware to handle specific error types
export const handleSpecificErrors = (req, res, next) => {
  // Handle common API errors
  const originalSend = res.send;
  
  res.send = function(data) {
    // Intercept specific error patterns and provide better messages
    if (res.statusCode >= 400) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (parsedData.message) {
          // Enhance error messages based on context
          if (req.originalUrl.includes('/auth/') && res.statusCode === 401) {
            parsedData.suggestion = 'Please check your credentials and try again';
          } else if (req.originalUrl.includes('/locations/') && res.statusCode === 400) {
            parsedData.suggestion = 'Please verify coordinate values are within valid ranges';
          } else if (res.statusCode === 404) {
            parsedData.suggestion = 'Check the resource ID and ensure it exists';
          }
        }
        
        return originalSend.call(this, parsedData);
      } catch (parseError) {
        // If parsing fails, send original data
        return originalSend.call(this, data);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};