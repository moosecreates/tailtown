# Invoice Management Feature

## Overview
The Invoice Management feature allows staff to generate, view, and manage invoices for customer services. It provides a detailed breakdown of charges, tracks payment history, and maintains customer account balances.

## Key Components

### 1. Invoice Generation
- Automatically creates invoices when reservations are made
- Includes service price and any add-on services
- Calculates tax based on the configured tax rate (7.44%)
- Generates a unique invoice number for each transaction

### 2. Invoice Details View
- Accessible by clicking on invoices in the customer account history
- Shows comprehensive information including:
  - Service details with proper service name display
  - Line items with quantities and prices
  - Tax calculations
  - Payment history
  - Balance due

### 3. Payment Processing
- Supports multiple payment methods (credit card, cash, check, etc.)
- Records payment history with timestamps
- Updates invoice status based on payment status
- Maintains customer account balance

## Implementation Details

### Components
- `InvoiceDetailsDialog`: Displays detailed invoice information when an invoice is clicked
- `AccountHistory`: Shows a list of customer invoices and payments with the ability to view details
- `OrderEntry`: Handles the creation of new reservations and associated invoices

### Data Flow
1. When a reservation is created, an invoice is automatically generated
2. The invoice includes the main service and any add-on services
3. Tax is calculated based on the configured rate (7.44%)
4. When payment is processed, the invoice status is updated
5. The customer's account history displays all invoices and payments

### Technical Considerations
- The system fetches reservation details to display the correct service name in invoices
- DOM nesting issues were addressed to ensure proper rendering of UI components
- Tax calculations are consistent throughout the application
- Error handling is implemented for failed API requests

## User Experience
- Staff can easily view invoice details by clicking on an invoice in the customer's account history
- The invoice details dialog provides a clear breakdown of charges
- Payment history is displayed alongside invoice information
- The system visually indicates invoice status (draft, paid, overdue, etc.)

## Future Enhancements
- Email invoice functionality
- Print invoice option
- Batch payment processing
- Integration with accounting software
- Customizable invoice templates

## Troubleshooting
- If invoice details are not displaying correctly, ensure the reservation data is properly linked
- For tax calculation issues, verify the tax rate is set to 7.44% in all relevant components
- If payment processing fails, check the API connection and request format
