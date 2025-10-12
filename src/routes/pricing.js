import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/pricing:
 *   get:
 *     summary: Get all pricing rules
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing rules retrieved successfully
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
 *                       routeId:
 *                         type: string
 *                         example: "68e676d44b1fa32c8ada8725"
 *                       baseFare:
 *                         type: number
 *                         example: 150
 *                       distanceRate:
 *                         type: number
 *                         example: 5.5
 *                       minimumFare:
 *                         type: number
 *                         example: 100
 *                       maximumFare:
 *                         type: number
 *                         example: 800
 *                       busType:
 *                         type: string
 *                         example: "standard"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                 message:
 *                   type: string
 *                   example: "Pricing rules retrieved successfully"
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/pricing:
 *   post:
 *     summary: Create new pricing rule
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routeId
 *               - baseFare
 *               - busType
 *             properties:
 *               routeId:
 *                 type: string
 *                 example: "68e676d44b1fa32c8ada8725"
 *               baseFare:
 *                 type: number
 *                 example: 150
 *               distanceRate:
 *                 type: number
 *                 example: 5.5
 *               minimumFare:
 *                 type: number
 *                 example: 100
 *               maximumFare:
 *                 type: number
 *                 example: 800
 *               busType:
 *                 type: string
 *                 example: "standard"
 *     responses:
 *       201:
 *         description: Pricing rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1234567890"
 *                     routeId:
 *                       type: string
 *                       example: "68e676d44b1fa32c8ada8725"
 *                     baseFare:
 *                       type: number
 *                       example: 150
 *                     busType:
 *                       type: string
 *                       example: "standard"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: "Pricing rule created successfully"
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, authorize('admin', 'operator'), async (req, res) => {
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
