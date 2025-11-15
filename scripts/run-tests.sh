#!/bin/bash

# Automated Test Runner for Tailtown
# Runs all tests across frontend and backend services

set -e  # Exit on error

echo "🧪 Running Tailtown Test Suite"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
FAILED_TESTS=()
PASSED_TESTS=()

# Function to run tests and track results
run_test() {
    local test_name=$1
    local test_command=$2
    local test_dir=$3
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if [ -n "$test_dir" ]; then
        cd "$test_dir"
    fi
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        PASSED_TESTS+=("$test_name")
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        FAILED_TESTS+=("$test_name")
    fi
    
    if [ -n "$test_dir" ]; then
        cd - > /dev/null
    fi
    
    echo ""
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📦 Installing dependencies..."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    cd frontend && npm install && cd ..
fi

if [ ! -d "services/customer/node_modules" ]; then
    cd services/customer && npm install && cd ../..
fi

if [ ! -d "services/reservation-service/node_modules" ]; then
    cd services/reservation-service && npm install && cd ../..
fi

echo ""
echo "🔧 Setting up test database..."
echo ""

# Setup test database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/customer_test"
export NODE_ENV="test"

# Run migrations for test database
cd services/customer
npx prisma migrate deploy --preview-feature 2>/dev/null || echo "Migrations already applied"
npx prisma generate 2>/dev/null || echo "Prisma client already generated"
cd ../..

echo ""
echo "🧪 Running Tests..."
echo "================================"
echo ""

# Run frontend tests
run_test "Frontend Tests" "npm test -- --watchAll=false --passWithNoTests" "frontend"

# Run customer service tests
run_test "Customer Service Tests" "npm test" "services/customer"

# Run reservation service tests  
run_test "Reservation Service Tests" "npm test" "services/reservation-service"

# Run messaging API tests specifically
run_test "Messaging API Tests" "npm test -- messaging.api.test.ts" "services/customer"

# Run linting
echo -e "${YELLOW}Running linting checks...${NC}"
echo ""

cd services/customer
npm run lint 2>/dev/null || echo "Linting completed with warnings"
cd ../..

cd services/reservation-service
npm run lint 2>/dev/null || echo "Linting completed with warnings"
cd ../..

echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo ""

if [ ${#PASSED_TESTS[@]} -gt 0 ]; then
    echo -e "${GREEN}Passed Tests (${#PASSED_TESTS[@]}):${NC}"
    for test in "${PASSED_TESTS[@]}"; do
        echo -e "  ${GREEN}✓${NC} $test"
    done
    echo ""
fi

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed Tests (${#FAILED_TESTS[@]}):${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi
