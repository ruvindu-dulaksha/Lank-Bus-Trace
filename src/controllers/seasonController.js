import Season from '../models/Season.js';
import Route from '../models/Route.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all seasons
 * @route   GET /api/seasons
 * @access  Private (Admin/Operator)
 */
export const getAllSeasons = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    isActive,
    year,
    search,
    sortBy = 'priority',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (type) query.type = type;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (year) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);
    query.$or = [
      { startDate: { $gte: startOfYear, $lte: endOfYear } },
      { endDate: { $gte: startOfYear, $lte: endOfYear } }
    ];
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortOptions,
    populate: [
      {
        path: 'createdBy',
        select: 'username role'
      },
      {
        path: 'applicableRoutes.routeId',
        select: 'routeNumber routeName origin destination'
      }
    ]
  };

  const seasons = await Season.paginate(query, options);

  // Add current status to each season
  const seasonsWithStatus = seasons.docs.map(season => ({
    ...season.toObject(),
    status: season.isCurrentlyActive ? 'active' : 
           (new Date() < season.startDate ? 'upcoming' : 'expired'),
    daysRemaining: season.daysRemaining
  }));

  res.status(200).json({
    success: true,
    data: seasonsWithStatus,
    pagination: {
      currentPage: seasons.page,
      totalPages: seasons.totalPages,
      totalItems: seasons.totalDocs,
      itemsPerPage: seasons.limit,
      hasNextPage: seasons.hasNextPage,
      hasPrevPage: seasons.hasPrevPage
    }
  });
});

/**
 * @desc    Get season by ID
 * @route   GET /api/seasons/:id
 * @access  Private (Admin/Operator)
 */
export const getSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id)
    .populate('createdBy', 'username role')
    .populate('applicableRoutes.routeId', 'routeNumber routeName origin destination');

  if (!season) {
    return res.status(404).json({
      success: false,
      message: 'Season not found'
    });
  }

  const seasonData = {
    ...season.toObject(),
    status: season.isCurrentlyActive ? 'active' : 
           (new Date() < season.startDate ? 'upcoming' : 'expired'),
    daysRemaining: season.daysRemaining
  };

  res.status(200).json({
    success: true,
    data: seasonData
  });
});

/**
 * @desc    Create new season
 * @route   POST /api/seasons
 * @access  Private (Admin)
 */
export const createSeason = asyncHandler(async (req, res) => {
  const seasonData = {
    ...req.body,
    createdBy: req.user._id
  };

  // Validate route IDs if provided
  if (seasonData.applicableRoutes && seasonData.applicableRoutes.length > 0) {
    for (const routeInfo of seasonData.applicableRoutes) {
      const route = await Route.findById(routeInfo.routeId);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: `Route with ID ${routeInfo.routeId} not found`
        });
      }
      routeInfo.routeNumber = route.routeNumber;
    }
  }

  const season = await Season.create(seasonData);
  
  await season.populate([
    { path: 'createdBy', select: 'username role' },
    { path: 'applicableRoutes.routeId', select: 'routeNumber routeName origin destination' }
  ]);

  logger.info(`Season created: ${season.name} by user ${req.user.username}`);

  res.status(201).json({
    success: true,
    data: season,
    message: 'Season created successfully'
  });
});

/**
 * @desc    Update season
 * @route   PUT /api/seasons/:id
 * @access  Private (Admin)
 */
export const updateSeason = asyncHandler(async (req, res) => {
  let season = await Season.findById(req.params.id);

  if (!season) {
    return res.status(404).json({
      success: false,
      message: 'Season not found'
    });
  }

  // Validate route IDs if updating applicableRoutes
  if (req.body.applicableRoutes) {
    for (const routeInfo of req.body.applicableRoutes) {
      const route = await Route.findById(routeInfo.routeId);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: `Route with ID ${routeInfo.routeId} not found`
        });
      }
      routeInfo.routeNumber = route.routeNumber;
    }
  }

  season = await Season.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'createdBy', select: 'username role' },
    { path: 'applicableRoutes.routeId', select: 'routeNumber routeName origin destination' }
  ]);

  logger.info(`Season updated: ${season.name} by user ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: season,
    message: 'Season updated successfully'
  });
});

/**
 * @desc    Delete season
 * @route   DELETE /api/seasons/:id
 * @access  Private (Admin)
 */
export const deleteSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);

  if (!season) {
    return res.status(404).json({
      success: false,
      message: 'Season not found'
    });
  }

  await Season.findByIdAndDelete(req.params.id);

  logger.info(`Season deleted: ${season.name} by user ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Season deleted successfully'
  });
});

