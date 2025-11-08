# Customer Reservation Management System

## Overview

The Customer Reservation Management System allows customers to view, modify, and cancel their pet boarding reservations through a self-service portal. This system includes comprehensive business logic for cancellation policies, refund calculations, and modification tracking.

## Features

### ✅ Implemented Features

1. **Reservation Dashboard**
   - View all reservations (upcoming, past, cancelled)
   - Summary statistics (total spent, reservation count)
   - Filter by status
   - Quick actions (view, modify, cancel)

2. **Reservation Details**
   - Complete reservation information
   - Add-ons list
   - Modification history
   - Pricing breakdown
   - Cancellation policy display

3. **Modification System**
   - Change check-in/check-out dates
   - Add/remove pets
   - Add/remove add-ons
   - Preview price changes
   - Modification reason tracking

4. **Cancellation System**
   - Policy-based refund calculation
   - Reason selection
   - Confirmation workflow
   - Refund processing

5. **Business Rules**
   - 24-hour modification window
   - Status-based eligibility
   - Tiered refund percentages
   - Modification history tracking

## Architecture

### Frontend Components

```
frontend/src/
├── types/
│   └── reservationManagement.ts    # Type definitions
├── services/
│   └── reservationManagementService.ts  # API calls & business logic
└── pages/
    └── customer/
        ├── MyReservations.tsx      # Dashboard
        ├── ReservationDetails.tsx  # Detail view
        ├── ModifyReservation.tsx   # Modification flow
        └── CancelReservation.tsx   # Cancellation flow
```

### Data Models

#### Reservation Summary
```typescript
interface ReservationSummary {
  id: string;
  orderNumber?: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  petName: string;
  serviceName: string;
  totalPrice: number;
  canModify: boolean;
  canCancel: boolean;
  daysUntilCheckIn: number;
}
```

#### Modification Tracking
```typescript
interface ReservationModification {
  id: string;
  reservationId: string;
  modificationType: ModificationType;
  modifiedBy: 'CUSTOMER' | 'STAFF';
  modifiedAt: Date | string;
  previousValue?: any;
  newValue?: any;
  notes?: string;
}
```

#### Cancellation Policy
```typescript
interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  daysBeforeCheckIn: number;
  refundPercentage: number; // 0-100
  isActive: boolean;
}
```

## Business Logic

### Modification Eligibility

A reservation can be modified if ALL of the following are true:

1. ✅ **Status is modifiable** (PENDING or CONFIRMED)
2. ✅ **Not checked in** (status not CHECKED_IN or CHECKED_OUT)
3. ✅ **Not completed** (status not COMPLETED, CANCELLED, or NO_SHOW)
4. ✅ **More than 24 hours until check-in**

```typescript
canModifyReservation(reservation: Reservation): boolean {
  // Can't modify if cancelled or completed
  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(reservation.status)) {
    return false;
  }

  // Can't modify if checked in or checked out
  if (['CHECKED_IN', 'CHECKED_OUT'].includes(reservation.status)) {
    return false;
  }

  // Can't modify if check-in is within 24 hours
  const daysUntil = getDaysUntilCheckIn(reservation.startDate);
  if (daysUntil < 1) {
    return false;
  }

  return true;
}
```

### Cancellation Eligibility

A reservation can be cancelled if ALL of the following are true:

1. ✅ **Not already cancelled** (status not CANCELLED)
2. ✅ **Not completed** (status not COMPLETED or NO_SHOW)
3. ✅ **Not checked in** (status not CHECKED_IN or CHECKED_OUT)

```typescript
canCancelReservation(reservation: Reservation): boolean {
  // Can't cancel if already cancelled or completed
  if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(reservation.status)) {
    return false;
  }

  // Can't cancel if checked in or checked out
  if (['CHECKED_IN', 'CHECKED_OUT'].includes(reservation.status)) {
    return false;
  }

  return true;
}
```

### Refund Calculation

Default cancellation policy (tiered refunds based on notice):

| Days Before Check-in | Refund Percentage |
|---------------------|-------------------|
| 7+ days             | 100%              |
| 3-6 days            | 50%               |
| 1-2 days            | 25%               |
| < 1 day             | 0%                |

```typescript
calculateRefundPercentage(daysUntilCheckIn: number): number {
  if (daysUntilCheckIn >= 7) return 100;
  if (daysUntilCheckIn >= 3) return 50;
  if (daysUntilCheckIn >= 1) return 25;
  return 0;
}
```

### Price Adjustment Calculation

When modifying a reservation:

```typescript
interface PriceAdjustment {
  originalPrice: number;
  newPrice: number;
  difference: number; // Positive = customer owes, Negative = refund
  breakdown: {
    basePrice: number;
    addOns: number;
    discount: number;
    tax: number;
  };
}
```

## User Workflows

### Workflow 1: View Reservations

1. Customer navigates to "My Reservations"
2. System displays dashboard with:
   - Summary statistics
   - Upcoming reservations
   - Past reservations
   - Cancelled reservations
3. Customer can filter by status using tabs
4. Customer can click "View Details" on any reservation

### Workflow 2: Modify Reservation

1. Customer clicks "Modify" on a reservation
2. System checks eligibility:
   - Must be PENDING or CONFIRMED
   - Must be > 24 hours before check-in
