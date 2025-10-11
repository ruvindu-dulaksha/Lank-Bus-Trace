# 🚌 Lanka Bus Trace API# 🚌 NTC Bus Tracking API



**Real-time inter-provincial bus tracking system for Sri Lanka**Real-time bus tracking system for the National Transport Commission of Sri Lanka.



![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)## 🚀 Quick Setup

![API](https://img.shields.io/badge/API-RESTful-blue)

![Tests](https://img.shields.io/badge/Tests-82%25%20Pass-green)# 🚌 Lanka Bus Trace API - Production Release

![NTC](https://img.shields.io/badge/NTC-Compliant-gold)

**✅ 100% Functional Backend System for Sri Lankan Bus Tracking**

## 📋 Overview

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

Lanka Bus Trace is a comprehensive REST API system designed for real-time tracking of inter-provincial bus services in Sri Lanka. Built in compliance with National Transport Commission (NTC) requirements, it provides tracking-only functionality without booking services.![API](https://img.shields.io/badge/API-100%25%20Functional-success)

![Tests](https://img.shields.io/badge/Tests-All%20Passing-brightgreen)

### Key Features

- **Real-time GPS tracking** of 26 buses across 14 inter-provincial routes---

- **JWT-based authentication** with role-based access control

- **Geospatial queries** for route optimization and tracking## 🎯 **RELEASE HIGHLIGHTS**

- **RESTful API design** with comprehensive documentation

- **MongoDB integration** with optimized indexing### ✅ **Complete Feature Set**

- **Production-ready** with security middleware and error handling- **Real-time GPS Tracking** - Live bus location monitoring

- **Route Search System** - Find routes between cities  

## 🏗️ System Architecture- **Geospatial Queries** - Nearby buses with radius search

- **JWT Authentication** - Secure access for all user roles

```- **Trip Management** - Comprehensive scheduling system

┌─────────────────────────────────────────────────────────────────┐- **Location History** - 12-hour GPS tracking per bus

│                    Lanka Bus Trace API                         │

│                   (Node.js + Express)                          │### 🔧 **Technical Excellence**

└─────────────────────┬───────────────────────────────────────────┘- **RESTful API Design** - Industry standard conventions

                      │- **MongoDB Integration** - Optimized with geospatial indexing

┌─────────────────────┼───────────────────────────────────────────┐- **Security Middleware** - JWT, CORS, rate limiting, validation

│                  API Layer                                     │- **Error Handling** - Comprehensive with detailed responses

├─────────────────────┼───────────────────────────────────────────┤- **API Documentation** - Interactive Swagger docs

│ Authentication      │ Route Management  │ Trip Scheduling       │- **Production Ready** - Fully tested and deployment ready

│ - JWT Tokens        │ - Inter-provincial│ - Real-time Status    │

│ - Role-based Access │ - Route Search    │ - Schedule Management │---

├─────────────────────┼───────────────────┼───────────────────────┤

│ Bus Management      │ Location Tracking │ Analytics & Reports   │## 🚀 **Quick Start**

│ - Fleet Overview    │ - GPS Coordinates │ - Performance Metrics │

│ - Status Monitoring │ - Movement History│ - Usage Analytics     │### Prerequisites

└─────────────────────┼───────────────────┼───────────────────────┘- Node.js 16+ 

                      │- MongoDB (local or Atlas)

┌─────────────────────┼───────────────────────────────────────────┐- Git

│              Business Logic Layer                              │

├─────────────────────┼───────────────────────────────────────────┤### Installation

│ Controllers         │ Middleware        │ Services              │```bash

│ - Request Handling  │ - Authentication  │ - Data Processing     │# Clone the repository

│ - Response Formatting│ - Validation     │ - Business Rules      │git clone <repository-url>

│ - Error Management  │ - Rate Limiting   │ - External APIs       │cd lanka-bus-trace-main

└─────────────────────┼───────────────────────────────────────────┘

                      │# Install dependencies

┌─────────────────────┼───────────────────────────────────────────┐npm install

│                Data Layer                                      │

├─────────────────────┼───────────────────────────────────────────┤# Configure environment

│                MongoDB Atlas                                   │cp .env.example .env

│ ┌─────────────┬─────────────┬─────────────┬─────────────────┐ │# Edit .env with your MongoDB URI and JWT secret

│ │   Users     │   Buses     │   Routes    │   Locations     │ │

│ │   Trips     │   Pricing   │   Analytics │   System Logs   │ │# Import sample data (optional)

│ └─────────────┴─────────────┴─────────────┴─────────────────┘ │node scripts/import-simulation-data.js

└─────────────────────────────────────────────────────────────────┘

```# Create test users (see documentation for credentials)

node scripts/create-test-users.js

### Technology Stack

- **Backend**: Node.js with Express.js framework# Start the server

- **Database**: MongoDB with Mongoose ODMnpm start

- **Authentication**: JWT (JSON Web Tokens)```

- **Documentation**: Swagger/OpenAPI 3.0

- **Security**: Helmet, CORS, Rate Limiting, Input Validation### Test Credentials

- **Deployment**: AWS EC2 with PM2 process management```

Admin:    [See deployment documentation for credentials]

## 🚀 Quick StartOperator: [See deployment documentation for credentials]  

User:     [See deployment documentation for credentials]

### Prerequisites```

- Node.js 16+

- MongoDB (local or MongoDB Atlas)**Note**: Test user credentials are provided separately in deployment documentation for security.

- npm or yarn

---

### Installation

## 📊 **API Status: 100% Functional**

```bash

# Clone the repository### ✅ **Working Endpoints**

git clone https://github.com/ruvindu-dulaksha/lanka-bus-trace.git| Category | Endpoints | Status |

cd lanka-bus-trace|----------|-----------|---------|

| **Authentication** | `/api/auth/*` | ✅ All roles working |

# Install dependencies| **Routes** | `/api/routes/*` | ✅ Search & CRUD operations |

npm install| **Buses** | `/api/buses/*` | ✅ Geospatial & fleet management |

| **Trips** | `/api/trips/*` | ✅ Scheduling & monitoring |

# Configure environment variables| **Locations** | `/api/locations/*` | ✅ GPS tracking with history |

cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret### 🧪 **Test Results**

See `TEST_RESULTS.md` for comprehensive testing report showing 100% functionality.

# Start the development server

npm run dev---



# Or start in production mode## 📚 **API Documentation**

npm start

```### Interactive Docs

- **Swagger UI**: `http://localhost:3000/api-docs`

### Environment Variables- **API Info**: `http://localhost:3000/api`

- **Health Check**: `http://localhost:3000/health`

Create a `.env` file with the following variables:

### Quick Examples

```env```bash

NODE_ENV=development# Login and get token

PORT=3000curl -X POST http://localhost:3000/api/auth/login \

MONGODB_URI=your_mongodb_connection_string  -H "Content-Type: application/json" \

JWT_SECRET=your_secure_jwt_secret  -d '{"emailOrUsername": "your_username", "password": "your_password"}'

JWT_EXPIRE=24h

BCRYPT_SALT_ROUNDS=12# Search routes between cities

```curl -H "Authorization: Bearer <your_jwt_token>" \

  "http://localhost:3000/api/routes/search?from=Colombo&to=Kandy"

## 📚 API Documentation

# Find nearby buses  

### Interactive Documentationcurl -H "Authorization: Bearer <your_jwt_token>" \

- **Swagger UI**: `http://localhost:3000/api-docs`  "http://localhost:3000/api/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5"

- **API Health**: `http://localhost:3000/api/health````



### Main Endpoints**Note**: Replace `your_username`, `your_password`, and `<your_jwt_token>` with actual credentials.



| Method | Endpoint | Description | Auth Required |---

|--------|----------|-------------|---------------|

| `POST` | `/api/auth/login` | User authentication | No |## 🌐 **Production Deployment**

| `POST` | `/api/auth/register` | User registration | No |

| `GET` | `/api/routes` | List all routes | Yes |### AWS Deployment (Recommended)

| `GET` | `/api/routes/search` | Search routes by cities | Yes |1. **EC2 Instance** - Ubuntu 20.04 LTS

| `GET` | `/api/buses` | List all buses | Yes |2. **MongoDB Atlas** - Cloud database

| `GET` | `/api/buses/nearby` | Find nearby buses | Yes |3. **Domain Setup** - Namecheap integration

| `GET` | `/api/trips` | List all trips | Yes |4. **SSL Certificate** - Let's Encrypt

| `POST` | `/api/locations/update` | Update bus location | Yes |5. **Process Manager** - PM2 for production

| `GET` | `/api/system/config` | System configuration | No |

### Environment Configuration

### Example Usage```env

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