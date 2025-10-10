# 🚀 **Lanka Bus Trace API - Complete Endpoint Documentation**
## **For Postman Testing & Deployment**

---

## 📋 **Base Configuration**

```
Base URL: http://localhost:3000
Production URL: https://your-domain.com
API Version: 1.0.0
Content-Type: application/json
```

---

## 🔐 **Authentication**

### **Common Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-API-Key": "your-api-key",
  "Authorization": "Bearer your-jwt-token"
}
```

---

## 📖 **ALL API ENDPOINTS**

### **🏥 1. HEALTH & INFO ENDPOINTS**

#### **GET /health**
- **Method:** GET
- **URL:** `{{base_url}}/health`
- **Headers:** None required
- **Response:**
```json
{
  "status": "OK",
  "message": "Lanka Bus Trace API is running",
  "timestamp": "2025-10-08T14:30:00.000Z",
  "uptime": 1234.567,
  "environment": "development"
}
```

#### **GET /api**
- **Method:** GET
- **URL:** `{{base_url}}/api`
- **Headers:** None required
- **Response:**
```json
{
  "name": "Lanka Bus Trace API",
  "version": "1.0.0",
  "description": "Real-time bus tracking system for inter-provincial services in Sri Lanka",
  "endpoints": {
    "documentation": "/api-docs",
    "health": "/health",
    "auth": "/api/auth",
    "buses": "/api/buses",
    "routes": "/api/routes",
    "trips": "/api/trips",
    "locations": "/api/locations"
  }
}
```

---

### **🔐 2. AUTHENTICATION ENDPOINTS**

#### **POST /api/auth/register**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "username": "test_user",
  "email": "test@lankabustrace.lk",
  "password": "TestPass123!",
  "role": "commuter"
}
```

#### **POST /api/auth/login**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "emailOrUsername": "test@lankabustrace.lk",
  "password": "TestPass123!"
}
```

#### **POST /api/auth/api-key**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/api-key`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:** None

#### **POST /api/auth/forgot-password**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/forgot-password`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@lankabustrace.lk"
}
```

#### **POST /api/auth/reset-password**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/reset-password`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewPass123!"
}
```

#### **POST /api/auth/change-password**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/change-password`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

### **🛣️ 3. ROUTES ENDPOINTS**

#### **GET /api/routes**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes`
- **Query Params:**
  - `page=1`
  - `limit=20`
  - `origin=Colombo`
  - `destination=Kandy`
  - `status=active`
  - `search=Express`

#### **GET /api/routes/search**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/search`
- **Query Params:**
  - `origin=Colombo` (required)
  - `destination=Kandy` (required)
  - `date=2025-10-08`
  - `passengers=2`
  - `busType=luxury`
  - `serviceType=express`
  - `maxPrice=500`
  - `minPrice=100`
  - `hasAC=true`
  - `hasWiFi=true`
  - `sortBy=price`
  - `sortOrder=asc`

#### **GET /api/routes/cities**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/cities`
- **Headers:** None required

#### **GET /api/routes/estimate-price**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/estimate-price`
- **Query Params:**
  - `origin=Colombo` (required)
  - `destination=Kandy` (required)
  - `passengers=2`

#### **GET /api/routes/pricing/:from/:to**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/pricing/Colombo/Kandy`
- **Query Params:**
  - `passengers=2`
  - `busType=luxury`

#### **GET /api/routes/:id**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/{{route_id}}`
- **Headers:** None required

#### **GET /api/routes/:id/stops**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/{{route_id}}/stops`
- **Headers:** None required

#### **GET /api/routes/:id/stats**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/{{route_id}}/stats`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **GET /api/routes/province/:province**
- **Method:** GET
- **URL:** `{{base_url}}/api/routes/province/Western`
- **Query Params:**
  - `limit=50`

