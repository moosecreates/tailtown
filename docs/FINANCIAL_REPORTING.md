# Tailtown Financial Reporting System

## Overview

The Tailtown financial reporting system provides a comprehensive view of business revenue across multiple interfaces. This document explains how revenue is calculated, where it's displayed, and how to maintain consistency across the application.

## Revenue Sources

The system tracks three types of revenue:

1. **Invoice-based Revenue**: Revenue from formal invoices that have been issued to customers.
2. **Direct Payments**: Cash payments received without formal invoices.
3. **Reserved Revenue**: Value of scheduled services that haven't been invoiced yet.

## Key Components

### 1. Financial Service (`financialService.ts`)

The financial service is the **single source of truth** for all financial calculations. It provides methods for:

- Getting financial summaries for date ranges
- Calculating service revenue
- Calculating add-on revenue
- Processing payments and invoices

Key functions:
- `getFinancialSummary`: Returns complete financial data for a date range
- `getServiceRevenue`: Calculates revenue from services, including reservations without invoices
- `getAddOnRevenue`: Calculates revenue from add-on services, including those from reservations without invoices

### 2. Analytics Controller (`analytics.controller.ts`)

Provides API endpoints for analytics data including:
- Dashboard summary data
- Sales by service
- Sales by add-on
- Customer analytics

### 3. Reservation Controller (`reservation.controller.ts`)

Handles reservation-related operations including:
- Creating and managing reservations
- Calculating today's revenue via the `getTodayRevenue` function

### 4. Frontend Components

- **Dashboard** (`Dashboard.tsx`): Shows key metrics including today's revenue
- **Financial Analytics Dashboard** (`AnalyticsDashboard.tsx`): Provides detailed financial analytics

## Revenue Calculation Logic

### Total Revenue Formula

```
Total Revenue = Invoice Revenue + Direct Payments + Reservation Value
```

Where:
- **Invoice Revenue**: Sum of all invoice totals in the date range
- **Direct Payments**: Sum of all direct payments in the date range
- **Reservation Value**: Sum of all reservation service prices + add-on prices for reservations without invoices

### Important Implementation Details

1. **Consistent Date Handling**: All date ranges are handled consistently using the `DateRange` type.

2. **Rounding**: Financial calculations use `Math.round((value * 100) / 100)` for precise 2-decimal place values.

3. **Add-on Services**: Revenue calculations include both service prices and add-on service prices.

4. **Reservation Status**: Only reservations with statuses other than 'CANCELLED' are included in revenue calculations.

## Common Issues and Solutions

### Issue: Revenue Discrepancy Between Dashboard and Analytics

**Symptoms**: Different revenue totals shown on the main dashboard vs. the analytics dashboard.

**Causes**:
- Inconsistent inclusion of add-on services
- Different date range calculations
- Missing reservation revenue in one view

**Solution**:
- Ensure all revenue calculations include both services and add-ons
- Verify date ranges are consistent across all views
- Use the financial service as the single source of truth

### Issue: Missing Reservation Revenue

**Symptoms**: Revenue from scheduled services not appearing in reports.

**Cause**: Only looking at invoices and not including non-invoiced reservations.

**Solution**: Include reservations without invoices in revenue calculations.

## Diagnostic Tools

The system includes diagnostic scripts to help identify and fix revenue discrepancies:

- `check-revenue-discrepancy.ts`: Compares revenue calculations between different parts of the system
- `check-todays-data.ts`: Analyzes today's data for consistency

## Maintenance Guidelines

1. **Single Source of Truth**: Always use the financial service for revenue calculations.
2. **Test All Views**: When making changes, verify that all dashboards show consistent numbers.
3. **Run Diagnostics**: Use the diagnostic scripts to verify consistency after changes.
4. **Document Changes**: Update this documentation when modifying revenue calculation logic.

## Future Enhancements

Planned improvements to the financial reporting system:

1. Enhanced date filtering for financial reports
2. Detailed cash receipts reporting
3. Reconciliation features to match reservations with payments
4. Export capabilities for financial data
