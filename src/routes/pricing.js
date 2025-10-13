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
router.get('/', async (req, res) => {
  try {
    const basicPricing = [
      {
        route: 'Colombo - Kandy',
        adultPrice: 288,
        childPrice: 144,
        distance: '115 km'
      },
      {
        route: 'Colombo - Galle', 
        adultPrice: 200,
        childPrice: 100,
        distance: '119 km'
      },
      {
        route: 'Colombo - Jaffna',
        adultPrice: 450,
        childPrice: 225,
        distance: '396 km'
      },
      {
        route: 'Colombo - Badulla',
        adultPrice: 350,
        childPrice: 175,
        distance: '230 km'
      },
      {
        route: 'Kandy - Galle',
        adultPrice: 320,
        childPrice: 160,
        distance: '160 km'
      }
    ];

    res.status(200).json({
      success: true,
      data: basicPricing,
      message: 'Basic place-to-place pricing retrieved successfully',
      note: 'Adult price for 16+ years, Child price (half rate) for under 16 years'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pricing information',
      error: error.message
    });
  }
});



export default router;
