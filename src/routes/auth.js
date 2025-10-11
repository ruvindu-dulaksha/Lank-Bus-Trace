import express from 'express';
import { 
  register, 
  login, 
  generateAPIKey, 
  forgotPassword, 
  resetPassword, 
  changePassword,
  logout,
  refreshToken,
  getBlacklistStats,
  clearBlacklist
} from '../controllers/authController.js';
import {
  getCurrentUser,
  updateProfile
} from '../controllers/userController.js';
import { 
  validateLogin, 
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  emailRateLimiter,
  authSlowDown
} from '../middleware/rateLimiting.js';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Username (letters, numbers, underscore, hyphen only)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (must contain uppercase, lowercase, and number)
 *               role:
 *                 type: string
 *                 enum: [commuter]
 *                 default: commuter
 *                 description: User role (admin and operator roles require system administrator approval)
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       429:
 *         description: Too many registration attempts
 */
router.post('/register', registerLimiter, authSlowDown, validateRegister, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with JWT token and cookie support
 *     description: Authenticate user and receive JWT token. Response sets both token in body and httpOnly cookie for dual authentication support.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *               - password
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: Email address or username
 *                 example: "your_username"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "your_password"
 *           examples:
 *             valid_user:
 *               summary: Sample user credentials
 *               value:
 *                 emailOrUsername: "your_username"
 *                 password: "your_password"
 *             email_login:
 *               summary: Login with email
 *               value:
 *                 emailOrUsername: "user@example.com"
 *                 password: "your_password"
 *     responses:
 *       200:
 *         description: Login successful - JWT token returned and cookie set
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie (24h expiration)
 *             schema:
 *               type: string
 *               example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Lax; Max-Age=86400"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT token for Bearer authentication
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU5ZmNlZmFjNzVmYzJiMzAxODY4NjQiLCJpYXQiOjE3NjAxNzQ5NzksImV4cCI6MTc2MDI2MTM3OX0.nS_wyUKdr0d94cV4ncao8lmYIjPNJxQuTNs8h3L5SVY"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       429:
 *         description: Too many login attempts (rate limited)
 */
router.post('/login', loginLimiter, authSlowDown, validateLogin, login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset via email
 *     tags: [Authentication]
 *     description: Send password reset instructions to user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the account
 *     responses:
 *       200:
 *         description: Password reset instructions sent (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset instructions have been sent to your email address."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                       example: "15 minutes"
 *       429:
 *         description: Too many password reset requests
 *       500:
 *         description: Email service error
 */
router.post('/forgot-password', 
  forgotPasswordLimiter, 
  emailRateLimiter, 
  validateForgotPassword, 
  forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token from email
 *     tags: [Authentication]
 *     description: Reset password using the token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received via email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (must contain uppercase, lowercase, and number)
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       429:
 *         description: Too many reset attempts
 */
router.post('/reset-password', resetPasswordLimiter, validateResetPassword, resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (for logged in users)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Change password for currently authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (must be different from current)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Authentication required
 */
router.post('/change-password', authenticate, validateChangePassword, changePassword);

/**
 * @swagger
 * /auth/api-key:
 *   post:
 *     summary: Generate API key
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Generate API key for admin/operator users
 *     responses:
 *       200:
 *         description: API key generated successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/api-key', authenticate, generateAPIKey);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Logout current user and invalidate refresh token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate (optional)
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Authentication required
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Get new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Get current authenticated user's profile information
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Authentication required
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Update current user's profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @swagger
 * /auth/blacklist-stats:
 *   get:
 *     summary: Get token blacklist statistics (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Get statistics about blacklisted tokens for monitoring purposes
 *     responses:
 *       200:
 *         description: Blacklist statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBlacklistedTokens:
 *                       type: number
 *                     lastCleanup:
 *                       type: string
 *                       format: date-time
 *                     memoryUsage:
 *                       type: object
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Authentication required
 */
router.get('/blacklist-stats', authenticate, getBlacklistStats);

/**
 * @swagger
 * /auth/clear-blacklist:
 *   post:
 *     summary: Clear token blacklist (Admin only - Emergency use)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Clear all blacklisted tokens - use only in emergency situations
 *     responses:
 *       200:
 *         description: Blacklist cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     clearedTokens:
 *                       type: number
 *                     clearedBy:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Authentication required
 */
router.post('/clear-blacklist', authenticate, clearBlacklist);

export default router;