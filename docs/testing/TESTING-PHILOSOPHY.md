# Testing Philosophy - Tailtown Pet Resort

## Overview

This document defines our testing strategy, focusing on **high-value tests** that document business logic, verify critical algorithms, and define what "working" means for each feature.

## Testing Principles

### 1. Test Business Logic, Not Implementation Details

❌ **Don't Test:**
- Simple getters/setters
- CSS styling
- Component rendering (unless critical UX)
- Trivial utility functions

✅ **Do Test:**
- Complex algorithms (availability checking, pricing)
- Data transformations
- API interactions and error handling
- Business rules and validation
- End-to-end user flows

### 2. Tests as Documentation

Every test should answer: **"What does 'working' mean for this feature?"**

Example:
```typescript
/**
 * BUSINESS LOGIC: Suite Availability
 * 
 * A suite is available if:
 * 1. No overlapping reservations exist
 * 2. Suite is not under maintenance
 * 3. Suite capacity is not exceeded
 */
describe('Suite Availability Rules', () => {
  it('should identify suite as available when no conflicts exist', () => {
    // Test implementation
  });
});
```

### 3. Integration Over Unit

**Integration tests** verify that components work together correctly.
**Unit tests** verify complex logic in isolation.

We prefer integration tests because they:
- Test real user scenarios
- Catch integration bugs
- Are less brittle (don't break on refactoring)
- Provide more confidence

## Test Categories

### Category 1: Integration Tests (Highest Value)

**Purpose:** Define what "working" means for complete features

**Examples:**
- Complete booking flow (service → dates → pets → payment → confirmation)
- Reservation management (view, modify, cancel)
- Customer authentication flow

**Location:** `src/__tests__/integration/`

**Value:** 🔥🔥🔥🔥🔥 (Highest)

### Category 2: Business Logic Tests (High Value)

**Purpose:** Test complex algorithms and business rules

**Examples:**
- Availability checking algorithm
- Pricing calculations (discounts, add-ons, tax)
- Multi-pet suite assignment
- Date validation rules

**Location:** `src/utils/__tests__/`, `src/services/__tests__/`

**Value:** 🔥🔥🔥🔥 (Very High)

### Category 3: API Interaction Tests (High Value)

**Purpose:** Verify API communication patterns and error handling

**Examples:**
- Network error handling
- HTTP status code handling
- Request/response transformation
- Retry logic
- Concurrent requests

**Location:** `src/services/__tests__/`

**Value:** 🔥🔥🔥🔥 (Very High)

### Category 4: Component Tests (Medium Value)

**Purpose:** Test critical user interactions

**Examples:**
- Service selection with auto-advance
- Pet auto-select logic
- Form validation
- Error message display

**Location:** `src/components/__tests__/`, `src/pages/__tests__/`

**Value:** 🔥🔥🔥 (Medium)

### Category 5: Service Layer Tests (Medium Value)

**Purpose:** Test API service functions

**Examples:**
- customerService CRUD operations
- petService data fetching
- reservationService booking creation

**Location:** `src/services/__tests__/`

**Value:** 🔥🔥 (Medium)

### Category 6: Utility Tests (Low-Medium Value)

**Purpose:** Test reusable utility functions

**Examples:**
- Date formatting
- Currency formatting
- Sorting algorithms
- Data transformations

**Location:** `src/utils/__tests__/`

**Value:** 🔥🔥 (Low-Medium)

## What "Working" Means

### Booking Flow

**Working means:**
1. ✅ User can select a service
2. ✅ User can select dates (with validation)
3. ✅ User can select pets (auto-select if one pet)
4. ✅ User can add optional services
5. ✅ User can enter contact information
6. ✅ User can complete payment
7. ✅ User receives confirmation
8. ✅ Errors are handled gracefully at each step

**Test:** `BookingFlow.integration.test.tsx`

### Suite Availability

**Working means:**
1. ✅ No overlapping reservations
2. ✅ Same-day checkout/checkin is allowed (with time buffer)
3. ✅ Multiple overlapping reservations are detected
4. ✅ Suite capacity is respected

**Test:** `availabilityLogic.test.ts`

### Pricing Calculations

**Working means:**
1. ✅ Base price × nights is calculated correctly
2. ✅ Multi-pet discount (20% off additional pets) is applied
3. ✅ Add-on services are included in total
4. ✅ Tax is calculated correctly
5. ✅ Partial day pricing works for daycare

**Test:** `availabilityLogic.test.ts`

### API Error Handling

**Working means:**
1. ✅ Network errors show user-friendly messages
2. ✅ 400 errors show validation details
3. ✅ 401 errors redirect to login
4. ✅ 404 errors show "not found" message
5. ✅ 500 errors show generic error message
6. ✅ Transient errors trigger retries
7. ✅ Permanent errors don't retry

**Test:** `apiErrorHandling.test.ts`

### Pet Selection Logic

**Working means:**
1. ✅ Single active pet is auto-selected
2. ✅ Multiple pets require manual selection
3. ✅ Inactive pets are not shown
4. ✅ Selection persists across steps

**Test:** `PetSelection.test.tsx`

## Test Coverage Goals

We **don't** aim for arbitrary coverage percentages (like 80%).

We **do** aim for:
- ✅ 100% coverage of business logic
- ✅ 100% coverage of critical paths
- ✅ 100% coverage of error handling
- ✅ Integration tests for all major features
- ✅ Documentation of what "working" means

**Current Status:**
- Overall Coverage: 7.92%
- Passing Tests: 210
- Business Logic Coverage: Excellent
- Critical Paths Coverage: Excellent
- Integration Tests: Good foundation

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- BookingFlow.integration.test

# Run tests in watch mode
npm test -- --watch

# Run integration tests only
npm test -- --testPathPattern=integration
```

## Writing New Tests

### Template: Integration Test

```typescript
/**
 * [Feature Name] Integration Tests
 * 
 * These tests define what "working" means for [feature].
 */

describe('[Feature Name]', () => {
  /**
   * INTEGRATION TEST: [Scenario Name]
   * 
   * Defines "working" as:
   * - [Requirement 1]
   * - [Requirement 2]
   * - [Requirement 3]
   */
  describe('[Scenario Name]', () => {
    it('should [expected behavior]', async () => {
      // Arrange: Set up test data
      // Act: Perform action
      // Assert: Verify outcome
    });
  });
});
```

### Template: Business Logic Test

```typescript
/**
 * [Algorithm Name] Tests
 * 
 * Tests for [description of algorithm].
 * These define what "working" means for [feature].
 */

describe('[Algorithm Name]', () => {
  /**
   * BUSINESS LOGIC: [Rule Name]
   * 
   * [Description of business rule]
   */
  describe('[Rule Name]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

## Test Maintenance

### When to Update Tests

✅ **Update tests when:**
- Business rules change
- API contracts change
- Critical bugs are fixed (add regression test)
- New features are added

❌ **Don't update tests when:**
- Refactoring implementation (tests should still pass)
- Changing CSS/styling
- Renaming variables

### Handling Failing Tests

1. **Understand why it's failing** - Is it a bug or a test issue?
2. **Fix the root cause** - Don't just make the test pass
3. **Add regression test** - If it was a bug
4. **Update documentation** - If business rules changed

## Success Metrics

We measure testing success by:

1. **Confidence** - Can we deploy without fear?
2. **Documentation** - Do tests explain what "working" means?
3. **Bug Prevention** - Do tests catch regressions?
4. **Speed** - Can we refactor quickly?

**Not by:**
- Coverage percentage
- Number of tests
- Lines of test code

## Conclusion

Good tests are:
- **Valuable** - Test important behavior
- **Maintainable** - Easy to update
- **Fast** - Run quickly
- **Reliable** - Don't flake
- **Isolated** - Independent of each other
- **Readable** - Clear and well-documented

Focus on testing **what matters** to users and the business, not arbitrary metrics.

---

**Last Updated:** October 24, 2025
**Author:** Development Team
**Status:** Living Document
