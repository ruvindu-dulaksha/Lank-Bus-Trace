import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// ===============================
// 📁 CONFIGURATIONS & UTILITIES
// ===============================
import connectDB from './config/database.js';
import { swaggerOptions } from './config/swagger.js';
import logger from './config/logger.js';
import { initializeDefaultData } from './utils/initializeData.js';

// ===============================
// 🛡️ MIDDLEWARE IMPORTS
// ===============================
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { globalApiLimiter } from './middleware/rateLimiting.js';

// ===============================
// 🚦 API ROUTE IMPORTS
// ===============================
// Core System Routes
import authRoutes from './routes/auth.js';
import systemRoutes from './routes/system.js';
import searchRoutes from './routes/search.js';

// Fleet Management Routes  
import busRoutes from './routes/buses.js';
import routeRoutes from './routes/routes.js';
import tripRoutes from './routes/trips.js';
import locationRoutes from './routes/locations.js';

// Business Logic Routes
import pricingRoutes from './routes/pricing.js';
import seasonsRoutes from './routes/seasons.js';

// User & Role Management
import userRoutes from './routes/users.js';
import driverRoutes from './routes/driver.js';
import operatorRoutes from './routes/operator.js';

// Analytics & Reporting
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import reportsRoutes from './routes/reports.js';

// ===============================
// 🚀 APPLICATION INITIALIZATION
// ===============================

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Trust proxy (required for Nginx reverse proxy & rate limiting)
app.set('trust proxy', 1);

// ===============================
// 💾 DATABASE CONNECTION
// ===============================
connectDB();

// Initialize default system data (admin user, sample data, etc.)
setTimeout(() => {
  initializeDefaultData();
}, 2000); // Allow DB connection to establish

// ===============================
// 🛡️ SECURITY & MIDDLEWARE SETUP
// ===============================

// Security headers and CORS protection
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS (Cross-Origin Resource Sharing) configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin
    
    const allowedOrigins = [
      'https://api.ruvindu-dulaksha.me',
      'https://ruvindu-dulaksha.me',  
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('ruvindu-dulaksha.me')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development - restrict in production
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Link', 'ETag', 'Last-Modified']
};
app.use(cors(corsOptions));

// ===============================
// 📝 REQUEST PARSING & LOGGING  
// ===============================

// Body parsing middleware (handles JSON and URL-encoded data)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware (for authentication)
app.use(cookieParser());

// HTTP request logging
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// ===============================
// 🚦 RATE LIMITING & API HEADERS
// ===============================

// Apply rate limiting to all API endpoints
app.use('/api', globalApiLimiter);

// Add custom API headers to all API responses
app.use('/api', (req, res, next) => {
  res.set({
    'API-Version': '1.0.0',
    'X-Powered-By': 'Lanka Bus Trace API',
    'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    'X-Response-Time': Date.now()
  });
  next();
});

// ===============================
// 📚 API DOCUMENTATION (SWAGGER)
// ===============================

// Generate Swagger specification from route comments
const specs = swaggerJsdoc(swaggerOptions);

// Swagger JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI interactive documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Lanka Bus Trace API - Interactive Documentation",
  swaggerOptions: {
    url: '/api-docs.json',
    servers: [
      { url: 'https://ruvindu-dulaksha.me', description: 'Production Server' },
      { url: 'http://localhost:3000', description: 'Development Server' }
    ],
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    tryItOutEnabled: true,
    filter: true,
    showRequestHeaders: true
  }
}));

// ===============================
// ❤️ HEALTH CHECK ENDPOINTS
// ===============================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic server health check
 *     tags: [System]
 *     description: Quick health verification - returns server status and basic metrics
 *     responses:
 *       200:
 *         description: Server is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Lanka Bus Trace API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Comprehensive API health diagnostics
 *     tags: [System]
 *     description: Detailed health information including database connectivity and system metrics
 *     responses:
 *       200:
 *         description: Complete API health report
 */
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    success: true,
    status: 'healthy',
    api: {
      name: 'Lanka Bus Trace API',
      version: '1.0.0',
      status: 'operational',
      documentation: '/api-docs'
    },
    database: {
      status: 'connected',
      type: 'MongoDB Atlas',
      cluster: 'Production'
    },
    system: {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    },
    timestamp: new Date().toISOString()
  });
});

// ===============================
// 🛣️ API ROUTE REGISTRATION
// ===============================

// 🔐 Authentication & System Core
app.use('/api/auth', authRoutes);           // User authentication (login, register, logout)
app.use('/api/system', systemRoutes);       // System configuration and health
app.use('/api', searchRoutes);              // Global search (live-search, general search)

// 🚌 Fleet Management Core
app.use('/api/buses', busRoutes);           // Bus fleet management and tracking
app.use('/api/routes', routeRoutes);        // Route management and statistics  
app.use('/api/trips', tripRoutes);          // Trip scheduling and live tracking
app.use('/api/locations', locationRoutes);  // GPS location services and proximity

