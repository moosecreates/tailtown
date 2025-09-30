# Dashboard and Calendar Synchronization Tests

## Overview

These tests ensure that the dashboard metrics (In, Out, Overnight counts) always match what's displayed on the calendar for the same date.

## Running the Tests

```bash
# From the frontend directory
cd frontend

# Run all tests
npm test

# Run only dashboard-calendar sync tests
npm test dashboard-calendar-sync

# Run tests in watch mode
npm test -- --watch
```

## What the Tests Validate

### 1. **IN Count Accuracy**
- Counts reservations checking in today (start date = today)
- Should match pets arriving on the calendar

### 2. **OUT Count Accuracy**
- Counts reservations checking out today (end date = today)
- Should match pets leaving on the calendar

### 3. **OVERNIGHT Count Accuracy**
- Counts reservations staying overnight (active today, ending after today)
- Should match pets staying on the calendar

### 4. **Calendar Occupancy Matching**
- Ensures all active reservations on calendar are accounted for in dashboard
- Validates that dashboard metrics cover all calendar entries

## Test Scenarios

### Standard Cases
- ✅ Same-day reservations (check-in and check-out today)
- ✅ Multi-day stays starting today
- ✅ Multi-day stays that started yesterday
- ✅ Reservations ending today

### Edge Cases
- ✅ Reservations spanning multiple days
- ✅ Overlapping reservations
- ✅ Reservations with different statuses

## Validation Rules

The tests enforce these key rules:

1. **Every reservation on the calendar must be counted in at least one dashboard metric**
2. **IN count must equal the number of reservations starting today**
3. **OUT count must equal the number of reservations ending today**
4. **OVERNIGHT count must equal active reservations ending after today**
5. **Calendar occupancy = all reservations overlapping with today**

## Example Test Output

```
Dashboard and Calendar Synchronization
  ✓ should calculate correct IN count for reservations starting today
  ✓ should calculate correct OUT count for reservations ending today
  ✓ should calculate correct OVERNIGHT count for reservations staying overnight
  ✓ should match calendar occupancy with total active reservations
  ✓ should have consistent logic between dashboard and calendar
  ✓ should handle edge case: same-day reservation
  ✓ should handle edge case: multi-day stay that started yesterday

Dashboard Metrics Validation Rules
  ✓ should ensure IN + OVERNIGHT >= total calendar occupancy
  ✓ should ensure calendar occupancy includes all dashboard categories

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

## Debugging Failed Tests

If tests fail, check:

1. **Dashboard.tsx logic** - Ensure date normalization matches test logic
2. **Calendar filtering** - Verify active reservation filtering
3. **Date comparison** - Check timezone handling and midnight normalization
4. **API responses** - Ensure backend returns consistent date formats

## Adding New Test Cases

To add new test scenarios:

1. Add mock reservation data to `mockReservations` array
2. Create a new test case using the helper functions:
   - `calculateDashboardMetrics(reservations, targetDate)`
   - `calculateCalendarOccupancy(reservations, targetDate)`
3. Add assertions to validate expected behavior

Example:

```typescript
it('should handle new edge case', () => {
  const customReservations = [
    {
      id: 'test-1',
      startDate: '2025-09-30T09:00:00.000Z',
      endDate: '2025-10-02T17:00:00.000Z',
      status: 'CONFIRMED',
      pet: { name: 'TestPet' },
      customer: { firstName: 'Test', lastName: 'User' }
    }
  ];
  
  const metrics = calculateDashboardMetrics(customReservations, testDate);
  const calendar = calculateCalendarOccupancy(customReservations, testDate);
  
  expect(metrics.inCount).toBe(1);
  expect(calendar.totalOccupied).toBe(1);
});
```

## Continuous Integration

These tests should be run:
- ✅ Before every commit
- ✅ In CI/CD pipeline
- ✅ Before deploying to production
- ✅ After any changes to dashboard or calendar logic

## Related Files

- `/frontend/src/pages/Dashboard.tsx` - Dashboard metrics calculation
- `/frontend/src/hooks/useKennelData.ts` - Calendar data loading
- `/frontend/src/components/calendar/KennelCalendar.tsx` - Calendar display logic
