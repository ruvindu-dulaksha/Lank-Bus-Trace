# Swagger API Documentation Screenshot

This screenshot shows the interactive Swagger UI documentation for the Lanka Bus Trace API running at http://localhost:3000/api-docs.

## Features Shown:

### 📊 API Information
- **Title**: Lanka Bus Trace API (Version 1.0.0)
- **Description**: Real-time inter-provincial bus tracking system for Sri Lanka
- **Status**: NTC compliant tracking-only service
- **Developer**: K.D.R. Dulaksha (COBSCCOMP241P-018)

### 🔐 Authentication Section
The screenshot shows the comprehensive authentication endpoints:
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user 
- `POST /auth/forgot-password` - Request password reset via email
- `POST /auth/reset-password` - Reset password with token from email
- `POST /auth/change-password` - Change password (for logged in users)
- `POST /auth/api-key` - Generate API key
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update current user profile

### 🌟 Key Features Displayed
- **Interactive Documentation**: All endpoints are expandable and testable
- **Method Indicators**: Color-coded HTTP methods (POST, GET, PUT)
- **Authentication Requirements**: Lock icons show protected endpoints
- **Comprehensive Coverage**: Complete authentication workflow
- **Professional UI**: Clean, modern Swagger interface
- **Real-time Testing**: Authorize button for token-based testing

This demonstrates a fully functional, well-documented API with comprehensive authentication system suitable for production use.