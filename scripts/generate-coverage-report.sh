#!/bin/bash

# Generate Coverage Report Script
# Runs all tests with coverage and generates a combined report

set -e

echo "🧪 Generating Test Coverage Report..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create coverage directory
mkdir -p coverage-reports

echo "📊 Running Frontend Tests with Coverage..."
cd frontend
npm run test:coverage -- --watchAll=false --silent 2>/dev/null || true
cd ..

echo ""
echo "📊 Running Backend Unit Tests with Coverage..."
cd services/reservation-service
npm run test:unit -- --coverage --silent 2>/dev/null || true
cd ../..

echo ""
echo "📊 Backend Integration Tests (skipped - requires database)..."
echo "   Run manually with: cd services/reservation-service && npm run test:integration"

echo ""
echo "📊 E2E Tests (skipped - requires running application)..."
echo "   Run manually with: npm run test:e2e"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 COVERAGE SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend Coverage
if [ -f "frontend/coverage/coverage-summary.json" ]; then
    echo -e "${GREEN}✅ Frontend Coverage:${NC}"
    node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('frontend/coverage/coverage-summary.json'));
        const total = coverage.total;
        console.log('   Statements: ' + total.statements.pct + '%');
        console.log('   Branches:   ' + total.branches.pct + '%');
        console.log('   Functions:  ' + total.functions.pct + '%');
        console.log('   Lines:      ' + total.lines.pct + '%');
    "
    echo ""
else
    echo -e "${YELLOW}⚠️  Frontend coverage not found${NC}"
    echo ""
fi

# Backend Coverage
if [ -f "services/reservation-service/coverage/coverage-summary.json" ]; then
    echo -e "${GREEN}✅ Backend Coverage:${NC}"
    node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('services/reservation-service/coverage/coverage-summary.json'));
        const total = coverage.total;
        console.log('   Statements: ' + total.statements.pct + '%');
        console.log('   Branches:   ' + total.branches.pct + '%');
        console.log('   Functions:  ' + total.functions.pct + '%');
        console.log('   Lines:      ' + total.lines.pct + '%');
    "
    echo ""
else
    echo -e "${YELLOW}⚠️  Backend coverage not found${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Coverage Reports Generated:"
echo ""
echo "   Frontend: frontend/coverage/lcov-report/index.html"
echo "   Backend:  services/reservation-service/coverage/lcov-report/index.html"
echo ""
echo "🌐 Open in browser:"
echo ""
echo "   open frontend/coverage/lcov-report/index.html"
echo "   open services/reservation-service/coverage/lcov-report/index.html"
echo ""
echo "✅ Coverage report generation complete!"
