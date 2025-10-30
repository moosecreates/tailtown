# E2E Critical Path Tests

Comprehensive end-to-end tests for the most important user workflows in Tailtown.

## 🎯 What These Tests Cover

### 1. Boarding Reservations
- ✅ Complete booking flow (customer → pet → dates → suite → confirm)
- ✅ Double-booking prevention
- ✅ Multi-day stays
- ✅ Add-on services
- ✅ Check-in/check-out workflows

### 2. Daycare Bookings
- ✅ Single day booking
- ✅ Package purchase and usage
- ✅ Package balance tracking
- ✅ Time slot selection

### 3. Training Class Enrollment
- ✅ Browse and select classes
- ✅ Enrollment flow
- ✅ Payment options
- ✅ Waitlist management
- ✅ Class schedule generation

### 4. Grooming Appointments
- ✅ Appointment booking
- ✅ Service selection
- ✅ Groomer assignment
- ✅ Double-booking prevention
- ✅ Time slot management

### 5. Multi-Service Scenarios
- ✅ Grooming during boarding stay
- ✅ Cross-service conflict detection
- ✅ Combined invoicing

## 🚀 Running the Tests

### Prerequisites
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### Setup Test Data
```bash
# From the customer service directory
cd services/customer
npx ts-node frontend/src/__tests__/e2e/setup/test-data.ts
```

### Run All Critical Path Tests
```bash
# From frontend directory
cd frontend

# Run all tests
npx playwright test

# Run specific test file
npx playwright test critical-paths.spec.ts

# Run specific test
npx playwright test -g "should create a complete boarding reservation"

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Run Tests in CI
```bash
# Run with all browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## 📊 Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

Reports include:
- ✅ Pass/fail status for each test
- 📸 Screenshots on failure
- 🎥 Video recordings on failure
- 📝 Detailed traces for debugging

## 🔧 Configuration

Edit `playwright.config.ts` to customize:
- Browser selection
- Viewport sizes
- Timeouts
- Retry logic
- Parallel execution
- Video/screenshot settings

## 📝 Test Data

Tests use consistent test data:
- **Customer**: Test Customer (test.customer@example.com)
- **Pets**: Buddy (Golden Retriever), Max (Labrador)
- **Services**: Boarding, Daycare, Grooming, Training
- **Resources**: Test Suite 1, Test Suite 2
- **Staff**: Sarah Johnson (Groomer)

## 🐛 Debugging Failed Tests

### View Trace
```bash
npx playwright show-trace trace.zip
```

### Run Single Test in Debug Mode
```bash
npx playwright test --debug -g "test name"
```

### Common Issues

**Test times out:**
- Increase timeout in `playwright.config.ts`
- Check if services are running
- Verify test data exists

**Element not found:**
- Check selectors in test
- Verify UI hasn't changed
- Use `page.pause()` to inspect

**Flaky tests:**
- Add explicit waits: `await page.waitForSelector()`
- Use `waitForLoadState('networkidle')`
- Increase action timeout

## 📈 Test Coverage

| Service Type | Tests | Coverage |
|--------------|-------|----------|
| Boarding | 2 | Core flow + conflicts |
| Daycare | 2 | Booking + packages |
| Training | 2 | Enrollment + waitlist |
| Grooming | 2 | Booking + conflicts |
| Check-in/out | 2 | Full workflows |
| Multi-service | 1 | Combined bookings |
| **Total** | **11** | **Critical paths** |

## 🎯 Success Criteria

All tests should:
- ✅ Complete in under 2 minutes each
- ✅ Pass consistently (no flakiness)
- ✅ Work across all browsers
- ✅ Provide clear failure messages
- ✅ Clean up test data

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    CI: true
```

### Pre-deployment Checks
Run these tests before every deployment to ensure:
- All critical paths work
- No regressions introduced
- UI changes don't break workflows

## 📚 Writing New Tests

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should do something', async ({ page }) => {
    // 1. Navigate
    // 2. Interact
    // 3. Assert
  });
});
```

### Best Practices
- Use data-testid attributes for stable selectors
- Wait for network idle before assertions
- Take screenshots at key steps
- Clean up test data after tests
- Use descriptive test names
- Keep tests independent

## 🎉 Benefits

These E2E tests provide:
- ✅ Confidence in production deployments
- ✅ Early detection of breaking changes
- ✅ Documentation of user workflows
- ✅ Regression prevention
- ✅ Cross-browser compatibility verification

## 🚨 When Tests Fail

1. **Check the HTML report** - Visual timeline of what happened
2. **View screenshots** - See exact failure point
3. **Watch video** - Replay the test execution
4. **Inspect trace** - Detailed debugging information
5. **Run locally** - Reproduce in headed mode

## 📞 Support

If tests are failing:
1. Check if services are running (ports 3000, 4003, 4004)
2. Verify test data exists
3. Check for UI changes
4. Review recent code changes
5. Run in debug mode to investigate

---

**Status**: ✅ Ready for use  
**Last Updated**: October 30, 2025  
**Maintainer**: Development Team
