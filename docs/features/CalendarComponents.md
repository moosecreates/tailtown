# Calendar Components

## Overview

Tailtown uses various calendar components to display and manage different types of reservations. The application implements specialized calendar views for different service categories:

- **Boarding & Daycare Calendar**: Uses the standard Calendar component with a toggle for grid view
- **Grooming Calendar**: Uses a specialized calendar component with fixed time formatting
- **Training Calendar**: Uses the same specialized calendar component as grooming

## Component Architecture

### Calendar.tsx
The base calendar component used for boarding and daycare reservations. This component uses string-based time formatting which works with the current implementation.

### SpecializedCalendar.tsx
A specialized calendar component created specifically for grooming and training views. This component fixes time formatting issues by using object notation instead of string literals:

```javascript
// Correct format using object notation
eventTimeFormat={{
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}}
```

## Technical Notes

### Time Formatting Issue
The application previously experienced an error with the grooming and training calendars: `context.cmdFormatter is not a function`. This was caused by using string-based time formatting which is deprecated in newer versions of FullCalendar.

The solution was to create a specialized calendar component that uses object notation for time formatting, which is the recommended approach in FullCalendar v6+.

### Implementation Details
- **GroomingCalendarPage.tsx**: Uses SpecializedCalendar with ServiceCategory.GROOMING filter
- **TrainingCalendarPage.tsx**: Uses SpecializedCalendar with ServiceCategory.TRAINING filter
- **CalendarPage.tsx**: Uses the original Calendar component which works for boarding/daycare

## Future Improvements

- Consider consolidating all calendar views to use the object notation format once all calendar components are verified to be stable
- Implement additional calendar features like resource views for staff scheduling
- Add print functionality for calendar views
