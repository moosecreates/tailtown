# Dynamic Pricing System

## Overview

The Dynamic Pricing System implements peak demand pricing with multiple rule types to optimize revenue based on seasonality, demand, capacity, and booking patterns. This system allows automatic price adjustments while maintaining control and transparency.

## Features

### ✅ Implemented Features

1. **Seasonal Pricing**
   - Spring, Summer, Fall, Winter pricing rules
   - Custom date ranges for each season
   - Percentage or fixed amount adjustments

2. **Peak Time Surcharges**
   - Weekend pricing
   - Holiday pricing
   - Time-of-day pricing
   - Day-of-week specific pricing

3. **Capacity-Based Pricing**
   - Occupancy percentage thresholds
   - Dynamic pricing based on demand
   - Automatic adjustments as capacity fills

4. **Special Event Pricing**
   - Named event pricing (e.g., Christmas, New Year)
   - Date-specific surcharges
   - Pre/post event pricing windows

5. **Advance Booking Discounts**
   - Early bird discounts
   - Booking window requirements
   - Encourages advance planning

6. **Last-Minute Pricing**
   - Fill capacity discounts
   - Short-notice bookings
   - Maximize occupancy

7. **Automated Price Adjustments**
   - Scheduled price updates
   - Occupancy-based triggers
   - Min/max price limits

## Architecture

### Components

```
frontend/src/
├── types/
│   └── dynamicPricing.ts           # Type definitions
├── services/
│   └── dynamicPricingService.ts    # Business logic & API
└── pages/
    └── admin/
        └── PricingRules.tsx        # Admin UI
```

### Data Models

#### Pricing Rule Types

```typescript
type PricingRuleType = 
  | 'SEASONAL'          // Season-based pricing
  | 'PEAK_TIME'         // Weekend/holiday pricing
  | 'CAPACITY_BASED'    // Occupancy-based pricing
  | 'SPECIAL_EVENT'     // Event-specific pricing
  | 'DAY_OF_WEEK'       // Day-specific pricing
  | 'ADVANCE_BOOKING'   // Early bird discounts
  | 'LAST_MINUTE';      // Fill capacity discounts
```

#### Base Pricing Rule

```typescript
interface PricingRule {
  id: string;
  name: string;
  description: string;
  type: PricingRuleType;
  isActive: boolean;
  priority: number;              // Higher = applies first
  
  adjustmentType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  adjustmentValue: number;       // % or $
  
  serviceIds?: string[];         // Optional service filter
  suiteTypes?: string[];         // Optional suite filter
  validFrom?: Date;              // Optional date range
  validUntil?: Date;
}
```

## Usage

### Creating Pricing Rules

#### Seasonal Pricing

```typescript
const summerSurcharge: SeasonalPricingRule = {
  name: 'Summer Peak Season',
  description: 'Higher demand during summer months',
  type: 'SEASONAL',
  season: 'SUMMER',
  startMonth: 6,
  startDay: 1,
  endMonth: 8,
  endDay: 31,
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: 20,  // 20% surcharge
  priority: 5,
  isActive: true
};
```

#### Weekend Pricing

```typescript
const weekendSurcharge: PeakTimePricingRule = {
  name: 'Weekend Surcharge',
  description: 'Higher rates on weekends',
  type: 'PEAK_TIME',
  isWeekend: true,
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: 15,  // 15% surcharge
  priority: 3,
  isActive: true
};
```

#### Capacity-Based Pricing

```typescript
const highOccupancySurcharge: CapacityBasedPricingRule = {
  name: 'High Occupancy Surcharge',
  description: 'Increase prices when >80% full',
  type: 'CAPACITY_BASED',
  minOccupancyPercentage: 80,
  maxOccupancyPercentage: 100,
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: 25,  // 25% surcharge
  priority: 10,
  isActive: true
};
```

#### Advance Booking Discount

