# Multi-Pet Suite Bookings System

## Overview

The Multi-Pet Suite Bookings System allows pet resorts to maximize revenue and improve customer experience by enabling multiple pets from the same family to share a suite. The system includes configurable capacity, flexible pricing models, compatibility checks, and visual occupancy indicators.

## Features

### ✅ Implemented Features

1. **Configurable Suite Capacity**
   - 5 capacity types (Single, Double, Family, Group, Custom)
   - Per-suite maximum pet limits
   - Size/space requirements
   - Active/inactive management

2. **Flexible Pricing Models** (4 Types)
   - Per-pet pricing
   - Flat rate pricing
   - Tiered pricing
   - Percentage-off pricing

3. **Compatibility Checks**
   - Same owner requirements
   - Size compatibility
   - Age compatibility
   - Health requirements
   - Temperament checks

4. **Occupancy Management**
   - Real-time occupancy tracking
   - Visual indicators
   - Availability checking
   - Capacity status display

5. **Admin Configuration UI**
   - Suite capacity management
   - Pricing configuration
   - General settings
   - Form validation

6. **Customer Pricing Display**
   - Automatic calculation
   - Pricing breakdown
   - Savings display
   - Per-pet average

---

## Architecture

### Components

```
frontend/src/
├── types/
│   └── multiPet.ts                    # Type definitions
├── services/
│   └── multiPetService.ts             # Business logic & API
├── pages/
│   └── admin/
│       └── SuiteCapacity.tsx          # Admin configuration
└── components/
    └── multiPet/
        └── MultiPetPricingDisplay.tsx # Customer display
```

### Data Models

#### SuiteCapacity

```typescript
interface SuiteCapacity {
  id: string;
  suiteType: string;           // e.g., 'STANDARD', 'DELUXE', 'LUXURY'
  capacityType: SuiteCapacityType;
  maxPets: number;
  pricingType: MultiPetPricingType;
  basePrice: number;
  additionalPetPrice?: number;
  tieredPricing?: TieredPricing[];
  percentageOff?: number;
  isActive: boolean;
}
```

#### MultiPetReservation

```typescript
interface MultiPetReservation {
  id: string;
  reservationId: string;
  suiteId: string;
  customerId: string;
  pets: PetInSuite[];
  totalPets: number;
  suiteCapacity: number;
  occupancyPercentage: number;
  basePrice: number;
  additionalPetCharges: number;
  totalPrice: number;
  pricingBreakdown: PricingBreakdown[];
  compatibilityChecked: boolean;
  status: string;
}
```

---

## Usage

### Admin Configuration

#### 1. Create Suite Capacity

```typescript
await multiPetService.createSuiteCapacity({
  suiteType: 'DELUXE',
  capacityType: 'FAMILY',
  maxPets: 4,
  pricingType: 'TIERED',
  basePrice: 80,
  tieredPricing: [
    { minPets: 1, maxPets: 1, price: 80, description: 'Single pet' },
    { minPets: 2, maxPets: 2, price: 140, description: 'Two pets' },
    { minPets: 3, maxPets: 3, price: 190, description: 'Three pets' },
    { minPets: 4, maxPets: 4, price: 230, description: 'Four pets' }
  ],
  isActive: true
});
```

### Customer Operations

#### 1. Calculate Multi-Pet Pricing

```typescript
const calculation = multiPetService.calculatePricingLocal(
  suiteCapacity,
  numberOfPets,
  pets
);

console.log(calculation);
// {
//   totalPrice: 140,
//   perPetCost: 70,
//   savings: 20,
//   savingsPercentage: 12.5,
//   breakdown: [...]
// }
```

#### 2. Check Pet Compatibility

```typescript
const compatibility = multiPetService.checkCompatibilityLocal(
  pets,
  requireSameOwner
);

console.log(compatibility);
// {
//   isCompatible: true,
//   issues: [],
//   warnings: [...],
//   recommendations: [...]
// }
```

---

## Capacity Types

### 1. SINGLE

**Description**: One pet only

**Configuration:**
```typescript
{
  capacityType: 'SINGLE',
  maxPets: 1
}
```

**Use Cases:**
- Premium suites
- Pets requiring isolation
- Special needs pets

---

### 2. DOUBLE

**Description**: Two pets maximum

**Configuration:**
```typescript
{
  capacityType: 'DOUBLE',
  maxPets: 2,
  pricingType: 'PER_PET',
  basePrice: 50,
  additionalPetPrice: 40
}
```

**Use Cases:**
- Standard family bookings
- Two-pet households
- Most common configuration

**Pricing Example:**
- 1 pet: $50
- 2 pets: $90 ($50 + $40)

---

### 3. FAMILY

**Description**: 3-4 pets from same family

