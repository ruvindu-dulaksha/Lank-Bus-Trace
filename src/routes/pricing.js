import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  calculatePrice,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule
} from '../controllers/pricingController.js';
import { 
  validatePricingCalculation,
  validatePricingRule,
  validatePricingRuleUpdate
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pricing
 *   description: Simple pricing system with age-based discounts
 */

// Public routes - no authentication required
router.get('/calculate', validatePricingCalculation, calculatePrice);
router.get('/rules', getPricingRules);

// Admin-only routes
router.post('/rules', 
  authenticate, 
  authorize(['admin']), 
  validatePricingRule, 
  createPricingRule
);

router.put('/rules/:id', 
  authenticate, 
  authorize(['admin']), 
  validatePricingRuleUpdate, 
  updatePricingRule
);

router.delete('/rules/:id', 
  authenticate, 
  authorize(['admin']), 
  deletePricingRule
);

export default router;