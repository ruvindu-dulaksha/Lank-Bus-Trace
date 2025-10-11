#!/bin/bash

# 🔒 Security Fixes Verification Script
# This script verifies that all security fixes are properly deployed

echo "🔍 Lanka Bus Trace - Security Fixes Verification"
echo "=============================================="
echo ""

# Configuration
API_BASE="https://ruvindu-dulaksha.me"
DOCS_URL="$API_BASE/api-docs.json"
LOGIN_URL="$API_BASE/auth/login"
REGISTER_URL="$API_BASE/auth/register"
LOGOUT_URL="$API_BASE/auth/logout"
ME_URL="$API_BASE/auth/me"

echo "🌐 Testing API Base: $API_BASE"
echo ""

# Test 1: Check Swagger Documentation Security
echo "📋 Test 1: Checking API Documentation Security..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCS_RESPONSE=$(curl -s "$DOCS_URL" 2>/dev/null)
if echo "$DOCS_RESPONSE" | grep -q "dulaksha"; then
    echo "❌ FAILED: Hardcoded credentials still present in documentation"
    echo "   Found 'dulaksha' in API docs - security risk!"
else
    echo "✅ PASSED: No hardcoded credentials found in documentation"
fi

if echo "$DOCS_RESPONSE" | grep -q "testuser"; then
    echo "✅ PASSED: Generic test credentials are present"
else
    echo "⚠️  WARNING: Generic test credentials not found"
fi

echo ""

# Test 2: Check JWT Token Blacklisting
echo "🔐 Test 2: Testing JWT Token Blacklisting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Login to get a token
echo "   🔑 Logging in to get test token..."
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"testuser","password":"Test123!"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "   ✅ Login successful"
    
    # Extract token (basic extraction - may need adjustment based on response format)
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "   🎫 Token obtained: ${TOKEN:0:20}..."
        
        # Test token validity before logout
        echo "   🧪 Testing token before logout..."
        ME_RESPONSE_BEFORE=$(curl -s -X GET "$ME_URL" \
          -H "Authorization: Bearer $TOKEN" 2>/dev/null)
        
        if echo "$ME_RESPONSE_BEFORE" | grep -q "success"; then
            echo "   ✅ Token valid before logout"
            
            # Logout to blacklist token
            echo "   🚪 Logging out to blacklist token..."
            LOGOUT_RESPONSE=$(curl -s -X POST "$LOGOUT_URL" \
              -H "Authorization: Bearer $TOKEN" 2>/dev/null)
            
            if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
                echo "   ✅ Logout successful"
                
                # Test token after logout (should fail)
                echo "   🧪 Testing token after logout (should fail)..."
                ME_RESPONSE_AFTER=$(curl -s -X GET "$ME_URL" \
                  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
                
                if echo "$ME_RESPONSE_AFTER" | grep -q "success"; then
                    echo "   ❌ FAILED: Token still valid after logout - blacklisting not working!"
                else
                    echo "   ✅ PASSED: Token properly invalidated after logout"
                fi
            else
                echo "   ❌ Logout failed"
            fi
        else
            echo "   ❌ Token invalid before logout"
        fi
    else
        echo "   ❌ Could not extract token from login response"
    fi
else
    echo "   ❌ Login failed - cannot test token blacklisting"
fi

echo ""

# Test 3: Check Registration Role Restrictions
echo "👤 Test 3: Testing Registration Role Restrictions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test admin role registration (should fail)
echo "   🚫 Attempting admin role registration (should fail)..."
RANDOM_NUM=$((RANDOM % 9999))
ADMIN_REG_RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testadmin$RANDOM_NUM\",\"email\":\"testadmin$RANDOM_NUM@example.com\",\"password\":\"Test123!\",\"role\":\"admin\"}" 2>/dev/null)

if echo "$ADMIN_REG_RESPONSE" | grep -q "success.*true"; then
    echo "   ❌ FAILED: Admin registration succeeded - security vulnerability!"
else
    echo "   ✅ PASSED: Admin registration properly blocked"
fi

# Test commuter role registration (should work)
echo "   ✅ Attempting commuter role registration (should work)..."
COMMUTER_REG_RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testcommuter$RANDOM_NUM\",\"email\":\"testcommuter$RANDOM_NUM@example.com\",\"password\":\"Test123!\",\"role\":\"commuter\"}" 2>/dev/null)

if echo "$COMMUTER_REG_RESPONSE" | grep -q "success.*true"; then
    echo "   ✅ PASSED: Commuter registration works correctly"
elif echo "$COMMUTER_REG_RESPONSE" | grep -q "already exists"; then
    echo "   ✅ PASSED: Registration system working (user already exists)"
else
    echo "   ⚠️  WARNING: Commuter registration may have issues"
fi

echo ""

# Summary
echo "📊 SECURITY VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ = Test Passed (Secure)"
echo "❌ = Test Failed (Security Risk)"
echo "⚠️  = Warning (Check Manually)"
echo ""
echo "🔍 Manual verification recommended:"
echo "   1. Check API docs: $API_BASE/api-docs"
echo "   2. Verify no hardcoded credentials visible"
echo "   3. Test complete login/logout flow"
echo ""
echo "🛡️  If any tests failed, redeploy the security fixes immediately!"
echo ""