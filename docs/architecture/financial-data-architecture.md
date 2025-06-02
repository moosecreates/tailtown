# Financial Data Architecture

## Overview

This document outlines the financial data architecture for the Tailtown application. It provides guidance on how financial data should be managed, calculated, and reported to ensure consistency across the entire application.

## Core Principles

1. **Single Source of Truth**: All financial calculations are centralized in the `financialService.ts`
2. **Consistent Filtering**: Standard filters are applied to ensure the same data is used in all calculations
3. **Standardized Calculations**: Common calculation methods are used for all financial reporting
4. **Validation and Reconciliation**: Automated testing ensures that all financial calculations remain consistent

## Key Components

### Financial Service

The Financial Service (`financialService.ts`) serves as the central hub for all financial calculations in the application. It provides:

- Standardized date range filtering
- Common calculation methods for various financial metrics
- Consistent data structures for financial reporting

This service ensures that calculations like revenue, tax amounts, and totals are performed the same way throughout the application.

```typescript
// Example usage
import financialService from '../services/financialService';

// Get date range filter
const dateRange = financialService.getDateRangeFilter('month');

// Get financial summary
const summary = await financialService.getFinancialSummary(dateRange);

// Get service revenue breakdown
const serviceRevenue = await financialService.getServiceRevenue(dateRange);
```

### Financial Data Types

Common type definitions for financial data ensure consistent data structures across the application:

- `FinancialSummary`: Overall financial metrics
- `ServiceRevenue`: Revenue breakdown by service
- `AddOnRevenue`: Revenue breakdown by add-on
- `CustomerRevenue`: Revenue breakdown by customer
- `FinancialTransaction`: Financial transaction records with proper typing
  ```typescript
  interface FinancialTransaction {
    id: string;
    transactionNumber: string;
    status: string;
    amount: number;
    customerId: string;
    timestamp: Date;
  }
  ```
- `Reservation`: Complete reservation data including payments and invoices
  ```typescript
  // Payment history for the reservation
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    transactionId?: string;
  }>;
  
  // Multiple invoices for the reservation
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  ```

### Controllers and API Endpoints

All controllers that handle financial data should use the Financial Service to ensure consistent results:

- `/api/analytics/*`: Analytics endpoints
- `/api/invoices/*`: Invoice management
- `/api/payments/*`: Payment processing

### Validation

A validation framework ensures financial data remains consistent:

- `financialService.test.ts`: Tests to verify calculation consistency
- `validateFinancialData.ts`: Script to validate all financial data

## Implementation Rules

To maintain financial data consistency, follow these rules:

1. **Never bypass the Financial Service**: Always use methods from `financialService.ts` for financial calculations
2. **Use standard filters**: Use the predefined status filters for invoices, reservations, and payments
3. **Follow the data flow**: All financial data should flow through a standardized pipeline
4. **Test thoroughly**: Run validation tests after any changes to financial calculations
5. **Maintain type safety**: Always use explicit typing for financial data structures
   ```typescript
   // Good: Explicitly typed array
   const transactions: FinancialTransaction[] = [];
   
   // Bad: Implicitly typed array
   const transactions = [];
   ```
6. **Document financial interfaces**: Ensure all financial data structures have clear interface definitions
7. **Avoid any type**: Never use `any` type for financial data to prevent calculation errors

## Database Schema

The financial data is stored in several tables:

- `invoices`: Main invoice records
- `invoice_line_items`: Individual line items for invoices
- `payments`: Payment records linked to invoices
- `reservations`: Service bookings
- `reservation_addons`: Add-on services linked to reservations

## Common Calculations

### Total Revenue Calculation

```typescript
// Calculate total revenue from invoices
const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
```

### Tax Calculation

```typescript
// Calculate tax for an invoice
const taxAmount = subtotal * taxRate;
```

### Invoice Total Calculation

```typescript
// Calculate total for an invoice
const total = subtotal + taxAmount - discount;
```

## Financial Reports

All financial reports should be generated using the Financial Service to ensure consistent data. The main reports include:

1. **Sales by Service**: Revenue breakdown by service type
2. **Sales by Add-On**: Revenue breakdown by add-on services
3. **Customer Value**: Revenue breakdown by customer
4. **Dashboard Summary**: Overall financial metrics

## Validation and Testing

Regular validation ensures financial data remains consistent:

1. Run the validation script: `npm run validate-financial-data`
2. Check validation logs in `logs/financial-validation/`
3. Address any discrepancies identified in the validation report

## Troubleshooting

If financial numbers don't match across different parts of the application:

1. Check the analytics controller is using the Financial Service
2. Verify invoice and payment controllers are using standard calculations
3. Run the validation script to identify specific discrepancies
4. Check for custom filtering that might exclude certain records

## Future Improvements

Planned improvements to the financial architecture include:

1. Implementation of a true event sourcing approach for financial transactions
2. Enhanced audit logging for financial operations
3. Reconciliation tools for daily/monthly accounting
4. Integration with external accounting systems

## Implementation Notes

This section tracks implementation decisions, lessons learned, and refinements to the strategy as the refactoring progresses.

| Date | Component | Decision | Rationale |
|------|-----------|----------|-----------|
| 2025-06-01 | Financial Data | Documented separation of operational and reporting data | Optimize for both transaction integrity and reporting performance |
| 2025-06-01 | Financial Modeling | Planned tenant-specific indexes | Prepare for multi-tenant scaling while maintaining query performance |
