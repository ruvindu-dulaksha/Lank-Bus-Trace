import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all seasonal pricing
router.get('/', authenticate, async (req, res) => {
  try {
    const seasons = [
      {
        id: '1',
        name: 'Peak Season',
        description: 'High demand period with increased fares',
        startDate: '2025-12-15',
        endDate: '2026-01-15',
        multiplier: 1.5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Off-Peak Season',
        description: 'Normal period with standard fares',
        startDate: '2025-02-01',
        endDate: '2025-11-30',
        multiplier: 1.0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.status(200).json({
      success: true,
      data: seasons,
      message: 'Seasonal pricing retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving seasonal pricing',
      error: error.message
    });
  }
});

// Create new seasonal pricing
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, description, startDate, endDate, multiplier } = req.body;

    const newSeason = {
      id: Date.now().toString(),
      name,
      description,
      startDate,
      endDate,
      multiplier,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: newSeason,
      message: 'Seasonal pricing created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating seasonal pricing',
      error: error.message
    });
  }
});

export default router;