```typescript
const earlyBirdDiscount: AdvanceBookingPricingRule = {
  name: 'Early Bird Discount',
  description: 'Book 30+ days in advance',
  type: 'ADVANCE_BOOKING',
  minDaysInAdvance: 30,
  isDiscount: true,
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: -10,  // 10% discount
  priority: 2,
  isActive: true
};
```

### Calculating Prices

```typescript
const request: PriceCalculationRequest = {
  basePrice: 100,
  serviceId: 'boarding-service',
  suiteType: 'DELUXE',
  checkInDate: '2025-07-15',
  checkOutDate: '2025-07-20',
  bookingDate: '2025-06-01',
  numberOfNights: 5,
  currentOccupancy: 85
};

const result = await dynamicPricingService.calculatePrice(request);

// Result:
{
  basePrice: 100,
  adjustments: [
    {
      ruleName: 'Summer Peak Season',
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 20,
      calculatedAmount: 20,
      reason: 'Summer peak season'
    },
    {
      ruleName: 'High Occupancy Surcharge',
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 25,
      calculatedAmount: 25,
      reason: 'Occupancy above 80%'
    }
  ],
  totalAdjustment: 45,
  finalPrice: 145
}
```

## Business Logic

### Rule Priority

Rules are applied in priority order (highest first):

1. **Priority 10:** Capacity-based pricing
2. **Priority 5:** Seasonal pricing
3. **Priority 3:** Peak time pricing
4. **Priority 2:** Advance booking
5. **Priority 1:** Last minute

### Adjustment Calculation

**Percentage Adjustments:**
```typescript
adjustment = basePrice * (percentage / 100)
```

**Fixed Amount Adjustments:**
```typescript
adjustment = fixedAmount
```

**Final Price:**
```typescript
finalPrice = max(0, basePrice + sum(allAdjustments))
```

### Season Detection

```typescript
Spring: March 1 - May 31
Summer: June 1 - August 31
Fall: September 1 - November 30
Winter: December 1 - February 28/29
```

### Holiday Management

Holidays can be:
- **One-time:** Specific date in specific year
- **Recurring:** Same date every year (e.g., Christmas)

### Capacity Thresholds

Example capacity-based pricing:
- 0-50%: Base price
- 50-70%: +10%
- 70-85%: +20%
- 85-100%: +30%

## Admin Interface

### Managing Pricing Rules

1. **View All Rules**
   - Sorted by priority
   - Color-coded by type
   - Active/inactive toggle

2. **Create Rule**
   - Select rule type
   - Set adjustment (% or $)
   - Define priority
   - Optional filters (service, suite type)
   - Date range restrictions

3. **Edit Rule**
   - Modify any field
   - Change active status
   - Update priority

4. **Delete Rule**
   - Confirmation required
   - Immediate effect

### Managing Holidays

1. **Add Holiday**
   - Name and date
   - Recurring option
   - Automatic year rollover

2. **Delete Holiday**
   - Remove from calendar
   - Affects peak time rules

## API Endpoints

### Pricing Rules

```
GET    /api/pricing/rules
       Query: type, isActive, page, limit
       Returns: PricingRule[]

GET    /api/pricing/rules/:id
       Returns: PricingRule

POST   /api/pricing/rules
       Body: Partial<PricingRule>
       Returns: PricingRule

PUT    /api/pricing/rules/:id
       Body: Partial<PricingRule>
       Returns: PricingRule

DELETE /api/pricing/rules/:id
       Returns: void
```

### Price Calculation

```
POST   /api/pricing/calculate
       Body: PriceCalculationRequest
       Returns: PriceCalculationResult
```

### Pricing Calendar

```
GET    /api/pricing/calendar
       Query: year, month, serviceId
       Returns: PricingCalendar
```

### Holidays

```
GET    /api/pricing/holidays
       Query: year (optional)
       Returns: Holiday[]

POST   /api/pricing/holidays
       Body: Partial<Holiday>
       Returns: Holiday

PUT    /api/pricing/holidays/:id
       Body: Partial<Holiday>
       Returns: Holiday

DELETE /api/pricing/holidays/:id
       Returns: void
```

### Analytics

