# Performance Tests

## Overview

Performance tests for the Tailtown application using k6 load testing framework. These tests validate system behavior under various load conditions and ensure the application can handle production traffic.

## Test Suites

### 1. `reservation-load-test.js`

**Purpose:** General load testing of reservation service endpoints

**Test Scenarios:**
- Get all reservations (pagination)
- Get reservations with filters
- Create reservations
- Check availability
- Get reservation by ID

**Load Profile:**
```
Stage 1: Ramp up to 10 users (30s)
Stage 2: Sustain 10 users (1m)
Stage 3: Ramp up to 50 users (30s)
Stage 4: Sustain 50 users (2m)
Stage 5: Spike to 100 users (30s)
Stage 6: Sustain 100 users (1m)
Stage 7: Ramp down to 0 (30s)
```

**Performance Thresholds:**
- 95% of requests < 500ms
- Error rate < 10%

**Metrics:**
- HTTP request duration
- Request rate
- Error rate
- Custom: Reservation creation time
- Custom: Reservation query time

### 2. `concurrent-booking-test.js`

**Purpose:** Stress test for double-booking prevention

**Test Scenario:**
- Multiple users simultaneously booking the SAME kennel
- Tests database transaction isolation
- Validates conflict detection

**Load Profile:**
```
50 requests per second for 30 seconds
100-200 concurrent virtual users
```

**Success Criteria:**
- ✅ Exactly ONE successful booking
- ✅ All other attempts rejected with 409 Conflict
- ✅ ZERO double bookings
- ✅ No data corruption

**Metrics:**
- Successful bookings (should be 1)
- Rejected bookings (should be many)
- Double bookings (should be 0)
- Error rate

### 3. `database-query-test.js`

**Purpose:** Database query performance testing

**Test Scenarios:**
- Large pagination (250 records)
- Multiple filters
- Date range queries
- Complex queries with joins
- Sorting performance

**Load Profile:**
```
Stage 1: Ramp up to 20 users (30s)
Stage 2: Sustain 20 users (2m)
Stage 3: Ramp down to 0 (30s)
```

**Performance Thresholds:**
- Pagination queries: p95 < 300ms
- Filter queries: p95 < 500ms
- Complex queries: p95 < 1000ms

**Metrics:**
- Pagination query time
- Filter query time
- Complex query time
- Error rate

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

### Setup Test Environment

1. **Start Services:**
   ```bash
   # Terminal 1: Reservation Service
   cd services/reservation-service
   npm start
   
   # Terminal 2: Customer Service
   cd services/customer-service
   npm start
   
   # Terminal 3: Frontend (optional)
   cd frontend
   npm start
   ```

2. **Ensure Database is Running:**
   ```bash
   # PostgreSQL should be running on localhost:5434
   ```

3. **Create Test Data:**
   ```bash
   # Run seed script to populate test data
   cd services/reservation-service
   npm run seed
   ```

## Running Tests

### Run Individual Tests

```bash
# Load test
k6 run performance/reservation-load-test.js

# Concurrent booking test
k6 run performance/concurrent-booking-test.js

# Database query test
k6 run performance/database-query-test.js
```

### Run with Custom Base URL

```bash
k6 run -e BASE_URL=http://localhost:4003 performance/reservation-load-test.js
```

### Run All Tests

```bash
# Run all performance tests sequentially
./performance/run-all-tests.sh
```

### View Results

```bash
# Results are saved to performance/results/
ls -la performance/results/

# View JSON summary
cat performance/results/reservation-load-test-summary.json
```

## Test Results

### Expected Performance

**Reservation Service:**
- GET requests: < 200ms (p95)
- POST requests: < 500ms (p95)
- Throughput: > 100 req/s
- Error rate: < 1%

**Database Queries:**
- Simple queries: < 100ms (p95)
- Pagination (250): < 300ms (p95)
- Complex queries: < 1000ms (p95)

**Concurrent Operations:**
- No double bookings
- Proper conflict detection
- Transaction isolation maintained

### Sample Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Requests: 1250
Failed Requests: 12
Request Duration (avg): 156.32ms
Request Duration (p95): 423.45ms
Request Duration (max): 892.11ms
Requests/sec: 25.67
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Interpreting Results

