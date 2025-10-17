import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';
import tokenBlacklistService from '../services/tokenBlacklistService.js';

// JWT Authentication Middleware
export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token; // Get token from cookie
    
    let token = null;
    
    // Check for Bearer token first, then cookie
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (cookieToken) {
      token = cookieToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please provide a valid Bearer token in the Authorization header or login cookie.'
      });
    }

    // Check if token is blacklisted (logged out)
    if (tokenBlacklistService.isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please log in again.',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token payload
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Add user info to request object
    req.user = user;
    next();

  } catch (error) {
    logger.error('JWT Authentication Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Please refresh your token.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token format.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication service error.'
    });
  }
};

// API Key Authentication Middleware
export const authenticateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required. Please provide X-API-Key header.'
      });
    }

    // Find user by API key
    const user = await User.findOne({ 
      apiKey, 
      isActive: true,
      role: { $in: ['admin', 'operator'] } // Only admin and operators can use API keys
    }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }

    // Add user info to request object
    req.user = user;
    next();

  } catch (error) {
    logger.error('API Key Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.'
    });
  }
};

// Combined authentication middleware (JWT or API Key)
export const authenticate = (req, res, next) => {
  // Check if API key is provided
  if (req.headers['x-api-key']) {
    return authenticateAPIKey(req, res, next);
  }
  
  // Otherwise, use JWT authentication
  return authenticateJWT(req, res, next);
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Operator-specific authorization (must be assigned to specific routes/buses)
export const authorizeOperator = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Allow admins full access
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      if (!req.user || req.user.role !== 'operator') {
        return res.status(403).json({
          success: false,
          message: 'Operator access required.'
        });
      }

      const resourceId = req.params.id || req.params.routeId || req.params.busId;
      
      if (!resourceId) {
        return next(); 
        // Let the route handler validate the resource
      }

      // Check if operator has access to the specific resource
      let hasAccess = false;
      
      if (resourceType === 'route') {
        hasAccess = req.user.operatorDetails?.assignedRoutes?.some(
          routeId => routeId.toString() === resourceId
        );
      } else if (resourceType === 'bus') {
        hasAccess = req.user.operatorDetails?.assignedBuses?.some(
          busId => busId.toString() === resourceId
        );
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `You are not authorized to access this ${resourceType}.`
        });
      }

      next();

    } catch (error) {
      logger.error('Operator Authorization Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization service error.'
      });
    }
  };
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey) {
      const user = await User.findOne({ 
        apiKey, 
        isActive: true 
      }).select('-password');
      
      if (user) {
        req.user = user;
      }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (tokenError) {
        // Ignore token errors for optional auth
        logger.debug('Optional auth token error (ignored):', tokenError.message);
      }
    }
    
    next();

  } catch (error) {
    // For optional auth, we don't return errors
    logger.debug('Optional auth error (ignored):', error.message);
    next();
  }
};

// Rate limiting by user/IP
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (requests.has(identifier)) {
      const userRequests = requests.get(identifier);
      const validRequests = userRequests.filter(time => time > windowStart);
      requests.set(identifier, validRequests);
    } else {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

// Middleware to log authentication events
export const logAuthEvents = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (req.user) {
      logger.info(`Auth Event - User: ${req.user.username} (${req.user.role}) accessed ${req.method} ${req.originalUrl}`, {
        userId: req.user._id,
        username: req.user.username,
        role: req.user.role,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};