```
GET    /api/pricing/stats
       Query: ruleId (optional)
       Returns: PricingRuleStats[]

GET    /api/pricing/insights
       Query: startDate, endDate, serviceId
       Returns: PricingInsights
```

### Automated Pricing

```
GET    /api/pricing/automated
       Returns: AutomatedPriceAdjustment

PUT    /api/pricing/automated
       Body: Partial<AutomatedPriceAdjustment>
       Returns: AutomatedPriceAdjustment
```

## Testing

### Unit Tests

Run tests:
```bash
npm test -- dynamicPricingService.test
```

**Test Coverage (33 passing tests):**
- ✅ Season detection (4 tests)
- ✅ Holiday checking (2 tests)
- ✅ Days in advance calculation (3 tests)
- ✅ Percentage adjustments (2 tests)
- ✅ Fixed adjustments (1 test)
- ✅ Total adjustment calculation (3 tests)
- ✅ Final price calculation (2 tests)
- ✅ Price change formatting (3 tests)
- ✅ Rule validation (4 tests)
- ✅ Rule sorting (2 tests)
- ✅ Rule filtering (1 test)
- ✅ Adjustment colors (3 tests)
- ✅ Business rules (4 tests)

## Examples

### Example 1: Summer Weekend Booking

**Scenario:**
- Base price: $100/night
- Date: July 15-20, 2025 (Summer, includes weekend)
- Booked: June 1, 2025 (45 days in advance)
- Occupancy: 85%

**Applied Rules:**
1. Summer surcharge: +20% = $20
2. Weekend surcharge: +15% = $15
3. High occupancy: +25% = $25
4. Early bird discount: -10% = -$10

**Final Price:** $150/night

### Example 2: Last-Minute Booking

**Scenario:**
- Base price: $100/night
- Date: November 1-3, 2025
- Booked: October 30, 2025 (1 day in advance)
- Occupancy: 45%

**Applied Rules:**
1. Last-minute discount: -15% = -$15

**Final Price:** $85/night

### Example 3: Holiday Booking

**Scenario:**
- Base price: $100/night
- Date: December 24-26, 2025 (Christmas)
- Booked: September 1, 2025
- Occupancy: 95%

**Applied Rules:**
1. Winter season: +10% = $10
2. Holiday surcharge: +30% = $30
3. High occupancy: +25% = $25
4. Early bird discount: -10% = -$10

**Final Price:** $155/night

## Best Practices

### For Administrators

1. **Set Clear Priorities**
   - Capacity-based should be highest
   - Seasonal next
   - Time-based after
   - Discounts lowest

2. **Test Before Activating**
   - Use preview/calculation tools
   - Verify expected results
   - Check edge cases

3. **Monitor Performance**
   - Review pricing stats
   - Track revenue impact
   - Adjust as needed

4. **Communicate Changes**
   - Notify customers of pricing
   - Explain peak periods
   - Highlight discount opportunities

5. **Avoid Over-Pricing**
   - Set maximum limits
   - Consider competition
   - Balance revenue vs occupancy

### For Developers

1. **Always Apply Rules in Priority Order**
2. **Validate All Inputs**
3. **Handle Edge Cases** (zero capacity, past dates)
4. **Log All Calculations** for debugging
5. **Test Thoroughly** with various scenarios

## Future Enhancements

### Potential Features

1. **Machine Learning**
   - Predict optimal pricing
   - Historical demand analysis
   - Automatic rule suggestions

2. **Competitor Pricing**
   - Market rate monitoring
   - Automatic adjustments
   - Competitive positioning

3. **Customer Segmentation**
   - VIP pricing
   - Loyalty tier pricing
   - First-time customer discounts

4. **A/B Testing**
   - Test pricing strategies
   - Measure conversion rates
   - Optimize revenue

5. **Revenue Forecasting**
   - Predict future revenue
   - Scenario modeling
   - What-if analysis

## Support

For questions or issues:
- Check this documentation
- Review test files for examples
- Contact development team

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
**Status:** Frontend Complete, Backend Pending
**Test Coverage:** 33 passing tests
