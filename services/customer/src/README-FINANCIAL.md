# Tailtown Financial Reporting System

## Overview

This document provides technical implementation details for the Tailtown financial reporting system. It explains how revenue is calculated, where the code is located, and how to maintain consistency across the application.

## Key Components

### 1. Financial Service (`src/services/financialService.ts`)

The financial service is the **single source of truth** for all financial calculations. It provides methods for:

- `getFinancialSummary`: Returns complete financial data for a date range
- `getServiceRevenue`: Calculates revenue from services, including reservations without invoices
- `getAddOnRevenue`: Calculates revenue from add-on services, including those from reservations without invoices
- `getCustomerRevenue`: Calculates revenue breakdown by customer
- `getInvoicesInRange`: Retrieves invoices within a date range
- `getDirectPaymentsInRange`: Retrieves direct payments within a date range
- `getReservationsWithoutInvoices`: Retrieves reservations without invoices

### 2. Analytics Controller (`src/controllers/analytics.controller.ts`)

Provides API endpoints for analytics data:

- `getDashboardSummary`: Returns summary data for the dashboard
- `getSalesByService`: Returns sales data broken down by service
- `getSalesByAddOn`: Returns sales data broken down by add-on
- `getCustomerSpending`: Returns customer spending data

### 3. Reservation Controller (`src/controllers/reservation.controller.ts`)

Includes the `getTodayRevenue` function which calculates today's revenue for the main dashboard.

## Revenue Calculation Formula

```
Total Revenue = Invoice Revenue + Direct Payments + Reservation Value
```

Where:
- **Invoice Revenue**: Sum of all invoice totals in the date range
- **Direct Payments**: Sum of all direct payments in the date range
- **Reservation Value**: Sum of all reservation service prices + add-on prices for reservations without invoices

## Important Implementation Details

1. **Consistent Status Filtering**: 
   - Valid invoice statuses: `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `PENDING`
   - Valid reservation statuses: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `COMPLETED`

2. **Reservation Revenue Calculation**:
   ```typescript
   // Base service price
   const serviceRevenue = reservations.reduce((acc, reservation) => {
     return acc + (reservation.service?.price || 0);
   }, 0);
   
   // Add-on services
   const addOnRevenue = reservations.reduce((acc, reservation) => {
     return acc + (reservation.addOnServices?.reduce((addOnAcc, addOnService) => {
       const price = typeof addOnService.price === 'number' ? addOnService.price : 0;
       return addOnAcc + price;
     }, 0) || 0);
   }, 0);
   
   // Total revenue
   const totalRevenue = serviceRevenue + addOnRevenue;
   ```

3. **Date Range Handling**:
   ```typescript
   interface DateRange {
     gte: Date; // Greater than or equal to (start date)
     lte: Date; // Less than or equal to (end date)
   }
   ```

## Common Issues and Solutions

### Issue: Revenue Discrepancy Between Dashboard and Analytics

**Symptoms**: Different revenue totals shown on the main dashboard vs. the analytics dashboard.

**Root Causes**:
1. The `getTodayRevenue` function in the reservation controller wasn't including add-on services
2. The analytics controller wasn't including reservations without invoices

**Solution**:
1. Update `getTodayRevenue` to include both service and add-on revenue
2. Ensure all revenue calculations include reservations without invoices

### Issue: Missing Add-On Revenue

**Symptoms**: Total revenue doesn't match the sum of service prices and add-on prices.

**Cause**: Add-on services not being included in revenue calculations.

**Solution**: Always include add-on services in revenue calculations.

## Diagnostic Tools

The system includes diagnostic scripts to help identify and fix revenue discrepancies:

- `src/scripts/check-revenue-discrepancy.ts`: Compares revenue calculations between different parts of the system

## Testing Guidelines

When making changes to the financial reporting system:

1. Run the diagnostic script to verify consistency
2. Check both the main dashboard and financial analytics dashboard
3. Verify that service revenue + add-on revenue = total revenue

## Future Enhancements

Planned improvements to the financial reporting system:

1. Enhanced date filtering for financial reports
2. Detailed cash receipts reporting
3. Reconciliation features to match reservations with payments
