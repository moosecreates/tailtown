# Staff Scheduling Implementation

## Overview

This document provides technical details about the implementation of the staff scheduling feature in the Tailtown application. It covers the architecture, data model, API endpoints, and important implementation notes.

## Architecture

The staff scheduling feature consists of the following components:

1. **Backend**:
   - Separate route file for schedule endpoints (`schedule.routes.ts`)
   - Controller methods in `staff.controller.ts`
   - Prisma model for `StaffSchedule`

2. **Frontend**:
   - Staff service methods for interacting with the API
   - React components for displaying and managing schedules
   - Calendar view for visualizing schedules

## Data Model

The `StaffSchedule` model in Prisma has the following structure:

```prisma
model StaffSchedule {
  id          String         @id @default(uuid())
  staffId     String
  date        DateTime
  startTime   String
  endTime     String
  status      ScheduleStatus @default(SCHEDULED)
  notes       String?
  location    String?
  role        String?
  createdById String?
  updatedById String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  staff       Staff          @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId, date], map: "staff_schedules_staff_date_idx")
  @@index([date, status])
  @@map("staff_schedules")
}
```

## API Endpoints

### Schedule Routes

Schedule-related endpoints are registered under the `/api/schedules` prefix to avoid middleware conflicts with staff routes.

- `GET /api/schedules` - Get all staff schedules
- `GET /api/schedules/staff/:staffId` - Get schedules for a specific staff member
- `POST /api/schedules/staff/:staffId` - Create a new schedule for a staff member
- `PUT /api/schedules/:scheduleId` - Update an existing schedule
- `DELETE /api/schedules/:scheduleId` - Delete a schedule
- `POST /api/schedules/bulk` - Create multiple schedules at once

### Frontend Service Methods

The frontend uses the following methods in `staffService.ts` to interact with the API:

- `getAllSchedules(startDate?, endDate?)` - Get all staff schedules
- `getStaffSchedules(staffId, startDate?, endDate?)` - Get schedules for a specific staff member
- `createStaffSchedule(staffId, scheduleData)` - Create a new schedule
- `updateStaffSchedule(scheduleId, scheduleData)` - Update an existing schedule
- `deleteStaffSchedule(scheduleId)` - Delete a schedule
- `bulkCreateSchedules(scheduleData[])` - Create multiple schedules at once

## Implementation Notes

### Date Handling

The `date` field in the `StaffSchedule` model is a `DateTime` type in Prisma. When querying schedules with date ranges, we need to convert the string dates to DateTime objects:

```typescript
// Convert string dates to DateTime objects
const startDateTime = new Date(startDate as string);
const endDateTime = new Date(endDate as string);

// Set the time to the beginning and end of the day to include all schedules
startDateTime.setHours(0, 0, 0, 0);
endDateTime.setHours(23, 59, 59, 999);

whereClause.date = {
  gte: startDateTime,
  lte: endDateTime
};
```

### Separate Route File

To avoid middleware conflicts with staff routes, we created a separate route file for schedule-related endpoints:

```typescript
// schedule.routes.ts
import { Router } from 'express';
import { 
  getAllSchedules,
  getStaffSchedules,
  createStaffSchedule,
  updateStaffSchedule,
  deleteStaffSchedule,
  bulkCreateSchedules
} from '../controllers/staff.controller';

const router = Router();

// Schedule Routes
router.get('/', getAllSchedules);
router.get('/staff/:staffId', getStaffSchedules);
router.post('/staff/:staffId', createStaffSchedule);
router.put('/:scheduleId', updateStaffSchedule);
router.delete('/:scheduleId', deleteStaffSchedule);
router.post('/bulk', bulkCreateSchedules);

export { router as scheduleRoutes };
```

### Route Registration

The schedule routes are registered in the main server file:

```typescript
// index.ts
app.use('/api/schedules', scheduleRoutes);
app.use('/schedules', scheduleRoutes); // Also registered without /api prefix for flexibility
```

## Frontend Components

### StaffScheduleCalendar

The `StaffScheduleCalendar` component displays staff schedules in a calendar view. It fetches schedules using the `staffService` methods and renders them in a calendar format.

### StaffScheduleForm

The `StaffScheduleForm` component provides a form for creating and editing staff schedules. It includes fields for date, start time, end time, status, and other schedule details.

## Troubleshooting

If you encounter issues with the staff scheduling feature, check the following:

1. **404 Errors**: Ensure that the frontend is using the correct API endpoints (`/api/schedules/*`).
2. **500 Errors**: Check the date handling in the controller methods. Make sure that dates are properly converted to DateTime objects for Prisma queries.
3. **Empty Schedules**: Verify that the date range is correctly specified in the API calls.

## Future Improvements

1. **Real-time Updates**: Implement WebSocket connections for real-time schedule updates.
2. **Conflict Detection**: Add validation to prevent scheduling conflicts.
3. **Recurring Schedules**: Add support for creating recurring schedules.
4. **Mobile Optimization**: Improve the calendar view for mobile devices.
