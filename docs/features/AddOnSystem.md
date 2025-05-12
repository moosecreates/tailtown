# Add-On System

## Overview

The Add-On System in Tailtown allows staff to enhance reservations with supplementary services. This feature is fully integrated with the reservation workflow, providing a seamless experience for adding services to boarding, grooming, and training appointments.

## Key Features

- **Seamless Integration**: Automatically opens after creating a new reservation
- **Consistent Experience**: Works the same way across all calendar types (boarding, grooming, training)
- **Real-time Updates**: Calendar refreshes automatically after add-ons are applied
- **Accessibility**: Proper focus management for keyboard navigation and screen readers
- **Error Prevention**: Prevents duplicate reservations by automatically closing forms after completion

## Technical Implementation

### Components

1. **AddOnSelectionDialog**: The modal dialog that displays available add-ons and allows selection
2. **ReservationForm**: Manages the reservation creation and triggers the add-on dialog
3. **KennelCalendar**: Calendar for boarding reservations with add-on integration
4. **SpecializedCalendar**: Calendar for grooming and training with add-on integration

### Workflow

1. User creates a new reservation in either calendar
2. The form stays open after successful reservation creation
3. The add-on dialog is displayed automatically
4. User selects desired add-ons and submits
5. A custom event is dispatched to signal completion
6. The parent calendar component closes the form and refreshes
7. The updated reservation with add-ons appears in the calendar

### Event-Based Communication

The system uses a custom event pattern for communication between components:

```typescript
// In ReservationForm.tsx - After add-ons are successfully added
const event = new CustomEvent('reservationComplete', { detail: { success: true } });
document.dispatchEvent(event);

// In Calendar components - Listening for the event
useEffect(() => {
  const handleReservationComplete = (event: Event) => {
    // Close the form dialog
    setIsFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    // Reload reservations to refresh the calendar
    loadReservations();
  };
  
  document.addEventListener('reservationComplete', handleReservationComplete);
  
  return () => {
    document.removeEventListener('reservationComplete', handleReservationComplete);
  };
}, [loadReservations]);
```

## Recent Improvements

### May 2025 Updates

1. **Consistent Behavior**: Standardized add-on workflow across all calendar types
   - Both KennelCalendar and SpecializedCalendar now handle add-ons identically
   - Forms remain open after reservation creation to allow add-on selection

2. **Automatic Form Closing**: Implemented event-based form closing
   - Forms automatically close after add-ons are added
   - Prevents users from creating duplicate reservations

3. **Focus Management**: Improved accessibility
   - Proper focus handling when opening and closing dialogs
   - Prevents accessibility warnings and improves screen reader compatibility

4. **Error Handling**: Enhanced error feedback
   - Clear error messages for reservation conflicts
   - Improved validation for overlapping reservations

## Usage Guidelines

### For Developers

- The add-on system uses custom events for communication between components
- Always maintain the event listener pattern when modifying calendar components
- Ensure proper focus management when working with dialogs
- Test add-on functionality across all calendar types after making changes

### For Users

- After creating a reservation, the add-on dialog will appear automatically
- Select desired add-ons by clicking the "+" button
- Adjust quantities as needed
- Click "Save" to apply the add-ons to the reservation
- The form will automatically close and the calendar will refresh

## Future Enhancements

- Dynamic pricing based on reservation duration
- Seasonal or promotional add-on packages
- Inventory tracking for add-on items
- Customizable add-on categories by service type
- Bulk add-on application to multiple reservations
