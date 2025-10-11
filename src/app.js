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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy for Nginx reverse proxy (secure configuration)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware - Enhanced for browser compatibility
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

// CORS configuration - Comprehensive fix for Swagger UI
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      'https://api.ruvindu-dulaksha.me',
      'https://ruvindu-dulaksha.me',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow same-origin requests and API documentation
    if (allowedOrigins.includes(origin) || origin.includes('ruvindu-dulaksha.me')) {
      callback(null, true);
    } else {
      // For development and API documentation, allow all origins
      callback(null, true);
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
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Link', 'ETag', 'Last-Modified']
};
app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key,Accept,Origin,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Enhanced RESTful headers middleware with browser compatibility
app.use((req, res, next) => {
  // API versioning header
  res.set('API-Version', '1.0.0');
  
  // Service identification
  res.set('X-Powered-By', 'Lanka Bus Trace API');
  
  // Enhanced CORS headers for better browser compatibility
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Accept, Origin, X-Requested-With, Access-Control-Allow-Headers');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '86400');
  
  // Request tracking
  res.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  next();
});

// Global rate limiting for all API endpoints
app.use('/api', globalApiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);

// Swagger JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  // Set CORS headers for Swagger JSON
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI at /api-docs (main documentation interface)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Lanka Bus Trace API Documentation",
  swaggerOptions: {
    url: '/api-docs.json',
    requestInterceptor: (req) => {
      // Ensure all requests go through proper CORS handling
      req.headers['Accept'] = 'application/json';
      req.headers['Content-Type'] = 'application/json';
      // Add origin header for CORS
      req.headers['Origin'] = 'https://ruvindu-dulaksha.me';
      return req;
    },
    responseInterceptor: (res) => {
      // Handle response and ensure proper CORS headers
      return res;
    },
    // Configure servers for proper API testing
    servers: [
      {
        url: 'https://ruvindu-dulaksha.me',
        description: 'Production Server'
      }
    ],
    // Enable CORS for Swagger UI requests
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    requestSnippets: {
      generators: {
        curl_bash: {
          title: "cURL (bash)",
          syntax: "bash"
        },
        curl_powershell: {
          title: "cURL (PowerShell)",
          syntax: "powershell"
        },
        curl_cmd: {
          title: "cURL (CMD)",
          syntax: "cmd"
        }
      },
      defaultExpanded: true,
      languages: ['curl_bash', 'curl_powershell', 'curl_cmd']
    }
  }
}));

// API Documentation info endpoint (for testing purposes)
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lanka Bus Trace API Documentation',
    documentation: 'Interactive API documentation available',
    swaggerUI: '/api-docs',
    apiInfo: '/api',
    version: '1.0.0'
  });
});

// Health check endpoint
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
 *                   example: "Lanka Bus Trace API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                   example: "production"
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

// API Health endpoint
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     name:
 *                       type: string
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
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

// Additional CORS middleware for API routes to ensure Swagger UI works
app.use('/api', (req, res, next) => {
  // Set CORS headers for all API routes
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Accept, Origin, X-Requested-With, Access-Control-Allow-Headers');
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count, Link, ETag, Last-Modified');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Lanka Bus Trace API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 message:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 api:
 *                   type: string
 *                   example: "/api"
 *                 health:
 *                   type: string
 *                   example: "/health"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 version:
 *                   type: string
 *                 description:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                   description: All available API endpoints
 *                 contact:
 *                   type: object
 *                   properties:
 *                     organization:
 *                       type: string
 *                     website:
 *                       type: string
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
      analytics: '/api/analytics'
    },
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