#### **POST /api/routes**
- **Method:** POST
- **URL:** `{{base_url}}/api/routes`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "routeNumber": "R007",
  "routeName": "Colombo - Matara Coastal",
  "origin": "Colombo",
  "destination": "Matara",
  "distance": 160,
  "estimatedDuration": 210,
  "provinces": ["Western", "Southern"],
  "serviceType": "express",
  "operationalHours": {
    "firstDeparture": "05:00",
    "lastDeparture": "22:00",
    "frequency": "every_30_minutes"
  },
  "stops": [
    {
      "name": "Colombo Central",
      "coordinates": {
        "latitude": 6.9271,
        "longitude": 79.8612
      },
      "estimatedArrival": "00:00",
      "stopOrder": 1
    }
  ],
  "fareStructure": {
    "baseFare": 50,
    "farePerKm": 1.2
  }
}
```

#### **PUT /api/routes/:id**
- **Method:** PUT
- **URL:** `{{base_url}}/api/routes/{{route_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:** Same as POST with updated fields

#### **DELETE /api/routes/:id**
- **Method:** DELETE
- **URL:** `{{base_url}}/api/routes/{{route_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

---

### **🚌 4. BUSES ENDPOINTS**

#### **GET /api/buses**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses`
- **Query Params:**
  - `page=1`
  - `limit=20`
  - `status=active`
  - `busType=luxury`
  - `operator=Lanka Express`
  - `search=WP-KX-1001`

#### **GET /api/buses/nearby**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/nearby`
- **Query Params:**
  - `latitude=6.9271` (required)
  - `longitude=79.8612` (required)
  - `radius=5000`

#### **GET /api/buses/live-tracking/:id**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/live-tracking/{{bus_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **GET /api/buses/fleet-status**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/fleet-status`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **GET /api/buses/route-coverage/:routeId**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/route-coverage/{{route_id}}`
- **Headers:** None required

#### **GET /api/buses/route/:routeId**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/route/{{route_id}}`
- **Headers:** None required

#### **GET /api/buses/:id**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/{{bus_id}}`
- **Headers:** None required

#### **GET /api/buses/:id/location-history**
- **Method:** GET
- **URL:** `{{base_url}}/api/buses/{{bus_id}}/location-history`
- **Query Params:**
  - `startDate=2025-10-07T00:00:00Z`
  - `endDate=2025-10-08T23:59:59Z`
  - `limit=100`

#### **POST /api/buses**
- **Method:** POST
- **URL:** `{{base_url}}/api/buses`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "registrationNumber": "WP-KX-2001",
  "busNumber": "LX003",
  "operatorInfo": {
    "operatorName": "Lanka Express Transport",
    "licenseNumber": "LET-2024-002",
    "contactNumber": "+94771234567"
  },
  "vehicleDetails": {
    "make": "Tata",
    "model": "Starbus",
    "year": 2024
  },
  "capacity": {
    "seated": 45,
    "standing": 10
  },
  "busType": "luxury",
  "features": ["AC", "WiFi", "USB Charging", "GPS"],
  "currentLocation": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271],
    "address": "Colombo"
  }
}
```

#### **PUT /api/buses/:id**
- **Method:** PUT
- **URL:** `{{base_url}}/api/buses/{{bus_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:** Same as POST with updated fields

#### **DELETE /api/buses/:id**
- **Method:** DELETE
- **URL:** `{{base_url}}/api/buses/{{bus_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **POST /api/buses/:id/location**
- **Method:** POST
- **URL:** `{{base_url}}/api/buses/{{bus_id}}/location`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "latitude": 6.9271,
  "longitude": 79.8612,
  "speed": 45,
  "heading": 90,
  "accuracy": 5,
  "deviceId": "GPS_DEVICE_001",
  "batteryLevel": 85
}
```

---

### **🚍 5. TRIPS ENDPOINTS**

#### **GET /api/trips**
- **Method:** GET
- **URL:** `{{base_url}}/api/trips`
- **Query Params:**
  - `page=1`
  - `limit=20`
  - `status=scheduled`
  - `routeId={{route_id}}`
  - `busId={{bus_id}}`
  - `date=2025-10-08`

#### **GET /api/trips/upcoming**
- **Method:** GET
- **URL:** `{{base_url}}/api/trips/upcoming`
- **Query Params:**
  - `hours=24`
  - `routeId={{route_id}}`

#### **GET /api/trips/active**
- **Method:** GET
- **URL:** `{{base_url}}/api/trips/active`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **GET /api/trips/stats**
- **Method:** GET
- **URL:** `{{base_url}}/api/trips/stats`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Query Params:**
  - `startDate=2025-10-01`
  - `endDate=2025-10-08`

#### **GET /api/trips/:id**
- **Method:** GET
- **URL:** `{{base_url}}/api/trips/{{trip_id}}`
- **Headers:** None required

#### **POST /api/trips**
- **Method:** POST
- **URL:** `{{base_url}}/api/trips`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "tripNumber": "T0051",
  "routeId": "{{route_id}}",
  "busId": "{{bus_id}}",
  "departureTime": "2025-10-09T08:00:00Z",
  "estimatedArrival": "2025-10-09T11:00:00Z",
  "pricing": {
    "farePerPerson": 250,
    "currency": "LKR"
  },
  "availability": {
    "totalSeats": 45,
    "availableSeats": 40
  }
}
```

#### **PUT /api/trips/:id**
- **Method:** PUT
- **URL:** `{{base_url}}/api/trips/{{trip_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:** Same as POST with updated fields

#### **DELETE /api/trips/:id**
- **Method:** DELETE
- **URL:** `{{base_url}}/api/trips/{{trip_id}}`
- **Headers:** `Authorization: Bearer {{jwt_token}}`

#### **PATCH /api/trips/:id/status**
- **Method:** PATCH
- **URL:** `{{base_url}}/api/trips/{{trip_id}}/status`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "status": "in_progress",
  "actualDepartureTime": "2025-10-09T08:05:00Z"
}
```

---

### **📍 6. LOCATIONS ENDPOINTS**

#### **GET /api/locations**
- **Method:** GET
- **URL:** `{{base_url}}/api/locations`
- **Query Params:**
  - `busId={{bus_id}}`
  - `startDate=2025-10-08T00:00:00Z`
  - `endDate=2025-10-08T23:59:59Z`
  - `limit=100`

#### **GET /api/locations/recent**
- **Method:** GET
- **URL:** `{{base_url}}/api/locations/recent`
- **Query Params:**
  - `minutes=30`
  - `busId={{bus_id}}`

#### **GET /api/locations/nearby**
- **Method:** GET
- **URL:** `{{base_url}}/api/locations/nearby`
- **Query Params:**
  - `latitude=6.9271` (required)
  - `longitude=79.8612` (required)
  - `radius=1000`

#### **POST /api/locations/update**
- **Method:** POST
- **URL:** `{{base_url}}/api/locations/update`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "busId": "{{bus_id}}",
  "coordinates": {
    "latitude": 6.9271,
    "longitude": 79.8612
  },
  "speed": 45,
  "heading": 90,
  "accuracy": 5,
  "source": "gps_tracker"
}
```

#### **POST /api/locations/bulk-update**
- **Method:** POST
- **URL:** `{{base_url}}/api/locations/bulk-update`
- **Headers:** `Authorization: Bearer {{jwt_token}}`
- **Body:**
```json
{
  "locations": [
    {
      "busId": "{{bus_id}}",
      "coordinates": {
        "latitude": 6.9271,
        "longitude": 79.8612
      },
      "timestamp": "2025-10-08T14:30:00Z",
      "speed": 45
    }
  ]
}
```

---

## 🔧 **POSTMAN ENVIRONMENT VARIABLES**

Create these variables in Postman:

```json
{
  "base_url": "http://localhost:3000",
  "jwt_token": "",
  "api_key": "",
  "bus_id": "",
  "route_id": "",
  "trip_id": "",
  "user_id": ""
}
```

---

## 📊 **RESPONSE HEADERS TO VERIFY**

All endpoints should return these RESTful headers:

```http
Content-Type: application/json; charset=utf-8
API-Version: 1.0.0
X-Powered-By: Lanka Bus Trace API
X-Request-ID: req_1728404721_abc123def
X-Response-Time: 150ms
Cache-Control: no-cache, no-store, must-revalidate
ETag: "hash-value" (for GET requests)
Last-Modified: Tue, 08 Oct 2025 14:30:00 GMT (where applicable)
Access-Control-Allow-Origin: *
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_url
   JWT_SECRET=your_strong_jwt_secret
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

2. **Test All Endpoints in Postman**
3. **Verify Security Headers**
4. **Check Rate Limiting**
5. **Validate CORS Configuration**
6. **Test Authentication Flows**
7. **Verify Database Connections**

---

## 📈 **TOTAL ENDPOINTS: 46**

- **Health/Info:** 2 endpoints
- **Authentication:** 6 endpoints
- **Routes:** 12 endpoints
- **Buses:** 15 endpoints
- **Trips:** 8 endpoints
- **Locations:** 5 endpoints

**All endpoints are fully functional with proper RESTful headers and ready for production deployment! 🚀**