### Key Metrics

1. **HTTP Request Duration**
   - Average response time
   - p95 (95th percentile) - 95% of requests faster than this
   - p99 (99th percentile) - 99% of requests faster than this
   - Max - Slowest request

2. **Request Rate**
   - Requests per second
   - Indicates throughput capacity

3. **Error Rate**
   - Percentage of failed requests
   - Should be < 1% under normal load

4. **Custom Metrics**
   - Specific to each test
   - Track business-critical operations

### Performance Indicators

**🟢 Good Performance:**
- p95 < 500ms
- Error rate < 1%
- No double bookings
- Stable under load

**🟡 Acceptable Performance:**
- p95 < 1000ms
- Error rate < 5%
- Minor degradation under peak load

**🔴 Poor Performance:**
- p95 > 1000ms
- Error rate > 5%
- Double bookings detected
- System instability

## Troubleshooting

### High Response Times

**Possible Causes:**
- Database not indexed properly
- Too many database connections
- Inefficient queries
- Network latency

**Solutions:**
```sql
-- Add indexes
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_resource ON reservations(resource_id);
CREATE INDEX idx_reservations_status ON reservations(status);
```

### High Error Rates

**Possible Causes:**
- Database connection pool exhausted
- Memory leaks
- Unhandled exceptions
- Rate limiting

**Solutions:**
- Increase database connection pool
- Check for memory leaks
- Add error handling
- Adjust rate limits

### Double Bookings Detected

**Possible Causes:**
- Missing database transaction
- Race condition in code
- Improper locking
- Database isolation level

**Solutions:**
```typescript
// Use database transactions
await prisma.$transaction(async (tx) => {
  // Check availability
  // Create reservation
});

// Use proper isolation level
await prisma.$executeRaw`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`;
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *' # Run nightly
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run performance tests
        run: |
          k6 run performance/reservation-load-test.js
          k6 run performance/concurrent-booking-test.js
          k6 run performance/database-query-test.js
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance/results/
```

## Best Practices

### Test Design

1. **Realistic Load Patterns**
   - Model actual user behavior
   - Include think time (sleep)
   - Vary request types

2. **Gradual Ramp-up**
   - Don't spike immediately
   - Allow system to warm up
   - Monitor during ramp-up

3. **Meaningful Thresholds**
   - Based on SLA requirements
   - Account for network latency
   - Consider user expectations

### Test Execution

1. **Isolated Environment**
   - Dedicated test environment
   - No other traffic
   - Consistent hardware

2. **Baseline Measurements**
   - Run tests regularly
   - Track trends over time
   - Compare against baseline

3. **Multiple Runs**
   - Run tests multiple times
   - Average results
   - Identify outliers

### Result Analysis

1. **Look for Patterns**
   - Degradation under load
   - Memory leaks
   - Connection pool exhaustion

2. **Identify Bottlenecks**
   - Database queries
   - External API calls
   - CPU/Memory usage

3. **Prioritize Fixes**
   - High-impact issues first
   - Quick wins
   - Long-term improvements

## Performance Optimization Tips

### Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_resource_dates ON reservations(resource_id, start_date, end_date);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM reservations WHERE start_date >= '2025-10-21';

-- Update statistics
ANALYZE reservations;
```

### Backend

```typescript
// Use connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10,
      },
    },
  },
});

// Cache frequently accessed data
const cache = new Map();

// Use pagination
const reservations = await prisma.reservation.findMany({
  take: 100,
  skip: page * 100,
});
```

### Frontend

```typescript
// Debounce search inputs
const debouncedSearch = debounce(searchFunction, 300);

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));

// Virtualize long lists
import { FixedSizeList } from 'react-window';
```

## Related Documentation

- [Test Coverage](../docs/TEST-COVERAGE.md)
- [Integration Tests](../services/reservation-service/src/tests/integration/README.md)
- [E2E Tests](../e2e/README.md)
- [k6 Documentation](https://k6.io/docs/)

## Updates

### October 21, 2025
- ✅ Created performance test suite
- ✅ Added load testing
- ✅ Added concurrent booking stress test
- ✅ Added database query performance test
- ✅ Documented test execution and analysis
