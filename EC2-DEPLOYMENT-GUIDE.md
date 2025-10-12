# EC2 Deployment Commands for Lanka Bus Trace API

## Prerequisites
- Ubuntu 20.04 LTS or higher
- EC2 instance with proper security groups (ports 80, 443, 3000)
- Domain name pointed to your EC2 instance

## Step 1: Connect to EC2 Instance
```bash
# Replace with your actual key file and EC2 public IP
ssh -i lanka-bus-trace-key.pem ubuntu@your-ec2-ip-address
```

## Step 2: Update System and Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

## Step 3: Clone and Setup Application
```bash
# Clone the repository
git clone https://github.com/ruvindu-dulaksha/Lank-Bus-Trace.git
cd Lank-Bus-Trace

# Switch to release branch
git checkout release

# Install dependencies
npm install

# Create production environment file
sudo nano .env
```

## Step 4: Configure Environment Variables (.env file)
```env
# Copy this content to your .env file on EC2
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://ruvindu-dulaksha.me
API_VERSION=v1
LOG_LEVEL=info
SWAGGER_HOST=ruvindu-dulaksha.me
SWAGGER_SCHEMES=https
```

## Step 5: Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/lanka-bus-trace
```

**Nginx Configuration Content:**
```nginx
server {
    listen 80;
    server_name ruvindu-dulaksha.me www.ruvindu-dulaksha.me;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ruvindu-dulaksha.me www.ruvindu-dulaksha.me;

    # SSL certificates (configure with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ruvindu-dulaksha.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ruvindu-dulaksha.me/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API specific configuration
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "https://ruvindu-dulaksha.me" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    }

    # Swagger documentation
    location /api-docs/ {
        proxy_pass http://localhost:3000/api-docs/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 6: Enable Nginx Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/lanka-bus-trace /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 7: Install SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d ruvindu-dulaksha.me -d www.ruvindu-dulaksha.me

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Start Application with PM2
```bash
# Navigate to project directory
cd /home/ubuntu/Lank-Bus-Trace

# Start application with PM2
pm2 start server.js --name "lanka-bus-trace" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by PM2 startup command

# Check application status
pm2 status
pm2 logs lanka-bus-trace
```

## Step 9: Configure Firewall
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check firewall status
sudo ufw status
```

## Step 10: Verify Deployment
```bash
# Check if application is running
curl -k https://ruvindu-dulaksha.me/api/health

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View application logs
pm2 logs lanka-bus-trace
```

## Step 11: Setup Monitoring and Maintenance
```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Setup automatic updates (optional)
echo "0 2 * * 0 cd /home/ubuntu/Lank-Bus-Trace && git pull origin release && npm install && pm2 restart lanka-bus-trace" | sudo crontab -
```

## Useful Commands for Management

### Application Management
```bash
# Restart application
pm2 restart lanka-bus-trace

# Stop application
pm2 stop lanka-bus-trace

# View logs
pm2 logs lanka-bus-trace

# Monitor resources
pm2 monit
```

### Nginx Management
```bash
# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Renewal
```bash
# Renew SSL certificates
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

## Troubleshooting

### Check Port Usage
```bash
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Check Application Health
```bash
# Test API endpoints
curl -k https://ruvindu-dulaksha.me/api/health
curl -k https://ruvindu-dulaksha.me/api/routes
curl -k https://ruvindu-dulaksha.me/api-docs/
```

### View System Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## Security Recommendations

1. **Regular Updates**: Keep system and packages updated
2. **Firewall**: Only allow necessary ports
3. **SSL**: Use strong SSL configuration
4. **Environment Variables**: Keep secrets secure in .env file
5. **Monitoring**: Set up log monitoring and alerts
6. **Backups**: Regular database backups
7. **Rate Limiting**: Configure appropriate rate limits
8. **CORS**: Restrict CORS to your domain only

## Performance Optimization

1. **PM2 Cluster Mode**: Use PM2 cluster mode for better performance
2. **Nginx Caching**: Configure Nginx caching for static content
3. **Database Indexing**: Ensure proper MongoDB indexing
4. **CDN**: Consider using a CDN for global performance
5. **Monitoring**: Set up APM monitoring

Your Lanka Bus Trace API should now be running at https://ruvindu-dulaksha.me with full SSL, reverse proxy, and production-ready configuration!