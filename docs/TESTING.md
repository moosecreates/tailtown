# Testing Guide

## Automated Tests

### Build Tests

Test that all services build successfully:

```bash
# Test backend services only (fast)
npm run test:builds

# Test all services including frontend (slower)
npm run test:builds:full
```

### TypeScript Error Checking

Check for TypeScript compilation errors without building:

```bash
# Check backend services only (fast)
npm run test:typescript

# Check all services including frontend
npm run test:typescript:full
```

### All Tests

Run all available tests:

```bash
# Quick tests (unit + integration)
npm run test:quick

# All tests including E2E
npm run test:all

# Full test suite including builds
npm run test:full
```

## Continuous Integration

### GitHub Actions

The project includes automated CI/CD workflows:

- **Build Tests** (`.github/workflows/build-test.yml`)
  - Runs on push to main, develop, and feature branches
  - Tests builds on Node 16.x and 18.x
  - Verifies Docker builds
  - Checks for TypeScript errors

### Pre-Push Hook

A git pre-push hook automatically runs:
1. TypeScript error check
2. Build verification

To bypass the hook (not recommended):
```bash
git push --no-verify
```

## Manual Testing

### Test Individual Services

```bash
# Customer Service
cd services/customer
npm run build
npm test

# Reservation Service
cd services/reservation-service
npm run build
npm test

# Frontend
cd frontend
npm run build
npm test
```

### Test Docker Builds

```bash
# Test customer service Docker build
docker build -f services/customer/Dockerfile.prod -t test-customer services/customer

# Test reservation service Docker build
docker build -f services/reservation-service/Dockerfile.prod -t test-reservation services/reservation-service

# Test frontend Docker build
docker build -f frontend/Dockerfile.prod -t test-frontend frontend
```

## Test Scripts Location

All test scripts are located in `/scripts/`:
- `test-builds.sh` - Build verification script
- `test-typescript.sh` - TypeScript error checking script
- `test-runner.sh` - Main test runner for unit/integration tests

## Troubleshooting

### Build Fails Locally But CI Passes

Check your Node version:
```bash
node --version  # Should be 16.x or 18.x
```

### TypeScript Errors in Test Files

Test files are excluded from production builds. If you see errors in `*.test.ts` files, they won't affect production.

### Docker Build Fails

1. Check if you have enough disk space
2. Try cleaning Docker cache:
   ```bash
   docker system prune -a
   ```
3. Rebuild without cache:
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

## Adding New Tests

### Add a New Test Script

1. Create script in `/scripts/test-*.sh`
2. Make it executable: `chmod +x scripts/test-*.sh`
3. Add npm script to `package.json`:
   ```json
   "test:mytest": "./scripts/test-mytest.sh"
   ```

### Add to CI/CD

Edit `.github/workflows/build-test.yml` to include your new test.

## Test Coverage

Current test coverage:
- Unit Tests: ~80%
- Integration Tests: ~60%
- E2E Tests: Core user flows
- Build Tests: All services
- TypeScript: Zero errors in production code

## Best Practices

1. **Run tests before committing**: `npm run test:quick`
2. **Run build tests before pushing**: `npm run test:builds`
3. **Check TypeScript errors**: `npm run test:typescript`
4. **Run full suite before major releases**: `npm run test:full`
5. **Keep tests fast**: Use mocks for external dependencies
6. **Write tests for bug fixes**: Prevent regressions

## Continuous Testing

For development, run tests in watch mode:
```bash
npm run test:watch
```

This will automatically re-run tests when files change.
