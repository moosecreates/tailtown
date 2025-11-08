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

## Training Calendar Timezone Fix

### The Problem

Training class sessions were displaying on the wrong day in the calendar because:

1. **Backend**: Sessions stored with dates like `2024-11-04T00:00:00.000Z` (UTC midnight)
2. **Frontend**: JavaScript parsed these as UTC and converted to local time
3. **Result**: In PST (UTC-8), Nov 4 midnight UTC became Nov 3 at 4:00 PM locally
4. **Impact**: Sessions appeared on the wrong day, risking double-booking

### The Solution

**Frontend Date Parsing** (`SpecializedCalendar.tsx`):

```typescript
// Extract date and time components
const dateStr = session.scheduledDate.split('T')[0]; // '2024-11-04'
const [year, month, day] = dateStr.split('-').map(Number);
const [hours, minutes] = session.scheduledTime.split(':').map(Number);

// Create Date in LOCAL timezone (not UTC)
const sessionDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
```

**Why This Works:**
- Extracts just the date part (`YYYY-MM-DD`) from the ISO string
- Manually parses into components
- Creates Date object using local timezone constructor
- Nov 4 stays Nov 4 regardless of timezone

### Test Coverage

**Backend Tests** (`dateHandling.timezone.test.ts`):
- 20 passing tests
- Date storage and retrieval
- Month/year boundaries
- Leap years
- DST transitions
- Session generation logic

**Frontend Tests** (`SpecializedCalendar.timezone.test.tsx`):
- 10 passing tests
- UTC to local date parsing
- Multi-week schedules
- Time handling
- DST edge cases
- Multiple classes

### Verified Scenarios

✅ Sessions display on correct dates (Nov 4, 11, 18, 25)  
✅ Works across month boundaries (Oct 28 → Nov 4)  
✅ Works across year boundaries (Dec 30 → Jan 6)  
✅ Handles leap years (Feb 29)  
✅ Maintains consistency during DST transitions  
✅ Multiple classes on same day at different times  
✅ Sessions spanning midnight  

## Gingr Import Timezone Handling

### The Problem

When importing reservations from Gingr, dates were displaying with incorrect times:

1. **Gingr Format**: Sends dates like `"2025-10-13T12:30:00"` representing Mountain Time (MST/MDT)
2. **No Timezone Info**: ISO string has no timezone indicator (no `Z` or offset)
3. **JavaScript Parsing**: `new Date("2025-10-13T12:30:00")` treats as local time, then stores as UTC
4. **Result**: 12:30 PM MST check-in displayed as 12:30 AM MST (7-hour offset error)

### Real Example

**Gingr Data:**
```json
{
  "start_date": "2025-10-13T12:30:00",  // Meant as 12:30 PM MST
  "end_date": "2025-11-12T12:00:00"     // Meant as 12:00 PM MST
}
```

**Old Code (WRONG):**
```typescript
startDate: new Date(reservation.start_date)
// Stored as: 2025-10-13T12:30:00Z (5:30 AM MST - WRONG!)
```

**New Code (CORRECT):**
```typescript
const parseGingrDate = (dateStr: string): Date => {
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 7); // Add MST offset (UTC-7)
  return date;
};

startDate: parseGingrDate(reservation.start_date)
// Stored as: 2025-10-13T19:30:00Z (12:30 PM MST - CORRECT!)
```

### The Solution

**Location:** `services/customer/src/services/gingr-sync.service.ts`

```typescript
// Parse Gingr dates correctly - they come as ISO strings but represent local time
// We need to treat them as Mountain Time (UTC-7) and convert to UTC for storage
const parseGingrDate = (dateStr: string): Date => {
  // Gingr sends dates like "2025-10-13T12:30:00" which represents Mountain Time
  // We need to add the timezone offset to convert to UTC
  const date = new Date(dateStr);
  // Add 7 hours (Mountain Time offset) to get correct UTC time
  date.setHours(date.getHours() + 7);
  return date;
};

const reservationData: any = {
  customerId: customer.id,
  petId: pet.id,
  startDate: parseGingrDate(reservation.start_date),
  endDate: parseGingrDate(reservation.end_date),
  // ... other fields
};
```

### Migration Script

**File:** `scripts/fix-reservation-times.js`

Fixed 6,535 existing reservations by adding 7 hours to all Gingr imports:

