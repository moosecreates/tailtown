# Order Entry System

## Overview
The Order Entry system provides a step-by-step guided process for creating new orders, including customer selection, reservation creation, add-on services, invoice review, and payment processing.

## Component Location and Structure
- **Main Component**: `/frontend/src/pages/orders/OrderEntry.tsx`
- **Route Path**: `/orders/new`
- **Route Definition**: Added in `/frontend/src/App.tsx`

## Related Components
The OrderEntry system uses several sub-components:
- `CustomerSelection.tsx` - for selecting customers and their pets
- `ReservationCreation.tsx` - for creating reservation details
- `AddOnSelection.tsx` - for selecting add-on services
- `InvoiceReview.tsx` - for reviewing invoice details
- `PaymentProcessing.tsx` - for processing payments

## Functionality
The Order Entry system follows a 5-step process:

1. **Customer Information**
   - Select existing customer and pet
   - View customer details

2. **Reservation Details**
   - Select service type
   - Choose dates and times
   - Add notes
   - Automatic price calculation

3. **Add-On Services**
   - Browse and select additional services
   - Add quantities
   - View pricing for each add-on

4. **Review Invoice**
   - View itemized invoice with subtotal
   - See tax calculations
   - Review any discounts applied
   - Confirm final total

5. **Process Payment**
   - Choose payment method (credit card or cash)
   - Enter payment details
   - Process transaction

## Backend Integration
The Order Entry system integrates with multiple backend services:
- `reservationService.ts` - for creating and managing reservations
- `invoiceService.ts` - for generating invoices
- `paymentService.ts` - for processing payments
- `priceRuleService.ts` - for applying pricing rules and discounts

## Current Status
This feature has been superseded by the Calendar-based reservation system with integrated checkout. However, the code is being preserved for potential future use and reference.

## Related Routes
- `/orders/new` - Main order entry page
- `/checkout` - Checkout page for reviewing and finalizing orders

## Notes for Developers
- The Order Entry system was designed as a comprehensive, step-by-step flow for creating orders
- While this exact flow is no longer used, many of its components and logic have been incorporated into the Calendar-based reservation and checkout system
- The code provides valuable reference for order processing logic and form handling

## Data Flow
1. Customer and pet selection → Update order data
2. Reservation details → Create reservation in database → Update order data
3. Add-on selection → Update order data
4. Invoice review → Create invoice in database → Update order data
5. Payment processing → Process payment → Mark order as complete
