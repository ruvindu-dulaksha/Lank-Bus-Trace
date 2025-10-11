import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    isActive,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Manual pagination implementation
  const totalDocs = await User.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / parseInt(limit));
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const users = await User.find(query)
    .select('-password -refreshTokens -passwordResetToken -passwordResetExpires')
    .populate({
      path: 'operatorDetails.assignedRoutes operatorDetails.assignedBuses',
      select: 'routeNumber routeName registrationNumber busNumber'
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Add additional user stats
  const usersWithStats = users.map(user => ({
    ...user.toObject(),
    accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
    lastActiveAgo: user.lastLogin ? Math.floor((new Date() - user.lastLogin) / (1000 * 60 * 60 * 24)) : null,
    hasApiKey: !!user.apiKey
  }));

  res.status(200).json({
    success: true,
    data: usersWithStats,
    pagination: {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalItems: totalDocs,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens -passwordResetToken -passwordResetExpires')
    .populate('operatorDetails.assignedRoutes', 'routeNumber routeName origin destination')
    .populate('operatorDetails.assignedBuses', 'registrationNumber busNumber busType');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const userData = {
    ...user.toObject(),
    accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
    lastActiveAgo: user.lastLogin ? Math.floor((new Date() - user.lastLogin) / (1000 * 60 * 60 * 24)) : null,
    hasApiKey: !!user.apiKey,
    totalRefreshTokens: user.refreshTokens ? user.refreshTokens.length : 0
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens -passwordResetToken -passwordResetExpires')
    .populate('operatorDetails.assignedRoutes', 'routeNumber routeName origin destination')
    .populate('operatorDetails.assignedBuses', 'registrationNumber busNumber busType');

  const userData = {
    ...user.toObject(),
    accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
    lastActiveAgo: user.lastLogin ? Math.floor((new Date() - user.lastLogin) / (1000 * 60 * 60 * 24)) : null,
    hasApiKey: !!user.apiKey
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { password, role, ...updateData } = req.body;

  // Don't allow updating password through this endpoint
  if (password) {
    return res.status(400).json({
      success: false,
      message: 'Use change password endpoint to update password'
    });
  }

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // If role is being changed, handle operator details
  if (role && role !== user.role) {
    if (role === 'operator' && !updateData.operatorDetails) {
      updateData.operatorDetails = {
        assignedRoutes: [],
        assignedBuses: []
      };
    } else if (role !== 'operator') {
      updateData.operatorDetails = undefined;
    }
    updateData.role = role;
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens -passwordResetToken -passwordResetExpires')
   .populate('operatorDetails.assignedRoutes', 'routeNumber routeName')
   .populate('operatorDetails.assignedBuses', 'registrationNumber busNumber');

  logger.info(`User updated: ${user.username} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user,
    message: 'User updated successfully'
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { password, role, email, ...updateData } = req.body;

  // Users cannot change their own role or email through this endpoint
  if (password) {
    return res.status(400).json({
      success: false,
      message: 'Use change password endpoint to update password'
    });
  }

  if (role && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You cannot change your own role'
    });
  }

  if (email && email !== req.user.email) {
    return res.status(400).json({
      success: false,
      message: 'Email changes must be done through admin or verified separately'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  // Check if user has active assignments (for operators)
  if (user.role === 'operator' && user.operatorDetails) {
    const hasActiveAssignments = user.operatorDetails.assignedRoutes.length > 0 || 
                                 user.operatorDetails.assignedBuses.length > 0;
    
    if (hasActiveAssignments) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete operator with active route or bus assignments. Remove assignments first.'
      });
    }
  }

  await User.findByIdAndDelete(req.params.id);

  logger.info(`User deleted: ${user.username} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Update user role
 * @route   PATCH /api/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['admin', 'operator', 'commuter'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Valid role required (admin, operator, commuter)'
    });
  }

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from changing their own role
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot change your own role'
    });
  }

  const oldRole = user.role;
  user.role = role;

  // Handle operator details based on role change
  if (role === 'operator' && oldRole !== 'operator') {
    user.operatorDetails = {
      assignedRoutes: [],
      assignedBuses: []
    };
  } else if (role !== 'operator' && oldRole === 'operator') {
    user.operatorDetails = undefined;
  }

  await user.save();

  logger.info(`User role updated: ${user.username} from ${oldRole} to ${role} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user,
    message: `User role updated from ${oldRole} to ${role}`
  });
});

/**
 * @desc    Toggle user status (active/inactive)
 * @route   PATCH /api/users/:id/toggle
 * @access  Private (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  logger.info(`User ${user.isActive ? 'activated' : 'deactivated'}: ${user.username} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private (Admin only)
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0]
          }
        },
        withApiKey: {
          $sum: {
            $cond: [{ $ne: ['$apiKey', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });

  const recentUsers = await User.find()
    .select('username email role createdAt isActive')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth
      },
      byRole: stats,
      recentUsers,
      generatedAt: new Date()
    }
  });
});

/**
 * @desc    Assign routes to operator
 * @route   POST /api/users/:id/assign-routes
 * @access  Private (Admin only)
 */
export const assignRoutesToOperator = asyncHandler(async (req, res) => {
  const { routeIds } = req.body;

  if (!routeIds || !Array.isArray(routeIds)) {
    return res.status(400).json({
      success: false,
      message: 'Route IDs array is required'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role !== 'operator') {
    return res.status(400).json({
      success: false,
      message: 'User must be an operator to assign routes'
    });
  }

  // Initialize operator details if not exists
  if (!user.operatorDetails) {
    user.operatorDetails = {
      assignedRoutes: [],
      assignedBuses: []
    };
  }

  // Add new route IDs (avoid duplicates)
  const existingRouteIds = user.operatorDetails.assignedRoutes.map(id => id.toString());
  const newRouteIds = routeIds.filter(id => !existingRouteIds.includes(id.toString()));
  
  user.operatorDetails.assignedRoutes.push(...newRouteIds);
  await user.save();

  await user.populate('operatorDetails.assignedRoutes', 'routeNumber routeName origin destination');

  logger.info(`Routes assigned to operator ${user.username}: ${newRouteIds.join(', ')} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user.operatorDetails,
    message: `${newRouteIds.length} routes assigned successfully`
  });
});

/**
 * @desc    Assign buses to operator
 * @route   POST /api/users/:id/assign-buses
 * @access  Private (Admin only)
 */
export const assignBusesToOperator = asyncHandler(async (req, res) => {
  const { busIds } = req.body;

  if (!busIds || !Array.isArray(busIds)) {
    return res.status(400).json({
      success: false,
      message: 'Bus IDs array is required'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role !== 'operator') {
    return res.status(400).json({
      success: false,
      message: 'User must be an operator to assign buses'
    });
  }

  // Initialize operator details if not exists
  if (!user.operatorDetails) {
    user.operatorDetails = {
      assignedRoutes: [],
      assignedBuses: []
    };
  }

  // Add new bus IDs (avoid duplicates)
  const existingBusIds = user.operatorDetails.assignedBuses.map(id => id.toString());
  const newBusIds = busIds.filter(id => !existingBusIds.includes(id.toString()));
  
  user.operatorDetails.assignedBuses.push(...newBusIds);
  await user.save();

  await user.populate('operatorDetails.assignedBuses', 'registrationNumber busNumber busType');

  logger.info(`Buses assigned to operator ${user.username}: ${newBusIds.join(', ')} by admin ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user.operatorDetails,
    message: `${newBusIds.length} buses assigned successfully`
  });
});