```javascript
// Add 7 hours to both start and end dates
const newStartDate = new Date(reservation.startDate);
newStartDate.setHours(newStartDate.getHours() + 7);

const newEndDate = new Date(reservation.endDate);
newEndDate.setHours(newEndDate.getHours() + 7);
```

**Results:**
- Old: `2025-10-25T09:00:00.000Z` (2:00 AM MST - WRONG)
- New: `2025-10-25T16:00:00.000Z` (9:00 AM MST - CORRECT)

### Test Coverage

**File:** `services/customer/src/__tests__/integration/gingr-timezone-handling.test.ts`

**15 comprehensive tests covering:**

1. **Date Conversion Tests (4 tests)**
   - Noon MST → UTC conversion
   - Morning check-in (9 AM MST)
   - Evening check-out (5 PM MST)
   - Late night check-in (11:30 PM MST)

2. **Timezone Offset Calculation (3 tests)**
   - 7-hour MST offset validation
   - UTC → MST conversion
   - MST → UTC conversion

3. **Edge Cases (3 tests)**
   - Midnight MST handling
   - Date boundary crossing (11 PM MST → next day UTC)
   - Preserving minutes and seconds

4. **Real-World Scenarios (2 tests)**
   - Validates migration script fixes
   - Prevents 12:30 AM bug from recurring

5. **Integration Tests (3 tests)**
   - Kennel cards date filtering
   - Reservation queries
   - Display formatting

### Timezone Offset Reference

**Mountain Time (MST/MDT):**
- Standard Time (MST): UTC-7
- Daylight Time (MDT): UTC-6
- **Current Implementation**: Uses UTC-7 (MST) consistently

**Note:** The current implementation uses a fixed 7-hour offset. For production, consider using a proper timezone library (e.g., `date-fns-tz` or `luxon`) to handle Daylight Saving Time transitions automatically.

### Kennel Cards Integration

The kennel cards page dynamically fetches the tenant's timezone setting:

```typescript
// Frontend: PrintKennelCards.tsx
// Fetch tenant timezone from tenant settings
const timezone = await tenantService.getCurrentTenantTimezone();
setTenantTimezone(timezone);

// Backend: get-reservation.controller.ts
const timezoneOffsets: { [key: string]: number } = {
  'America/New_York': -5,    // EST
  'America/Chicago': -6,     // CST
  'America/Denver': -7,      // MST
  'America/Los_Angeles': -8, // PST
  // ... more timezones
};

const offsetHours = timezoneOffsets[timezone] || -5;
```

**How It Works:**
1. Frontend fetches tenant timezone from API on page load
2. Timezone is cached in localStorage for performance
3. Backend uses timezone to convert check-in date to UTC range
4. Reservations are filtered correctly for tenant's local time

**Managing Tenant Timezone:**
```bash
# Check current timezone
node scripts/test-tenant-timezone.js

# Update timezone
node scripts/update-tenant-timezone.js tailtown America/Denver
```

This ensures:
- Dogs checking in at 11:30 PM on Nov 5 appear on Nov 5 cards (not Nov 6)
- Kennel cards show correct local times
- Date filtering works correctly for the business's timezone
- Each tenant can have their own timezone setting

### Best Practices for Gingr Imports

**✅ DO:**
1. Always use `parseGingrDate()` for Gingr date/time fields
2. Store all dates in UTC in the database
3. Add timezone offset when importing
4. Test with various times (morning, noon, evening, late night)
5. Verify dates display correctly in local timezone

**❌ DON'T:**
1. Use `new Date(gingrDateString)` directly
2. Assume Gingr sends UTC times
3. Mix timezone conversions
4. Forget to handle date boundary crossings (11 PM → next day UTC)

### Verification Checklist

After importing Gingr data:

- [ ] Check-in times display correctly (not shifted by 7 hours)
- [ ] Kennel cards show dogs on correct dates
- [ ] Reservation times match Gingr system
- [ ] No midnight/early morning check-ins (unless actually scheduled)
- [ ] Date boundaries handled correctly (late night check-ins)

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

**Last Updated:** November 7, 2025
**Version:** 1.3.0
**Status:** Production Ready
**Test Coverage:** 75 passing tests (28 date utils + 21 backend + 11 frontend + 15 Gingr timezone)
**Special Notes:** 
- Sunday (day 0) scheduling fully validated
- Gingr import timezone handling (Mountain Time) fully tested
- 6,535 reservations migrated successfully
- Dynamic tenant timezone support implemented
- Timezone management scripts available