/**
 * @desc    Get active seasons
 * @route   GET /api/seasons/active
 * @access  Public
 */
export const getActiveSeasons = asyncHandler(async (req, res) => {
  const { routeId, busType } = req.query;
  
  const activeSeasons = await Season.findActiveSeasons()
    .populate('applicableRoutes.routeId', 'routeNumber routeName origin destination');

  let filteredSeasons = activeSeasons;

  // Filter by route if specified
  if (routeId) {
    filteredSeasons = activeSeasons.filter(season => 
      season.applicableRoutes.length === 0 || 
      season.applicableRoutes.some(route => 
        route.routeId._id.toString() === routeId && route.isActive
      )
    );
  }

  // Filter by bus type if specified
  if (busType) {
    filteredSeasons = filteredSeasons.filter(season =>
      season.applicableBusTypes.length === 0 || 
      season.applicableBusTypes.includes(busType)
    );
  }

  res.status(200).json({
    success: true,
    data: filteredSeasons,
    message: `Found ${filteredSeasons.length} active seasons`
  });
});

/**
 * @desc    Get seasonal pricing for route
 * @route   GET /api/seasons/pricing/:routeId
 * @access  Public
 */
export const getSeasonalPricing = asyncHandler(async (req, res) => {
  const { routeId } = req.params;
  const { busType = 'standard', date } = req.query;
  
  const targetDate = date ? new Date(date) : new Date();
  
  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  const multiplier = await Season.getApplicableMultiplier(routeId, busType, targetDate);
  
  // Get base fare from route
  const baseFare = route.fareStructure?.baseFare || 100;
  const adjustedFare = Math.round(baseFare * multiplier);

  res.status(200).json({
    success: true,
    data: {
      routeId,
      routeNumber: route.routeNumber,
      busType,
      date: targetDate,
      baseFare,
      seasonalMultiplier: multiplier,
      adjustedFare,
      savings: multiplier < 1 ? Math.round(baseFare - adjustedFare) : 0,
      surcharge: multiplier > 1 ? Math.round(adjustedFare - baseFare) : 0
    }
  });
});

/**
 * @desc    Get season statistics
 * @route   GET /api/seasons/stats
 * @access  Private (Admin)
 */
export const getSeasonStats = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const stats = await Season.aggregate([
    {
      $match: {
        $or: [
          { startDate: { $gte: startOfYear, $lte: endOfYear } },
          { endDate: { $gte: startOfYear, $lte: endOfYear } }
        ]
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgMultiplier: { $avg: '$priceMultiplier' },
        maxMultiplier: { $max: '$priceMultiplier' },
        minMultiplier: { $min: '$priceMultiplier' },
        totalRoutes: { $sum: { $size: '$applicableRoutes' } }
      }
    }
  ]);

  const totalSeasons = await Season.countDocuments({
    $or: [
      { startDate: { $gte: startOfYear, $lte: endOfYear } },
      { endDate: { $gte: startOfYear, $lte: endOfYear } }
    ]
  });

  const activeSeasons = await Season.countDocuments({
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  res.status(200).json({
    success: true,
    data: {
      year: parseInt(year),
      summary: {
        totalSeasons,
        activeSeasons,
        upcomingSeasons: await Season.countDocuments({
          isActive: true,
          startDate: { $gt: new Date() }
        }),
        expiredSeasons: await Season.countDocuments({
          endDate: { $lt: new Date() }
        })
      },
      byType: stats,
      generatedAt: new Date()
    }
  });
});

/**
 * @desc    Toggle season status
 * @route   PATCH /api/seasons/:id/toggle
 * @access  Private (Admin)
 */
export const toggleSeasonStatus = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);

  if (!season) {
    return res.status(404).json({
      success: false,
      message: 'Season not found'
    });
  }

  season.isActive = !season.isActive;
  await season.save();

  logger.info(`Season ${season.isActive ? 'activated' : 'deactivated'}: ${season.name} by user ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: season,
    message: `Season ${season.isActive ? 'activated' : 'deactivated'} successfully`
  });
});