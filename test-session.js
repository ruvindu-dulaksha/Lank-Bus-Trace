#!/usr/bin/env node

/**
 * Session Management and Cookie Testing Script
 * Tests various aspects of session management, cookies, and authentication
 */

import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import { URLSearchParams } from 'url';

const API_BASE = 'https://ruvindu-dulaksha.me';
const cookieJar = new CookieJar();

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
        'User-Agent': 'Session-Test-Script/1.0',
        ...options.headers
      }
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data,
      headers: response.headers,
      cookies: response.headers.get('set-cookie')
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testBasicConnectivity() {
  log('\\n🔗 Testing Basic Connectivity...', 'bold');
  
  const response = await makeRequest(`${API_BASE}/health`);
  
  if (response.success) {
    logTest('API Health Check', 'PASS', `Server is running (${response.data.status})`);
    return true;
  } else {
    logTest('API Health Check', 'FAIL', response.error || 'Server unreachable');
    return false;
  }
}

async function testSessionStatus() {
  log('\\n📊 Testing Session Status (Unauthenticated)...', 'bold');
  
  const response = await makeRequest(`${API_BASE}/api/session/status`);
  
  if (response.success) {
    const { sessionActive, cookiePresent, authMethod } = response.data;
    
    logTest('Session Status Endpoint', 'PASS', 'Endpoint accessible');
    logTest('Unauthenticated State', sessionActive ? 'FAIL' : 'PASS', 
      `Session active: ${sessionActive}, Auth method: ${authMethod}`);
    logTest('Cookie Detection', 'INFO', `Cookie present: ${cookiePresent}`);
    
    return response.data;
  } else {
    logTest('Session Status Endpoint', 'FAIL', response.error);
    return null;
  }
}

async function testCookieOperations() {
  log('\\n🍪 Testing Cookie Operations...', 'bold');
  
  // Test cookie setting
  const testValue = `test-${Date.now()}`;
  const setCookieResponse = await makeRequest(`${API_BASE}/api/session/test-cookie`, {
    method: 'POST',
    body: JSON.stringify({ testValue })
  });
  
  if (setCookieResponse.success) {
    logTest('Cookie Setting', 'PASS', `Test cookie set with value: ${testValue}`);
    
    const cookieHeader = setCookieResponse.cookies;
    if (cookieHeader) {
      logTest('Set-Cookie Header', 'PASS', 'Cookie header present in response');
      log(`  Cookie details: ${cookieHeader}`, 'blue');
    } else {
      logTest('Set-Cookie Header', 'FAIL', 'No Set-Cookie header found');
    }
    
    return setCookieResponse.data;
  } else {
    logTest('Cookie Setting', 'FAIL', setCookieResponse.error);
    return null;
  }
}

async function testAuthentication() {
  log('\\n🔐 Testing Authentication & Session Creation...', 'bold');
  
  const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(TEST_CREDENTIALS)
  });
  
  if (loginResponse.success) {
    logTest('Login Request', 'PASS', `User: ${loginResponse.data.data.user.username}`);
    
    const authCookie = loginResponse.cookies;
    if (authCookie && authCookie.includes('token=')) {
      logTest('Auth Cookie Creation', 'PASS', 'Authentication cookie set');
      
      // Extract token from cookie header
      const tokenMatch = authCookie.match(/token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;
      
      if (token) {
        return {
          token,
          user: loginResponse.data.data.user,
          cookieHeader: authCookie
        };
      }
    } else {
      logTest('Auth Cookie Creation', 'FAIL', 'No authentication cookie found');
    }
    
    // Fallback to token from response body
    if (loginResponse.data.data.token) {
      logTest('Token in Response', 'PASS', 'JWT token provided in response body');
      return {
        token: loginResponse.data.data.token,
        user: loginResponse.data.data.user,
        cookieHeader: authCookie
      };
    }
  } else {
    logTest('Login Request', 'FAIL', loginResponse.error || 'Authentication failed');
  }
  
  return null;
}

async function testAuthenticatedSession(authData) {
  log('\\n🔒 Testing Authenticated Session...', 'bold');
  
  if (!authData) {
    logTest('Authenticated Session Tests', 'SKIP', 'No authentication data available');
    return;
  }
  
  // Test with Bearer token
  const bearerResponse = await makeRequest(`${API_BASE}/api/session/auth-test`, {
    headers: {
      'Authorization': `Bearer ${authData.token}`
    }
  });
  
  if (bearerResponse.success) {
    logTest('Bearer Token Auth', 'PASS', 
      `Authenticated as: ${bearerResponse.data.user.username} (${bearerResponse.data.user.role})`);
    logTest('Session Details', 'INFO', 
      `Auth method: ${bearerResponse.data.sessionDetails.authMethod}`);
  } else {
    logTest('Bearer Token Auth', 'FAIL', bearerResponse.error);
  }
  
  // Test session status with authentication
  const statusResponse = await makeRequest(`${API_BASE}/api/session/status`, {
    headers: {
      'Authorization': `Bearer ${authData.token}`
    }
  });
  
  if (statusResponse.success) {
    const { sessionActive, authMethod, user } = statusResponse.data;
    logTest('Authenticated Session Status', sessionActive ? 'PASS' : 'FAIL',
      `Session active: ${sessionActive}, Method: ${authMethod}, User: ${user?.username}`);
  }
}

