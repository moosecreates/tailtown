# Timezone Handling Best Practices

## Overview

This document outlines the timezone handling strategy for the Tailtown application to prevent date-related bugs and ensure consistent behavior across different timezones.

---

## Core Principles

### 1. **Store Everything in UTC**
- All dates in the database are stored in UTC
- PostgreSQL `TIMESTAMP` fields store UTC by default
- Never store local timezone dates in the database

### 2. **Convert at the Edges**
- Convert to user's local timezone only in the UI
- Convert from user's local timezone to UTC when saving
- Keep all internal logic in UTC

### 3. **Use UTC Methods for Comparisons**
- Always use `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()` for date comparisons
- Never use local timezone methods (`getFullYear()`, `getMonth()`, `getDate()`) for business logic

---

## Common Pitfalls

### ❌ **Wrong: Using Local Timezone Methods**

```typescript
// BAD - This will break in different timezones
const today = new Date();
const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

const reservationDate = new Date(reservation.startDate);
const resDateStr = `${reservationDate.getFullYear()}-${reservationDate.getMonth() + 1}-${reservationDate.getDate()}`;

if (resDateStr === todayStr) {
  // This comparison is timezone-dependent!
}
```

### ✅ **Correct: Using UTC Methods**

```typescript
// GOOD - Works consistently across all timezones
const today = new Date();
const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

const reservationDate = new Date(reservation.startDate);
const resDateStr = `${reservationDate.getUTCFullYear()}-${String(reservationDate.getUTCMonth() + 1).padStart(2, '0')}-${String(reservationDate.getUTCDate()).padStart(2, '0')}`;

if (resDateStr === todayStr) {
  // This works correctly!
}
```

---

## Date Comparison Patterns

### Checking if Date is Today

```typescript
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getUTCFullYear() === today.getUTCFullYear() &&
         date.getUTCMonth() === today.getUTCMonth() &&
         date.getUTCDate() === today.getUTCDate();
};
```

### Checking if Date is in Range

```typescript
const isInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  const startStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
  const endStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;
  
  return dateStr >= startStr && dateStr <= endStr;
};
```

### Creating UTC Dates

```typescript
// Create a date at midnight UTC for a specific day
const createUTCDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

// Example: Oct 23, 2025 at midnight UTC
const date = createUTCDate(2025, 10, 23);
```

---

## Database Queries

### Filtering by Date Range

```typescript
// Find reservations starting on a specific date (UTC)
const startOfDay = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
const endOfDay = new Date(Date.UTC(2025, 9, 23, 23, 59, 59, 999));

const reservations = await prisma.reservation.findMany({
  where: {
    startDate: {
      gte: startOfDay,
      lte: endOfDay
    }
  }
});
```

### Finding Overlapping Reservations

```typescript
// Find reservations that overlap with a specific date
const targetDate = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
const endOfDay = new Date(Date.UTC(2025, 9, 23, 23, 59, 59, 999));

const overlapping = await prisma.reservation.findMany({
  where: {
    AND: [
      { startDate: { lte: endOfDay } },
      { endDate: { gte: targetDate } }
    ]
  }
});
```

---

## Frontend Display

### Displaying Dates to Users

```typescript
// Use toLocaleDateString() for display only
const displayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Example: "October 23, 2025"
```

### Date Pickers

```typescript
// When user selects a date, convert to UTC midnight
const handleDateSelect = (selectedDate: Date) => {
  const utcDate = new Date(Date.UTC(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0, 0, 0, 0
  ));
  
  // Save utcDate to backend
};
```

---

## Testing

### Test Different Timezones

```typescript
describe('Timezone Tests', () => {
  it('should work at midnight UTC', () => {
    const midnightUTC = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
    // Test logic
  });

  it('should work at end of day UTC', () => {
    const endOfDayUTC = new Date(Date.UTC(2025, 9, 23, 23, 59, 59));
    // Test logic
  });

  it('should work across timezone boundaries', () => {
    // Test with dates that would be different days in different timezones
    const lateNightUTC = new Date(Date.UTC(2025, 9, 23, 23, 0, 0));
    const earlyMorningUTC = new Date(Date.UTC(2025, 9, 24, 1, 0, 0));
    // Test logic
  });
});
```

---

## API Contracts

### Request Format

Clients should send dates in ISO 8601 format:
```json
{
  "startDate": "2025-10-23T00:00:00.000Z",
  "endDate": "2025-10-24T00:00:00.000Z"
}
```

### Response Format

Server should return dates in ISO 8601 format with UTC timezone:
```json
{
  "startDate": "2025-10-23T14:30:00.000Z",
  "endDate": "2025-10-24T14:30:00.000Z"
}
```

---

## Checklist for New Features

When implementing date-related features:

- [ ] Use UTC methods for all date comparisons
- [ ] Store dates in UTC in the database
- [ ] Test with dates at midnight UTC
- [ ] Test with dates at 23:59:59 UTC
- [ ] Test with dates that cross timezone boundaries
- [ ] Use `toISOString()` for API responses
- [ ] Parse ISO strings for API requests
- [ ] Only convert to local timezone for display
- [ ] Add timezone tests to test suite

---

## Known Issues Fixed

### Dashboard Date Filtering (Oct 2025)
**Problem**: Dashboard was using local timezone methods, causing appointments to show on wrong day  
**Solution**: Changed to UTC methods in `useDashboardData.ts`  
**Commit**: `aa79bb8a6`

---

## Resources

- [MDN: Date.UTC()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC)
- [ISO 8601 Format](https://en.wikipedia.org/wiki/ISO_8601)
- [PostgreSQL Timezone Handling](https://www.postgresql.org/docs/current/datatype-datetime.html)

---

## Questions?

If you encounter timezone-related issues:
1. Check if you're using UTC methods
2. Verify dates are stored in UTC
3. Add a test case to `timezone.test.ts`
4. Update this document with the solution