// 💰 Business Logic & Pricing
app.use('/api/pricing', pricingRoutes);     // Fare calculation and pricing rules
app.use('/api/seasons', seasonsRoutes);     // Seasonal pricing management

// 👥 User & Role Management  
app.use('/api/users', userRoutes);          // User management (admin only)
app.use('/api/driver', driverRoutes);       // Driver-specific endpoints
app.use('/api/operator', operatorRoutes);   // Bus operator management

// 📊 Analytics & Business Intelligence
app.use('/api/dashboard', dashboardRoutes); // Administrative dashboard
app.use('/api/analytics', analyticsRoutes); // Fleet performance analytics
app.use('/api/reports', reportsRoutes);     // Trip, revenue, and fleet reports

// ===============================
// 🏠 ROOT & API INFO ENDPOINTS
// ===============================

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome & Information
 *     tags: [System]
 *     description: Welcome message with API overview and quick links
 *     responses:
 *       200:
 *         description: API welcome information
 */
app.get('/', (req, res) => {
  res.json({
    name: '🚌 Lanka Bus Trace API',
    version: '1.0.0',
    status: 'operational',
    message: 'Welcome to Lanka Bus Trace - Real-time Inter-Provincial Bus Tracking System for Sri Lanka',
    description: 'Professional REST API for Sri Lanka National Transport Commission (NTC)',
    
    quickStart: {
      documentation: '/api-docs',
      health: '/health',
      apiInfo: '/api'
    },
    
    developer: {
      name: 'K.D.R. Dulaksha',
      studentId: 'COBSCCOMP241P-018',
      institution: 'Coventry University',
      project: 'Advanced Software Development Coursework'
    },
    
    deployment: {
      production: 'https://ruvindu-dulaksha.me',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Complete API Endpoints Directory
 *     tags: [System]  
 *     description: Comprehensive listing of all available API endpoints with descriptions
 *     responses:
 *       200:
 *         description: Complete API endpoints information
 */
app.get('/api', (req, res) => {
  res.json({
    api: {
      name: 'Lanka Bus Trace API',
      version: '1.0.0',
      description: 'Real-time inter-provincial bus tracking system for Sri Lanka',
      documentation: '/api-docs',
      baseUrl: '/api'
    },

    endpoints: {
      // Core System
      authentication: '/api/auth',      // Login, register, logout, password reset
      system: '/api/system',           // System health, configuration
      search: '/api/search',           // General search
      liveSearch: '/api/live-search',  // Smart journey planning
      
      // Fleet Management
      buses: '/api/buses',             // Bus fleet management & real-time tracking  
      routes: '/api/routes',           // Route management & statistics
      trips: '/api/trips',             // Trip scheduling & live tracking
      locations: '/api/locations',     // GPS services & proximity search
      
      // Business Logic
      pricing: '/api/pricing',         // Fare calculation & pricing rules
      seasons: '/api/seasons',         // Seasonal pricing management
      
      // User Management  
      users: '/api/users',             // User administration (admin only)
      driver: '/api/driver',           // Driver-specific operations
      operator: '/api/operator',       // Bus operator management
      
      // Analytics & Reporting
      dashboard: '/api/dashboard',     // Administrative overview
      analytics: '/api/analytics',     // Performance analytics  
      reports: '/api/reports'          // Business intelligence reports
    },

    features: [
      '🎯 Smart Journey Planning - Find buses for actual travel needs',
      '📍 Real-time GPS Tracking - Live location monitoring',  
      '🔐 Enterprise Authentication - JWT & cookie-based security',
      '🚌 Fleet Management - Complete bus operations control',
      '💰 Dynamic Pricing - Seasonal & route-based fare calculation',
      '📊 Advanced Analytics - Performance insights & reporting',
      '👥 Role-based Access - Admin, operator, driver, commuter roles',
      '📱 Mobile-ready APIs - Optimized for mobile applications',
      '🌐 Production Deployment - AWS EC2 with SSL certificates'
    ],

    compliance: {
      organization: 'Sri Lanka National Transport Commission (NTC)',
      scope: 'Inter-provincial bus services only',
      functionality: 'Tracking-only (no booking per government requirements)',
      website: 'https://www.ntc.gov.lk'
    },

    statistics: {
      totalEndpoints: '50+',
      supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      responseFormat: 'JSON',
      maxRequestSize: '10MB',
      rateLimiting: 'Applied'
    }
  });
});

// ===============================
// 🚫 ERROR HANDLING & 404
// ===============================

// Handle 404 - Route not found
app.use(notFound);

// Global error handler (must be the last middleware)
app.use(errorHandler);

// ===============================
// 📤 APPLICATION EXPORT
// ===============================

export default app;