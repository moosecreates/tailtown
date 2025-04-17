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