**Configuration:**
```typescript
{
  capacityType: 'FAMILY',
  maxPets: 4,
  pricingType: 'TIERED',
  tieredPricing: [
    { minPets: 1, maxPets: 1, price: 80 },
    { minPets: 2, maxPets: 2, price: 140 },
    { minPets: 3, maxPets: 3, price: 190 },
    { minPets: 4, maxPets: 4, price: 230 }
  ]
}
```

**Use Cases:**
- Large families
- Multi-pet households
- Group discounts

---

### 4. GROUP

**Description**: 5+ pets from same family

**Configuration:**
```typescript
{
  capacityType: 'GROUP',
  maxPets: 6,
  pricingType: 'PERCENTAGE_OFF',
  basePrice: 120,
  additionalPetPrice: 100,
  percentageOff: 10
}
```

**Use Cases:**
- Very large families
- Breeders
- Special events

**Pricing Example:**
- 1 pet: $120
- 2 pets: $210 ($120 + $90)
- 3 pets: $300 ($120 + $90 + $90)

---

### 5. CUSTOM

**Description**: Custom capacity configuration

**Configuration:**
```typescript
{
  capacityType: 'CUSTOM',
  maxPets: 8, // Or any number
  pricingType: 'FLAT_RATE',
  basePrice: 300
}
```

**Use Cases:**
- Special arrangements
- Unique suite configurations
- Custom business needs

---

## Pricing Models

### 1. PER_PET

**Description**: Charge per pet with different rates

**Configuration:**
```typescript
{
  pricingType: 'PER_PET',
  basePrice: 50,        // First pet
  additionalPetPrice: 40 // Each additional pet
}
```

**Calculation:**
```typescript
// 1 pet: $50
// 2 pets: $50 + $40 = $90
// 3 pets: $50 + $40 + $40 = $130
```

**Use Cases:**
- Simple pricing structure
- Clear per-pet costs
- Easy to understand

---

### 2. FLAT_RATE

**Description**: Same price regardless of number of pets

**Configuration:**
```typescript
{
  pricingType: 'FLAT_RATE',
  basePrice: 150 // Same for 1-4 pets
}
```

**Calculation:**
```typescript
// 1 pet: $150
// 2 pets: $150
// 3 pets: $150
// 4 pets: $150
```

**Use Cases:**
- Encourage multi-pet bookings
- Simplify pricing
- Maximize occupancy

---

### 3. TIERED

**Description**: Different price tiers based on pet count

**Configuration:**
```typescript
{
  pricingType: 'TIERED',
  tieredPricing: [
    { minPets: 1, maxPets: 1, price: 80 },
    { minPets: 2, maxPets: 2, price: 140 },
    { minPets: 3, maxPets: 3, price: 190 },
    { minPets: 4, maxPets: 4, price: 230 }
  ]
}
```

**Calculation:**
```typescript
// 1 pet: $80
// 2 pets: $140 (not $160)
// 3 pets: $190 (not $240)
// 4 pets: $230 (not $320)
```

**Use Cases:**
- Volume discounts
- Encourage larger bookings
- Competitive pricing

---

### 4. PERCENTAGE_OFF

**Description**: Percentage discount on additional pets

**Configuration:**
```typescript
{
  pricingType: 'PERCENTAGE_OFF',
  basePrice: 120,
  additionalPetPrice: 100,
  percentageOff: 10 // 10% off each additional pet
}
```

**Calculation:**
```typescript
// 1 pet: $120
// 2 pets: $120 + ($100 - 10%) = $120 + $90 = $210
// 3 pets: $120 + $90 + $90 = $300
```

**Use Cases:**
- Reward multi-pet families
- Flexible discounting
- Competitive advantage

---

## Compatibility Rules

### 1. Same Owner Required

**Purpose**: Ensure all pets belong to same customer

**Configuration:**
```typescript
{
  requireSameOwner: true
}
```

**Validation:**
- Checks customer ID for all pets
- Prevents mixing different families
- Ensures proper responsibility

---

### 2. Size Compatibility

**Purpose**: Ensure pets are similar in size

**Configuration:**
```typescript
{
  allowMixedSizes: true,
  maxSizeDifference: 'MEDIUM'
}
```

**Checks:**
- Small + Medium: ✅ OK
- Small + Large: ⚠️ Warning
- Small + Extra Large: ❌ Not recommended

---

### 3. Age Compatibility

**Purpose**: Consider age differences

**Configuration:**
```typescript
{
  allowPuppies: true,
  allowSeniors: true,
  minAgeMonths: 4
}
```

**Checks:**
- Puppies (<12 months) with seniors (>7 years): ⚠️ Warning
- Very young puppies (<4 months): ❌ May require separate care

---

### 4. Health Requirements

