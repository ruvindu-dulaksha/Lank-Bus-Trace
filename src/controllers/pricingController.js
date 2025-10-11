import PricingRule from '../models/PricingRule.js';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * /api/pricing/calculate:
 *   get:
 *     summary: Calculate price based on age
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: basePrice
 *         required: true
 *         schema:
 *           type: number
 *         description: Base price of the ticket
 *       - in: query
 *         name: age
 *         schema:
 *           type: number
 *         description: Passenger age (for discounts)
 *     responses:
 *       200:
 *         description: Price calculation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     basePrice:
 *                       type: number
 *                     finalPrice:
 *                       type: number
 *                     savings:
 *                       type: number
 *                     age:
 *                       type: number
 *                     multiplier:
 *                       type: number
 *                     priceType:
 *                       type: string
 *                     appliedRule:
 *                       type: object
 */
export const calculatePrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { basePrice, age } = req.query;
    const basePriceNum = parseFloat(basePrice);
    const ageNum = age ? parseInt(age) : null;

    if (!basePriceNum || basePriceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid base price is required'
      });
    }

    const result = await PricingRule.calculatePrice(basePriceNum, ageNum);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating price',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/pricing/rules:
 *   get:
 *     summary: Get all active pricing rules
 *     tags: [Pricing]
 *     responses:
 *       200:
 *         description: Pricing rules retrieved successfully
 */
export const getPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find({ isActive: true })
      .sort({ priority: -1 })
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing rules',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/pricing/rules:
 *   post:
 *     summary: Create new pricing rule (Admin only)
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
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [age_discount, standard]
 *               description:
 *                 type: string
 *               ageDiscount:
 *                 type: object
 *                 properties:
 *                   minAge:
 *                     type: number
 *                   maxAge:
 *                     type: number
 *                   discountPercentage:
 *                     type: number
 *               priority:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pricing rule created successfully
 */
export const createPricingRule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const pricingRuleData = {
      ...req.body,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    };

    const pricingRule = new PricingRule(pricingRuleData);
    await pricingRule.save();

    await pricingRule.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Pricing rule created successfully',
      data: pricingRule
    });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pricing rule',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/pricing/rules/{id}:
 *   put:
 *     summary: Update pricing rule (Admin only)
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing rule updated successfully
 */
export const updatePricingRule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const pricingRule = await PricingRule.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        lastModifiedBy: req.user.id 
      },
      { new: true, runValidators: true }
    ).populate('createdBy lastModifiedBy', 'username email');

    if (!pricingRule) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing rule updated successfully',
      data: pricingRule
    });
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing rule',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/pricing/rules/{id}:
 *   delete:
 *     summary: Delete pricing rule (Admin only)
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pricing rule deleted successfully
 */
export const deletePricingRule = async (req, res) => {
  try {
    const pricingRule = await PricingRule.findByIdAndDelete(req.params.id);

    if (!pricingRule) {
      return res.status(404).json({
        success: false,
        message: 'Pricing rule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pricing rule',
      error: error.message
    });
  }
};