async function testSessionPersistence(authData) {
  log('\\n⏰ Testing Session Persistence...', 'bold');
  
  if (!authData) {
    logTest('Session Persistence Tests', 'SKIP', 'No authentication data available');
    return;
  }
  
  // Test multiple requests with same token
  const requests = [];
  for (let i = 0; i < 3; i++) {
    requests.push(
      makeRequest(`${API_BASE}/api/session/status`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      })
    );
  }
  
  const responses = await Promise.all(requests);
  const successCount = responses.filter(r => r.success && r.data.sessionActive).length;
  
  logTest('Multiple Requests', successCount === 3 ? 'PASS' : 'FAIL',
    `${successCount}/3 requests successful with persistent session`);
  
  // Test token expiration handling
  const invalidTokenResponse = await makeRequest(`${API_BASE}/api/session/auth-test`, {
    headers: {
      'Authorization': 'Bearer invalid.token.here'
    }
  });
  
  logTest('Invalid Token Handling', !invalidTokenResponse.success ? 'PASS' : 'FAIL',
    `Status: ${invalidTokenResponse.status}, Invalid token correctly rejected`);
}

async function testLogout(authData) {
  log('\\n🚪 Testing Logout & Session Cleanup...', 'bold');
  
  if (!authData) {
    logTest('Logout Tests', 'SKIP', 'No authentication data available');
    return;
  }
  
  const logoutResponse = await makeRequest(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authData.token}`
    }
  });
  
  if (logoutResponse.success) {
    logTest('Logout Request', 'PASS', 'Logout successful');
    
    // Check if cookie is cleared
    const cookieHeader = logoutResponse.headers.get('set-cookie');
    if (cookieHeader && cookieHeader.includes('token=;')) {
      logTest('Cookie Cleanup', 'PASS', 'Authentication cookie cleared');
    } else {
      logTest('Cookie Cleanup', 'INFO', 'Cookie clearing method may vary');
    }
    
    // Test if token is still valid after logout
    const postLogoutResponse = await makeRequest(`${API_BASE}/api/session/auth-test`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
    
    logTest('Post-Logout Token Validity', !postLogoutResponse.success ? 'PASS' : 'FAIL',
      `Token should be invalid after logout`);
  } else {
    logTest('Logout Request', 'FAIL', logoutResponse.error);
  }
}

async function testCookieCleanup() {
  log('\\n🧹 Testing Cookie Cleanup...', 'bold');
  
  const clearResponse = await makeRequest(`${API_BASE}/api/session/clear`, {
    method: 'POST'
  });
  
  if (clearResponse.success) {
    logTest('Cookie Clear Endpoint', 'PASS', 
      `Cleared cookies: ${clearResponse.data.clearedCookies.join(', ')}`);
  } else {
    logTest('Cookie Clear Endpoint', 'FAIL', clearResponse.error);
  }
}

async function runAllTests() {
  log('🧪 Lanka Bus Trace - Session Management & Cookie Testing', 'bold');
  log('=' * 60, 'blue');
  
  let authData = null;
  
  try {
    // Basic connectivity
    const isConnected = await testBasicConnectivity();
    if (!isConnected) {
      log('\\n❌ Cannot proceed - API server is not accessible', 'red');
      return;
    }
    
    // Session status (unauthenticated)
    await testSessionStatus();
    
    // Cookie operations
    await testCookieOperations();
    
    // Authentication
    authData = await testAuthentication();
    
    // Authenticated session
    await testAuthenticatedSession(authData);
    
    // Session persistence
    await testSessionPersistence(authData);
    
    // Logout
    await testLogout(authData);
    
    // Cookie cleanup
    await testCookieCleanup();
    
    log('\\n✅ Session Management & Cookie Testing Complete!', 'green');
    
  } catch (error) {
    log(`\\n❌ Test execution failed: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export default {
  runAllTests,
  testBasicConnectivity,
  testSessionStatus,
  testCookieOperations,
  testAuthentication,
  testAuthenticatedSession,
  testSessionPersistence,
  testLogout,
  testCookieCleanup
};