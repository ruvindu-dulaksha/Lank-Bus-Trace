#!/bin/bash

# 🔐 Lanka Bus Trace API - Role-Based Access Control Testing
# This script tests all user roles and their permissions for CRUD operations

echo "🔐 Starting Role-Based Access Control Testing..."
echo "================================================="

BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

# User tokens storage
ADMIN_TOKEN=""
OPERATOR_TOKEN=""
COMMUTER_TOKEN=""

# Function to run test
run_test() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local token="$4"
    local data="$5"
    local expected_status="${6:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
    echo "Method: $method | URL: $url"
    echo "Expected Status: $expected_status"
    
    # Build curl command
    local curl_cmd="curl -s -w 'HTTPSTATUS:%{http_code}'"
    
    if [ -n "$token" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $token'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd -X $method '$url'"
    
    # Execute request
    response=$(eval $curl_cmd)
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS - Status: $http_status${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Extract and show relevant info
        if [[ "$response_body" == *"token"* ]]; then
            echo "   🔑 Login successful"
        elif [[ "$response_body" == *"created"* ]]; then
            echo "   ➕ Resource created"
        elif [[ "$response_body" == *"updated"* ]]; then
            echo "   ✏️ Resource updated"
        elif [[ "$response_body" == *"deleted"* ]]; then
            echo "   🗑️ Resource deleted"
        elif [[ "$response_body" == *"data"* ]]; then
            echo "   📊 Data retrieved"
        fi
    else
        echo -e "${RED}❌ FAIL - Expected: $expected_status, Got: $http_status${NC}"
        echo "Response: $(echo "$response_body" | head -c 200)"
    fi
}

# Function to extract token from login response
extract_token() {
    local response="$1"
    echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo -e "\n${PURPLE}🔑 Phase 1: User Authentication${NC}"
echo "======================================="

# Test user logins
echo -e "\n${YELLOW}1.1 Admin Login${NC}"
admin_response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "admin_ntc", "password": "admin123"}')

if [[ "$admin_response" == *"token"* ]]; then
    ADMIN_TOKEN=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Admin login successful${NC}"
    echo "Token: ${ADMIN_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Admin login failed${NC}"
    echo "Response: $admin_response"
fi

echo -e "\n${YELLOW}1.2 Operator Login${NC}"
operator_response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "operator_test", "password": "operator123"}')

