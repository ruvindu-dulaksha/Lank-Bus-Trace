import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get basic pricing information - Adult and Child rates only
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: Basic pricing information retrieved successfully
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
 *                     adultPrice:
 *                       type: string
 *                       example: "Full Price (16+ years)"
 *                     childPrice:
 *                       type: string
 *                       example: "Half Price (Under 16 years)"
 *                     note:
 *                       type: string
 *                       example: "Simple flat rate pricing - no peak times or seasonal variations"
 *                 message:
 *                   type: string
 *                   example: "Basic pricing information retrieved successfully"
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const pricingInfo = {
      adultPrice: "Full Price (16+ years)",
      childPrice: "Half Price (Under 16 years)", 
      note: "Simple flat rate pricing - no peak times or seasonal variations"
    };

    res.status(200).json({
      success: true,
      data: pricingInfo,
      message: 'Basic pricing information retrieved successfully'
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
