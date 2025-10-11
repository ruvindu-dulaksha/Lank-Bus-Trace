import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import logger from '../config/logger.js';

// Forgot password rate limiting - strict limits to prevent abuse
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after 15 minutes.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for forgot password: ${req.ip}`);
    res.status(options.statusCode || 429).json(options.message);
  }
});

// Login rate limiting - prevent brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res, next, options) => {
    logger.warn(`Login rate limit exceeded: ${req.ip}`);
    res.status(options.statusCode || 429).json(options.message);
  }
});

// Registration rate limiting
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 registration requests per hour
  message: {
    success: false,
    message: 'Too many registration attempts from this IP. Please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res, next, options) => {
    logger.warn(`Registration rate limit exceeded: ${req.ip}`);
    res.status(options.statusCode || 429).json(options.message);
  }
});

// Password reset attempts rate limiting
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 reset attempts per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP. Please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  trustProxy: true,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res, next, options) => {
    logger.warn(`Password reset rate limit exceeded: ${req.ip}`);
    res.status(options.statusCode || 429).json(options.message);
  }
});

// Slow down middleware for authentication endpoints
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // Allow 5 requests per windowMs at full speed
  delayMs: (used, req) => (used - 5) * 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

// Email-based rate limiting (to prevent email bombing)
export const createEmailRateLimiter = () => {
  const emailAttempts = new Map();

  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const email = req.body.email?.toLowerCase();
    if (!email) {
      return next();
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxAttempts = 3; // Max 3 password reset emails per hour per email

    // Clean up old entries
    for (const [key, data] of emailAttempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        emailAttempts.delete(key);
      }
    }

    // Check current email attempts
    const emailData = emailAttempts.get(email);
    
    if (emailData) {
      if (emailData.attempts >= maxAttempts) {
        logger.warn(`Email rate limit exceeded for: ${email}`);
        return res.status(429).json({
          success: false,
          message: 'Too many password reset requests for this email. Please try again after 1 hour.',
          retryAfter: Math.ceil((emailData.firstAttempt + windowMs - now) / 1000)
        });
      }
      emailData.attempts++;
    } else {
      emailAttempts.set(email, {
        attempts: 1,
        firstAttempt: now
      });
    }

    next();
  };
};

// Global rate limiting for all API endpoints
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  trustProxy: true, // Essential for Nginx proxy
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

export const emailRateLimiter = createEmailRateLimiter();