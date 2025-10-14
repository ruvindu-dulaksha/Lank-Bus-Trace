export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lanka Bus Trace API',
      version: '1.0.0',
      description: `
# 🚌 Lanka Bus Trace API

**Real-time Inter-Provincial Bus Tracking System for Sri Lanka**

---

## 👨‍💻 Developer Information
- **Name**: K.D. Ruvindu Dulaksha  
- **Student ID**: COBSCCOMP4Y241P-018  
- **Institution**: Coventry University  
- **Project Type**: Academic Coursework - WEB API Development

---

## 📋 Project Overview
Professional REST API system designed for Sri Lanka's National Transport Commission (NTC) to track inter-provincial bus services in real-time. This comprehensive solution demonstrates enterprise-level software development practices and production deployment capabilities.

---

## ✨ Core Features

### 🚌 Smart Journey Planning
Find optimal bus routes for your actual travel needs, not just proximity-based results.

### 🔐 Enterprise Authentication  
Dual authentication system supporting JWT tokens and secure HTTP-only cookies.

### 📍 Real-time GPS Tracking
Live location monitoring with comprehensive movement history.

### �️ Intelligent Route Discovery
Advanced search capabilities across cities and transport networks.

### 📊 Performance Analytics
Fleet management metrics and operational insights.

---

## 🛡️ Security Features

### 🔒 ObjectId Protection
**Critical Security Enhancement**: Public API endpoints automatically remove MongoDB ObjectIds (_id fields) from responses to prevent enumeration attacks and database structure exposure. Only authenticated admin/operator users can access full ObjectId data for management purposes.

**Public Endpoints**: Use business identifiers (B001, T000001) and hide ObjectIds
**Admin/Operator Endpoints**: Retain ObjectIds for internal management operations

---

## 🏛️ NTC Compliance
- ✅ **Tracking-Only Service** - No booking functionality (government requirement)
- ✅ **Inter-Provincial Focus** - Long-distance routes only
- ✅ **Standardized Data** - Government-approved route and pricing information
- ✅ **Security Standards** - Enterprise-grade data protection

---

## 🎓 Academic Excellence
This API demonstrates mastery of:
- **RESTful Architecture** - Industry-standard API design
- **Database Optimization** - MongoDB with geospatial indexing
- **Production Deployment** - AWS EC2 with SSL certificates
- **Security Implementation** - JWT authentication & role-based access
- **Documentation Standards** - Comprehensive API documentation

---

## 🚀 Quick Start Guide

### 1. 🔓 Test Without Authentication (Public Endpoints)
\`\`\`bash
# Get system information
curl https://ruvindu-dulaksha.me/health

# Search routes between cities
curl "https://ruvindu-dulaksha.me/api/routes/search?from=Colombo&to=Kandy"

# Get available cities
curl https://ruvindu-dulaksha.me/api/routes/cities

# Get bus by business identifier (ObjectIds hidden)
curl https://ruvindu-dulaksha.me/api/buses/B001

# Get trip by business identifier (ObjectIds hidden)
curl https://ruvindu-dulaksha.me/api/trips/T000001
\`\`\`

### 2. 🔐 Authentication Required
\`\`\`bash
# Login to get JWT token
curl -X POST https://ruvindu-dulaksha.me/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"emailOrUsername": "your_username", "password": "your_password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  https://ruvindu-dulaksha.me/api/buses
\`\`\`

### 3. 🎯 Journey Planning
\`\`\`bash
# Smart journey search
curl "https://ruvindu-dulaksha.me/api/live-search?from=Colombo&to=Kandy&date=2025-10-12&time=09:00"
\`\`\`

### 4. 🔧 Using This Swagger UI
1. Click **"Authorize"** button above
2. Enter your JWT token (get from login response)
3. Test any endpoint with the **"Try it out"** button
4. Check **"Schemas"** section for request/response formats

---

## 🔐 Authentication Information
- **Registration**: Contact system administrator for account creation
- **Roles**: admin, operator, commuter (role-based access control)
- **Security**: JWT tokens with HTTP-only cookie support

*🔒 Use the "Authorize" button above to test protected endpoints*

---

**🌟 100% Functional API | Production Ready | Academic Excellence**
      `,
      contact: {
        name: 'Lanka Bus Trace API Support',
        url: 'https://github.com/ruvindu-dulaksha/lanka-bus-trace',
        email: 'api-support@lanka-bus-trace.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://ruvindu-dulaksha.me',
        description: 'Production server (AWS EC2 with SSL)'
      },
      {
        url: 'https://ruvindu-dulaksha.me/api',
        description: 'Production API Base URL'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication - use the token from login response',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1
          }
        },
        LimitParam: {
          name: 'limit', 
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            example: 20
          }
        }
      },
      examples: {
        LoginRequest: {
          summary: 'Sample Login Request',
          value: {
            emailOrUsername: 'your_username',
            password: 'your_password'
          }
        },
        LoginResponse: {
          summary: 'Successful Login Response',
          value: {
            success: true,
            message: 'Login successful',
            data: {
              user: {
                _id: '507f1f77bcf86cd799439011',
                username: 'sample_user',
                email: 'user@example.com',
                role: 'commuter'
              },
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Operation successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Success'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Invalid input data provided'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication required - Invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access token required. Please provide a valid Bearer token.'
              }
            }
          }
        },
        Forbidden: {
          description: 'Access denied - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access denied. Required role: admin. Your role: commuter'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        Conflict: {
          description: 'Conflict - Resource already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource already exists'
              }
            }
          }
        },
        TooManyRequests: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: 60
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error occurred'
              }
            }
          }
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
        BusPublic: {
          type: 'object',
          description: 'Bus schema for public endpoints - ObjectIds are automatically removed for security',
          properties: {
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
        },
        Pagination: {
          type: 'object',
          description: 'Pagination information for paginated responses',
          properties: {
            currentPage: {
              type: 'integer',
              example: 1,
              description: 'Current page number (1-based)'
            },
            totalPages: {
              type: 'integer',
              example: 5,
              description: 'Total number of pages'
            },
            totalItems: {
              type: 'integer',
              example: 87,
              description: 'Total number of items across all pages'
            },
            itemsPerPage: {
              type: 'integer',
              example: 20,
              description: 'Number of items per page'
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
              description: 'Whether there is a next page available'
            },
            hasPrevPage: {
              type: 'boolean',
              example: false,
              description: 'Whether there is a previous page available'
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              example: 2,
              description: 'Next page number (null if no next page)'
            },
            prevPage: {
              type: 'integer',
              nullable: true,
              example: null,
              description: 'Previous page number (null if no previous page)'
            }
          },
          required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage']
        },
        PaginatedResponse: {
          type: 'object',
          description: 'Standard paginated response format',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Data retrieved successfully'
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Array of data items'
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          },
          required: ['success', 'data', 'pagination']
        },
        Trip: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            routeId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            busId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            departureTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-11T09:00:00.000Z'
            },
            estimatedArrivalTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-11T12:00:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
              example: 'scheduled'
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
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        RoutePublic: {
          type: 'object',
          description: 'Route schema for public endpoints - ObjectIds are automatically removed for security',
          properties: {
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
        TripCreate: {
          type: 'object',
          required: ['routeId', 'busId', 'departureTime'],
          properties: {
            routeId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            busId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            departureTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-11T09:00:00.000Z'
            },
            estimatedArrivalTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-11T12:00:00.000Z'
            }
          }
        },
        TripUpdate: {
          type: 'object',
          properties: {
            departureTime: {
              type: 'string',
              format: 'date-time'
            },
            estimatedArrivalTime: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'in-progress', 'completed', 'cancelled']
            },
            currentLocation: {
              type: 'object',
              properties: {
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        Location: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Colombo Central Bus Stand'
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number', example: 6.9271 },
                longitude: { type: 'number', example: 79.8612 }
              }
            },
            address: {
              type: 'string',
              example: 'Colombo Fort, Colombo 01'
            },
            type: {
              type: 'string',
              enum: ['terminal', 'stop', 'landmark'],
              example: 'terminal'
            },
            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },
        GeoLocation: {
          type: 'object',
          properties: {
            coordinates: {
              type: 'object',
              properties: {
                latitude: { 
                  type: 'number', 
                  minimum: -90, 
                  maximum: 90,
                  example: 6.9271 
                },
                longitude: { 
                  type: 'number', 
                  minimum: -180, 
                  maximum: 180,
                  example: 79.8612 
                }
              },
              required: ['latitude', 'longitude']
            },
            accuracy: {
              type: 'number',
              example: 10,
              description: 'GPS accuracy in meters'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-11T09:30:00.000Z'
            }
          },
          required: ['coordinates']
        },
        BusCreate: {
          type: 'object',
          required: ['registrationNumber', 'busNumber', 'operatorName', 'capacity', 'busType'],
          properties: {
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
              minimum: 1,
              maximum: 100,
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
            }
          }
        },
        BusUpdate: {
          type: 'object',
          properties: {
            operatorName: {
              type: 'string'
            },
            capacity: {
              type: 'number',
              minimum: 1,
              maximum: 100
            },
            busType: {
              type: 'string',
              enum: ['standard', 'semi-luxury', 'luxury', 'super-luxury']
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            isActive: {
              type: 'boolean'
            },
            currentLocation: {
              type: 'object',
              properties: {
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        RouteCreate: {
          type: 'object',
          required: ['routeNumber', 'routeName', 'origin', 'destination', 'distance'],
          properties: {
            routeNumber: {
              type: 'string',
              example: 'R001'
            },
            routeName: {
              type: 'string',
              example: 'Colombo - Kandy Express'
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
              minimum: 0,
              example: 115.5
            },
            estimatedDuration: {
              type: 'number',
              minimum: 0,
              example: 180,
              description: 'Duration in minutes'
            }
          }
        },
        RouteUpdate: {
          type: 'object',
          properties: {
            routeName: {
              type: 'string'
            },
            distance: {
              type: 'number',
              minimum: 0
            },
            estimatedDuration: {
              type: 'number',
              minimum: 0
            },
            stops: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  coordinates: {
                    type: 'object',
                    properties: {
                      latitude: { type: 'number' },
                      longitude: { type: 'number' }
                    }
                  },
                  estimatedArrival: { type: 'number' }
                }
              }
            },
            isActive: {
              type: 'boolean'
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
        name: 'Users',
        description: 'User management and role-based access control'
      },
      {
        name: 'Pricing',
        description: 'Fare calculation and pricing rules management'
      },
      {
        name: 'Seasons',
        description: 'Seasonal pricing and peak/off-peak fare management'
      },
      {
        name: 'Dashboard',
        description: 'Administrative dashboard and overview statistics'
      },
      {
        name: 'Analytics',
        description: 'Fleet performance analytics and operational insights'
      },
      {
        name: 'Reports',
        description: 'Trip reports, revenue reports, and business intelligence'
      },
      {
        name: 'Driver',
        description: 'Driver-specific endpoints for trip management'
      },
      {
        name: 'Operator',
        description: 'Bus operator management and fleet oversight'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};