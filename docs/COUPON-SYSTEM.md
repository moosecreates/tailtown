# Coupon System Documentation

## Overview

The Tailtown coupon system provides a comprehensive discount management solution for both administrators and customers. It supports percentage and fixed-amount discounts with flexible restrictions and usage tracking.

## Features

### ✅ Implemented Features

1. **Coupon Types**
   - Percentage discounts (e.g., 25% off)
   - Fixed amount discounts (e.g., $15 off)

2. **Restrictions**
   - Service-specific coupons
   - Date range restrictions (valid from/until)
   - Minimum purchase requirements
   - First-time customer only coupons
   - Usage limits (total and per customer)

3. **Management**
   - Admin UI for creating/editing coupons
   - Bulk coupon generation
   - Usage tracking and statistics
   - Status management (Active, Inactive, Expired, Depleted)

4. **Customer Experience**
   - Easy coupon code entry during booking
   - Real-time validation
   - Discount preview before applying
   - Clear error messages

5. **Business Logic**
   - Automatic expiration checking
   - Usage limit enforcement
   - Minimum purchase validation
   - Service restriction validation
   - First-time customer verification

## Architecture

### Frontend Components

```
frontend/src/
├── types/
│   └── coupon.ts              # TypeScript types and interfaces
├── services/
│   └── couponService.ts       # API calls and business logic
├── components/
│   └── coupons/
│       └── CouponInput.tsx    # Customer-facing input component
└── pages/
    └── admin/
        └── CouponManagement.tsx  # Admin management interface
```

### Data Model

```typescript
interface Coupon {
  id: string;
  code: string;                    // e.g., "SUMMER2025"
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;           // Percentage (0-100) or dollar amount
  
  // Restrictions
  minimumPurchase?: number;
  serviceIds?: string[];
  firstTimeCustomersOnly?: boolean;
  
  // Date validity
  validFrom: Date | string;
  validUntil: Date | string;
  
  // Usage limits
  maxTotalUses?: number;
  maxUsesPerCustomer?: number;
  currentUses: number;
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DEPLETED';
  
  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  notes?: string;
}
```

## Usage

### For Administrators

#### Creating a Coupon

1. Navigate to Admin → Coupon Management
2. Click "Create Coupon"
3. Fill in the required fields:
   - **Code**: Unique identifier (e.g., SUMMER2025)
   - **Description**: What the coupon is for
   - **Type**: Percentage or Fixed Amount
   - **Discount Value**: Amount or percentage
   - **Valid From/Until**: Date range
4. Optional settings:
   - Minimum purchase amount
   - Service restrictions
   - Usage limits
   - First-time customer only
5. Click "Create"

#### Bulk Coupon Generation

```typescript
const request: BulkCouponRequest = {
  prefix: 'SUMMER2025',
  count: 100,
  type: 'PERCENTAGE',
  discountValue: 20,
  description: 'Summer 2025 promotion',
  validFrom: '2025-06-01',
  validUntil: '2025-08-31',
  maxUsesPerCustomer: 1
};

const coupons = await couponService.generateBulkCoupons(request);
// Generates: SUMMER2025-001, SUMMER2025-002, ..., SUMMER2025-100
```

#### Viewing Statistics

```typescript
const stats = await couponService.getCouponStats();
// Returns:
// - Total coupons
// - Active coupons
// - Total redemptions
// - Total discount amount
// - Top performing coupons
```

### For Customers

#### Applying a Coupon During Booking

The `CouponInput` component is integrated into the booking flow:

```tsx
<CouponInput
  customerId={customer.id}
  subtotal={bookingSubtotal}
  serviceIds={selectedServiceIds}
  onCouponApplied={(coupon, discountAmount) => {
    // Update booking with discount
    setDiscount(discountAmount);
    setAppliedCoupon(coupon);
  }}
  onCouponRemoved={() => {
    // Remove discount
    setDiscount(0);
    setAppliedCoupon(null);
  }}
  appliedCoupon={appliedCoupon}
/>
```

## Business Logic

### Coupon Validation Rules

A coupon is valid if ALL of the following are true:

1. ✅ **Coupon exists** in the database
2. ✅ **Status is ACTIVE** (not inactive, expired, or depleted)
3. ✅ **Current date is within valid range** (validFrom ≤ now ≤ validUntil)
4. ✅ **Usage limit not exceeded** (currentUses < maxTotalUses)
5. ✅ **Customer hasn't exceeded their limit** (customer uses < maxUsesPerCustomer)
6. ✅ **Minimum purchase met** (subtotal ≥ minimumPurchase)
7. ✅ **Service restriction met** (if serviceIds specified, booking includes those services)
8. ✅ **First-time customer check** (if firstTimeCustomersOnly, customer has no previous bookings)

### Discount Calculation

#### Percentage Discount
```typescript
discountAmount = (subtotal × discountValue) / 100
finalPrice = subtotal - discountAmount
```

Example: 25% off $100 = $25 discount, $75 final price

#### Fixed Amount Discount
```typescript
discountAmount = min(discountValue, subtotal)
finalPrice = max(0, subtotal - discountValue)
```

