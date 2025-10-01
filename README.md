# 🚌 NTC Bus Tracking API

Real-time bus tracking system for the National Transport Commission of Sri Lanka.

## 🚀 Quick Setup

```bash
# 1. Copy all files to your local project directory

# 2. Rename backend-package.json to package.json
mv backend-package.json package.json

# 3. Install dependencies
npm install

# 4. Create .env file from example
cp .env.example .env

# 5. Update .env with your MongoDB connection:
# MONGODB_URI=mongodb://localhost:27017/bus_tracking_db
# JWT_SECRET=your_super_secret_key_here

# 6. Start MongoDB (if local)
mongod

# 7. Start development server
npm run dev
```

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
2. Set environment variables
3. Configure security groups
4. Deploy using PM2 or Docker

## 📖 Main Endpoints

- `POST /api/auth/login` - User login
- `GET /api/routes` - List all routes
- `GET /api/buses` - List all buses
- `POST /api/locations/update` - Update bus location
- `GET /api/trips` - List trips

This is production-ready backend code - copy to your local environment and run!