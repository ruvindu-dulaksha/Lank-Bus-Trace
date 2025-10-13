import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get all seasonal pricing configurations
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seasonal pricing configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "Peak Season"
 *                       description:
 *                         type: string
 *                         example: "High demand period with increased fares"
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2025-12-15"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: "2026-01-15"
 *                       multiplier:
 *                         type: number
 *                         example: 1.5
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                 message:
 *                   type: string
 *                   example: "Seasonal pricing retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const seasons = [
      {
        id: '1',
        name: 'Peak Season',
        description: 'High demand period with increased fares (December-January)',
        startDate: '2025-12-15',
        endDate: '2026-01-15',
        multiplier: 1.5,
        isActive: true,
        routes: ['Colombo-Kandy', 'Colombo-Galle', 'Colombo-Negombo'],
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
        routes: ['All Routes'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Festival Season',
        description: 'Special pricing during major festivals (Sinhala New Year, Vesak)',
        startDate: '2025-04-12',
        endDate: '2025-04-16',
        multiplier: 1.3,
        isActive: true,
        routes: ['Inter-Provincial Routes'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'School Holiday Season',
        description: 'Increased demand during school holidays',
        startDate: '2025-08-01',
        endDate: '2025-08-31',
        multiplier: 1.2,
        isActive: true,
        routes: ['Tourist Destination Routes'],
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
router.post('/', authenticate, authorize('admin'), async (req, res) => {
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
