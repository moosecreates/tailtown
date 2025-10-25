# Timezone-Safe Date Handling

## Overview

This document explains how Tailtown handles dates in a timezone-safe manner to ensure consistent day-of-week calculations, weekend detection, and scheduling across all timezones.

## The Problem

### JavaScript Date Parsing Issue

When you parse a date string like `'2025-11-01'` using `new Date()`:

```javascript
const date = new Date('2025-11-01');
// Interprets as: 2025-11-01T00:00:00.000Z (UTC midnight)
```

Then when you call `getDay()`:

```javascript
date.getDay(); // Returns day in LOCAL timezone
```

**The Issue:**
- If you're in PST (UTC-8), midnight UTC is 4pm the previous day locally
- So `'2025-11-01'` (Saturday) becomes Friday in PST
- This breaks weekend detection, day-of-week pricing, and scheduling

### Real Example

```javascript
// WRONG WAY (timezone-dependent)
const date = new Date('2025-11-01'); // UTC midnight
console.log(date.getDay()); 
// PST: Returns 5 (Friday) ❌
// EST: Returns 6 (Saturday) ✅
// UTC: Returns 6 (Saturday) ✅

// RIGHT WAY (timezone-safe)
const date = parseLocalDate('2025-11-01'); // Local midnight
console.log(date.getDay());
// PST: Returns 6 (Saturday) ✅
// EST: Returns 6 (Saturday) ✅
// UTC: Returns 6 (Saturday) ✅
```

## The Solution

### parseLocalDate Function

```typescript
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day);
};
```

**How it works:**
1. Splits the date string into components
2. Creates a Date object using the constructor with explicit values
3. This creates the date in the **local timezone**, not UTC
4. Ensures consistent day-of-week across all timezones

## Timezone-Safe Utilities

### Core Functions

All located in `/frontend/src/utils/dateUtils.ts`:

#### 1. parseLocalDate
```typescript
parseLocalDate('2025-11-01') // Always November 1st locally
```

#### 2. getDayOfWeek
```typescript
getDayOfWeek('2025-11-01') // Returns 6 (Saturday) everywhere
```

#### 3. getDayOfWeekName
```typescript
getDayOfWeekName('2025-11-01') // Returns 'SATURDAY' everywhere
```

#### 4. isWeekend
```typescript
isWeekend('2025-11-01') // Returns true everywhere
isWeekend('2025-11-03') // Returns false everywhere
```

#### 5. getMonth
```typescript
getMonth('2025-11-01') // Returns 11 everywhere
```

#### 6. getYear
```typescript
getYear('2025-11-01') // Returns 2025 everywhere
```

#### 7. compareDates
```typescript
compareDates('2025-11-01', '2025-11-02') // Returns -1 everywhere
```

#### 8. addDays
```typescript
addDays('2025-11-01', 7) // Returns '2025-11-08' everywhere
```

#### 9. daysBetween
```typescript
daysBetween('2025-11-01', '2025-11-08') // Returns 7 everywhere
```

## Usage in Services

### Dynamic Pricing Service

```typescript
import { getDayOfWeekName, isWeekend } from '../utils/dateUtils';

export const dynamicPricingService = {
  getDayOfWeek: (date: Date | string): DayOfWeek => {
    return getDayOfWeekName(date) as DayOfWeek;
  },
  
  isWeekend: (date: Date | string): boolean => {
    return isWeekendUtil(date);
  }
};
```

### Availability Service

```typescript
import { parseLocalDate, daysBetween } from '../utils/dateUtils';

// Calculate nights
const nights = daysBetween(checkInDate, checkOutDate);

// Check if date is in past
const checkDate = parseLocalDate(dateString);
const today = new Date();
today.setHours(0, 0, 0, 0);
return checkDate < today;
```

## Best Practices

### ✅ DO

1. **Always use string dates** (`'YYYY-MM-DD'`) for date-only values
2. **Use parseLocalDate** when you need a Date object from a string
3. **Use our utilities** for day-of-week, weekend checks, etc.
4. **Store dates as strings** in state and props
5. **Test across timezones** (PST, EST, UTC)

```typescript
// ✅ GOOD
const date = '2025-11-01';
const dayName = getDayOfWeekName(date);
const isWeekendDay = isWeekend(date);
```

### ❌ DON'T

1. **Don't use `new Date('YYYY-MM-DD')`** for date-only values
2. **Don't use `getDay()` directly** on UTC dates
3. **Don't assume timezone** in date calculations
4. **Don't mix Date objects and strings** without conversion

