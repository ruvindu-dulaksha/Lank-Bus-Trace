import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import emailService from '../services/emailService.js';
import tokenBlacklistService from '../services/tokenBlacklistService.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Centralized cookie options helper
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role = 'commuter' } = req.body;

  // Security: Restrict role assignment to prevent unauthorized admin creation
  const allowedRoles = ['commuter'];
  const userRole = allowedRoles.includes(role) ? role : 'commuter';
  
  if (role && role !== userRole) {
    logger.warn(`Registration attempt with restricted role: ${role}`, {
      username,
      email,
      attemptedRole: role,
      ip: req.ip
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or username already exists'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: userRole  // Use sanitized role
  });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  logger.info(`New user registered: ${username} (${role})`);

  res.status(201).cookie('token', token, getCookieOptions()).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  let { emailOrUsername, email, password } = req.body;
  
  // Use emailOrUsername if provided, otherwise use email
  const loginIdentifier = emailOrUsername || email;
  
  if (!loginIdentifier) {
    return res.status(400).json({
      success: false,
      message: 'Email or username is required'
    });
  }

  try {
    const user = await User.findByCredentials(loginIdentifier, password);
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    logger.info(`User logged in: ${user.username}`);

    res.cookie('token', token, getCookieOptions()).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Generate API key
// @route   POST /api/auth/api-key
// @access  Private (Admin/Operator only)
export const generateAPIKey = asyncHandler(async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only administrators and operators can generate API keys'
    });
  }

  const apiKey = `ntc_${uuidv4().replace(/-/g, '')}`;
  
  req.user.apiKey = apiKey;
  await req.user.save();

  res.json({
    success: true,
    message: 'API key generated successfully',
    data: {
      apiKey,
      note: 'Store this API key securely. It will not be shown again.'
    }
  });
});

// @desc    Forgot password - Send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    isActive: true 
  });

  if (!user) {
    // For security, always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send email with reset token
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.username || user.fullName
    );

    if (emailResult.success) {
      logger.info(`Password reset email sent to: ${user.email}`);
      
      res.json({
        success: true,
        message: 'Password reset instructions have been sent to your email address.',
        data: {
          email: user.email,
          expiresIn: '15 minutes',
          // In development, include the token for testing
          ...(process.env.NODE_ENV === 'development' && { 
            resetToken,
            note: 'Reset token included for development testing only'
          })
        }
      });
    } else {
      // If email fails, clear the reset token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`Failed to send password reset email to: ${user.email}`, emailResult.error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      });
    }
  } catch (error) {
    // If email fails, clear the reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Password reset email error for: ${user.email}`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset email. Please try again later.'
    });
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash the provided token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    isActive: true
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Password reset token is invalid or has expired'
    });
  }

  // Set the new password
  await user.resetPassword(password);

  logger.info(`Password reset completed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.'
  });
});

// @desc    Change password (for logged in users)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.username}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Get token from cookie or Authorization header
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  const currentToken = cookieToken || bearerToken;

  if (currentToken) {
    try {
      // Decode token to get expiration time
      const decoded = jwt.decode(currentToken);
      
      if (decoded && decoded.exp) {
        // Add token to blacklist
        tokenBlacklistService.blacklistToken(currentToken, decoded.exp);
        
        logger.info(`Token blacklisted on logout: ${req.user.username}`, {
          userId: req.user._id,
          tokenExpiry: new Date(decoded.exp * 1000).toISOString()
        });
      }
    } catch (error) {
      logger.error('Error blacklisting token on logout:', error);
      // Continue with logout even if blacklisting fails
    }
  }

  // Remove the specific refresh token if provided
  if (refreshToken) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { refreshTokens: refreshToken } }
    );
  }

  // Update last logout time
  await User.findByIdAndUpdate(
    req.user._id,
    { lastLogout: new Date() }
  );

  logger.info(`User logged out: ${req.user.username}`);

  // Clear the authentication cookie using same attributes (except maxAge)
  const clearOpts = Object.assign({}, getCookieOptions());
  delete clearOpts.maxAge;
  res.clearCookie('token', clearOpts).status(200).json({
    success: true,
    message: 'Logged out successfully',
    tokenInvalidated: !!currentToken
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Optionally generate new refresh token and rotate
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

/**
 * @desc    Get token blacklist statistics (Admin only)
 * @route   GET /api/auth/blacklist-stats
 * @access  Private (Admin only)
 */
export const getBlacklistStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const stats = tokenBlacklistService.getStats();
  
  res.json({
    success: true,
    message: 'Token blacklist statistics retrieved',
    data: {
      ...stats,
      currentUser: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
});

/**
 * @desc    Clear token blacklist (Admin only - Emergency use)
 * @route   POST /api/auth/clear-blacklist
 * @access  Private (Admin only)
 */
export const clearBlacklist = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Use the TokenBlacklistService method to clear the blacklist and return the result
  const result = tokenBlacklistService.clearBlacklist(req.user._id);

  logger.warn(`Token blacklist cleared by admin: ${req.user.username}`, {
    adminId: req.user._id,
    clearedTokens: result.clearedTokens,
    timestamp: result.timestamp
  });

  res.json({
    success: true,
    message: 'Token blacklist cleared successfully',
    data: result
  });
});