3. Customer can modify:
   - Check-in date
   - Check-out date
   - Add/remove pets
   - Add/remove add-ons
4. Customer clicks "Preview Changes"
5. System shows:
   - Price adjustment
   - Warnings (if any)
   - Confirmation dialog
6. Customer confirms modification
7. System:
   - Updates reservation
   - Records modification history
   - Processes payment/refund if needed
   - Sends confirmation email
8. Success message displayed

### Workflow 3: Cancel Reservation

1. Customer clicks "Cancel" on a reservation
2. System checks eligibility
3. System displays:
   - Cancellation policy
   - Refund amount
   - Refund percentage
4. Customer selects cancellation reason
5. Customer provides optional details
6. Customer confirms cancellation
7. System:
   - Updates reservation status to CANCELLED
   - Creates refund request
   - Records cancellation
   - Sends confirmation email
8. Success message with refund details displayed

## API Endpoints

### Required Backend Endpoints

```
GET    /api/customers/:id/reservations/dashboard
       Returns: CustomerReservationDashboard

GET    /api/customers/:id/reservations?filter=UPCOMING|PAST|CANCELLED
       Returns: ReservationSummary[]

GET    /api/reservations/:id/details
       Returns: ReservationDetails (with modification history)

GET    /api/reservations/:id/modifications
       Returns: ReservationModification[]

GET    /api/reservations/:id/can-modify
       Returns: ModificationConstraints

POST   /api/reservations/:id/preview-modification
       Body: ModifyReservationRequest
       Returns: { isAvailable, priceAdjustment, warnings }

PUT    /api/reservations/:id/modify
       Body: ModifyReservationRequest
       Returns: ModifyReservationResult

GET    /api/reservations/:id/cancellation-policy
       Returns: CancellationPolicy

GET    /api/reservations/:id/calculate-refund
       Returns: { refundAmount, refundPercentage, policy }

POST   /api/reservations/cancel
       Body: CancellationRequest
       Returns: CancellationResult

POST   /api/reservations/:id/add-pet
       Body: { petId }
       Returns: ModifyReservationResult

POST   /api/reservations/:id/remove-pet
       Body: { petId }
       Returns: ModifyReservationResult

POST   /api/reservations/:id/add-addon
       Body: { addOnId, quantity }
       Returns: ModifyReservationResult

DELETE /api/reservations/:id/addons/:addOnServiceId
       Returns: ModifyReservationResult

PATCH  /api/reservations/:id/notes
       Body: { notes }
       Returns: Reservation

GET    /api/customers/:id/refunds
       Returns: RefundRequest[]
```

## Testing

### Unit Tests

Run tests:
```bash
npm test -- reservationManagementService.test
```

Tests cover:
- ✅ Days until check-in calculation
- ✅ Modification eligibility rules
- ✅ Cancellation eligibility rules
- ✅ Refund percentage calculation
- ✅ Status formatting
- ✅ 24-hour modification window
- ✅ Edge cases

### Integration Tests

Test complete workflows:
1. View reservations dashboard
2. Modify reservation dates
3. Add/remove pets
4. Cancel reservation
5. Verify refund calculation

## Error Handling

### Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| "Cannot modify reservation" | Within 24 hours or wrong status | Wait or contact support |
| "Cannot cancel reservation" | Already cancelled or checked in | Contact support |
| "Reservation not found" | Invalid ID | Check URL |
| "No pets selected" | Must select at least one pet | Select a pet |
| "Invalid dates" | Check-out before check-in | Fix dates |
| "Availability conflict" | Dates not available | Choose different dates |

## Security

### Authorization

- Customers can only view/modify their own reservations
- All API calls require authentication
- Customer ID verified on backend

### Validation

- Server-side validation of all modifications
- Eligibility checks enforced on backend
- Price calculations verified server-side

## Future Enhancements

### Potential Features

1. **Email Notifications**
   - Modification confirmations
   - Cancellation confirmations
   - Refund status updates

2. **SMS Notifications**
   - Reminder before check-in
   - Modification alerts

3. **Flexible Policies**
   - Custom policies per service
   - Seasonal policy variations
   - VIP customer exceptions

4. **Advanced Modifications**
   - Change service type
   - Transfer to different dates
   - Split reservations

5. **Refund Tracking**
   - Real-time refund status
   - Refund history
   - Payment method selection

6. **Modification Limits**
   - Max modifications per reservation
   - Modification fees
   - Time-based restrictions

## Best Practices

### For Customers

1. **Modify Early**: Changes are easier and cheaper with more notice
2. **Check Policy**: Review cancellation policy before booking
3. **Provide Reason**: Helps us improve our service
4. **Verify Changes**: Review preview before confirming

### For Developers

1. **Always Validate Server-Side**: Don't trust client calculations
2. **Log All Modifications**: Complete audit trail
3. **Handle Edge Cases**: Timezone issues, concurrent modifications
4. **Test Thoroughly**: All status combinations and timing scenarios
5. **Clear Error Messages**: Help users understand what went wrong

## Support

For questions or issues:
- Check this documentation first
- Review test files for examples
- Contact development team

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
**Status:** Frontend Complete, Backend Pending
