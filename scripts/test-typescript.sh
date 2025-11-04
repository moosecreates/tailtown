#!/bin/bash

# TypeScript Error Check Script
# Scans for TypeScript errors without building

set -e

echo "🔍 Checking for TypeScript Errors..."
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS_FOUND=0

# Check Customer Service
echo -e "${BLUE}Checking Customer Service...${NC}"
cd services/customer
ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | xargs)
if [ "$ERROR_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ Customer Service: No TypeScript errors${NC}"
else
    echo -e "${RED}❌ Customer Service: Found $ERROR_COUNT TypeScript errors${NC}"
    npx tsc --noEmit 2>&1 | grep "error TS" | head -10
    ERRORS_FOUND=1
fi
cd ../..

echo ""

# Check Reservation Service
echo -e "${BLUE}Checking Reservation Service...${NC}"
cd services/reservation-service
ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | xargs)
if [ "$ERROR_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ Reservation Service: No TypeScript errors${NC}"
else
    echo -e "${RED}❌ Reservation Service: Found $ERROR_COUNT TypeScript errors${NC}"
    npx tsc --noEmit 2>&1 | grep "error TS" | head -10
    ERRORS_FOUND=1
fi
cd ../..

echo ""

# Check Frontend (optional)
if [ "$1" == "--with-frontend" ]; then
    echo -e "${BLUE}Checking Frontend...${NC}"
    cd frontend
    ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | xargs)
    if [ "$ERROR_COUNT" -eq "0" ]; then
        echo -e "${GREEN}✅ Frontend: No TypeScript errors${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend: Found $ERROR_COUNT TypeScript errors${NC}"
        echo "(Frontend errors are often acceptable due to library type mismatches)"
    fi
    cd ..
    echo ""
fi

# Summary
echo "======================================"
if [ $ERRORS_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 No TypeScript errors found!${NC}"
    exit 0
else
    echo -e "${RED}❌ TypeScript errors detected${NC}"
    exit 1
fi
