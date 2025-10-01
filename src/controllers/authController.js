import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role = 'commuter' } = req.body;

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
    role
  });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  logger.info(`New user registered: ${username} (${role})`);

  res.status(201).json({
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
  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findByCredentials(emailOrUsername, password);
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    logger.info(`User logged in: ${user.username}`);

    res.json({
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