**Purpose**: Ensure all pets are healthy

**Configuration:**
```typescript
{
  requireVaccinations: true,
  excludeSickPets: true
}
```

**Checks:**
- Vaccination records up to date
- No current illnesses
- Special medical needs noted

---

### 5. Temperament Checks

**Purpose**: Ensure pets are compatible

**Configuration:**
```typescript
{
  requireFriendlyTemperament: true,
  excludeAggressivePets: true
}
```

**Checks:**
- Friendly/social temperament
- No aggression history
- Good with other pets

---

## API Endpoints

### Configuration

```
GET    /api/multi-pet/config
PUT    /api/multi-pet/config
```

### Suite Capacities

```
GET    /api/multi-pet/capacities
POST   /api/multi-pet/capacities
PUT    /api/multi-pet/capacities/:id
DELETE /api/multi-pet/capacities/:id
```

### Pricing

```
POST   /api/multi-pet/calculate-pricing
```

### Compatibility

```
POST   /api/multi-pet/check-compatibility
```

### Occupancy

```
GET    /api/multi-pet/occupancy/:suiteId
GET    /api/multi-pet/occupancies
POST   /api/multi-pet/check-availability
```

### Reservations

```
POST   /api/multi-pet/reservations
GET    /api/multi-pet/reservations/:id
PUT    /api/multi-pet/reservations/:id
```

---

## Testing

### Unit Tests

Run tests:
```bash
npm test -- multiPetService.test
```

**Test Coverage (34 passing tests):**
- ✅ PER_PET pricing (3 tests)
- ✅ FLAT_RATE pricing (2 tests)
- ✅ TIERED pricing (4 tests)
- ✅ PERCENTAGE_OFF pricing (2 tests)
- ✅ Compatibility checks (4 tests)
- ✅ Occupancy calculations (3 tests)
- ✅ Helper functions (10 tests)
- ✅ Validation (6 tests)

---

## Examples

### Example 1: Double Suite (Per-Pet Pricing)

**Configuration:**
- Suite Type: STANDARD
- Max Pets: 2
- Pricing: PER_PET
- Base: $50, Additional: $40

**Booking 2 Pets:**
```typescript
Total: $90
Breakdown:
  - First pet (Max): $50
  - Additional pet (Buddy): $40
Per-pet average: $45
```

---

### Example 2: Family Suite (Tiered Pricing)

**Configuration:**
- Suite Type: DELUXE
- Max Pets: 4
- Pricing: TIERED

**Booking 3 Pets:**
```typescript
Total: $190 (tier price)
Standard would be: $240 (3 × $80)
Savings: $50 (20.8% off)
Per-pet average: $63.33
```

---

### Example 3: Group Suite (Percentage-Off)

**Configuration:**
- Suite Type: LUXURY
- Max Pets: 6
- Pricing: PERCENTAGE_OFF (10%)

**Booking 4 Pets:**
```typescript
Total: $390
Breakdown:
  - First pet: $120
  - Additional pet 2: $90 (10% off $100)
  - Additional pet 3: $90
  - Additional pet 4: $90
Standard would be: $480 (4 × $120)
Savings: $90 (18.75% off)
```

---

## Best Practices

### For Administrators

1. **Start Simple**
   - Begin with DOUBLE capacity
   - Use PER_PET pricing
   - Add complexity as needed

2. **Price Strategically**
   - Ensure multi-pet bookings are profitable
   - Offer meaningful discounts
   - Consider operational costs

3. **Monitor Occupancy**
   - Track suite utilization
   - Adjust capacity as needed
   - Optimize pricing based on demand

4. **Enforce Compatibility**
   - Always require same owner
   - Check pet sizes
   - Verify health records

5. **Communicate Clearly**
   - Explain pricing models
   - Show savings prominently
   - Set clear expectations

### For Developers

1. **Always Validate**
2. **Handle Edge Cases**
3. **Test Thoroughly**
4. **Log Calculations**
5. **Document Pricing**

---

## Future Enhancements

### Potential Features

1. **Advanced Compatibility**
   - Breed-specific rules
   - Play style matching
   - Dietary compatibility

2. **Dynamic Pricing**
   - Demand-based pricing
   - Seasonal adjustments
   - Last-minute discounts

3. **Visual Suite Maps**
   - Interactive floor plans
   - Real-time occupancy
   - Pet location tracking

4. **Family Profiles**
   - Pre-approved pet groups
   - Saved preferences
   - Booking history

5. **Analytics**
   - Occupancy reports
   - Revenue optimization
   - Capacity utilization

---

**Last Updated:** October 25, 2025
**Version:** 1.0.0
**Status:** Frontend Complete, Backend Pending
**Test Coverage:** 34 passing tests
