export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lanka Bus Trace API',
      version: '1.0.0',
      description: `
## Smart Inter-Provincial Bus Tracking System for Sri Lanka

### Features:
- 🚌 **Smart Journey Planning**: Find buses for your actual travel route (not just nearby buses)
- 🔐 **Dual Authentication**: JWT tokens and HTTP-only cookies support
- 📍 **Real-time Tracking**: Live GPS location updates
- 🛣️ **Route Discovery**: Find available routes between cities
- 🔍 **Intelligent Search**: Search across buses, routes, and locations
- 📊 **Analytics**: Fleet performance and usage statistics

### NTC Compliance:
- Tracking-only service (no booking functionality)
- Government-approved inter-provincial bus monitoring
- Standardized route and pricing information

### Quick Start:
1. **Login**: Use \`POST /auth/login\` with test credentials
2. **Journey Planning**: Use \`GET /live-search?from=Colombo&to=Kandy\`
3. **Route Discovery**: Use \`GET /routes?origin=Colombo&destination=Kandy\`
4. **Search**: Use \`GET /search?q=Colombo&type=route\`
      `,
      contact: {
        name: 'Lanka Bus Trace',
        url: 'https://www.lankabustrace.lk',
        email: 'info@lankabustrace.lk'
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
        url: 'https://ruvindu-dulaksha.me/',
        description: 'Production server (AWS)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication - use the token from login response'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Cookie-based authentication - automatically set after login'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key authentication for operators and admins'
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
        },
        JourneySearchResult: {
          type: 'object',
          description: 'Smart journey search results showing buses relevant to user travel',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Found 3 available trips'
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  routeId: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                  },
                  routeName: {
                    type: 'string',
                    example: 'Colombo - Kandy Express'
                  },
                  origin: {
                    type: 'string',
                    example: 'Colombo'
                  },
                  destination: {
                    type: 'string',
                    example: 'Kandy'
                  },
                  departureTime: {
                    type: 'string',
                    example: '09:00'
                  },
                  estimatedArrival: {
                    type: 'string',
                    example: '12:00'
                  }
                }
              }
            },
            searchCriteria: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  example: 'Colombo'
                },
                to: {
                  type: 'string',
                  example: 'Kandy'
                },
                date: {
                  type: 'string',
                  example: '2025-10-11'
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
        description: 'User authentication and authorization with JWT tokens and cookies'
      },
      {
        name: 'Search',
        description: 'Smart journey planning and search capabilities - find buses for your actual travel needs'
      },
      {
        name: 'System',
        description: 'System configuration and health monitoring'
      },
      {
        name: 'Routes',
        description: 'Inter-provincial bus routes and journey planning'
      },
      {
        name: 'Buses',
        description: 'Bus fleet management and real-time tracking'
      },
      {
        name: 'Trips',
        description: 'Trip scheduling and live tracking'
      },
      {
        name: 'Locations',
        description: 'Real-time GPS location tracking and proximity search'
      },
      {
        name: 'Analytics',
        description: 'Fleet analytics and performance reporting'
      },
      {
        name: 'Users',
        description: 'User management and role-based access control'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};