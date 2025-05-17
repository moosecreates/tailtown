# Tailtown Financial Services

## Overview

The Financial Services layer is the single source of truth for all financial data in Tailtown. It centralizes calculation logic and ensures consistent reporting across the application.

## Core Design Principles

1. **Single Source of Truth**: All financial calculations come from this service
2. **Consistent Filtering**: Standard filters for invoice, payment, and reservation statuses 
3. **No Duplication**: Shared calculation methods prevent divergent implementations
4. **Built-in Validation**: Self-checking mechanisms ensure accuracy

## Key Components

### `financialService.ts`

This is the central service for all financial data:

- Common date range filtering
- Standard invoice/payment filtering
- Revenue calculation methods
- Customer spending analysis

### Data Validation

The `validateFinancialData.ts` script can be run to verify data consistency:

```bash
# Run from the services/customer directory
npm run validate-financial
```

This checks for consistency between:
- Total revenue from invoices 
- Sum of service revenue
- Sum of customer spending

## Common Calculations

All financial calculations use standardized methods:

1. **Revenue Calculation**: Always use the `getFinancialSummary` method
2. **Tax Calculation**: Use standard tax rate applied to subtotal
3. **Totals with Discounts**: Always (subtotal + tax - discount)
4. **Period Filtering**: Always use `getDateRangeFilter`

## Implementing New Features

When adding features that calculate or display financial data:

1. Add calculation methods to `financialService.ts`
2. Update validation tests
3. Run the validation script to ensure consistency

## Troubleshooting

If financial numbers appear inconsistent:

1. Check filters for invoices, payments, and reservations
2. Verify date range filters
3. Run the validation script
4. Look for custom calculations outside the financial service

## Known Limitations

- Historical data from before this implementation may show inconsistencies
- Non-standard discount types require special handling
- Data is only as accurate as the inputs (garbage in, garbage out)

## Future Improvements

- Event sourcing for all financial transactions
- Real-time reconciliation
- Improved audit logging
