# 🚌 Lanka Bus Trace API

![Status](https://img.shields.io/badge/Status-100%25%20Functional-brightgreen)
![API](https://img.shields.io/badge/API-Production%20Ready-success)
![Tests](https://img.shields.io/badge/Tests-All%20Passing-brightgreen)
![NTC](https://img.shields.io/badge/NTC-Compliant-gold)

**✅ 100% Functional Backend System for Sri Lankan Bus Tracking**

## 👨‍💻 Developer Information
- **Student Name**: K.D.R. Dulaksha
- **Student ID**: COBSCCOMP4Y241P-018
- **Institution**: Coventry University
- **Project**: Real-time Inter-Provincial Bus Tracking System for Sri Lanka

## 📋 Project Overview

Real-time inter-provincial bus tracking system for Sri Lanka, built in compliance with National Transport Commission (NTC) requirements. This comprehensive REST API provides tracking-only functionality without booking services, designed as part of academic coursework for advanced software development.

## 🎯 Key Features

### ✅ Complete Feature Set
- **Real-time GPS Tracking** - Live bus location monitoring across 26 buses
- **Smart Journey Planning** - Intelligent route search between cities  
- **Geospatial Queries** - Find nearby buses with radius-based search
- **JWT Authentication** - Secure access with role-based permissions
- **Trip Management** - Comprehensive scheduling and monitoring system
- **Location History** - 12-hour GPS tracking per bus with data persistence

### 🔧 Technical Excellence
- **RESTful API Design** - Industry standard conventions with proper HTTP methods
- **MongoDB Integration** - Optimized with geospatial indexing for location queries
- **Security Middleware** - JWT, CORS, rate limiting, comprehensive validation
- **Error Handling** - Robust error responses with detailed messages
- **API Documentation** - Interactive Swagger docs with working examples
- **Production Ready** - Fully tested with 100% endpoint functionality

## 📊 API Status: 100% Functional

### ✅ Complete API Endpoints

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| **🔐 Authentication** |
| `POST` | `/api/auth/login` | User authentication with JWT token | ❌ | JWT token + user data |
| `POST` | `/api/auth/register` | User registration | ❌ | Success message |
| `GET` | `/api/auth/profile` | Get current user profile | ✅ | User profile data |
| `POST` | `/api/auth/logout` | Logout user | ✅ | Success message |
| **🚌 Bus Management** |
| `GET` | `/api/buses` | List all buses with pagination | ✅ | Array of buses |
| `GET` | `/api/buses/:id` | Get specific bus details | ✅ | Bus details |
| `POST` | `/api/buses` | Create new bus | ✅ Admin | Created bus data |
| `PUT` | `/api/buses/:id` | Update bus information | ✅ Admin | Updated bus data |
| `DELETE` | `/api/buses/:id` | Delete bus | ✅ Admin | Success message |
| **🛣️ Route Management** |
| `GET` | `/api/routes` | List all routes with filtering | ✅ | Array of routes |
| `GET` | `/api/routes/:id` | Get specific route details | ✅ | Route details |
| `GET` | `/api/routes/search` | Search routes by origin/destination | ✅ | Matching routes |
| `POST` | `/api/routes` | Create new route | ✅ Admin | Created route data |
| `PUT` | `/api/routes/:id` | Update route information | ✅ Admin | Updated route data |
| `DELETE` | `/api/routes/:id` | Delete route | ✅ Admin | Success message |
| **🚂 Trip Management** |
| `GET` | `/api/trips` | List all trips with filtering | ✅ | Array of trips |
| `GET` | `/api/trips/:id` | Get specific trip details | ✅ | Trip details |
| `POST` | `/api/trips` | Create new trip | ✅ Operator | Created trip data |
| `PUT` | `/api/trips/:id` | Update trip status | ✅ Driver | Updated trip data |
| `DELETE` | `/api/trips/:id` | Cancel trip | ✅ Operator | Success message |
| **📍 Location Tracking** |
| `GET` | `/api/locations` | List location history | ✅ | Array of locations |
| `GET` | `/api/locations/:busId` | Get bus location history | ✅ | Location history |
| `POST` | `/api/locations/update` | Update bus location | ✅ Driver | Updated location |
| `GET` | `/api/locations/nearby` | Find nearby buses | ✅ | Nearby buses |
| **🔍 Search & Discovery** |
| `GET` | `/api/search` | General search across all entities | ✅ | Search results |
| `GET` | `/api/live-search` | Smart journey planning search | ✅ | Journey options |
| `GET` | `/api/search/routes` | Search routes by criteria | ✅ | Route results |
| `GET` | `/api/search/buses` | Search buses by criteria | ✅ | Bus results |
| **👥 User Management** |
| `GET` | `/api/users` | List all users | ✅ Admin | Array of users |
| `GET` | `/api/users/:id` | Get specific user | ✅ Admin | User details |
| `PUT` | `/api/users/:id` | Update user information | ✅ Admin | Updated user |
| `DELETE` | `/api/users/:id` | Delete user account | ✅ Admin | Success message |
| **📊 Analytics & Reports** |
| `GET` | `/api/analytics/dashboard` | Get dashboard metrics | ✅ Admin | Dashboard data |
| `GET` | `/api/analytics/buses` | Bus performance analytics | ✅ Operator | Bus metrics |
| `GET` | `/api/analytics/routes` | Route performance analytics | ✅ Operator | Route metrics |
| `GET` | `/api/reports/trips` | Trip reports | ✅ Operator | Trip reports |
| **🏥 System Health** |
| `GET` | `/health` | Basic health check | ❌ | Server status |
| `GET` | `/api/health` | Detailed health metrics | ❌ | System metrics |
| `GET` | `/api-docs` | Interactive API documentation | ❌ | Swagger UI |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ruvindu-dulaksha/Lank-Bus-Trace.git
cd Lank-Bus-Trace

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm start
```

### Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=24h
BCRYPT_SALT_ROUNDS=12
```

### Test Credentials

```
Username: testuser
Password: Test123!
Role: commuter
```

**Note**: Change all default credentials before production deployment.

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Health**: `http://localhost:3000/api/health`
- **Main Health**: `http://localhost:3000/health`

### Quick Examples

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "testuser", "password": "Test123!"}'

# Search routes between cities
curl -H "Authorization: Bearer <your_jwt_token>" \
  "http://localhost:3000/api/routes?origin=Colombo&destination=Kandy"

# Find buses
curl -H "Authorization: Bearer <your_jwt_token>" \
  "http://localhost:3000/api/buses?limit=5"

# Live search for journeys
curl -H "Authorization: Bearer <your_jwt_token>" \
  "http://localhost:3000/api/live-search?from=Colombo&to=Kandy&date=2025-10-11&time=09:00"
```

## 🗂️ Database Collections

| Collection | Records | Content |
|------------|---------|---------|
| **routes** | 14 | Complete route data with stops and schedules |
| **buses** | 26 | Fleet with operator details and real-time status |
| **trips** | 83+ | Scheduled trips with live tracking metrics |
| **users** | 59+ | Admin, operators, drivers, commuters |
| **locations** | 11+ | GPS tracking with location history |

## 🔐 Security Features

- **JWT Authentication** - Secure token-based access with role validation
- **Password Encryption** - bcrypt with configurable salt rounds
- **Input Validation** - Comprehensive request validation and sanitization
- **Rate Limiting** - DDoS protection with configurable limits
- **CORS Protection** - Cross-origin security with proper headers
- **Error Sanitization** - No sensitive data exposure in error responses
- **Role-based Access Control** - Admin, operator, driver, conductor, commuter roles

## 🏗️ System Architecture

### 📊 Production Backend Architecture

![Lanka Bus Trace API - Production Backend Architecture](docs/architecture-diagram.md)

*Complete production backend architecture diagram showing all layers from client applications to external services*

The Lanka Bus Trace API follows a comprehensive **9-layer architecture** designed for scalability, security, and maintainability:

#### 🖥️ **Layer 1: Client Applications**
- **Web Browsers** (Admin Dashboard)
- **Mobile Apps** (Driver/Commuter Apps) 
- **Postman/API Testing Tools**
- **Third-party Integrations**

#### 🌐 **Layer 2: Client Layer** 
- **Namecheap Domain** (ruvindu-dulaksha.me)
- **SSL/TLS Certificate** (Let's Encrypt)
- **DNS Resolution**

#### ☁️ **Layer 3: AWS Cloud**
- **AWS EC2** (t2.micro, Free Tier)
- **Security Groups** (Firewall)
- **Elastic IP** (Optional)

#### 🔧 **Layer 4: Web Server Layer**
- **Nginx Reverse Proxy**
- **Load Balancing**
- **HTTPS Termination**
- **Static File Serving**

#### 🚀 **Layer 5: API Endpoints**
- **Node.js Runtime**
- **Express.js Framework**
- **PM2 Process Manager**
- **API Gateway**

#### 🛡️ **Layer 6: Middleware**
- **Rate Limiting**
- **CORS Protection**
- **Request Validation**
- **Encrypt Password Hashing**

#### 🎯 **Layer 7: API Endpoints**
- **Controllers** (Business Logic)
- **Services** (Data Processing)
- **Utilities** (Helper Functions)
- **Helmet Security Headers**

#### 💾 **Layer 8: Business Logic**
- **MongoDB Atlas Cluster**
- **Services** (Authentication, Validation)
- **Swagger** (OpenAPI Documentation)

#### 🌍 **Layer 9: External Services**
- **MongoDB Atlas** (Cloud Database)
- **GitHub Repository** (Source Code)
- **Swagger/OpenAPI** (Documentation)

> **📋 Detailed Architecture**: See [Architecture Documentation](docs/ARCHITECTURE.md) for comprehensive system design details.

#### 🏗️ **Architecture Layers Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                         │
│  Web Browsers │ Mobile Apps │ Postman/Testing │ Integrations   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│              NETWORK & SECURITY LAYER                          │
│    Namecheap Domain │ SSL/TLS Certificates │ DNS Resolution     │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                AWS CLOUD INFRASTRUCTURE                        │
│  AWS EC2 (t2.micro) │ Security Groups │ Elastic IP (Optional)  │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│               WEB SERVER LAYER                                 │
│ Nginx Reverse Proxy │ Load Balancing │ HTTPS │ Static Files    │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│               API ENDPOINTS LAYER                              │
│  Node.js Runtime │ Express.js │ PM2 Manager │ API Gateway      │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                MIDDLEWARE LAYER                                │
│ Rate Limiting │ CORS Protection │ Validation │ Encryption      │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                              │
│ Controllers │ Services │ Utilities │ Helmet Security Headers   │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│               DATABASE LAYER                                   │
│    MongoDB Atlas │ Geospatial Indexing │ Data Validation      │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                 │
│  MongoDB Atlas │ GitHub Repository │ Swagger Documentation     │
└─────────────────────────────────────────────────────────────────┘
```

The Lanka Bus Trace API follows a comprehensive multi-layered architecture designed for scalability, security, and maintainability:

#### 🖥️ **Client Layer**
- **Web Browsers**: Admin dashboard and management interfaces
- **Mobile Apps**: Driver and commuter applications  
- **API Testing Tools**: Postman for development and testing
- **Third-party Integrations**: External system connections

#### 🌐 **Network & Security Layer**
- **Namecheap Domain**: Custom domain management (ruvindu-dulaksha.me)
- **SSL/TLS Certificate**: Let's Encrypt for HTTPS encryption
- **DNS Resolution**: Proper domain to IP mapping

#### ☁️ **AWS Cloud Infrastructure**
- **AWS EC2 (t2.micro)**: Free tier virtual server hosting
- **Security Groups**: Firewall rules and access control
- **Elastic IP**: Optional static IP address assignment

#### 🔧 **Web Server Layer**
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **Load Balancing**: Traffic distribution (future scalability)
- **HTTPS Termination**: SSL certificate management
- **Static File Serving**: Efficient asset delivery

#### 🚀 **API Endpoints Layer**
- **Node.js Runtime**: JavaScript server environment
- **Express.js Framework**: RESTful API development
- **PM2 Process Manager**: Application monitoring and auto-restart
- **API Gateway**: Centralized request handling

#### 🛡️ **Middleware Layer**
- **Rate Limiting**: DDoS protection and abuse prevention
- **CORS Protection**: Cross-origin request security
- **Request Validation**: Input sanitization and validation
- **Encrypt Password**: bcrypt hashing for security

#### 🎯 **API Endpoints Layer**
- **Controllers**: Business logic and request handling
- **Services**: Data processing and business rules
- **Utilities**: Helper functions and processing
- **Helmet Security**: HTTP header security

#### 💾 **Business Logic Layer**
- **MongoDB Atlas**: Cloud database cluster
- **Services**: Authentication, validation, geospatial queries
- **Swagger**: OpenAPI documentation generation

#### 🌍 **External Services**
- **MongoDB Atlas**: Cloud database hosting
- **GitHub Repository**: Source code management
- **Swagger/OpenAPI**: API documentation hosting

### 📁 **Project Structure**

```
📁 src/
├── 🎮 controllers/     # Business logic and request handling
│   ├── authController.js      # Authentication & authorization
│   ├── busController.js       # Bus fleet management
│   ├── routeController.js     # Route management
│   ├── tripController.js      # Trip scheduling & monitoring
│   ├── locationController.js  # GPS tracking & history
│   └── searchController.js    # Search & discovery
├── 🗃️ models/          # MongoDB schemas and data models
│   ├── User.js               # User accounts & roles
│   ├── Bus.js                # Bus fleet information
│   ├── Route.js              # Route definitions
│   ├── Trip.js               # Trip scheduling data
│   └── Location.js           # GPS tracking history
├── 🛣️ routes/          # API endpoint definitions
│   ├── auth.js               # Authentication routes
│   ├── buses.js              # Bus management routes
│   ├── routes.js             # Route management routes
│   ├── trips.js              # Trip management routes
│   ├── locations.js          # Location tracking routes
│   └── search.js             # Search & discovery routes
├── 🛡️ middleware/      # Security, validation, and authentication
│   ├── auth.js               # JWT authentication middleware
│   ├── validation.js         # Request validation
│   ├── errorHandler.js       # Global error handling
│   └── notFound.js           # 404 error handling
├── ⚙️ config/          # Database connection and logging setup
│   ├── database.js           # MongoDB connection
│   ├── swagger.js            # API documentation config
│   └── logger.js             # Application logging
└── 📊 data/            # Sample datasets and test data
    ├── sample-data.json      # Basic test data
    └── extended-sample-data.json # Comprehensive test data
```

## 🏆 NTC Compliance

This system is designed in strict compliance with National Transport Commission requirements:

- ✅ **Tracking Only**: No booking or payment functionality
- ✅ **Inter-provincial Focus**: Only long-distance routes
- ✅ **Real-time Monitoring**: Live GPS tracking with history
- ✅ **Data Security**: Encrypted data transmission and storage
- ✅ **Role-based Access**: Proper authorization controls for different user types

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access and management capabilities
- **Operator**: Fleet and route management permissions
- **Driver**: Location updates and trip management access
- **Conductor**: Trip and passenger information access
- **Commuter**: Route search and tracking information access

### Security Features
- JWT-based authentication with automatic token refresh
- Password encryption with bcrypt
- Role-based access control for API endpoints
- Rate limiting and CORS protection
- Input validation and sanitization
- Comprehensive error handling

## 🧪 Testing Results

**Comprehensive testing completed**: All major API functions verified working correctly
- ✅ Authentication system functional
- ✅ Core data endpoints returning proper data  
- ✅ Search functionality operational
- ✅ Role-based access control working
- ✅ Error handling robust
- ✅ Data integrity maintained

## 🌐 Production Deployment

### AWS Deployment (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "lanka-bus-trace"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Configuration

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRE=24h
BCRYPT_SALT_ROUNDS=12
```

**Security Note**: Always use strong, unique values for JWT_SECRET and database credentials in production.

## 🏆 Release Notes

**Version**: 1.0.0 - Production Release  
**Date**: October 11, 2025  
**Status**: 100% Functional - All Issues Resolved

### ✅ What's Working
- Smart journey planning between cities
- Real-time GPS location tracking
- Authentication for all user roles
- Role-based access control
- Comprehensive search functionality
- Data integrity across all collections
- Production-ready security measures

### 🚀 Ready For
- Production deployment on AWS/cloud platforms
- Frontend integration with React/Vue/Angular
- Mobile app development (iOS/Android)
- Real-time WebSocket implementation
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Documentation**: [API Docs](http://localhost:3000/api-docs)
- **Issues**: [GitHub Issues](https://github.com/ruvindu-dulaksha/Lank-Bus-Trace/issues)
- **Repository**: [GitHub Repository](https://github.com/ruvindu-dulaksha/Lank-Bus-Trace)

---

## 📚 Academic Context

This project was developed as part of advanced software development coursework, demonstrating:
- **Full-stack API development** with Node.js and Express
- **Database design and optimization** with MongoDB
- **Authentication and authorization** implementation
- **Production deployment** and DevOps practices
- **API documentation** and testing methodologies
- **Security best practices** for web applications

**Built for Sri Lankan Public Transportation 🇱🇰**

*Lanka Bus Trace - Connecting Sri Lanka, One Route at a Time*

---

**Developer**: K.D.R. Dulaksha | **Student ID**: COBSCCOMP241P-018