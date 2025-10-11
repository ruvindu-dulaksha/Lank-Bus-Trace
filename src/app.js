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
import pricingRoutes from './routes/pricing.js';
import seasonRoutes from './routes/seasons.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';
import roleRoutes from './routes/roles.js';
import analyticsRoutes from './routes/analytics.js';
import reportsRoutes from './routes/reports.js';
import systemRoutes from './routes/system.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy for Nginx reverse proxy
app.set('trust proxy', true);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Link', 'ETag', 'Last-Modified']
};
app.use(cors(corsOptions));

// Enhanced RESTful headers middleware
app.use((req, res, next) => {
  // API versioning header
  res.set('API-Version', '1.0.0');
  
  // Service identification
  res.set('X-Powered-By', 'Lanka Bus Trace API');
  
  // Request ID for tracking
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.set('X-Request-ID', requestId);
  
  // Security headers for API
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API-specific headers for API routes
  if (req.path.startsWith('/api/')) {
    res.set('Content-Type', 'application/json; charset=utf-8');
  }
  
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
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger UI at /api-docs (main documentation interface)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Lanka Bus Trace API Documentation",
  swaggerOptions: {
    url: '/api-docs.json'
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
app.use('/api/pricing', pricingRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', roleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/system', systemRoutes);

// Root endpoint
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
      pricing: '/api/pricing',
      seasons: '/api/seasons',
      search: '/api/search',
      liveSearch: '/api/live-search',
      dashboard: '/api/dashboard',
      driver: '/api/driver',
      conductor: '/api/conductor',
      operator: '/api/operator'
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