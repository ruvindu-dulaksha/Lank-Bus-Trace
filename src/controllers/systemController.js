/**
 * System Configuration Controller
 * Provides system-wide configuration information for Lanka Bus Trace API
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version info
const packageJsonPath = path.join(__dirname, '../../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

/**
 * @swagger
 * /api/system/config:
 *   get:
 *     summary: Get system configuration
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
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
 *                     system:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Lanka Bus Trace"
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         description:
 *                           type: string
 *                           example: "Real-time inter-provincial bus tracking system"
 *                         environment:
 *                           type: string
 *                           example: "production"
 *                         timezone:
 *                           type: string
 *                           example: "Asia/Colombo"
 *                     features:
 *                       type: object
 *                       properties:
 *                         realTimeTracking:
 *                           type: boolean
 *                           example: true
 *                         routeSearch:
 *                           type: boolean
 *                           example: true
 *                         analytics:
 *                           type: boolean
 *                           example: true
 *                         booking:
 *                           type: boolean
 *                           example: false
 *                     compliance:
 *                       type: object
 *                       properties:
 *                         ntcCompliant:
 *                           type: boolean
 *                           example: true
 *                         trackingOnly:
 *                           type: boolean
 *                           example: true
 *                         interProvincial:
 *                           type: boolean
 *                           example: true
 */
const getSystemConfig = async (req, res) => {
  try {
    const systemConfig = {
      success: true,
      data: {
        system: {
          name: "Lanka Bus Trace",
          version: pkg.version || "1.0.0",
          description: "Real-time inter-provincial bus tracking system for Sri Lanka",
          environment: process.env.NODE_ENV || "development",
          timezone: "Asia/Colombo",
          uptime: Math.floor(process.uptime()),
          nodeVersion: process.version
        },
        features: {
          realTimeTracking: true,
          routeSearch: true,
          analytics: true,
          reporting: true,
          userManagement: true,
          booking: false, // Explicitly disabled per NTC requirements
          payment: false, // Explicitly disabled per NTC requirements
          ticketing: false // Explicitly disabled per NTC requirements
        },
        compliance: {
          ntcCompliant: true,
          trackingOnly: true,
          interProvincial: true,
          noBookingPolicy: true,
          gdprCompliant: true
        },
        api: {
          version: "1.0.0",
          documentation: "/api-docs/",
          rateLimit: "100 requests per minute",
          authentication: "JWT Bearer Token",
          supportedFormats: ["JSON"]
        },
        database: {
          type: "MongoDB",
          status: "connected",
          collections: [
            "users",
            "buses", 
            "routes",
            "trips",
            "locations"
          ]
        },
        fleet: {
          totalBuses: 26,
          totalRoutes: 14,
          routeType: "Inter-provincial only",
          coverage: "Major cities across Sri Lanka"
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'system-config'
    };

    res.status(200).json(systemConfig);
  } catch (error) {
    console.error('System config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export {
  getSystemConfig
};