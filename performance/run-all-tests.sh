#!/bin/bash

# Run All Performance Tests
# Executes all k6 performance tests and generates summary report

set -e

echo "🚀 Running All Performance Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create results directory
mkdir -p performance/results

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed${NC}"
    echo "Install k6: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if services are running
echo "🔍 Checking if services are running..."
BASE_URL=${BASE_URL:-http://localhost:4003}

if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Service at $BASE_URL may not be running${NC}"
    echo "Start the reservation service before running tests"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 1: Reservation Load Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

k6 run performance/reservation-load-test.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 Test 2: Concurrent Booking Stress Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

k6 run performance/concurrent-booking-test.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 3: Database Query Performance Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

k6 run performance/database-query-test.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Performance Tests Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Results saved to: performance/results/"
echo ""
echo "View results:"
echo "  cat performance/results/reservation-load-test-summary.json"
echo "  cat performance/results/concurrent-booking-test-summary.json"
echo "  cat performance/results/database-query-test-summary.json"
echo ""
