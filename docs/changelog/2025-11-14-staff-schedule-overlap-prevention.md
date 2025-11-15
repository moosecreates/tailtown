# Staff Schedule Overlap Prevention

**Date**: November 14, 2025  
**Type**: Feature Enhancement  
**Priority**: Medium  
**Status**: Complete

## Overview

Added server-side validation to prevent employees from being scheduled for overlapping shifts on the same day. This ensures staff members cannot be double-booked and improves schedule reliability.

## Changes Made

### Backend Changes

**File**: `services/customer/src/controllers/staff.controller.ts`

1. **New Helper Function**: `hasScheduleConflict()`
   - Detects overlapping schedules for a staff member on a given day
   - Parameters:
     - `tenantId`: Optional tenant ID for multi-tenant filtering
     - `staffId`: Staff member ID
     - `date`: Schedule date
     - `startTime`: Shift start time (string format)
     - `endTime`: Shift end time (string format)
     - `excludeScheduleId`: Optional schedule ID to exclude (for updates)
   - Returns: `boolean` - true if conflict exists
   - Logic: Checks if `existing.endTime > new.startTime AND existing.startTime < new.endTime`

2. **Updated `createStaffSchedule`**
   - Added overlap validation before creating new schedules
   - Returns 400 error with message: "This staff member already has a shift during this time"
   - Only creates schedule if no conflict detected

3. **Updated `updateStaffSchedule`**
   - Added overlap validation before updating schedules
   - Excludes the current schedule from conflict check
   - Returns 400 error if new times would overlap with other shifts

4. **Updated `bulkCreateSchedules`**
   - Added overlap validation for each schedule in bulk operations
   - Aborts entire transaction if any conflict detected
   - Returns detailed error message with conflicting time range

## Technical Details

### Overlap Detection Algorithm

```typescript
// Time overlap condition:
// existing.endTime > new.startTime AND existing.startTime < new.endTime

const where = {
  staffId,
  date: { gte: startOfDay, lte: endOfDay },
  endTime: { gt: startTime },
  startTime: { lt: endTime }
};
```

### Date Normalization

- Normalizes dates to calendar day (00:00:00.000 to 23:59:59.999)
- Ensures accurate same-day conflict detection
- Handles timezone-aware date comparisons

### Multi-Tenant Support

- Respects tenant isolation when `tenantId` is provided
- Prevents cross-tenant schedule conflicts

## API Behavior

### Success Cases

- Creating/updating schedules with no time conflicts: **200/201** with schedule data
- Bulk creating non-overlapping schedules: **201** with all created schedules

### Error Cases

- **400 Bad Request**: "This staff member already has a shift during this time"
  - Returned when attempting to create/update overlapping schedule
  - In bulk operations: "Staff member already has a shift during HH:MM–HH:MM on this date"

## Testing Recommendations

### Manual Testing Scenarios

1. **Create overlapping shift**: Should fail with 400 error
2. **Create non-overlapping shift**: Should succeed
3. **Update shift to overlap**: Should fail with 400 error
4. **Update shift to non-overlapping time**: Should succeed
5. **Bulk create with one conflict**: Should fail entire batch
6. **Bulk create with no conflicts**: Should succeed

### Automated Test Cases (Recommended)

```typescript
// Test cases to add:
- createStaffSchedule: conflict detection
- createStaffSchedule: non-overlapping success
- updateStaffSchedule: conflict detection with exclusion
- updateStaffSchedule: non-overlapping success
- bulkCreateSchedules: abort on conflict
- bulkCreateSchedules: success with no conflicts
```

## Affected Endpoints

- `POST /api/staff/:staffId/schedules` - Create single schedule
- `POST /api/schedules/staff/:staffId` - Create single schedule (alternate route)
- `PUT /api/staff/schedules/:scheduleId` - Update schedule
- `PUT /api/schedules/:scheduleId` - Update schedule (alternate route)
- `POST /api/staff/schedules/bulk` - Bulk create schedules
- `POST /api/schedules/bulk` - Bulk create schedules (alternate route)

## Frontend Impact

### Expected UI Behavior

- Display error message when schedule conflict occurs
- Suggest alternative time slots
- Highlight conflicting schedules in calendar view
- Prevent drag-and-drop to conflicting times

### Error Handling

```typescript
// Frontend should catch 400 errors and display user-friendly message:
try {
  await createSchedule(scheduleData);
} catch (error) {
  if (error.status === 400) {
    showError('This employee already has a shift during this time. Please choose a different time.');
  }
}
```

## Benefits

- **Data Integrity**: Prevents double-booking of staff members
- **Operational Reliability**: Ensures accurate staffing schedules
- **User Experience**: Clear error messages guide users to fix conflicts
- **Multi-Tenant Safe**: Respects tenant boundaries in conflict detection

## Future Enhancements

- Add shift trading workflow with approval (roadmap item)
- Visual conflict indicators in scheduling UI
- Suggested alternative time slots
- Batch conflict resolution tools
- Schedule optimization algorithms

## Related Files

- `services/customer/src/controllers/staff.controller.ts` - Main implementation
- `services/customer/src/routes/staff.routes.ts` - Route definitions
- `services/customer/src/routes/schedule.routes.ts` - Alternate route definitions
- `services/customer/prisma/schema.prisma` - StaffSchedule model

## Rollback Plan

If issues arise, revert the following changes in `staff.controller.ts`:
1. Remove `hasScheduleConflict` helper function
2. Remove conflict checks from `createStaffSchedule`
3. Remove conflict checks from `updateStaffSchedule`
4. Remove conflict checks from `bulkCreateSchedules`

## Notes

- Overlap detection is time-based only (does not consider location or role)
- Conflicts are checked at API level, not database constraint level
- Transaction rollback in bulk operations ensures atomic behavior
- Compatible with existing staff availability and time-off systems
