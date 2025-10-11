import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all pricing rules
router.get('/', authenticate, async (req, res) => {
  try {
    const pricingRules = [
      {
        id: '1',
        routeId: '68e676d44b1fa32c8ada8725',
        baseFare: 150,
        distanceRate: 5.5,
        minimumFare: 100,
        maximumFare: 800,
        busType: 'standard',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.status(200).json({
      success: true,
      data: pricingRules,
      message: 'Pricing rules retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pricing rules',
      error: error.message
    });
  }
});

// Create new pricing rule
router.post('/', authenticate, authorize(['admin', 'operator']), async (req, res) => {
  try {
    const { routeId, baseFare, busType } = req.body;

    const newPricingRule = {
      id: Date.now().toString(),
      routeId,
      baseFare,
      busType,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: newPricingRule,
      message: 'Pricing rule created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pricing rule',
      error: error.message
    });
  }
});

export default router;
