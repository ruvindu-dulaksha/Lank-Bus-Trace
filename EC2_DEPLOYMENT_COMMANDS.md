# 🚀 EC2 Deployment Commands

## 📋 **Quick Deployment Steps**

### 1. **Connect to your EC2 server:**
```bash
ssh -i /path/to/your/key.pem ec2-user@ec2-3-83-195-71.compute-1.amazonaws.com
```

### 2. **Navigate to project directory:**
```bash
cd /home/ec2-user/lanka-bus-trace
```

### 3. **Pull latest security fixes from GitHub:**
```bash
git pull origin release
```

### 4. **Install any new dependencies:**
```bash
npm install
```

### 5. **Restart the application:**
```bash
# If using PM2:
pm2 restart all
pm2 status

# OR if using systemctl:
sudo systemctl restart lanka-bus-trace
sudo systemctl status lanka-bus-trace

# OR if running directly:
npm start
```

### 6. **Verify deployment:**
```bash
# Check if the app is running
curl http://localhost:3000/api/system/config

# Check logs
pm2 logs
# OR
sudo journalctl -u lanka-bus-trace -f
```

---

## 🔍 **Verify Security Fixes**

After deployment, test these endpoints to ensure security fixes are active:

### Test 1: Check API Documentation
```bash
curl https://ruvindu-dulaksha.me/api-docs.json | grep -i "dulaksha"
# Should return no results (empty)
```

### Test 2: Test Token Blacklisting
```bash
# Login
curl -X POST https://ruvindu-dulaksha.me/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"testuser","password":"Test123!"}'

# Copy the token from response, then logout
curl -X POST https://ruvindu-dulaksha.me/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Try using the same token (should fail with 401)
curl -X GET https://ruvindu-dulaksha.me/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 3: Test Registration Restrictions
```bash
# This should fail - admin creation blocked
curl -X POST https://ruvindu-dulaksha.me/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin123","email":"admin123@test.com","password":"Test123!","role":"admin"}'
```

---

## 🛠️ **Troubleshooting**

### If git pull fails:
```bash
# Check current branch
git branch

# Switch to release branch if needed
git checkout release

# Force pull if needed
git reset --hard origin/release
```

### If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### If PM2 restart fails:
```bash
# Check PM2 status
pm2 status

# Stop and start instead of restart
pm2 stop all
pm2 start ecosystem.config.js
# OR
pm2 start server.js --name "lanka-bus-trace"
```

---

## ✅ **Success Indicators**

After successful deployment, you should see:

1. **API Docs Clean**: No hardcoded credentials in https://ruvindu-dulaksha.me/api-docs
2. **Token Invalidation Working**: Tokens become invalid after logout
3. **Registration Restricted**: Cannot create admin users via API
4. **Application Running**: PM2 shows green status

---

**🎯 Your security fixes are now live and protecting your API!**