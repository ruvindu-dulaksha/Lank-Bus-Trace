# Lanka Bus Trace API - Production Backend Architecture

This is the architecture diagram image file for the Lanka Bus Trace API system.

The diagram shows the complete production backend architecture from client applications through all layers to external services.

## Layers Overview:

1. **Client Applications**: Web Browsers, Mobile Apps, Postman/API Testing Tools, Third-party Integrations
2. **Client Layer**: Namecheap Domain, SSL/TLS Certificate, DNS Resolution  
3. **AWS Cloud**: AWS EC2 (t2.micro), Security Groups (Firewall), Elastic IP (Optional)
4. **Web Server Layer**: Nginx Reverse Proxy, Load Balancing, HTTPS Termination, Static File Serving
5. **API Endpoints**: Node.js Runtime, Express.js Framework, PM2 Process Manager, API Gateway
6. **Middleware**: Rate Limiting, CORS Protection, Request Validation, Encrypt Password Hashing
7. **API Endpoints**: Controllers, Services, Utilities, Helmet Security Headers
8. **Business Logic**: MongoDB Atlas Cluster, Services, Swagger OpenAPI Documentation
9. **External Services**: MongoDB Atlas Cloud Database, GitHub Repository, Swagger/OpenAPI Documentation

This architecture ensures scalability, security, and maintainability for the Lanka Bus Trace API system.