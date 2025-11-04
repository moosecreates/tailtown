#!/bin/bash

# Test Builds Script
# Verifies that all services build successfully

set -e  # Exit on any error

echo "🧪 Testing Tailtown Service Builds..."
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
FAILED=0

# Test Customer Service Build
echo -e "${BLUE}Testing Customer Service Build...${NC}"
cd services/customer
if npm run build > /tmp/customer-build.log 2>&1; then
    echo -e "${GREEN}✅ Customer Service: Build successful${NC}"
else
    echo -e "${RED}❌ Customer Service: Build failed${NC}"
    echo "Error log:"
    tail -20 /tmp/customer-build.log
    FAILED=1
fi
cd ../..

echo ""

# Test Reservation Service Build
echo -e "${BLUE}Testing Reservation Service Build...${NC}"
cd services/reservation-service
if npm run build > /tmp/reservation-build.log 2>&1; then
    echo -e "${GREEN}✅ Reservation Service: Build successful${NC}"
else
    echo -e "${RED}❌ Reservation Service: Build failed${NC}"
    echo "Error log:"
    tail -20 /tmp/reservation-build.log
    FAILED=1
fi
cd ../..

echo ""

# Test Frontend Build (optional - takes longer)
if [ "$1" == "--with-frontend" ]; then
    echo -e "${BLUE}Testing Frontend Build...${NC}"
    cd frontend
    if npm run build > /tmp/frontend-build.log 2>&1; then
        echo -e "${GREEN}✅ Frontend: Build successful${NC}"
    else
        echo -e "${RED}❌ Frontend: Build failed${NC}"
        echo "Error log:"
        tail -20 /tmp/frontend-build.log
        FAILED=1
    fi
    cd ..
    echo ""
fi

# Summary
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All builds passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some builds failed${NC}"
    exit 1
fi
