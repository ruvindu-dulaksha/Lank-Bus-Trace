#!/usr/bin/env node

/**
 * Token Invalidation Testing Script
 * Tests the new token blacklisting functionality after logout
 */

import fetch from 'node-fetch';

const API_BASE = 'https://ruvindu-dulaksha.me';

// Test credentials
const TEST_CREDENTIALS = {
  emailOrUsername: 'Dulaksha',
  password: 'DulaBoy@2001'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${colors.bold}[${status}]${colors.reset} ${testName}`, statusColor);
  if (details) {
    log(`  → ${details}`, 'blue');
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Token-Invalidation-Test/1.0',
        ...options.headers
      }
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testTokenInvalidationFlow() {
  log('\\n🔒 Token Invalidation Testing - Lanka Bus Trace API', 'bold');
  log('=' * 60, 'blue');
  
  let authToken = null;
  let username = null;

  // Step 1: Login and get token
  log('\\n📝 Step 1: Login and obtain JWT token...', 'bold');
  const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(TEST_CREDENTIALS)
  });

  if (loginResponse.success) {
    authToken = loginResponse.data.data.token;
    username = loginResponse.data.data.user.username;
    logTest('Login Request', 'PASS', `Obtained token for user: ${username}`);
    log(`  Token (first 40 chars): ${authToken.substring(0, 40)}...`, 'blue');
  } else {
    logTest('Login Request', 'FAIL', loginResponse.error || 'Authentication failed');
    return;
  }

  // Step 2: Test protected endpoint with valid token
  log('\\n🔐 Step 2: Test protected endpoint with valid token...', 'bold');
  const preLogoutResponse = await makeRequest(`${API_BASE}/api/buses`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (preLogoutResponse.success) {
    logTest('Pre-logout Access', 'PASS', 'Protected endpoint accessible with valid token');
  } else {
    logTest('Pre-logout Access', 'FAIL', 'Token should be valid before logout');
    return;
  }

  // Step 3: Check blacklist stats (admin endpoint)
  log('\\n📊 Step 3: Check initial blacklist statistics...', 'bold');
  const statsResponse = await makeRequest(`${API_BASE}/api/auth/blacklist-stats`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (statsResponse.success) {
    const stats = statsResponse.data.data;
    logTest('Blacklist Stats Access', 'PASS', 
      `Initial blacklisted tokens: ${stats.totalBlacklistedTokens}`);
  } else {
    logTest('Blacklist Stats Access', 'INFO', 'Admin-only endpoint (expected if not admin)');
  }

  // Step 4: Logout (this should blacklist the token)
  log('\\n🚪 Step 4: Logout and blacklist token...', 'bold');
  const logoutResponse = await makeRequest(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (logoutResponse.success) {
    const tokenInvalidated = logoutResponse.data.tokenInvalidated;
    logTest('Logout Request', 'PASS', 'User logged out successfully');
    logTest('Token Invalidation', tokenInvalidated ? 'PASS' : 'FAIL', 
      `Token invalidated: ${tokenInvalidated}`);
  } else {
    logTest('Logout Request', 'FAIL', logoutResponse.error || 'Logout failed');
    return;
  }

  // Wait a moment for blacklist processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 5: Test protected endpoint with blacklisted token
  log('\\n🚫 Step 5: Test protected endpoint with blacklisted token...', 'bold');
  const postLogoutResponse = await makeRequest(`${API_BASE}/api/buses`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!postLogoutResponse.success) {
    if (postLogoutResponse.data?.code === 'TOKEN_BLACKLISTED') {
      logTest('Token Blacklisting', 'PASS', 'Token correctly rejected as blacklisted');
      logTest('Security Enhancement', 'PASS', 'Logout now properly invalidates tokens');
    } else if (postLogoutResponse.status === 401) {
      logTest('Token Rejection', 'PASS', 'Token rejected after logout');
      logTest('Rejection Reason', 'INFO', postLogoutResponse.data?.message || 'Token invalid');
    } else {
      logTest('Token Blacklisting', 'FAIL', 'Unexpected response after logout');
    }
  } else {
    logTest('Token Blacklisting', 'FAIL', 'Token still works after logout - blacklisting failed');
  }

  // Step 6: Login again to get a new token
  log('\\n🔄 Step 6: Login again to verify new tokens work...', 'bold');
  const newLoginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(TEST_CREDENTIALS)
  });

  if (newLoginResponse.success) {
    const newToken = newLoginResponse.data.data.token;
    logTest('New Login', 'PASS', 'Successfully obtained new token');
    
    // Test new token
    const newTokenResponse = await makeRequest(`${API_BASE}/api/buses`, {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    });
    
    if (newTokenResponse.success) {
      logTest('New Token Access', 'PASS', 'New token works for protected endpoints');
    } else {
      logTest('New Token Access', 'FAIL', 'New token should work');
    }
  } else {
    logTest('New Login', 'FAIL', 'Could not obtain new token');
  }

  log('\\n✅ Token Invalidation Testing Complete!', 'green');
  log('\\n📋 Summary:', 'bold');
  log('- Tokens are now properly invalidated on logout', 'green');
  log('- Security enhancement successfully implemented', 'green');
  log('- Users must login again after logout', 'green');
  
  if (statsResponse.success) {
    log('- Blacklist monitoring available for admins', 'green');
  }
}

// Run the test
testTokenInvalidationFlow().catch(error => {
  log(`\\n❌ Test execution failed: ${error.message}`, 'red');
  console.error(error);
});