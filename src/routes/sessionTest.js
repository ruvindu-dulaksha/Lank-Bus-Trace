import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/session/status:
 *   get:
 *     summary: Check session and cookie status
 *     tags: [Session Management]
 *     description: Test endpoint to verify session management and cookie functionality
 *     responses:
 *       200:
 *         description: Session status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionActive:
 *                   type: boolean
 *                 cookiePresent:
 *                   type: boolean
 *                 authMethod:
 *                   type: string
 *                   enum: [jwt_cookie, jwt_bearer, api_key, none]
 *                 user:
 *                   type: object
 *                 cookies:
 *                   type: object
 *                 headers:
 *                   type: object
 */
router.get('/status', optionalAuth, asyncHandler(async (req, res) => {
  const cookieToken = req.cookies?.token;
  const bearerToken = req.headers.authorization?.startsWith('Bearer ') 
    ? req.headers.authorization.substring(7) 
    : null;
  const apiKey = req.headers['x-api-key'];
  
  let authMethod = 'none';
  if (req.user) {
    if (cookieToken) {
      authMethod = 'jwt_cookie';
    } else if (bearerToken) {
      authMethod = 'jwt_bearer';
    } else if (apiKey) {
      authMethod = 'api_key';
    }
  }

  const sessionInfo = {
    success: true,
    timestamp: new Date().toISOString(),
    sessionActive: !!req.user,
    cookiePresent: !!cookieToken,
    authMethod,
    user: req.user ? {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      lastLogout: req.user.lastLogout
    } : null,
    cookies: {
      token: cookieToken ? 'Present (hidden for security)' : 'Not present',
      count: Object.keys(req.cookies || {}).length,
      allCookies: Object.keys(req.cookies || {})
    },
    headers: {
      authorization: req.headers.authorization ? 'Present (Bearer token)' : 'Not present',
      'x-api-key': apiKey ? 'Present (API key)' : 'Not present',
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  };

  logger.info('Session status check', {
    userId: req.user?._id,
    username: req.user?.username,
    authMethod,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json(sessionInfo);
}));

/**
 * @swagger
 * /api/session/test-cookie:
 *   post:
 *     summary: Test cookie setting and retrieval
 *     tags: [Session Management]
 *     description: Test endpoint to set and verify cookies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testValue:
 *                 type: string
 *                 description: Test value to store in cookie
 *                 example: "test123"
 *     responses:
 *       200:
 *         description: Cookie test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cookieSet:
 *                   type: boolean
 *                 cookieValue:
 *                   type: string
 */
router.post('/test-cookie', asyncHandler(async (req, res) => {
  const { testValue = 'session-test-' + Date.now() } = req.body;
  
  // Set a test cookie
  res.cookie('sessionTest', testValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  // Check if previous test cookie exists
  const existingTestCookie = req.cookies?.sessionTest;

  res.json({
    success: true,
    message: 'Test cookie set successfully',
    cookieSet: true,
    cookieValue: testValue,
    previousCookie: existingTestCookie || 'None',
    cookieSettings: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: '5 minutes'
    },
    allCookies: Object.keys(req.cookies || {}),
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/session/auth-test:
 *   get:
 *     summary: Test authenticated session
 *     tags: [Session Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - apiKeyAuth: []
 *     description: Test endpoint that requires authentication to verify session management
 *     responses:
 *       200:
 *         description: Authenticated session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 sessionDetails:
 *                   type: object
 *       401:
 *         description: Authentication required
 */
router.get('/auth-test', authenticate, asyncHandler(async (req, res) => {
  const sessionDetails = {
    authenticationTime: new Date().toISOString(),
    authMethod: req.cookies?.token ? 'cookie' : 
                req.headers.authorization ? 'bearer' : 
                req.headers['x-api-key'] ? 'api-key' : 'unknown',
    sessionValid: true,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    origin: req.headers.origin
  };

  logger.info('Authenticated session test', {
    userId: req.user._id,
    username: req.user.username,
    role: req.user.role,
    authMethod: sessionDetails.authMethod,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Authentication successful - session is working correctly',
    authenticated: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    },
    sessionDetails
  });
}));

/**
 * @swagger
 * /api/session/clear:
 *   post:
 *     summary: Clear all session cookies
 *     tags: [Session Management]
 *     description: Clear all cookies and session data for testing purposes
 *     responses:
 *       200:
 *         description: Session cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 clearedCookies:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/clear', asyncHandler(async (req, res) => {
  const cookieNames = Object.keys(req.cookies || {});
  
  // Clear all cookies
  cookieNames.forEach(cookieName => {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  });

  // Specifically clear auth token
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  // Clear test cookie
  res.clearCookie('sessionTest', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  logger.info('Session cookies cleared', {
    clearedCookies: cookieNames,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'All session cookies cleared successfully',
    clearedCookies: [...cookieNames, 'token', 'sessionTest'],
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/session/refresh-test:
 *   post:
 *     summary: Test token refresh mechanism
 *     tags: [Session Management]
 *     description: Test the token refresh functionality
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to test
 *     responses:
 *       200:
 *         description: Token refresh test results
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-test', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required for testing',
      test: 'refresh-mechanism',
      timestamp: new Date().toISOString()
    });
  }

  // This would typically call the refresh token logic
  // For testing purposes, we'll just validate the format
  const isValidFormat = refreshToken.length > 10 && typeof refreshToken === 'string';
  
  res.json({
    success: true,
    message: 'Refresh token test completed',
    test: 'refresh-mechanism',
    tokenFormat: isValidFormat ? 'valid' : 'invalid',
    tokenLength: refreshToken.length,
    note: 'Use /api/auth/refresh for actual token refresh',
    timestamp: new Date().toISOString()
  });
}));

export default router;