```typescript
// ❌ BAD
const date = new Date('2025-11-01'); // UTC midnight!
const day = date.getDay(); // Timezone-dependent!
```

## Testing

### Test Coverage

All timezone-safe utilities are thoroughly tested:

```bash
npm test -- dateUtils.test
# 28 passing tests
```

### Example Tests

```typescript
describe('getDayOfWeekName', () => {
  it('should return correct day names', () => {
    expect(getDayOfWeekName('2025-11-01')).toBe('SATURDAY');
    expect(getDayOfWeekName('2025-11-02')).toBe('SUNDAY');
    expect(getDayOfWeekName('2025-11-03')).toBe('MONDAY');
  });
});

describe('isWeekend', () => {
  it('should return true for Saturday and Sunday', () => {
    expect(isWeekend('2025-11-01')).toBe(true); // Saturday
    expect(isWeekend('2025-11-02')).toBe(true); // Sunday
  });
  
  it('should return false for weekdays', () => {
    expect(isWeekend('2025-11-03')).toBe(false); // Monday
  });
});
```

## Critical Use Cases

### 1. Weekend Pricing

```typescript
// Check if booking date is weekend
const checkInDate = '2025-11-01';
if (isWeekend(checkInDate)) {
  // Apply weekend surcharge
  price += weekendSurcharge;
}
```

### 2. Day-of-Week Rules

```typescript
// Apply day-specific pricing
const dayName = getDayOfWeekName(checkInDate);
const rule = pricingRules.find(r => r.daysOfWeek.includes(dayName));
```

### 3. Holiday Detection

```typescript
// Check if date matches holiday
const holidays = [
  { name: 'Christmas', date: '2025-12-25' }
];

const isHoliday = holidays.some(h => h.date === checkInDate);
```

### 4. Availability Checking

```typescript
// Calculate nights for reservation
const nights = daysBetween(checkInDate, checkOutDate);

// Check if dates are available
const availableDates = calendar.dates.filter(d => 
  !isWeekend(d.date) || hasWeekendCapacity
);
```

## Migration Guide

### Updating Existing Code

**Before:**
```typescript
const date = new Date(dateString);
const day = date.getDay();
const isWeekendDay = day === 0 || day === 6;
```

**After:**
```typescript
import { getDayOfWeek, isWeekend } from '../utils/dateUtils';

const day = getDayOfWeek(dateString);
const isWeekendDay = isWeekend(dateString);
```

## Common Pitfalls

### Pitfall 1: Using Date Constructor with String

```typescript
// ❌ WRONG
const date = new Date('2025-11-01');
// Creates UTC midnight, timezone-dependent

// ✅ RIGHT
const date = parseLocalDate('2025-11-01');
// Creates local midnight, timezone-safe
```

### Pitfall 2: Mixing Timezones

```typescript
// ❌ WRONG
const utcDate = new Date('2025-11-01T00:00:00Z');
const localDay = utcDate.getDay();
// Day depends on timezone

// ✅ RIGHT
const day = getDayOfWeek('2025-11-01');
// Day is consistent everywhere
```

### Pitfall 3: Date Arithmetic

```typescript
// ❌ WRONG
const tomorrow = new Date(dateString);
tomorrow.setDate(tomorrow.getDate() + 1);
// May cross DST boundaries incorrectly

// ✅ RIGHT
const tomorrow = addDays(dateString, 1);
// Handles DST correctly
```

## Performance Considerations

### Caching

For frequently accessed dates:

```typescript
const dayCache = new Map<string, number>();

function getCachedDayOfWeek(dateString: string): number {
  if (!dayCache.has(dateString)) {
    dayCache.set(dateString, getDayOfWeek(dateString));
  }
  return dayCache.get(dateString)!;
}
```

### Batch Operations

For processing many dates:

```typescript
// Process dates in batch
const weekendDates = dates.filter(isWeekend);
const weekdayDates = dates.filter(d => !isWeekend(d));
```

## Future Enhancements

### Potential Improvements

1. **Timezone Display**
   - Show user's timezone
   - Allow timezone selection
   - Display times in user's timezone

2. **International Support**
   - Locale-aware date formatting
   - Different week start days
   - Regional holiday calendars

3. **DST Handling**
   - Explicit DST transition handling
   - Time-based scheduling
   - Duration calculations

## References

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
**Status:** Production Ready
**Test Coverage:** 28 passing tests