Example: $15 off $100 = $15 discount, $85 final price
Example: $15 off $10 = $10 discount, $0 final price (can't go negative)

### Status Management

Coupons automatically transition between statuses:

- **ACTIVE**: Coupon is usable
- **INACTIVE**: Manually disabled by admin
- **EXPIRED**: Current date > validUntil
- **DEPLETED**: currentUses ≥ maxTotalUses

## API Endpoints

### Required Backend Endpoints

```
GET    /api/coupons                    # List all coupons
GET    /api/coupons/:id                # Get coupon by ID
GET    /api/coupons/code/:code         # Get coupon by code
POST   /api/coupons                    # Create new coupon
PUT    /api/coupons/:id                # Update coupon
DELETE /api/coupons/:id                # Delete coupon

POST   /api/coupons/validate           # Validate coupon
POST   /api/coupons/apply              # Apply coupon to reservation
GET    /api/coupons/:id/usage          # Get usage history
GET    /api/coupons/stats              # Get statistics

POST   /api/coupons/bulk               # Generate bulk coupons
POST   /api/coupons/referral           # Generate referral coupon

GET    /api/customers/:id/coupons      # Get customer's coupon usage
GET    /api/customers/:id/first-time   # Check if first-time customer
```

## Testing

### Unit Tests

```bash
npm test -- couponService.test
```

Tests cover:
- ✅ Discount calculation (percentage and fixed)
- ✅ Coupon code validation
- ✅ Expiration checking
- ✅ Depletion checking
- ✅ Formatting helpers
- ✅ Business rules

### Integration Tests

Test the complete flow:
1. Admin creates coupon
2. Customer enters code during booking
3. System validates coupon
4. Discount is applied
5. Usage is tracked
6. Limits are enforced

## Examples

### Example 1: Percentage Discount

```typescript
const coupon: Coupon = {
  code: 'SAVE25',
  type: 'PERCENTAGE',
  discountValue: 25,
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  status: 'ACTIVE'
};

// Customer books $100 service
const { discountAmount, finalPrice } = couponService.calculateDiscount(coupon, 100);
// discountAmount = $25
// finalPrice = $75
```

### Example 2: Fixed Amount with Minimum Purchase

```typescript
const coupon: Coupon = {
  code: 'SAVE15',
  type: 'FIXED_AMOUNT',
  discountValue: 15,
  minimumPurchase: 50,
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  status: 'ACTIVE'
};

// Customer books $75 service (meets minimum)
const { discountAmount, finalPrice } = couponService.calculateDiscount(coupon, 75);
// discountAmount = $15
// finalPrice = $60
```

### Example 3: First-Time Customer Coupon

```typescript
const coupon: Coupon = {
  code: 'WELCOME20',
  type: 'PERCENTAGE',
  discountValue: 20,
  firstTimeCustomersOnly: true,
  maxUsesPerCustomer: 1,
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  status: 'ACTIVE'
};

// Only works for customers with no previous bookings
```

### Example 4: Service-Specific Coupon

```typescript
const coupon: Coupon = {
  code: 'BOARDING10',
  type: 'PERCENTAGE',
  discountValue: 10,
  serviceIds: ['boarding-service-id'],
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  status: 'ACTIVE'
};

// Only applies to boarding services
```

### Example 5: Limited Use Coupon

```typescript
const coupon: Coupon = {
  code: 'FLASH50',
  type: 'PERCENTAGE',
  discountValue: 50,
  maxTotalUses: 100,
  maxUsesPerCustomer: 1,
  validFrom: '2025-01-01',
  validUntil: '2025-01-07',
  status: 'ACTIVE'
};

// Only 100 customers can use it
// Each customer can only use it once
// Valid for one week only
```

## Error Handling

### Common Error Messages

| Error | Reason | Solution |
|-------|--------|----------|
| "Invalid coupon code" | Code doesn't exist | Check spelling |
| "Coupon has expired" | Past validUntil date | Use different coupon |
| "Coupon not yet valid" | Before validFrom date | Wait until valid date |
| "Usage limit reached" | maxTotalUses exceeded | Coupon depleted |
| "You've already used this coupon" | maxUsesPerCustomer exceeded | Can't reuse |
| "Minimum purchase not met" | Subtotal < minimumPurchase | Add more services |
| "Coupon not valid for selected services" | Service restriction | Choose different services |
| "First-time customers only" | Customer has previous bookings | Use different coupon |

## Future Enhancements

### Potential Features

1. **Coupon Stacking**
   - Allow multiple coupons per booking
   - Define stacking rules

2. **Auto-Apply Coupons**
   - Automatically apply best available coupon
   - Show savings opportunity

3. **Coupon Categories**
   - Group coupons by campaign
   - Track performance by category

4. **Dynamic Coupons**
   - Generate unique codes per customer
   - Time-limited flash sales

5. **Referral Program**
   - Give referrer and referee coupons
   - Track referral chains

6. **Email Integration**
   - Send coupon codes via email
   - Abandoned cart recovery coupons

7. **A/B Testing**
   - Test different discount amounts
   - Measure conversion rates

## Best Practices

### For Administrators

1. **Use Clear Codes**: Make codes memorable (e.g., SUMMER2025, not X7K9P2)
2. **Set Expiration Dates**: Always include validUntil to create urgency
3. **Limit Usage**: Prevent abuse with maxUsesPerCustomer
4. **Track Performance**: Review coupon stats regularly
5. **Test Before Launch**: Validate coupons work as expected
6. **Communicate Clearly**: Include restrictions in description

### For Developers

1. **Always Validate Server-Side**: Don't trust client-side validation alone
2. **Use Transactions**: Ensure atomic coupon application
3. **Log Usage**: Track all coupon applications for auditing
4. **Handle Edge Cases**: Test with $0 subtotals, expired dates, etc.
5. **Optimize Queries**: Index coupon codes for fast lookup
6. **Cache Active Coupons**: Reduce database load

## Support

For questions or issues:
- Check this documentation first
- Review test files for examples
- Contact development team

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0
**Status:** Frontend Complete, Backend Pending
