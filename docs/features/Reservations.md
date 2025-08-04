# Reservation System

## Status Workflow

Reservations in Tailtown follow a specific status workflow:

```
PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT -> COMPLETED
             |             |
             v             v
         CANCELLED      NO_SHOW
```

### Status Definitions

- `PENDING`: Initial state when a reservation is created
- `CONFIRMED`: Reservation has been approved by staff
- `CHECKED_IN`: Pet has arrived and been checked in
- `CHECKED_OUT`: Pet has been picked up by owner
- `COMPLETED`: Service has been fully completed and finalized
- `CANCELLED`: Reservation was cancelled before check-in
- `NO_SHOW`: Customer did not show up for their reservation

## Dashboard Display

The dashboard shows reservations filtered by specific statuses:
- Active Reservations: `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `COMPLETED`
- Each status is color-coded for quick visual identification:
  * `CONFIRMED`: Green
  * `PENDING`: Yellow
  * `CHECKED_IN`: Blue
  * `CHECKED_OUT`: Purple
  * `CANCELLED`: Red
  * `NO_SHOW`: Gray
  * `COMPLETED`: Green

## UI Components

### Reservation Cards
- Compact layout with clear visual hierarchy
- Shows key information: Pet, Owner, Service, Status, Check-in/out times
- Interactive elements with hover effects
- Status chips for quick status identification

### Calendar Integration
- Color-coded events based on reservation status
- Interactive event creation and editing
- Multiple view options (month, week, day)
- Real-time updates when status changes

### Reservation Form
- Comprehensive form for creating and editing reservations
- Customer and pet selection with search functionality
- Service selection with dynamic pricing
- Date and time selection with availability checking
- Resource filtering by type (e.g., `STANDARD_SUITE`, `LUXURY_SUITE`)
- Support for multiple resource type filtering in a single query
- Add-on service selection after reservation creation

### Add-On System
- Allows adding supplementary services to existing reservations
- Automatically opens after creating a new reservation
- Consistent behavior across all calendar types (boarding, grooming, training)
- Seamless workflow from reservation creation to add-on selection
- For more details, see [Add-On System Documentation](./AddOnSystem.md)
- Accessible form with proper ARIA attributes
- Smart field handling with validation
- Auto-selection of pet when customer has only one pet
- Dynamic suite/kennel selection based on availability
- Proper form labels and field outlines for improved usability
- Error handling for invalid selections

## Backend Architecture

### Shared Database Approach
- Customer and Reservation services share the same PostgreSQL database (port 5433)
- Prisma schemas are synchronized between services to avoid runtime errors
- Field names and types are consistent across services (e.g., using `birthdate` instead of `age` for Pet model)

### Resource Filtering
- API supports filtering resources by one or more types
- Multiple type parameters are handled as an array (e.g., `?type=STANDARD_SUITE&type=LUXURY_SUITE`)
- Type values are validated against the Prisma `ResourceType` enum
- Invalid type values are logged but don't cause API failures
- Proper error handling for all database queries
