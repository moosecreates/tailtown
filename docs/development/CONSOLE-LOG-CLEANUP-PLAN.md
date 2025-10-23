# Console.log Cleanup Plan

## Status: In Progress

### Completed
- ✅ Created frontend logger utility (`frontend/src/utils/logger.ts`)
- ✅ Deleted unused legacy files with excessive logging:
  - `KennelCalendarLegacy.tsx` (72 console.logs)
  - `ImageTest.tsx`
  - `SuiteAvailabilityTester.tsx`
  - `ErrorHandlingDemo.tsx`

### High Priority Files (50+ console.logs)

#### 1. Dashboard.tsx - 53 console.logs
**Location**: `frontend/src/pages/Dashboard.tsx`
**Status**: Pending
**Action Plan**:
- Add logger import
- Keep only error/warn logs
- Remove debug logs for:
  - Component loading
  - Filter changes
  - Render cycles
  - API responses (unless error)

#### 2. ReservationForm.tsx - 52 console.logs  
**Location**: `frontend/src/components/reservations/ReservationForm.tsx`
**Status**: Pending
**Action Plan**:
- Add logger import
- Keep validation errors
- Remove debug logs for:
  - Form state changes
  - Field updates
  - Submission flow (unless error)

### Medium Priority Files (10-49 console.logs)

#### 3. Calendar.tsx - 20 console.logs
**Location**: `frontend/src/components/calendar/Calendar.tsx`
**Status**: Pending

#### 4. OrderEntry.tsx - 19 console.logs
**Location**: `frontend/src/pages/orders/OrderEntry.tsx`
**Status**: Pending

#### 5. PrintKennelCards.tsx - 19 console.logs
**Location**: `frontend/src/pages/kennels/PrintKennelCards.tsx`
**Status**: Pending

#### 6. SpecializedCalendar.tsx - 16 console.logs
**Location**: `frontend/src/components/calendar/SpecializedCalendar.tsx`
**Status**: Pending

#### 7. petService.ts - 15 console.logs
**Location**: `frontend/src/services/petService.ts`
**Status**: Pending

#### 8. resourceService.ts - 14 console.logs
**Location**: `frontend/src/services/resourceService.ts`
**Status**: Pending

#### 9. resourceManagement.ts - 12 console.logs
**Location**: `frontend/src/services/resourceManagement.ts`
**Status**: Pending

#### 10. SuiteBoard.tsx - 11 console.logs
**Location**: `frontend/src/components/suites/SuiteBoard.tsx`
**Status**: Pending

### Low Priority Files (1-9 console.logs)

See full list in grep results. These can be addressed gradually.

## Logger Usage Guide

### Import
```typescript
import { logger } from '../utils/logger';
```

### Replace Patterns

#### Debug Info (Remove in production)
```typescript
// ❌ Before
console.log('Component loaded');
console.log('Filter changed:', filter);
console.log('Data:', data);

// ✅ After - Remove entirely or use debug level
logger.debug('Component loaded');
logger.debug('Filter changed', { filter });
```

#### Errors (Keep, use logger)
```typescript
// ❌ Before
console.error('API call failed:', error);

// ✅ After
logger.error('API call failed', { error, endpoint: '/api/users' });
```

#### Warnings (Keep, use logger)
```typescript
// ❌ Before
console.warn('Invalid data format');

// ✅ After
logger.warn('Invalid data format', { data });
```

#### Success Messages (Use sparingly)
```typescript
// ❌ Before
console.log('✅ Data saved successfully');

// ✅ After
logger.success('Data saved successfully', { id });
```

## Gradual Cleanup Strategy

1. **Phase 1** (Week 1): Add logger to all files, no removals
2. **Phase 2** (Week 2): Remove obvious debug logs (component loading, render cycles)
3. **Phase 3** (Week 3): Convert console.error/warn to logger.error/warn
4. **Phase 4** (Week 4): Final review and cleanup

## Benefits

- **Performance**: Fewer console operations in production
- **Debugging**: Structured logging with context
- **Maintainability**: Consistent logging patterns
- **Production Ready**: Log levels control what appears in production

## Current Stats

- **Total console.logs**: 438 across 40 files
- **Removed (legacy files)**: ~160 console.logs
- **Remaining**: ~278 console.logs to review
- **Target**: <50 console.logs (critical only)

## Notes

- Keep console.error for critical errors
- Keep console.warn for important warnings
- Remove all debug console.logs
- Use logger.debug() for development-only logs
- Production log level set to WARN (errors and warnings only)
