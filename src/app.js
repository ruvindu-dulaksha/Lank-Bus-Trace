import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

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

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Swagger Documentation
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Lanka Bus Trace API Documentation"
}));

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);

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
      locations: '/api/locations'
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