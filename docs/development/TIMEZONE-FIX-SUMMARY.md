# Timezone Bug Fix and Testing Summary

## Critical Bug Fixed

### The Problem
Dashboard metrics (IN, OUT, OVERNIGHT counts) were not matching the calendar occupancy due to incorrect timezone handling.

**Example Bug:**
- Reservation ends: `2025-10-01T00:48:57.953Z` (UTC)
- Local time (Mountain): `2025-09-30 18:48:57` (6:48pm)
- **Wrong**: Counted as Oct 1 checkout (using UTC date string)
- **Correct**: Should be Sept 30 checkout (using local date)

### Root Cause
The code was using string splitting on ISO timestamps to extract dates:
```typescript
// WRONG - Uses UTC date
const dateStr = reservation.endDate.split('T')[0]; // "2025-10-01"
```

This ignores timezone offsets, causing reservations ending in the evening to be counted as the next day.

## The Fix

### Correct Date Extraction
```typescript
// CORRECT - Uses local timezone
const endDate = new Date(reservation.endDate);
const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
// "2025-09-30"
```

### Files Updated
1. **Frontend Dashboard** (`frontend/src/pages/Dashboard.tsx`)
   - Updated `loadData()` function to use Date objects
   - Updated `filterAppointments()` function to use Date objects
   - Both metrics calculation and filtering now use local timezone

2. **Backend API** (`services/reservation-service/src/controllers/reservation/get-reservation.controller.ts`)
   - Updated date filter to return all reservations active on a given date
   - Changed from "start date on this day" to "overlaps with this day"

## Test Coverage

### New Test Files
1. **`timezone-handling.test.ts`** - 9 tests
   - Date string extraction validation
   - Check-in/check-out identification
   - Midnight crossing edge cases
   - Daylight saving time transitions
   - Cross-timezone consistency
   - Date formatting standards

2. **`dashboard-calendar-sync.test.ts`** - Updated with timezone logic
   - Dashboard metrics accuracy
   - Calendar occupancy matching
   - Edge case handling
   - Validation rules enforcement

### Running Tests
```bash
cd frontend

# Run all tests
npm test

# Run timezone tests only
npm test timezone-handling

# Run sync tests only
npm test dashboard-calendar-sync
```

## Validation Rules

### Critical Rules Enforced by Tests
1. ✅ Date extraction MUST use `Date` objects, NOT string splitting
2. ✅ Dashboard and calendar MUST use identical date extraction logic
3. ✅ All date comparisons MUST use local timezone
4. ✅ IN count = reservations starting today (local date)
5. ✅ OUT count = reservations ending today (local date)
6. ✅ OVERNIGHT count = active reservations ending after today
7. ✅ Every calendar reservation MUST be counted in at least one metric

## Impact

### Before Fix
- Dashboard OUT count: 5
- Calendar shows: 6 pets checking out
- **Discrepancy**: 1 pet missing (moose, ending 6:48pm local = midnight UTC)

### After Fix
- Dashboard OUT count: 6 ✅
- Calendar shows: 6 pets checking out ✅
- **Perfect sync**: All metrics match calendar

## Best Practices Going Forward

### DO ✅
```typescript
// Extract local date from ISO timestamp
const date = new Date(isoTimestamp);
const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
```

### DON'T ❌
```typescript
// Never split ISO timestamp to get date
const dateStr = isoTimestamp.split('T')[0]; // This is UTC, not local!
```

### Date Comparison
```typescript
// DO: Compare local date strings
const startDateStr = extractLocalDate(reservation.startDate);
const todayStr = extractLocalDate(new Date());
if (startDateStr === todayStr) { /* checking in today */ }

// DON'T: Compare UTC date strings
if (reservation.startDate.split('T')[0] === today.toISOString().split('T')[0]) { /* WRONG */ }
```

## Related Issues Prevented

This fix prevents several classes of timezone bugs:

1. **Midnight Crossings**: Reservations ending just after midnight UTC but before midnight local
2. **DST Transitions**: Date calculations during daylight saving time changes
3. **Multi-timezone Support**: Consistent behavior regardless of server/client timezone
4. **Calendar Sync**: Dashboard and calendar always show the same data

## Commits

- `fcdd375f4` - Fix backend date filter to return all active reservations
- `2e545cd7f` - Fix timezone issue in dashboard date comparisons
- `1b6af521a` - Add comprehensive timezone and dashboard-calendar sync tests
- `3f12d0d0f` - Update test README with timezone handling documentation

## Testing Checklist

When making changes to date/time handling:

- [ ] Use `Date` objects for all date extraction
- [ ] Never use `.split('T')[0]` on ISO timestamps
- [ ] Test with reservations ending in the evening (e.g., 6pm-11pm)
- [ ] Verify dashboard counts match calendar occupancy
- [ ] Run `npm test timezone-handling` to validate
- [ ] Run `npm test dashboard-calendar-sync` to validate
- [ ] Test in different timezones if possible

## Future Considerations

1. **Backend Timezone Storage**: Consider storing timezone info with reservations
2. **User Timezone Selection**: Allow users to view data in different timezones
3. **Timezone Display**: Show timezone abbreviation (MT, PT, etc.) in UI
4. **API Documentation**: Document that all timestamps are UTC but should be converted to local

## References

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)
- [Timezone Best Practices](https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone)
