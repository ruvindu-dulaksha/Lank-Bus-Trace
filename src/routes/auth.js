import express from 'express';
import { 
  register, 
  login, 
  generateAPIKey, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} from '../controllers/authController.js';
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
 *                 enum: [admin, operator, commuter]
 *                 default: commuter
 *                 description: User role
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
 *     summary: Login user
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
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
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

export default router;