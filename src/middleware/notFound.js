/**
 * 404 Not Found Middleware
 * Handles requests to non-existent endpoints
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found - ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      auth: '/api/auth',
      buses: '/api/buses',
      routes: '/api/routes',
      trips: '/api/trips',
      locations: '/api/locations',
      documentation: '/api-docs',
      health: '/health',
      apiInfo: '/api'
    },
    suggestion: 'Please check the API documentation at /api-docs for available endpoints'
  });
};