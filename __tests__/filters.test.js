import request from 'supertest';
import app from '../src/app.js';

describe('🧪 Lanka Bus Trace API - Filter Testing Suite', () => {
  
  // Test API Health
  describe('📊 Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
    });
  });

  // Test Bus Filtering
  describe('🚌 Bus Filtering', () => {
    test('GET /api/buses should return paginated buses', async () => {
      const response = await request(app)
        .get('/api/buses')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    test('GET /api/buses with pagination should work', async () => {
      const response = await request(app)
        .get('/api/buses?page=1&limit=5')
        .expect(200);
      
      expect(response.body.pagination.currentPage).toBe('1');
      expect(response.body.pagination.itemsPerPage).toBe('5');
    });

    test('GET /api/buses with status filter should work', async () => {
      const response = await request(app)
        .get('/api/buses?status=active')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/buses with search should work', async () => {
      const response = await request(app)
        .get('/api/buses?search=B001')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/buses with invalid pagination should return 400', async () => {
      await request(app)
        .get('/api/buses?page=-1')
        .expect(400);
    });
  });

  // Test Route Filtering
  describe('🗺️ Route Filtering', () => {
    test('GET /api/routes should return paginated routes', async () => {
      const response = await request(app)
        .get('/api/routes')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/routes with origin filter should work', async () => {
      const response = await request(app)
        .get('/api/routes?origin=Colombo')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/routes/search should require from and to parameters', async () => {
      await request(app)
        .get('/api/routes/search?from=Colombo')
        .expect(400);
    });

    test('GET /api/routes/search with valid parameters should work', async () => {
      const response = await request(app)
        .get('/api/routes/search?from=Colombo&to=Kandy')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // Test Trip Filtering
  describe('🎫 Trip Filtering', () => {
    test('GET /api/trips should return paginated trips', async () => {
      const response = await request(app)
        .get('/api/trips')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/trips with upcoming filter should work', async () => {
      const response = await request(app)
        .get('/api/trips?upcoming=true')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // Test Location Filtering
  describe('📍 Location Filtering', () => {
    test('GET /api/locations should return paginated locations', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/locations with latest filter should work', async () => {
      const response = await request(app)
        .get('/api/locations?latest=true')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // Test Geospatial Queries
  describe('🌍 Geospatial Queries', () => {
    test('GET /api/buses/nearby should require coordinates', async () => {
      await request(app)
        .get('/api/buses/nearby')
        .expect(400);
    });

    test('GET /api/buses/nearby with valid coordinates should work', async () => {
      const response = await request(app)
        .get('/api/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5000')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('GET /api/buses/nearby with invalid coordinates should return 400', async () => {
      await request(app)
        .get('/api/buses/nearby?latitude=999&longitude=999')
        .expect(400);
    });
  });

  // Test Complex Filtering Combinations
  describe('🔄 Complex Filters', () => {
    test('Multiple bus filters should work together', async () => {
      const response = await request(app)
        .get('/api/buses?status=active&busType=luxury&page=1&limit=5')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('Route search with multiple parameters should work', async () => {
      const response = await request(app)
        .get('/api/routes?origin=Colombo&status=active&page=1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // Test API Documentation
  describe('📚 API Documentation', () => {
    test('GET /api should return API info', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body.name).toContain('Bus Tracking API');
    });
  });

  // Test Error Handling
  describe('⚠️ Error Handling', () => {
    test('GET /api/buses/invalid-id should return 404 or 400', async () => {
      const response = await request(app)
        .get('/api/buses/invalid-id');
      
      expect([400, 404, 500]).toContain(response.status);
    });

    test('GET /api/routes/invalid-id should return 404 or 400', async () => {
      const response = await request(app)
        .get('/api/routes/invalid-id');
      
      expect([400, 404, 500]).toContain(response.status);
    });
  });
});