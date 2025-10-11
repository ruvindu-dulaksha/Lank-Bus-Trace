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

### ✅ Working Endpoints

| Category | Endpoints | Status | Features |
|----------|-----------|---------|----------|
| **Authentication** | `/api/auth/*` | ✅ All roles working | Login, registration, JWT tokens |
| **Routes** | `/api/routes/*` | ✅ Search & CRUD operations | Inter-city search, route discovery |
| **Buses** | `/api/buses/*` | ✅ Geospatial & fleet management | Fleet status, location tracking |
| **Trips** | `/api/trips/*` | ✅ Scheduling & monitoring | Real-time trip status |
| **Locations** | `/api/locations/*` | ✅ GPS tracking with history | Live location updates |
| **Search** | `/api/search/*` | ✅ Multi-type search | Live search, general search |
| **Health** | `/api/health` | ✅ System monitoring | Server status, uptime metrics |

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

## 🏗️ Architecture

```
📁 src/
├── 🎮 controllers/     # Business logic and request handling
├── 🗃️ models/          # MongoDB schemas and data models
├── 🛣️ routes/          # API endpoint definitions
├── 🛡️ middleware/      # Security, validation, and authentication
├── ⚙️ config/          # Database connection and logging setup
└── 📊 data/            # Sample datasets and test data
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