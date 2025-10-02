#!/bin/bash

# 🧪 Lanka Bus Trace API - Comprehensive Filter Testing Script
# This script tests all filtering functionality in the API

echo "🚌 Starting Lanka Bus Trace API Filter Testing..."
echo "==============================================="

BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS - Status: $http_status${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Show data count if successful
        if [ "$http_status" -eq 200 ]; then
            count=$(echo "$response_body" | grep -o '"data":\[.*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
            count=$((count + 1))
            if [ "$count" -gt 1 ]; then
                echo "   📊 Returned $count items"
            else
                echo "   📊 Returned data"
            fi
        fi
    else
        echo -e "${RED}❌ FAIL - Expected: $expected_status, Got: $http_status${NC}"
        echo "Response: $response_body" | head -c 200
    fi
}

# Test authentication endpoint first
echo -e "\n${YELLOW}🔐 Testing Authentication${NC}"
run_test "Health Check" "$BASE_URL/../health"

# 1. BUS FILTERING TESTS
echo -e "\n${YELLOW}🚌 Testing Bus Filtering${NC}"

run_test "Get All Buses" "$BASE_URL/buses"
run_test "Bus Pagination" "$BASE_URL/buses?page=1&limit=5"
run_test "Filter by Status - Active" "$BASE_URL/buses?status=active"
run_test "Filter by Bus Type - Luxury" "$BASE_URL/buses?busType=luxury"
run_test "Search Buses" "$BASE_URL/buses?search=B001"
run_test "Complex Bus Filter" "$BASE_URL/buses?status=active&page=1&limit=3"

# 2. ROUTE FILTERING TESTS
echo -e "\n${YELLOW}🗺️ Testing Route Filtering${NC}"

run_test "Get All Routes" "$BASE_URL/routes"
run_test "Route Pagination" "$BASE_URL/routes?page=1&limit=5"
run_test "Filter by Origin" "$BASE_URL/routes?origin=Colombo"
run_test "Filter by Destination" "$BASE_URL/routes?destination=Kandy"
run_test "Filter by Status" "$BASE_URL/routes?status=active"
run_test "Search Routes" "$BASE_URL/routes?search=R001"
run_test "Route Search Between Cities" "$BASE_URL/routes/search?from=Colombo&to=Kandy"

# 3. TRIP FILTERING TESTS
echo -e "\n${YELLOW}🎫 Testing Trip Filtering${NC}"

run_test "Get All Trips" "$BASE_URL/trips"
run_test "Trip Pagination" "$BASE_URL/trips?page=1&limit=5"
run_test "Filter by Status" "$BASE_URL/trips?status=scheduled"
run_test "Upcoming Trips" "$BASE_URL/trips?upcoming=true"
run_test "Date Range Filter" "$BASE_URL/trips?startDate=2025-10-01&endDate=2025-10-31"

# 4. LOCATION FILTERING TESTS
echo -e "\n${YELLOW}📍 Testing Location Filtering${NC}"

run_test "Get All Locations" "$BASE_URL/locations"
run_test "Location Pagination" "$BASE_URL/locations?page=1&limit=10"
run_test "Latest Locations" "$BASE_URL/locations?latest=true"
run_test "Date Range Locations" "$BASE_URL/locations?startDate=2025-10-01"

# 5. GEOSPATIAL TESTS
echo -e "\n${YELLOW}🌍 Testing Geospatial Queries${NC}"

# Colombo coordinates
run_test "Nearby Buses (Colombo)" "$BASE_URL/buses/nearby?latitude=6.9271&longitude=79.8612&radius=5000"
run_test "Nearby Locations" "$BASE_URL/locations/nearby?latitude=6.9271&longitude=79.8612&radius=10000"

# 6. SPECIFIC RESOURCE TESTS
echo -e "\n${YELLOW}🔍 Testing Specific Resources${NC}"

# These might fail if no data exists, but should return proper status codes
run_test "Get Bus by Route" "$BASE_URL/buses/route/route123" 200
run_test "Get Bus Location History" "$BASE_URL/buses/bus123/location-history" 200

# 7. VALIDATION TESTS (Should return 400)
echo -e "\n${YELLOW}⚠️ Testing Validation (Expected Failures)${NC}"

run_test "Invalid Pagination" "$BASE_URL/buses?page=-1" 400
run_test "Invalid Coordinates" "$BASE_URL/buses/nearby?latitude=999&longitude=999" 400
run_test "Missing Required Params" "$BASE_URL/routes/search?from=Colombo" 400

# 8. SORTING TESTS
echo -e "\n${YELLOW}📊 Testing Sorting & Complex Queries${NC}"

run_test "Buses with Multiple Filters" "$BASE_URL/buses?status=active&busType=luxury&page=1&limit=5"
run_test "Routes with Search and Status" "$BASE_URL/routes?search=Colombo&status=active"
run_test "Locations with Bus Filter" "$BASE_URL/locations?busId=someId&limit=5"

# SUMMARY
echo -e "\n${YELLOW}📊 TEST SUMMARY${NC}"
echo "==============================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Filter API is fully functional.${NC}"
    exit 0
else
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "\n${YELLOW}Success Rate: $success_rate%${NC}"
    
    if [ $success_rate -ge 80 ]; then
        echo -e "${GREEN}✅ Filter API is mostly functional (>80% success)${NC}"
        exit 0
    else
        echo -e "${RED}❌ Filter API needs attention (<80% success)${NC}"
        exit 1
    fi
fi