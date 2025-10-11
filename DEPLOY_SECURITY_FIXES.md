# 🔒 Deploy Security Fixes - URGENT

## 🚨 **CRITICAL SECURITY UPDATES READY FOR DEPLOYMENT**

Your local codebase now contains **critical security fixes** that need to be deployed to production immediately to resolve the hardcoded credentials vulnerability.

---

## 📋 **What Was Fixed**

### 1. **Swagger Documentation Security**
- ✅ Removed all hardcoded admin credentials from API documentation
- ✅ Replaced with generic test credentials
- ✅ Sanitized all examples and contact information

### 2. **JWT Token Invalidation**
- ✅ Implemented comprehensive token blacklisting service
- ✅ Enhanced logout functionality to properly invalidate tokens
- ✅ Added automatic cleanup of expired blacklisted tokens

### 3. **Registration Security**
- ✅ Restricted user registration to "commuter" role only
- ✅ Added backend validation to prevent admin creation via API
- ✅ Enhanced error handling and logging

---

## 🚀 **Deployment Instructions**

### **Option 1: Direct Server Deployment (Recommended)**

1. **Connect to your production server:**
   ```bash
   ssh -i /path/to/your/aws-key.pem ec2-user@ec2-3-83-195-71.compute-1.amazonaws.com
   ```

2. **Navigate to project directory:**
   ```bash
   cd /home/ec2-user/lanka-bus-trace
   ```

3. **Pull latest security fixes:**
   ```bash
   git pull origin main
   ```

4. **Install any new dependencies:**
   ```bash
   npm install
   ```

5. **Restart the application:**
   ```bash
   pm2 restart all
   # OR if using systemctl:
   sudo systemctl restart lanka-bus-trace
   # OR if running directly:
   npm start
   ```

### **Option 2: GitHub Push & Server Pull**

1. **Ensure your fixes are in GitHub:**
   ```bash
   git status
   git add .
   git commit -m "Deploy security fixes"
   git push origin main
   ```

2. **Then connect to server and pull:**
   ```bash
   ssh -i /path/to/your/key.pem ec2-user@your-server-ip
   cd /home/ec2-user/lanka-bus-trace
   git pull origin main
   pm2 restart all
   ```

### **Option 3: Alternative Server Access**

If you have alternative access methods:
- **AWS Systems Manager Session Manager**
- **EC2 Instance Connect**
- **Alternative SSH keys**

---

## 🔍 **Verification Steps**

After deployment, verify the fixes:

### 1. **Check API Documentation**
Visit: `https://ruvindu-dulaksha.me/api-docs`
- ✅ Should show generic test credentials only
- ❌ Should NOT show any "dulaksha" or real credentials

### 2. **Test Token Invalidation**
```bash
# Login and get token
curl -X POST https://ruvindu-dulaksha.me/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"testuser","password":"Test123!"}'

# Logout with the token
curl -X POST https://ruvindu-dulaksha.me/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Try using the same token (should fail)
curl -X GET https://ruvindu-dulaksha.me/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. **Test Registration Restrictions**
```bash
# This should fail - admin creation blocked
curl -X POST https://ruvindu-dulaksha.me/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin","email":"admin@test.com","password":"Test123!","role":"admin"}'
```

---

## 📁 **Files Modified**

The following files contain your security fixes:

- `src/config/swagger.js` - Sanitized API documentation
- `src/controllers/authController.js` - Enhanced logout & registration
- `src/middleware/auth.js` - Token blacklist checking
- `src/services/tokenBlacklistService.js` - New blacklisting service
- `src/routes/auth.js` - Registration role restrictions

---

## ⚠️ **URGENT ACTION REQUIRED**

Your production API is currently exposing sensitive credentials in the documentation. **Deploy these fixes immediately** to prevent potential security breaches.

### Current Status:
- ❌ **Production**: Vulnerable (hardcoded credentials exposed)
- ✅ **Local**: Secured (fixes applied)

### Next Steps:
1. Deploy using one of the methods above
2. Verify the fixes are working
3. Monitor for any issues

---

## 🛠️ **Troubleshooting**

### If SSH key not found:
- Check AWS EC2 console for the correct key name
- Download the key from AWS if needed
- Ensure correct file permissions: `chmod 400 your-key.pem`

### If git pull fails:
- Check Git repository access
- Verify you're on the correct branch
- Resolve any merge conflicts

### If restart fails:
- Check process manager being used (pm2, systemctl, etc.)
- Verify application logs for errors
- Ensure all dependencies are installed

---

**🔒 Security is critical - deploy these fixes immediately!**