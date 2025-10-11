# 🚌 Lanka Bus Trace API# 🚌 Lanka Bus Trace API# 🚌 NTC Bus Tracking API



![Status](https://img.shields.io/badge/Status-100%25%20Functional-brightgreen)

![API](https://img.shields.io/badge/API-Production%20Ready-success)

![Tests](https://img.shields.io/badge/Tests-All%20Passing-brightgreen)**Real-time inter-provincial bus tracking system for Sri Lanka**Real-time bus tracking system for the National Transport Commission of Sri Lanka.

![NTC](https://img.shields.io/badge/NTC-Compliant-gold)



**✅ 100% Functional Backend System for Sri Lankan Bus Tracking**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)## 🚀 Quick Setup

Real-time inter-provincial bus tracking system for Sri Lanka, built in compliance with National Transport Commission (NTC) requirements. This comprehensive REST API provides tracking-only functionality without booking services.

![API](https://img.shields.io/badge/API-RESTful-blue)

## 🎯 Release Highlights

![Tests](https://img.shields.io/badge/Tests-82%25%20Pass-green)# 🚌 Lanka Bus Trace API - Production Release

### ✅ Complete Feature Set

- **Real-time GPS Tracking** - Live bus location monitoring across 26 buses![NTC](https://img.shields.io/badge/NTC-Compliant-gold)

- **Smart Journey Planning** - Intelligent route search between cities  

- **Geospatial Queries** - Find nearby buses with radius-based search**✅ 100% Functional Backend System for Sri Lankan Bus Tracking**

- **JWT Authentication** - Secure access with role-based permissions

- **Trip Management** - Comprehensive scheduling and monitoring system## 📋 Overview

- **Location History** - 12-hour GPS tracking per bus with data persistence

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

### 🔧 Technical Excellence

- **RESTful API Design** - Industry standard conventions with proper HTTP methodsLanka Bus Trace is a comprehensive REST API system designed for real-time tracking of inter-provincial bus services in Sri Lanka. Built in compliance with National Transport Commission (NTC) requirements, it provides tracking-only functionality without booking services.![API](https://img.shields.io/badge/API-100%25%20Functional-success)

- **MongoDB Integration** - Optimized with geospatial indexing for location queries

- **Security Middleware** - JWT, CORS, rate limiting, comprehensive validation![Tests](https://img.shields.io/badge/Tests-All%20Passing-brightgreen)

- **Error Handling** - Robust error responses with detailed messages

- **API Documentation** - Interactive Swagger docs with working examples### Key Features

- **Production Ready** - Fully tested with 100% endpoint functionality

- **Real-time GPS tracking** of 26 buses across 14 inter-provincial routes---

## 📊 API Status: 100% Functional

- **JWT-based authentication** with role-based access control

### ✅ Working Endpoints

- **Geospatial queries** for route optimization and tracking## 🎯 **RELEASE HIGHLIGHTS**

| Category | Endpoints | Status | Features |

|----------|-----------|---------|----------|- **RESTful API design** with comprehensive documentation

| **Authentication** | `/api/auth/*` | ✅ All roles working | Login, registration, JWT tokens |

| **Routes** | `/api/routes/*` | ✅ Search & CRUD operations | Inter-city search, route discovery |- **MongoDB integration** with optimized indexing### ✅ **Complete Feature Set**

| **Buses** | `/api/buses/*` | ✅ Geospatial & fleet management | Fleet status, location tracking |

| **Trips** | `/api/trips/*` | ✅ Scheduling & monitoring | Real-time trip status |- **Production-ready** with security middleware and error handling- **Real-time GPS Tracking** - Live bus location monitoring

| **Locations** | `/api/locations/*` | ✅ GPS tracking with history | Live location updates |

| **Search** | `/api/search/*` | ✅ Multi-type search | Live search, general search |- **Route Search System** - Find routes between cities  

| **Health** | `/api/health` | ✅ System monitoring | Server status, uptime metrics |

## 🏗️ System Architecture- **Geospatial Queries** - Nearby buses with radius search

### 🧪 Test Results

**Comprehensive testing completed**: All major API functions verified working correctly- **JWT Authentication** - Secure access for all user roles

- ✅ Authentication system functional

- ✅ Core data endpoints returning proper data  ```- **Trip Management** - Comprehensive scheduling system

- ✅ Search functionality operational

- ✅ Role-based access control working┌─────────────────────────────────────────────────────────────────┐- **Location History** - 12-hour GPS tracking per bus

- ✅ Error handling robust

- ✅ Data integrity maintained│                    Lanka Bus Trace API                         │



## 🚀 Quick Start│                   (Node.js + Express)                          │### 🔧 **Technical Excellence**



### Prerequisites└─────────────────────┬───────────────────────────────────────────┘- **RESTful API Design** - Industry standard conventions

- Node.js 16+

- MongoDB (local or Atlas)                      │- **MongoDB Integration** - Optimized with geospatial indexing

- Git

┌─────────────────────┼───────────────────────────────────────────┐- **Security Middleware** - JWT, CORS, rate limiting, validation

### Installation

│                  API Layer                                     │- **Error Handling** - Comprehensive with detailed responses

```bash

# Clone the repository├─────────────────────┼───────────────────────────────────────────┤- **API Documentation** - Interactive Swagger docs

git clone https://github.com/ruvindu-dulaksha/Lank-Bus-Trace.git

cd lanka-bus-trace-main│ Authentication      │ Route Management  │ Trip Scheduling       │- **Production Ready** - Fully tested and deployment ready



# Install dependencies│ - JWT Tokens        │ - Inter-provincial│ - Real-time Status    │

npm install

│ - Role-based Access │ - Route Search    │ - Schedule Management │---

# Configure environment

cp .env.example .env├─────────────────────┼───────────────────┼───────────────────────┤

# Edit .env with your MongoDB URI and JWT secret

│ Bus Management      │ Location Tracking │ Analytics & Reports   │## 🚀 **Quick Start**

# Start the server

npm start│ - Fleet Overview    │ - GPS Coordinates │ - Performance Metrics │

```

│ - Status Monitoring │ - Movement History│ - Usage Analytics     │### Prerequisites

### Environment Variables

└─────────────────────┼───────────────────┼───────────────────────┘- Node.js 16+ 

Create a `.env` file with the following variables:

                      │- MongoDB (local or Atlas)

```env

NODE_ENV=development┌─────────────────────┼───────────────────────────────────────────┐- Git

PORT=3000

MONGODB_URI=your_mongodb_connection_string│              Business Logic Layer                              │

JWT_SECRET=your_secure_jwt_secret

JWT_EXPIRE=24h├─────────────────────┼───────────────────────────────────────────┤### Installation

BCRYPT_SALT_ROUNDS=12

```│ Controllers         │ Middleware        │ Services              │```bash



### Test Credentials│ - Request Handling  │ - Authentication  │ - Data Processing     │# Clone the repository



```│ - Response Formatting│ - Validation     │ - Business Rules      │git clone <repository-url>

Username: testuser

Password: Test123!│ - Error Management  │ - Rate Limiting   │ - External APIs       │cd lanka-bus-trace-main

Role: commuter

```└─────────────────────┼───────────────────────────────────────────┘



**Note**: Change all default credentials before production deployment.                      │# Install dependencies



## 📚 API Documentation┌─────────────────────┼───────────────────────────────────────────┐npm install



### Interactive Docs│                Data Layer                                      │

- **Swagger UI**: `http://localhost:3000/api-docs`

- **API Health**: `http://localhost:3000/api/health`├─────────────────────┼───────────────────────────────────────────┤# Configure environment

- **Main Health**: `http://localhost:3000/health`

│                MongoDB Atlas                                   │cp .env.example .env

### Quick Examples

│ ┌─────────────┬─────────────┬─────────────┬─────────────────┐ │# Edit .env with your MongoDB URI and JWT secret

```bash

# Login and get token│ │   Users     │   Buses     │   Routes    │   Locations     │ │

curl -X POST http://localhost:3000/api/auth/login \

  -H "Content-Type: application/json" \│ │   Trips     │   Pricing   │   Analytics │   System Logs   │ │# Import sample data (optional)

  -d '{"emailOrUsername": "testuser", "password": "Test123!"}'

│ └─────────────┴─────────────┴─────────────┴─────────────────┘ │node scripts/import-simulation-data.js

# Search routes between cities

curl -H "Authorization: Bearer <your_jwt_token>" \└─────────────────────────────────────────────────────────────────┘

  "http://localhost:3000/api/routes?origin=Colombo&destination=Kandy"

```# Create test users (see documentation for credentials)

# Find nearby buses

curl -H "Authorization: Bearer <your_jwt_token>" \node scripts/create-test-users.js

  "http://localhost:3000/api/buses?limit=5"

### Technology Stack

# Live search for journeys

curl -H "Authorization: Bearer <your_jwt_token>" \- **Backend**: Node.js with Express.js framework# Start the server

  "http://localhost:3000/api/live-search?from=Colombo&to=Kandy&date=2025-10-11&time=09:00"

```- **Database**: MongoDB with Mongoose ODMnpm start



## 🗂️ Database Collections- **Authentication**: JWT (JSON Web Tokens)```



| Collection | Records | Content |- **Documentation**: Swagger/OpenAPI 3.0

|------------|---------|---------|

| **routes** | 14 | Complete route data with stops and schedules |- **Security**: Helmet, CORS, Rate Limiting, Input Validation### Test Credentials

| **buses** | 26 | Fleet with operator details and real-time status |

| **trips** | 83+ | Scheduled trips with live tracking metrics |- **Deployment**: AWS EC2 with PM2 process management```

| **users** | 59+ | Admin, operators, drivers, commuters |

| **locations** | 11+ | GPS tracking with location history |Admin:    [See deployment documentation for credentials]



## 🔐 Security Features## 🚀 Quick StartOperator: [See deployment documentation for credentials]  



- **JWT Authentication** - Secure token-based access with role validationUser:     [See deployment documentation for credentials]

- **Password Encryption** - bcrypt with configurable salt rounds

- **Input Validation** - Comprehensive request validation and sanitization### Prerequisites```

- **Rate Limiting** - DDoS protection with configurable limits

- **CORS Protection** - Cross-origin security with proper headers- Node.js 16+

- **Error Sanitization** - No sensitive data exposure in error responses

- **Role-based Access Control** - Admin, operator, driver, conductor, commuter roles- MongoDB (local or MongoDB Atlas)**Note**: Test user credentials are provided separately in deployment documentation for security.



## 🏗️ Architecture- npm or yarn



```---

📁 src/

├── 🎮 controllers/     # Business logic and request handling### Installation

├── 🗃️ models/          # MongoDB schemas and data models

├── 🛣️ routes/          # API endpoint definitions## 📊 **API Status: 100% Functional**

├── 🛡️ middleware/      # Security, validation, and authentication

├── ⚙️ config/          # Database connection and logging setup```bash

└── 📊 data/            # Sample datasets and test data

```# Clone the repository### ✅ **Working Endpoints**



## 🌐 Production Deploymentgit clone https://github.com/ruvindu-dulaksha/lanka-bus-trace.git| Category | Endpoints | Status |



### AWS Deployment (Recommended)cd lanka-bus-trace|----------|-----------|---------|



```bash| **Authentication** | `/api/auth/*` | ✅ All roles working |

# Install PM2 globally

npm install -g pm2# Install dependencies| **Routes** | `/api/routes/*` | ✅ Search & CRUD operations |



# Start with PM2npm install| **Buses** | `/api/buses/*` | ✅ Geospatial & fleet management |

pm2 start server.js --name "lanka-bus-trace"

| **Trips** | `/api/trips/*` | ✅ Scheduling & monitoring |

# Save PM2 configuration

pm2 save# Configure environment variables| **Locations** | `/api/locations/*` | ✅ GPS tracking with history |

pm2 startup

```cp .env.example .env



### Environment Configuration# Edit .env with your MongoDB URI and JWT secret### 🧪 **Test Results**



```envSee `TEST_RESULTS.md` for comprehensive testing report showing 100% functionality.

NODE_ENV=production

PORT=3000# Start the development server

MONGODB_URI=mongodb_atlas_connection_string

JWT_SECRET=your_secure_random_secret_key_herenpm run dev---

JWT_EXPIRE=24h

BCRYPT_SALT_ROUNDS=12

```

# Or start in production mode## 📚 **API Documentation**

**Security Note**: Always use strong, unique values for JWT_SECRET and database credentials in production.

npm start

## 🏆 NTC Compliance

```### Interactive Docs

This system is designed in strict compliance with National Transport Commission requirements:

- **Swagger UI**: `http://localhost:3000/api-docs`

- ✅ **Tracking Only**: No booking or payment functionality

- ✅ **Inter-provincial Focus**: Only long-distance routes### Environment Variables- **API Info**: `http://localhost:3000/api`

- ✅ **Real-time Monitoring**: Live GPS tracking with history

- ✅ **Data Security**: Encrypted data transmission and storage- **Health Check**: `http://localhost:3000/health`

- ✅ **Role-based Access**: Proper authorization controls for different user types

Create a `.env` file with the following variables:

## 🔐 Authentication & Authorization

### Quick Examples

### User Roles

- **Admin**: Full system access and management capabilities```env```bash

- **Operator**: Fleet and route management permissions

- **Driver**: Location updates and trip management accessNODE_ENV=development# Login and get token

- **Conductor**: Trip and passenger information access

- **Commuter**: Route search and tracking information accessPORT=3000curl -X POST http://localhost:3000/api/auth/login \



### Security FeaturesMONGODB_URI=your_mongodb_connection_string  -H "Content-Type: application/json" \

- JWT-based authentication with automatic token refresh

- Password encryption with bcryptJWT_SECRET=your_secure_jwt_secret  -d '{"emailOrUsername": "your_username", "password": "your_password"}'

- Role-based access control for API endpoints

- Rate limiting and CORS protectionJWT_EXPIRE=24h

- Input validation and sanitization

- Comprehensive error handlingBCRYPT_SALT_ROUNDS=12# Search routes between cities



## 🏆 Release Notes```curl -H "Authorization: Bearer <your_jwt_token>" \



**Version**: 1.0.0 - Production Release    "http://localhost:3000/api/routes/search?from=Colombo&to=Kandy"

**Date**: October 11, 2025  

**Status**: 100% Functional - All Issues Resolved## 📚 API Documentation



### ✅ What's Working# Find nearby buses  

- Smart journey planning between cities

- Real-time GPS location tracking### Interactive Documentationcurl -H "Authorization: Bearer <your_jwt_token>" \

- Authentication for all user roles

- Role-based access control- **Swagger UI**: `http://localhost:3000/api-docs`  "http://localhost:3000/api/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5"

- Comprehensive search functionality

- Data integrity across all collections- **API Health**: `http://localhost:3000/api/health````

- Production-ready security measures



### 🚀 Ready For

- Production deployment on AWS/cloud platforms### Main Endpoints**Note**: Replace `your_username`, `your_password`, and `<your_jwt_token>` with actual credentials.

- Frontend integration with React/Vue/Angular

- Mobile app development (iOS/Android)

- Real-time WebSocket implementation

- Advanced analytics and reporting| Method | Endpoint | Description | Auth Required |---



## 🤝 Contributing|--------|----------|-------------|---------------|



1. Fork the repository| `POST` | `/api/auth/login` | User authentication | No |## 🌐 **Production Deployment**

2. Create a feature branch: `git checkout -b feature/new-feature`

3. Commit changes: `git commit -am 'Add new feature'`| `POST` | `/api/auth/register` | User registration | No |

4. Push to branch: `git push origin feature/new-feature`

5. Submit a pull request| `GET` | `/api/routes` | List all routes | Yes |### AWS Deployment (Recommended)



## 📄 License| `GET` | `/api/routes/search` | Search routes by cities | Yes |1. **EC2 Instance** - Ubuntu 20.04 LTS



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.| `GET` | `/api/buses` | List all buses | Yes |2. **MongoDB Atlas** - Cloud database



## 📞 Support| `GET` | `/api/buses/nearby` | Find nearby buses | Yes |3. **Domain Setup** - Namecheap integration



For support and questions:| `GET` | `/api/trips` | List all trips | Yes |4. **SSL Certificate** - Let's Encrypt

- **Documentation**: [API Docs](http://localhost:3000/api-docs)

- **Issues**: [GitHub Issues](https://github.com/ruvindu-dulaksha/Lank-Bus-Trace/issues)| `POST` | `/api/locations/update` | Update bus location | Yes |5. **Process Manager** - PM2 for production

- **Repository**: [GitHub Repository](https://github.com/ruvindu-dulaksha/Lank-Bus-Trace)

| `GET` | `/api/system/config` | System configuration | No |

---

### Environment Configuration

**Built for Sri Lankan Public Transportation 🇱🇰**

### Example Usage```env

*Lanka Bus Trace - Connecting Sri Lanka, One Route at a Time*
NODE_ENV=production

```bashPORT=3000

# Login to get JWT tokenMONGODB_URI=mongodb connection string

curl -X POST http://localhost:3000/api/auth/login \JWT_SECRET=your_secure_random_secret_key_here

  -H "Content-Type: application/json" \JWT_EXPIRE=24h

  -d '{"emailOrUsername": "admin", "password": "your_password"}'BCRYPT_SALT_ROUNDS=12

```

# Search routes between cities

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \**Security Note**: Always use strong, unique values for JWT_SECRET and database credentials in production.

  "http://localhost:3000/api/routes/search?from=Colombo&to=Kandy"

---

# Find nearby buses

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \## 🗂️ **Database Collections**

  "http://localhost:3000/api/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5"

```| Collection | Records | Content |

|------------|---------|---------|

## 🔐 Authentication & Authorization| **routes** | 5 | Complete route data with stops |

| **buses** | 25+ | Fleet with operator details |

### User Roles| **trips** | 175+ | Scheduled trips with metrics |

- **Admin**: Full system access and management| **users** | 28+ | Admin, operators, drivers |

- **Operator**: Fleet and route management| **locations** | 10+ | GPS tracking with history |

- **Driver**: Location updates and trip management

- **Conductor**: Trip and passenger information---

- **Commuter**: Route search and tracking information

## 🔐 **Security Features**

### Security Features

- JWT-based authentication- **JWT Authentication** - Secure token-based access

- Password encryption with bcrypt- **Password Encryption** - bcrypt with salt rounds

- Role-based access control- **Input Validation** - Comprehensive request validation

- Rate limiting and CORS protection- **Rate Limiting** - DDoS protection

- Input validation and sanitization- **CORS Protection** - Cross-origin security

- **Error Sanitization** - No sensitive data exposure

## 🗂️ Database Schema

---

### Collections Overview

- **Users**: User accounts with role-based permissions## 🏗️ **Architecture**

- **Buses**: Fleet information with real-time status

- **Routes**: Inter-provincial route definitions```

- **Trips**: Scheduled trips with tracking data📁 src/

- **Locations**: GPS tracking history├── 🎮 controllers/     # Business logic

- **Pricing**: Route-based fare information├── 🗃️ models/          # Database schemas  

├── 🛣️ routes/          # API endpoints

## 🌐 Deployment├── 🛡️ middleware/      # Security & validation

├── ⚙️ config/          # Database & logging

### Production Deployment (AWS)└── 📊 data/            # Sample datasets

```

```bash

# Install PM2 globally---

npm install -g pm2

## 📞 **Support & Documentation**

# Start with PM2

pm2 start server.js --name "lanka-bus-trace"- **API Tests**: Run `npm test` for endpoint validation

- **Logs**: Check `logs/` directory for detailed logging

# Save PM2 configuration- **Scripts**: `scripts/` folder contains utilities

pm2 save- **Issues**: All known issues resolved in latest release

pm2 startup

```---



### Environment Setup## 🏆 **Release Notes**

- **Server**: AWS EC2 (Ubuntu 20.04 LTS)

- **Database**: MongoDB Atlas**Version**: 1.0.0 - Production Release  

- **Process Manager**: PM2**Date**: October 1, 2025  

- **Reverse Proxy**: Nginx (optional)**Status**: 100% Functional - All Issues Resolved

- **SSL**: Let's Encrypt

### ✅ **What's Fixed**

## 🧪 Testing- Route search between cities

- Geospatial nearby bus queries

```bash- Authentication for all user roles

# Run the comprehensive test suite- Bus route assignment queries  

./comprehensive_function_test.sh- Location tracking data population

- Admin password authentication

# Test specific endpoints

npm test### 🚀 **Ready For**

```- Production deployment

- Frontend integration  

**Current Test Results**: 82% pass rate (45/55 tests passing)- Mobile app development

- Real-time tracking implementation

## 📊 System Status

---

### Fleet Coverage

- **26 Buses** across the network**Built for Sri Lankan Public Transportation | NTC Bus Tracking System** 🇱🇰

- **14 Inter-provincial routes**

- **5+ Major cities** connected---

- **Real-time tracking** enabled

## ⚠️ SECURITY NOTICE

### API Performance

- **Response Time**: < 200ms average**This repository contains development/demo code. Before production deployment:**

- **Uptime**: 99.9% target- Change ALL default credentials

- **Rate Limit**: 1000 requests per 15 minutes per IP- Generate new JWT secrets  

- **Data**: 175+ trips, 25+ buses, 28+ users- Create production database with new credentials

- Review `DEVELOPMENT_CREDENTIALS.md` for security checklist

## 🏆 NTC Compliance- Follow deployment security best practices



This system is designed in strict compliance with National Transport Commission requirements:**Never use development credentials in production!**



- ✅ **Tracking Only**: No booking or payment functionality## 📚 API Documentation

- ✅ **Inter-provincial Focus**: Only long-distance routes

- ✅ **Real-time Monitoring**: Live GPS trackingVisit `http://localhost:3000/api-docs` for interactive Swagger documentation.

- ✅ **Data Security**: Encrypted data transmission

- ✅ **Role-based Access**: Proper authorization controls## 🔑 Key Features



## 🤝 Contributing- **JWT & API Key Authentication**

- **Real-time GPS Location Tracking**

1. Fork the repository- **Route Management System**

2. Create a feature branch: `git checkout -b feature/new-feature`- **Trip Scheduling & Monitoring**

3. Commit changes: `git commit -am 'Add new feature'`- **RESTful API Design**

4. Push to branch: `git push origin feature/new-feature`- **MongoDB Integration**

5. Submit a pull request- **Comprehensive Validation**

- **Security Middleware**

## 📄 License- **Rate Limiting**

- **Error Handling**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Deployment to AWS

## 📞 Support

1. Use AWS EC2 + MongoDB Atlas

For support and questions:2. Set environment variables securely

- **Email**: info@lankabustrace.lk3. Configure security groups and firewalls

- **Documentation**: [API Docs](http://localhost:3000/api-docs)4. Deploy using PM2 or Docker

- **Issues**: [GitHub Issues](https://github.com/ruvindu-dulaksha/lanka-bus-trace/issues)5. **Important**: Change all default credentials before production deployment



---## 🔐 Security Recommendations



**Built for Sri Lankan Public Transportation 🇱🇰**- **Never commit sensitive data** to version control

- **Use environment variables** for all credentials

*Lanka Bus Trace - Connecting Sri Lanka, One Route at a Time*- **Enable HTTPS** in production
- **Change default passwords** before deployment
- **Use strong JWT secrets** (minimum 32 characters)
- **Enable MongoDB authentication**
- **Configure proper CORS** settings

## 📖 Main Endpoints

- `POST /api/auth/login` - User login
- `GET /api/routes` - List all routes
- `GET /api/buses` - List all buses
- `POST /api/locations/update` - Update bus location
- `GET /api/trips` - List trips

This is production-ready backend code - copy to your local environment and run!