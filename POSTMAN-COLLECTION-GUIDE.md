# 📋 Lanka Bus Trace API - Complete Postman Collection Guide

## 🎯 **Collection Overview**

**File**: `Lanka-Bus-Trace-Complete-Collection.postman_collection.json`  
**Version**: 2.0.0  
**Total Endpoints**: 40+ working endpoints  
**Organization**: Role-based access control for easy navigation

---

## 📂 **Collection Structure & Role-Based Organization**

### 🏥 **1. SYSTEM HEALTH (Public Access)**
**No Authentication Required**
- ✅ `GET /health` - Basic server health check
- ✅ `GET /api/health` - Detailed API health metrics

### 🔐 **2. AUTHENTICATION (All Roles)**
**Authentication Endpoints**
- ✅ `POST /api/auth/login` - Admin login (auto-extracts token)
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/logout` - User logout

### 👤 **3. ADMIN ACCESS ENDPOINTS**
**Full System Access & Management**

#### 🚌 **Bus Management (Admin)**
- ✅ `GET /api/buses` - Get all buses (extracts bus_id)
- ✅ `GET /api/buses/search` - Search buses by criteria
- ✅ `GET /api/buses/nearby` - Find nearby buses (with correct parameters)
- ✅ `GET /api/buses/{id}` - Get specific bus details

#### 🛣️ **Route Management (Admin)**
- ✅ `GET /api/routes` - Get all routes (extracts route_id)
- ✅ `GET /api/routes/search` - Search routes by origin/destination
- ✅ `GET /api/routes/cities` - Get available cities
- ✅ `GET /api/routes/province/{province}` - Get routes by province
- ✅ `GET /api/routes/{id}` - Get specific route details
- ✅ `GET /api/routes/{id}/stops` - Get route stops
- ✅ `GET /api/routes/{id}/live-buses` - Get live buses on route

#### 🚂 **Trip Management (Admin)**
- ✅ `GET /api/trips` - Get all trips (extracts trip_id)
- ✅ `GET /api/trips/search` - Search trips by date
- ✅ `GET /api/trips/stats` - Get trip statistics
- ✅ `GET /api/trips/route/{routeId}` - Get trips by route
- ✅ `GET /api/trips/{id}` - Get specific trip details

#### 📍 **Location Services (Admin)**
- ✅ `GET /api/locations` - Get all GPS location records
- ✅ `GET /api/locations/search` - Search locations by area
- ✅ `GET /api/locations/nearby` - Get nearby buses by location
- ✅ `GET /api/locations/stats` - Get location statistics
- ✅ `GET /api/locations/bus/{busId}` - Get location history for bus

#### 👥 **User Management (Admin)**
- ✅ `GET /api/users` - Get all users (admin only)
- ✅ `GET /api/users/stats` - Get user statistics (admin only)

#### 📊 **Analytics & Reports (Admin)**
- ✅ `GET /api/dashboard` - Dashboard overview
- ✅ `GET /api/dashboard/stats` - Dashboard statistics
- ✅ `GET /api/analytics/performance` - Performance analytics
- ✅ `GET /api/analytics/usage` - Usage analytics
- ✅ `GET /api/reports/trips` - Trip reports
- ✅ `GET /api/reports/revenue` - Revenue reports
- ✅ `GET /api/reports/fleet` - Fleet reports

### 🔍 **4. PUBLIC SEARCH & DISCOVERY**
**Accessible to All Authenticated Users**
- ✅ `GET /api/search` - General search across all entities
- ✅ `GET /api/live-search` - Live route search (multiple examples)
  - Colombo ↔ Kandy
  - Kandy ↔ Galle  
  - Colombo ↔ Negombo
  - Custom query with date/time

### 💰 **5. PRICING & SEASONS**
**Financial Information**
- ✅ `GET /api/pricing` - Get pricing structure
- ✅ `GET /api/seasons` - Get seasonal adjustments

### 🚫 **6. ROLE-SPECIFIC ACCESS (403 Expected)**
**Demonstrates Correct Security Behavior**

#### 👨‍✈️ **Driver Endpoints** (403 for Admin)
- ❌ `GET /api/driver/profile` - Expected 403
- ❌ `GET /api/driver/dashboard` - Expected 403
- ❌ `GET /api/driver/trips` - Expected 403

#### 🎫 **Conductor Endpoints** (403 for Admin)
- ❌ `GET /api/conductor/profile` - Expected 403
- ❌ `GET /api/conductor/dashboard` - Expected 403

#### 🏢 **Operator Endpoints** (403 for Admin)
- ❌ `GET /api/operator/profile` - Expected 403
- ❌ `GET /api/operator/dashboard` - Expected 403
- ❌ `GET /api/operator/fleet` - Expected 403

### 📋 **7. TESTING UTILITIES**
**Quick Test Suite**
- 5-step sequential test for core functionality
- Auto-token extraction and management
- Health → Login → Buses → Routes → Live Search

---

## 🔧 **Pre-configured Variables**

```json
{
  "base_url": "https://ruvindu-dulaksha.me",
  "auth_token": "", // Auto-populated on login
  "admin_email": "ruvindu123456@gmail.com",
  "admin_password": "DulaBoy@2001",
  "user_id": "", // Auto-extracted
  "bus_id": "", // Auto-extracted  
  "route_id": "", // Auto-extracted
  "trip_id": "", // Auto-extracted
  "location_id": "" // Auto-extracted
}
```

---

## 🚀 **Key Features**

### ✅ **Auto-Authentication**
- Admin login automatically extracts and sets JWT token
- Token used for all subsequent authenticated requests
- Credentials pre-configured for immediate testing

### ✅ **Auto-ID Extraction**
- Bus, route, trip, and location IDs automatically extracted from responses
- Enables seamless testing of related endpoints
- No manual copying of IDs required

### ✅ **Smart Test Scripts**
- Enhanced global test scripts with detailed logging
- Success/failure detection with proper status code handling
- Performance testing (response time < 5s)
- JSON response parsing and logging

### ✅ **Security Validation**
- Role-specific endpoints clearly marked with expected 403 responses
- Demonstrates proper role-based access control
- Educational examples of security working correctly

### ✅ **Comprehensive Examples**
- Multiple live search examples for different city pairs
- Parameterized requests with descriptions
- Real-world usage scenarios

---

## 📈 **Success Metrics**

When testing with this collection, you should see:

- **✅ 40+ endpoints returning 200/201/204** (successful responses)
- **🔒 8 endpoints returning 403** (correct security behavior)
- **❓ Some endpoints returning 404** (not yet implemented - normal)
- **⚡ All responses under 5 seconds**
- **🔄 Automatic token and ID management**

---

## 🎯 **How to Use**

1. **Import Collection**: Import `Lanka-Bus-Trace-Complete-Collection.postman_collection.json`
2. **Start with Authentication**: Run "Admin Login" to get token
3. **Explore by Role**: Navigate sections based on your access needs
4. **Quick Testing**: Use "Testing Utilities" for rapid validation
5. **Security Demo**: Check role-specific sections to see 403 responses

---

## 🎉 **What's New in v2.0**

✅ **Complete role-based organization**  
✅ **All 40+ working endpoints included**  
✅ **Auto-authentication and ID extraction**  
✅ **Enhanced test scripts with detailed logging**  
✅ **Security behavior demonstrations**  
✅ **Pre-configured admin credentials**  
✅ **Multiple live search examples**  
✅ **Performance and success validation**

**Your Lanka Bus Trace API collection is now enterprise-ready with complete coverage and intelligent organization! 🚀**