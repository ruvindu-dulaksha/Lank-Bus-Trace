# 🚌 NTC Bus Tracking API

Real-time bus tracking system for the National Transport Commission of Sri Lanka.

## 🚀 Quick Setup

# 🚌 Lanka Bus Trace API - Production Release

**✅ 100% Functional Backend System for Sri Lankan Bus Tracking**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![API](https://img.shields.io/badge/API-100%25%20Functional-success)
![Tests](https://img.shields.io/badge/Tests-All%20Passing-brightgreen)

---

## 🎯 **RELEASE HIGHLIGHTS**

### ✅ **Complete Feature Set**
- **Real-time GPS Tracking** - Live bus location monitoring
- **Route Search System** - Find routes between cities  
- **Geospatial Queries** - Nearby buses with radius search
- **JWT Authentication** - Secure access for all user roles
- **Trip Management** - Comprehensive scheduling system
- **Location History** - 12-hour GPS tracking per bus

### 🔧 **Technical Excellence**
- **RESTful API Design** - Industry standard conventions
- **MongoDB Integration** - Optimized with geospatial indexing
- **Security Middleware** - JWT, CORS, rate limiting, validation
- **Error Handling** - Comprehensive with detailed responses
- **API Documentation** - Interactive Swagger docs
- **Production Ready** - Fully tested and deployment ready

---

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd lanka-bus-trace-main

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Import sample data (optional)
node scripts/import-simulation-data.js

# Create test users (see documentation for credentials)
node scripts/create-test-users.js

# Start the server
npm start
```

### Test Credentials
```
Admin:    [See deployment documentation for credentials]
Operator: [See deployment documentation for credentials]  
User:     [See deployment documentation for credentials]
```

**Note**: Test user credentials are provided separately in deployment documentation for security.

---

## 📊 **API Status: 100% Functional**

### ✅ **Working Endpoints**
| Category | Endpoints | Status |
|----------|-----------|---------|
| **Authentication** | `/api/auth/*` | ✅ All roles working |
| **Routes** | `/api/routes/*` | ✅ Search & CRUD operations |
| **Buses** | `/api/buses/*` | ✅ Geospatial & fleet management |
| **Trips** | `/api/trips/*` | ✅ Scheduling & monitoring |
| **Locations** | `/api/locations/*` | ✅ GPS tracking with history |

### 🧪 **Test Results**
See `TEST_RESULTS.md` for comprehensive testing report showing 100% functionality.

---

## 📚 **API Documentation**

### Interactive Docs
- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Info**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

### Quick Examples
```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "your_username", "password": "your_password"}'

# Search routes between cities
curl -H "Authorization: Bearer <your_jwt_token>" \
  "http://localhost:3000/api/routes/search?from=Colombo&to=Kandy"

# Find nearby buses  
curl -H "Authorization: Bearer <your_jwt_token>" \
  "http://localhost:3000/api/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5"
```

**Note**: Replace `your_username`, `your_password`, and `<your_jwt_token>` with actual credentials.

---

## 🌐 **Production Deployment**

### AWS Deployment (Recommended)
1. **EC2 Instance** - Ubuntu 20.04 LTS
2. **MongoDB Atlas** - Cloud database
3. **Domain Setup** - Namecheap integration
4. **SSL Certificate** - Let's Encrypt
5. **Process Manager** - PM2 for production

### Environment Configuration
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb connection string
JWT_SECRET=your_secure_random_secret_key_here
JWT_EXPIRE=24h
BCRYPT_SALT_ROUNDS=12
```

**Security Note**: Always use strong, unique values for JWT_SECRET and database credentials in production.

---

## 🗂️ **Database Collections**

| Collection | Records | Content |
|------------|---------|---------|
| **routes** | 5 | Complete route data with stops |
| **buses** | 25+ | Fleet with operator details |
| **trips** | 175+ | Scheduled trips with metrics |
| **users** | 28+ | Admin, operators, drivers |
| **locations** | 10+ | GPS tracking with history |

---

## 🔐 **Security Features**

- **JWT Authentication** - Secure token-based access
- **Password Encryption** - bcrypt with salt rounds
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - DDoS protection
- **CORS Protection** - Cross-origin security
- **Error Sanitization** - No sensitive data exposure

---

## 🏗️ **Architecture**

```
📁 src/
├── 🎮 controllers/     # Business logic
├── 🗃️ models/          # Database schemas  
├── 🛣️ routes/          # API endpoints
├── 🛡️ middleware/      # Security & validation
├── ⚙️ config/          # Database & logging
└── 📊 data/            # Sample datasets
```

---

## 📞 **Support & Documentation**

- **API Tests**: Run `npm test` for endpoint validation
- **Logs**: Check `logs/` directory for detailed logging
- **Scripts**: `scripts/` folder contains utilities
- **Issues**: All known issues resolved in latest release

---

## 🏆 **Release Notes**

**Version**: 1.0.0 - Production Release  
**Date**: October 1, 2025  
**Status**: 100% Functional - All Issues Resolved

### ✅ **What's Fixed**
- Route search between cities
- Geospatial nearby bus queries
- Authentication for all user roles
- Bus route assignment queries  
- Location tracking data population
- Admin password authentication

### 🚀 **Ready For**
- Production deployment
- Frontend integration  
- Mobile app development
- Real-time tracking implementation

---

**Built for Sri Lankan Public Transportation | NTC Bus Tracking System** 🇱🇰

---

## ⚠️ SECURITY NOTICE

**This repository contains development/demo code. Before production deployment:**
- Change ALL default credentials
- Generate new JWT secrets  
- Create production database with new credentials
- Review `DEVELOPMENT_CREDENTIALS.md` for security checklist
- Follow deployment security best practices

**Never use development credentials in production!**

## 📚 API Documentation

Visit `http://localhost:3000/api-docs` for interactive Swagger documentation.

## 🔑 Key Features

- **JWT & API Key Authentication**
- **Real-time GPS Location Tracking**
- **Route Management System**
- **Trip Scheduling & Monitoring**
- **RESTful API Design**
- **MongoDB Integration**
- **Comprehensive Validation**
- **Security Middleware**
- **Rate Limiting**
- **Error Handling**

## 🌐 Deployment to AWS

1. Use AWS EC2 + MongoDB Atlas
2. Set environment variables securely
3. Configure security groups and firewalls
4. Deploy using PM2 or Docker
5. **Important**: Change all default credentials before production deployment

## 🔐 Security Recommendations

- **Never commit sensitive data** to version control
- **Use environment variables** for all credentials
- **Enable HTTPS** in production
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