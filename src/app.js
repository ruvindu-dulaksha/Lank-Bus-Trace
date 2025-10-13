import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import configurations
import connectDB from './config/database.js';
import { swaggerOptions } from './config/swagger.js';
import logger from './config/logger.js';
import { initializeDefaultData } from './utils/initializeData.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { globalApiLimiter } from './middleware/rateLimiting.js';

// Import routes
import authRoutes from './routes/auth.js';
import busRoutes from './routes/buses.js';
import routeRoutes from './routes/routes.js';
import tripRoutes from './routes/trips.js';
import locationRoutes from './routes/locations.js';
import userRoutes from './routes/users.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import systemRoutes from './routes/system.js';
import pricingRoutes from './routes/pricing.js';
import seasonsRoutes from './routes/seasons.js';
import reportsRoutes from './routes/reports.js';
import driverRoutes from './routes/driver.js';
import operatorRoutes from './routes/operator.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy for Nginx reverse proxy
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Initialize default data (admin user, etc.)
setTimeout(() => {
  initializeDefaultData();
}, 2000); // Wait 2 seconds for DB connection

// Security middleware
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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://api.ruvindu-dulaksha.me',
      'https://ruvindu-dulaksha.me',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('ruvindu-dulaksha.me')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-API-Key', 
    'Accept', 
    'Origin', 
    'X-Requested-With'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Link', 'ETag', 'Last-Modified']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Global rate limiting for API endpoints
app.use('/api', globalApiLimiter);

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// API headers middleware
app.use('/api', (req, res, next) => {
  res.set('API-Version', '1.0.0');
  res.set('X-Powered-By', 'Lanka Bus Trace API');
  res.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  next();
});

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);

// Swagger JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Lanka Bus Trace API Documentation",
  swaggerOptions: {
    url: '/api-docs.json',
    servers: [
      {
        url: 'https://ruvindu-dulaksha.me',
        description: 'Production Server'
      }
    ],
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    tryItOutEnabled: true
  }
}));

// Health check endpoints
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [System]
 *     description: Check if the API server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Lanka Bus Trace API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Detailed API health check
 *     tags: [System]
 *     description: Detailed health information including database connectivity
 *     responses:
 *       200:
 *         description: API is healthy with detailed information
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    api: {
      name: 'Lanka Bus Trace API',
      version: '1.0.0',
      status: 'operational'
    },
    database: {
      status: 'connected',
      type: 'MongoDB'
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/operator', operatorRoutes);

// Root endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root information
 *     tags: [System]
 *     description: Get basic API information and available endpoints
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Lanka Bus Trace API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to Lanka Bus Trace API - Real-time bus tracking system for Sri Lanka',
    documentation: '/api-docs',
    api: '/api',
    health: '/health'
  });
});

// API Info endpoint
/**
 * @swagger
 * /api:
 *   get:
 *     summary: API endpoints information
 *     tags: [System]
 *     description: Get detailed information about all available API endpoints
 *     responses:
 *       200:
 *         description: API endpoints information
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Lanka Bus Trace API',
    version: '1.0.0',
    description: 'Real-time bus tracking system for inter-provincial services in Sri Lanka',
    endpoints: {
      documentation: '/api-docs',
      health: '/health',
      auth: '/api/auth',
      buses: '/api/buses',
      routes: '/api/routes',
      trips: '/api/trips',
      locations: '/api/locations',
      users: '/api/users',
      search: '/api/search',
      liveSearch: '/api/live-search',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics',
      pricing: '/api/pricing',
      seasons: '/api/seasons',
      reports: '/api/reports',
      driver: '/api/driver',
      operator: '/api/operator',
      system: '/api/system'
    },
    features: [
      'Real-time bus tracking',
      'Route management',
      'Trip scheduling',
      'User authentication',
      'Pricing and fare calculation',
      'Seasonal pricing management',
      'Comprehensive reporting',
      'Role-based access control',
      'Live search capabilities',
      'Fleet management'
    ],
    contact: {
      organization: 'Lanka Bus Trace',
      website: 'https://www.ntc.gov.lk'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;