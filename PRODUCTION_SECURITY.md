# 🔐 Production Security Configuration

## 📧 Email Service Setup for AWS

### Option 1: AWS SES (Recommended for AWS deployment)

#### Step 1: Set up AWS SES
```bash
# 1. Login to AWS Console
# 2. Go to SES (Simple Email Service)
# 3. Verify your domain or email address
# 4. Create SMTP credentials
# 5. Move out of sandbox mode (for production)
```

#### Step 2: Environment Variables
```env
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

#### Step 3: IAM Policy for SES
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

### Option 2: SMTP (Gmail/SendGrid/Other)

#### Environment Variables
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## 🛡️ Security Features Implemented

### ✅ Rate Limiting
- **Forgot Password**: 3 requests per 15 minutes per IP
- **Login**: 10 attempts per 15 minutes per IP
- **Registration**: 5 attempts per hour per IP
- **Password Reset**: 5 attempts per 15 minutes per IP
- **Email-based**: 3 reset emails per hour per email address

### ✅ Security Measures
- **No Token in Response**: Reset tokens only sent via email
- **Email Enumeration Protection**: Same response for existing/non-existing emails
- **Token Expiration**: 15-minute expiry for reset tokens
- **Secure Token Storage**: SHA-256 hashed tokens in database
- **Account Lockout Reset**: Failed login attempts cleared on password reset

### ✅ Production Hardening
- **Helmet Security Headers**: XSS, CSRF, and other protections
- **CORS Configuration**: Restricted origins for production
- **Input Validation**: Comprehensive validation on all endpoints
- **Error Handling**: No sensitive data in error responses
- **Logging**: Comprehensive security event logging

## 🚀 AWS Deployment Configuration

### 1. EC2 Environment Setup
```bash
# Create production environment file
cp .env.production.template .env

# Edit with your actual values
nano .env
```

### 2. AWS SES Setup (Recommended)
```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure

# Test SES
aws ses verify-email-identity --email-address noreply@yourdomain.com
```

### 3. Environment Variables for EC2
```bash
# Essential production variables
export NODE_ENV=production
export MONGODB_URI="your-mongodb-atlas-uri"
export JWT_SECRET="your-32-character-secret"
export EMAIL_PROVIDER=ses
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export EMAIL_FROM="noreply@yourdomain.com"
export FRONTEND_URL="https://yourdomain.com"
export ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### 4. PM2 Configuration
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lanka-bus-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production
```

## ⚠️ Security Checklist

### ✅ Before Deployment
- [ ] Change all default passwords and secrets
- [ ] Set up AWS SES and verify domain
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test email delivery
- [ ] Verify SSL certificate
- [ ] Update CORS origins

### ✅ After Deployment
- [ ] Test forgot password flow end-to-end
- [ ] Verify rate limiting is working
- [ ] Check logs for any errors
- [ ] Test from different IP addresses
- [ ] Verify email delivery in production
- [ ] Monitor failed authentication attempts
- [ ] Set up log rotation

## 📧 Email Templates

The system includes professional email templates with:
- **HTML and Text versions**
- **Company branding**
- **Security warnings**
- **Clear instructions**
- **Responsive design**

## 🔒 Token Security

- **Generation**: Cryptographically secure random tokens
- **Storage**: SHA-256 hashed in database
- **Transmission**: Only via email (never in API response)
- **Expiration**: 15-minute automatic expiry
- **Single Use**: Tokens are cleared after successful reset

## 📊 Monitoring

### Key Metrics to Monitor
- Failed authentication attempts
- Password reset request frequency
- Email delivery failures
- Rate limit violations
- API response times
- Database connection status

### Recommended Alerts
- Multiple failed login attempts from same IP
- High volume of password reset requests
- Email service failures
- Database connectivity issues
- Unusual API usage patterns

## 🚨 Emergency Procedures

### If Email Service Fails
1. Check AWS SES sending limits
2. Verify domain/email verification status
3. Check IAM permissions
4. Monitor bounce and complaint rates
5. Have backup SMTP configured

### If Rate Limiting Issues
1. Monitor legitimate user complaints
2. Adjust limits based on usage patterns
3. Implement IP whitelisting for trusted sources
4. Consider user-based rate limiting

### Security Incident Response
1. Monitor logs for suspicious activity
2. Have procedure to disable accounts
3. Keep backup of authentication logs
4. Document all security events