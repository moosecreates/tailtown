# Staff Scheduling

## Overview
The Staff Scheduling feature allows administrators to manage staff availability, time off requests, and employee work schedules. This functionality is essential for efficient resource allocation and scheduling of staff members across the organization.

## Features

### Staff Availability Management
- Set regular weekly availability for each staff member
- Specify available days and hours
- Mark specific time slots as available or unavailable
- Set effective date ranges for seasonal or temporary availability changes

### Time Off Management
- Request time off for staff members
- Support for various time off types (vacation, sick, personal, etc.)
- Track approval status of time off requests
- Record approver information for approved requests

### Employee Scheduling
- Create and manage employee work schedules
- View schedules by individual staff member or across the entire organization
- Track schedule status (scheduled, confirmed, in progress, completed, etc.)
- Create bulk schedules for multiple staff members at once
- Assign specific roles and locations for each scheduled shift

## User Interface

### Accessing Staff Availability & Time Off
1. Navigate to the **Settings** page
2. Select the **Users** tab
3. Edit a staff member
4. Switch to the **Scheduling** tab

### Accessing Employee Scheduling
1. Navigate to the **/staff/scheduling** page
2. The scheduling page offers three main views:
   - **All Staff Schedules**: View and manage schedules for all staff members in a calendar view
   - **Individual Staff Schedule**: Select a specific staff member to view and manage their schedule
   - **Bulk Schedule Creation**: Create multiple schedule entries at once for selected staff members

### Availability Tab
The Availability tab allows you to:
- View a staff member's current availability schedule
- Add new availability slots
- Edit existing availability
- Delete availability slots that are no longer needed

Each availability record includes:
- Day of the week
- Start time
- End time
- Available/Unavailable status
- Optional effective date range

### Time Off Tab
The Time Off tab allows you to:
- View a staff member's time off history and upcoming requests
- Request new time off
- Edit existing time off requests
- Delete time off requests

Each time off record includes:
- Start date
- End date
- Type of time off
- Status (pending, approved, denied, cancelled)
- Optional reason
- Approver information (if approved)

### Employee Scheduling Tab
The Employee Scheduling system provides a dedicated interface for creating and managing staff work schedules:

#### All Staff Schedules View
- Calendar view showing all scheduled shifts across the organization
- Color-coded shifts based on status (scheduled, confirmed, in progress, completed, etc.)
- Quick actions to edit or delete schedules
- Navigation controls to move between weeks

#### Individual Staff Schedule View
- Select a specific staff member to view only their schedules
- Same calendar interface as the all-staff view but filtered for the selected employee
- Easily identify scheduling conflicts or gaps

#### Bulk Schedule Creation
- Select multiple staff members at once
- Set a date range for the schedules
- Specify common start and end times
- Create multiple schedule entries with a single action
- Great for setting up recurring shifts or standard schedules

## Schedule Status Workflow

Each schedule entry follows a status workflow:

1. **SCHEDULED**: Initial status when a shift is created
2. **CONFIRMED**: Staff member has confirmed availability for the shift
3. **IN_PROGRESS**: Staff has clocked in and is currently working
4. **COMPLETED**: Shift has been completed
5. **CANCELLED**: Shift was cancelled before it started
6. **NO_SHOW**: Staff member did not show up for their scheduled shift

## Implementation Details

### Data Model
- `StaffAvailability`: Stores regular weekly availability patterns
- `StaffTimeOff`: Stores specific date ranges when staff are unavailable
- `StaffSchedule`: Stores employee work schedules

### Components
- `StaffSchedulingTabs`: Main component that handles tab switching between availability and time off
- `StaffAvailabilityForm`: Manages the creation, editing, and deletion of availability records
- `StaffTimeOffForm`: Manages the creation, editing, and deletion of time off requests
- `StaffScheduleForm`: Manages the creation and editing of staff schedule entries
- `StaffScheduleCalendar`: Displays staff schedules in a calendar view

### API Endpoints

#### Backend Route Configuration
Schedule-related endpoints are registered under the `/api/schedules` prefix in the backend server configuration. This is separate from the staff routes to avoid middleware conflicts.

#### Staff Availability
- Backend Route: `GET /api/staff/:staffId/availability` - Get availability for a specific staff member
- Frontend Service Call: `staffService.getStaffAvailability(staffId)`

- Backend Route: `POST /api/staff/:staffId/availability` - Create new availability for a staff member
- Frontend Service Call: `staffService.createStaffAvailability(staffId, availabilityData)`

- Backend Route: `PUT /api/staff/availability/:id` - Update an existing availability record
- Frontend Service Call: `staffService.updateStaffAvailability(id, availabilityData)`

- Backend Route: `DELETE /api/staff/availability/:id` - Delete an availability record
- Frontend Service Call: `staffService.deleteStaffAvailability(id)`

#### Staff Time Off
- Backend Route: `GET /api/staff/:staffId/time-off` - Get time off records for a specific staff member
- Frontend Service Call: `staffService.getStaffTimeOff(staffId)`

- Backend Route: `POST /api/staff/:staffId/time-off` - Create a new time off record for a staff member
- Frontend Service Call: `staffService.createStaffTimeOff(staffId, timeOffData)`

- Backend Route: `PUT /api/staff/time-off/:id` - Update an existing time off record
- Frontend Service Call: `staffService.updateStaffTimeOff(id, timeOffData)`

- Backend Route: `DELETE /api/staff/time-off/:id` - Delete a time off record
- Frontend Service Call: `staffService.deleteStaffTimeOff(id)`

#### Staff Scheduling
- Backend Route: `GET /api/schedules` - Get all staff schedules
- Frontend Service Call: `staffService.getAllSchedules(startDate, endDate)`

- Backend Route: `GET /api/schedules/staff/:staffId` - Get schedules for a specific staff member
- Frontend Service Call: `staffService.getStaffSchedules(staffId, startDate, endDate)`

- Backend Route: `POST /api/schedules/staff/:staffId` - Create a new schedule for a staff member
- Frontend Service Call: `staffService.createStaffSchedule(staffId, scheduleData)`

- Backend Route: `PUT /api/schedules/:scheduleId` - Update an existing schedule
- Frontend Service Call: `staffService.updateStaffSchedule(scheduleId, scheduleData)`

- Backend Route: `DELETE /api/schedules/:scheduleId` - Delete a schedule
- Frontend Service Call: `staffService.deleteStaffSchedule(scheduleId)`

- Backend Route: `POST /api/schedules/bulk` - Create multiple schedules at once
- Frontend Service Call: `staffService.bulkCreateSchedules(schedulesArray)`

- Backend Route: `GET /api/staff/available` - Get available staff for a specific time period
- Frontend Service Call: `staffService.getAvailableStaff({ date, startTime, endTime, specialties })`

#### Implementation Notes
- The schedule endpoints use a separate route file (`schedule.routes.ts`) to avoid middleware conflicts with staff routes
- Date handling in the backend converts string dates to DateTime objects for Prisma compatibility
- The frontend uses the `/api/schedules` prefix for all schedule-related API calls

## Best Practices
1. **Regular Updates**: Keep staff availability up to date to ensure accurate scheduling
2. **Advance Planning**: Encourage staff to submit time off requests well in advance
3. **Approval Workflow**: Implement a consistent approval process for time off requests
4. **Documentation**: Document all changes to availability for reference

## Future Enhancements
- Integration with the main reservation calendar
- Conflict detection when scheduling staff
- Automated notifications for time off approvals/denials
- Staff view for self-service availability and time off management
