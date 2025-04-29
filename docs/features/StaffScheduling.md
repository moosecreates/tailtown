# Staff Scheduling

## Overview
The Staff Scheduling feature allows administrators to manage staff availability and time off requests. This functionality is essential for efficient resource allocation and scheduling.

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

## User Interface

### Accessing Staff Scheduling
1. Navigate to the **Settings** page
2. Select the **Users** tab
3. Edit a staff member
4. Switch to the **Scheduling** tab

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
- Type (Vacation, Sick, Personal, Bereavement, Jury Duty, Other)
- Status (Pending, Approved, Denied)
- Optional reason
- Approval information (if applicable)

## Implementation Details

### Data Model
- `StaffAvailability`: Stores regular weekly availability patterns
- `StaffTimeOff`: Stores specific date ranges when staff are unavailable

### Components
- `StaffSchedulingTabs`: Main component that handles tab switching between availability and time off
- `StaffAvailabilityForm`: Manages the creation, editing, and deletion of availability records
- `StaffTimeOffForm`: Manages the creation, editing, and deletion of time off requests

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
