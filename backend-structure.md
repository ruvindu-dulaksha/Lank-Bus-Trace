# Real-Time Bus Tracking System Backend

## Project Structure
```
bus-tracking-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── swagger.js
│   │   └── constants.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── busController.js
│   │   ├── routeController.js
│   │   ├── tripController.js
│   │   └── locationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bus.js
│   │   ├── Route.js
│   │   ├── Trip.js
│   │   └── Location.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── buses.js
│   │   ├── routes.js
│   │   ├── trips.js
│   │   └── locations.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── busService.js
│   │   ├── routeService.js
│   │   └── locationService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── validation.js
│   │   └── helpers.js
│   ├── data/
│   │   ├── routes.json
│   │   ├── buses.json
│   │   └── trips.json
│   └── app.js
├── tests/
│   ├── auth.test.js
│   ├── buses.test.js
│   └── routes.test.js
├── docs/
│   └── api-documentation.md
├── package.json
├── .env.example
├── .gitignore
├── server.js
└── README.md
```

## Quick Start Commands
```bash
# Clone/create project directory
mkdir bus-tracking-api && cd bus-tracking-api

# Initialize project
npm init -y

# Install dependencies
npm install express mongoose cors helmet morgan dotenv bcryptjs jsonwebtoken express-rate-limit joi swagger-jsdoc swagger-ui-express winston express-validator

# Install dev dependencies
npm install --save-dev nodemon jest supertest

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev
```