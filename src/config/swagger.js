export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NTC Bus Tracking API',
      version: '1.0.0',
      description: 'Real-time bus tracking system for inter-provincial services in Sri Lanka',
      contact: {
        name: 'National Transport Commission',
        url: 'https://www.ntc.gov.lk',
        email: 'info@ntc.gov.lk'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-api-domain.com/api',
        description: 'Production server (AWS)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'object'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'operator1'
            },
            email: {
              type: 'string',
              example: 'operator@ntc.gov.lk'
            },
            role: {
              type: 'string',
              enum: ['admin', 'operator', 'commuter'],
              example: 'operator'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Route: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            routeNumber: {
              type: 'string',
              example: 'R001'
            },
            routeName: {
              type: 'string',
              example: 'Colombo - Kandy'
            },
            origin: {
              type: 'object',
              properties: {
                city: { type: 'string', example: 'Colombo' },
                terminal: { type: 'string', example: 'Bastian Mawatha' },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', example: 6.9271 },
                    longitude: { type: 'number', example: 79.8612 }
                  }
                }
              }
            },
            destination: {
              type: 'object',
              properties: {
                city: { type: 'string', example: 'Kandy' },
                terminal: { type: 'string', example: 'Kandy Bus Terminal' },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', example: 7.2906 },
                    longitude: { type: 'number', example: 80.6337 }
                  }
                }
              }
            },
            distance: {
              type: 'number',
              example: 115.5
            },
            estimatedDuration: {
              type: 'number',
              example: 180
            },
            stops: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Kegalle' },
                  coordinates: {
                    type: 'object',
                    properties: {
                      latitude: { type: 'number', example: 7.2513 },
                      longitude: { type: 'number', example: 80.3464 }
                    }
                  },
                  estimatedArrival: { type: 'number', example: 90 }
                }
              }
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        Bus: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            registrationNumber: {
              type: 'string',
              example: 'NB-1234'
            },
            busNumber: {
              type: 'string',
              example: 'B001'
            },
            operatorName: {
              type: 'string',
              example: 'SLTB Colombo'
            },
            capacity: {
              type: 'number',
              example: 52
            },
            busType: {
              type: 'string',
              enum: ['standard', 'semi-luxury', 'luxury', 'super-luxury'],
              example: 'semi-luxury'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['AC', 'WiFi', 'Charging Points']
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            currentLocation: {
              type: 'object',
              properties: {
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', example: 6.9271 },
                    longitude: { type: 'number', example: 79.8612 }
                  }
                },
                lastUpdated: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Routes',
        description: 'Bus route management'
      },
      {
        name: 'Buses',
        description: 'Bus fleet management'
      },
      {
        name: 'Trips',
        description: 'Trip scheduling and management'
      },
      {
        name: 'Locations',
        description: 'Real-time location tracking'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};