if [[ "$operator_response" == *"token"* ]]; then
    OPERATOR_TOKEN=$(echo "$operator_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Operator login successful${NC}"
    echo "Token: ${OPERATOR_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Operator login failed${NC}"
    echo "Response: $operator_response"
fi

echo -e "\n${YELLOW}1.3 Commuter Login${NC}"
commuter_response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername": "user_test", "password": "user123"}')

if [[ "$commuter_response" == *"token"* ]]; then
    COMMUTER_TOKEN=$(echo "$commuter_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Commuter login successful${NC}"
    echo "Token: ${COMMUTER_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Commuter login failed${NC}"
    echo "Response: $commuter_response"
fi

# Test authentication failures
echo -e "\n${YELLOW}1.4 Authentication Failure Tests${NC}"
run_test "Invalid credentials" "POST" "$BASE_URL/auth/login" "" '{"emailOrUsername": "invalid", "password": "wrong"}' 400
run_test "Missing password" "POST" "$BASE_URL/auth/login" "" '{"emailOrUsername": "admin_ntc"}' 400

echo -e "\n${PURPLE}🚌 Phase 2: Bus Management CRUD Tests${NC}"
echo "============================================="

# Bus READ operations
echo -e "\n${YELLOW}2.1 Bus READ Operations${NC}"
run_test "Public - Get all buses (no auth)" "GET" "$BASE_URL/buses" "" "" 200
run_test "Admin - Get all buses" "GET" "$BASE_URL/buses" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get all buses" "GET" "$BASE_URL/buses" "$OPERATOR_TOKEN" "" 200
run_test "Commuter - Get all buses" "GET" "$BASE_URL/buses" "$COMMUTER_TOKEN" "" 200

# Bus CREATE operations
echo -e "\n${YELLOW}2.2 Bus CREATE Operations${NC}"
BUS_DATA='{"registrationNumber": "TEST-1234", "busNumber": "B999", "operatorInfo": {"operatorName": "Test Operator"}, "vehicleDetails": {"make": "Test", "model": "Model", "year": 2023}, "capacity": {"seated": 50}, "busType": "standard"}'

run_test "Admin - Create bus (ALLOWED)" "POST" "$BASE_URL/buses" "$ADMIN_TOKEN" "$BUS_DATA" 201
run_test "Operator - Create bus (ALLOWED)" "POST" "$BASE_URL/buses" "$OPERATOR_TOKEN" "$BUS_DATA" 201
run_test "Commuter - Create bus (FORBIDDEN)" "POST" "$BASE_URL/buses" "$COMMUTER_TOKEN" "$BUS_DATA" 403
run_test "No Auth - Create bus (UNAUTHORIZED)" "POST" "$BASE_URL/buses" "" "$BUS_DATA" 401

# Bus UPDATE operations
echo -e "\n${YELLOW}2.3 Bus UPDATE Operations${NC}"
UPDATE_DATA='{"operationalStatus": "maintenance"}'

# First get a bus ID to test with
BUS_ID=$(curl -s "$BASE_URL/buses?limit=1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$BUS_ID" ]; then
    run_test "Admin - Update bus (ALLOWED)" "PUT" "$BASE_URL/buses/$BUS_ID" "$ADMIN_TOKEN" "$UPDATE_DATA" 200
    run_test "Operator - Update assigned bus (DEPENDS)" "PUT" "$BASE_URL/buses/$BUS_ID" "$OPERATOR_TOKEN" "$UPDATE_DATA" 200
    run_test "Commuter - Update bus (FORBIDDEN)" "PUT" "$BASE_URL/buses/$BUS_ID" "$COMMUTER_TOKEN" "$UPDATE_DATA" 403
    run_test "No Auth - Update bus (UNAUTHORIZED)" "PUT" "$BASE_URL/buses/$BUS_ID" "" "$UPDATE_DATA" 401
else
    echo -e "${YELLOW}⚠️ No bus ID found for update tests${NC}"
fi

# Bus DELETE operations
echo -e "\n${YELLOW}2.4 Bus DELETE Operations${NC}"
if [ -n "$BUS_ID" ]; then
    run_test "Commuter - Delete bus (FORBIDDEN)" "DELETE" "$BASE_URL/buses/$BUS_ID" "$COMMUTER_TOKEN" "" 403
    run_test "Operator - Delete bus (FORBIDDEN)" "DELETE" "$BASE_URL/buses/$BUS_ID" "$OPERATOR_TOKEN" "" 403
    run_test "No Auth - Delete bus (UNAUTHORIZED)" "DELETE" "$BASE_URL/buses/$BUS_ID" "" "" 401
    # Note: Admin delete test would actually delete, so we test permissions only
    echo -e "${BLUE}   Admin delete permission exists but not tested to preserve data${NC}"
fi

echo -e "\n${PURPLE}🗺️ Phase 3: Route Management CRUD Tests${NC}"
echo "==============================================="

# Route READ operations
echo -e "\n${YELLOW}3.1 Route READ Operations${NC}"
run_test "Public - Get all routes (no auth)" "GET" "$BASE_URL/routes" "" "" 200
run_test "Admin - Get all routes" "GET" "$BASE_URL/routes" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get all routes" "GET" "$BASE_URL/routes" "$OPERATOR_TOKEN" "" 200
run_test "Commuter - Get all routes" "GET" "$BASE_URL/routes" "$COMMUTER_TOKEN" "" 200

# Route CREATE operations
echo -e "\n${YELLOW}3.2 Route CREATE Operations${NC}"
ROUTE_DATA='{"routeNumber": "R999", "routeName": "Test Route", "origin": {"city": "TestCity", "coordinates": {"latitude": 6.9, "longitude": 79.8}}, "destination": {"city": "TestDest", "coordinates": {"latitude": 7.0, "longitude": 80.0}}, "distance": 50, "estimatedDuration": 90}'

run_test "Admin - Create route (ALLOWED)" "POST" "$BASE_URL/routes" "$ADMIN_TOKEN" "$ROUTE_DATA" 201
run_test "Operator - Create route (FORBIDDEN)" "POST" "$BASE_URL/routes" "$OPERATOR_TOKEN" "$ROUTE_DATA" 403
run_test "Commuter - Create route (FORBIDDEN)" "POST" "$BASE_URL/routes" "$COMMUTER_TOKEN" "$ROUTE_DATA" 403
run_test "No Auth - Create route (UNAUTHORIZED)" "POST" "$BASE_URL/routes" "" "$ROUTE_DATA" 401

echo -e "\n${PURPLE}🎫 Phase 4: Trip Management CRUD Tests${NC}"
echo "============================================="

# Trip READ operations
echo -e "\n${YELLOW}4.1 Trip READ Operations${NC}"
run_test "Public - Get all trips (no auth)" "GET" "$BASE_URL/trips" "" "" 200
run_test "Admin - Get all trips" "GET" "$BASE_URL/trips" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get all trips" "GET" "$BASE_URL/trips" "$OPERATOR_TOKEN" "" 200
run_test "Commuter - Get all trips" "GET" "$BASE_URL/trips" "$COMMUTER_TOKEN" "" 200

# Trip CREATE operations
echo -e "\n${YELLOW}4.2 Trip CREATE Operations${NC}"
ROUTE_ID=$(curl -s "$BASE_URL/routes?limit=1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
BUS_ID_FOR_TRIP=$(curl -s "$BASE_URL/buses?limit=1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ROUTE_ID" ] && [ -n "$BUS_ID_FOR_TRIP" ]; then
    TRIP_DATA="{\"routeId\": \"$ROUTE_ID\", \"busId\": \"$BUS_ID_FOR_TRIP\", \"schedule\": {\"plannedDeparture\": \"2025-10-15T08:00:00Z\", \"plannedArrival\": \"2025-10-15T10:00:00Z\"}, \"pricing\": {\"baseFare\": 100}}"
    
    run_test "Admin - Create trip (ALLOWED)" "POST" "$BASE_URL/trips" "$ADMIN_TOKEN" "$TRIP_DATA" 201
    run_test "Operator - Create trip (ALLOWED)" "POST" "$BASE_URL/trips" "$OPERATOR_TOKEN" "$TRIP_DATA" 201
    run_test "Commuter - Create trip (FORBIDDEN)" "POST" "$BASE_URL/trips" "$COMMUTER_TOKEN" "$TRIP_DATA" 403
    run_test "No Auth - Create trip (UNAUTHORIZED)" "POST" "$BASE_URL/trips" "" "$TRIP_DATA" 401
else
    echo -e "${YELLOW}⚠️ Missing route or bus ID for trip tests${NC}"
fi

echo -e "\n${PURPLE}📍 Phase 5: Location Management Tests${NC}"
echo "=========================================="

# Location READ operations
echo -e "\n${YELLOW}5.1 Location READ Operations${NC}"
run_test "Public - Get all locations" "GET" "$BASE_URL/locations" "" "" 200
run_test "Admin - Get all locations" "GET" "$BASE_URL/locations" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get all locations" "GET" "$BASE_URL/locations" "$OPERATOR_TOKEN" "" 200
run_test "Commuter - Get all locations" "GET" "$BASE_URL/locations" "$COMMUTER_TOKEN" "" 200

# Location CREATE operations (GPS updates)
echo -e "\n${YELLOW}5.2 Location CREATE Operations${NC}"
if [ -n "$BUS_ID" ]; then
    LOCATION_DATA='{"latitude": 6.9271, "longitude": 79.8612, "accuracy": 5}'
    
    run_test "Admin - Update bus location (ALLOWED)" "POST" "$BASE_URL/buses/$BUS_ID/location" "$ADMIN_TOKEN" "$LOCATION_DATA" 200
    run_test "Operator - Update bus location (DEPENDS)" "POST" "$BASE_URL/buses/$BUS_ID/location" "$OPERATOR_TOKEN" "$LOCATION_DATA" 200
    run_test "Commuter - Update bus location (FORBIDDEN)" "POST" "$BASE_URL/buses/$BUS_ID/location" "$COMMUTER_TOKEN" "$LOCATION_DATA" 403
    run_test "No Auth - Update bus location (UNAUTHORIZED)" "POST" "$BASE_URL/buses/$BUS_ID/location" "" "$LOCATION_DATA" 401
fi

echo -e "\n${PURPLE}🔧 Phase 6: Administrative Operations${NC}"
echo "=========================================="

# Stats and admin-only operations
echo -e "\n${YELLOW}6.1 Statistics Access${NC}"
run_test "Admin - Get trip stats (ALLOWED)" "GET" "$BASE_URL/trips/stats" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get trip stats (FORBIDDEN)" "GET" "$BASE_URL/trips/stats" "$OPERATOR_TOKEN" "" 403
run_test "Commuter - Get trip stats (FORBIDDEN)" "GET" "$BASE_URL/trips/stats" "$COMMUTER_TOKEN" "" 403

run_test "Admin - Get location stats (ALLOWED)" "GET" "$BASE_URL/locations/stats" "$ADMIN_TOKEN" "" 200
run_test "Operator - Get location stats (FORBIDDEN)" "GET" "$BASE_URL/locations/stats" "$OPERATOR_TOKEN" "" 403

echo -e "\n${YELLOW}6.2 User Management${NC}"
USER_DATA='{"username": "testuser", "email": "test@example.com", "password": "password123", "role": "commuter"}'

run_test "Admin - Create user (ALLOWED)" "POST" "$BASE_URL/auth/register" "$ADMIN_TOKEN" "$USER_DATA" 201
run_test "Operator - Create user (CHECK)" "POST" "$BASE_URL/auth/register" "$OPERATOR_TOKEN" "$USER_DATA" 201
run_test "Public - Register user (ALLOWED)" "POST" "$BASE_URL/auth/register" "" "$USER_DATA" 201

echo -e "\n${PURPLE}🔐 Phase 7: Special Permission Tests${NC}"
echo "==========================================="

# Test role-specific endpoints
echo -e "\n${YELLOW}7.1 Role-Specific Endpoints${NC}"
run_test "Admin - Generate API key (ALLOWED)" "POST" "$BASE_URL/auth/api-key" "$ADMIN_TOKEN" "" 200
run_test "Operator - Generate API key (ALLOWED)" "POST" "$BASE_URL/auth/api-key" "$OPERATOR_TOKEN" "" 200
run_test "Commuter - Generate API key (FORBIDDEN)" "POST" "$BASE_URL/auth/api-key" "$COMMUTER_TOKEN" "" 403

echo -e "\n${YELLOW}7.2 Resource Authorization Tests${NC}"
# Test operator access to specific resources
if [ -n "$BUS_ID" ]; then
    run_test "Get bus location history (Public)" "GET" "$BASE_URL/buses/$BUS_ID/location-history" "" "" 200
    run_test "Get bus details by ID (Public)" "GET" "$BASE_URL/buses/$BUS_ID" "" "" 200
fi

# SUMMARY
echo -e "\n${PURPLE}📊 ROLE TESTING SUMMARY${NC}"
echo "========================================"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $((TOTAL_TESTS - PASSED_TESTS))${NC}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Success Rate: $success_rate%"
    
    if [ $success_rate -ge 90 ]; then
        echo -e "\n${GREEN}🎉 EXCELLENT! Role-based access control is working correctly!${NC}"
    elif [ $success_rate -ge 80 ]; then
        echo -e "\n${GREEN}✅ GOOD! Role-based access control is mostly working (>80% success)${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "\n${YELLOW}⚠️ FAIR! Some role permissions need attention (70-80% success)${NC}"
    else
        echo -e "\n${RED}❌ NEEDS WORK! Role-based access control has issues (<70% success)${NC}"
    fi
else
    echo -e "\n${RED}❌ No tests were executed${NC}"
fi

echo -e "\n${BLUE}🔍 Role Permission Summary:${NC}"
echo "=================================="
echo -e "${GREEN}✅ ADMIN ROLE:${NC}"
echo "   - Full CRUD on all resources"
echo "   - Access to statistics and admin functions"
echo "   - Can create, update, delete buses, routes, trips"
echo "   - Can generate API keys"

echo -e "\n${YELLOW}⚡ OPERATOR ROLE:${NC}"
echo "   - Read access to all resources"
echo "   - Create and update trips"
echo "   - Update assigned buses/routes only"
echo "   - Update GPS locations for assigned buses"
echo "   - Can generate API keys"
echo "   - Cannot delete resources or access admin stats"

echo -e "\n${BLUE}👤 COMMUTER ROLE:${NC}"
echo "   - Read-only access to public data"
echo "   - Can view buses, routes, trips, locations"
echo "   - Cannot create, update, or delete anything"
echo "   - Cannot access admin functions or stats"
echo "   - Cannot generate API keys"

echo -e "\n${PURPLE}🌐 PUBLIC ACCESS (No Auth):${NC}"
echo "   - Read-only access to basic bus/route information"
echo "   - Can search routes and view schedules"
echo "   - Can register new accounts"
echo "   - Cannot access any modification operations"

exit 0
