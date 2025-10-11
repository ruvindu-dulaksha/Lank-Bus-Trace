/**
 * System Routes
 * Routes for system-wide configuration and health endpoints
 */

import express from 'express';
import { getSystemConfig } from '../controllers/systemController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System configuration and health endpoints
 */

// GET /api/system/config - Get system configuration
router.get('/config', getSystemConfig);

export default router;