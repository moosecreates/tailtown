# Dashboard Updates - April 16, 2025

## Changes Made

### Revenue Calculation
- Updated revenue calculation to include all non-PENDING and non-CANCELLED reservations
- Revenue now includes reservations with status: CONFIRMED, CHECKED_IN, CHECKED_OUT, and COMPLETED
- Only counts reservations for the current day

### Reservation Counter
- Fixed reservation counter to show accurate count of today's reservations
- Removed pagination limit that was causing only one reservation to be counted
- Added date filter to only count current day's reservations
- Excludes PENDING and CANCELLED reservations to match revenue calculation

### Dashboard UI
- Removed "from last month" text from all stat cards
- Removed "Updated live" text from revenue card
- Fixed layout to keep Quick Actions next to Today's Appointments
- Today's Appointments now shows all active reservations (CONFIRMED, CHECKED_IN, CHECKED_OUT, COMPLETED)

## Configuration Changes

### Frontend (`/frontend/src/pages/Dashboard.tsx`)
```typescript
// Updated getAllReservations call to remove limit
reservationService.getAllReservations() // No limit for accurate counting

// Updated status filter for upcoming reservations
reservationService.getAllReservations(1, 5, 'startDate', 'asc', 'CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED')
```

### Backend (`/services/customer/src/controllers/reservation.controller.ts`)
```typescript
// Added date filter to getAllReservations
const where = {
  status: {
    notIn: ['PENDING', 'CANCELLED'] as ReservationStatus[]
  },
  startDate: {
    gte: today,
    lt: tomorrow
  }
};
```

## Testing Notes
- Verified that revenue calculation matches all non-PENDING/CANCELLED reservations
- Confirmed reservation count matches visible reservations in Today's Appointments
- Tested with multiple reservations to ensure accurate counting
