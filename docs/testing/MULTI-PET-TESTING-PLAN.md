# Multi-Pet Room Check-in Testing Plan

**Date**: November 20, 2025  
**Environment**: dev.canicloud.com (Development)  
**Tester**: Rob Weinstein  
**Status**: In Progress

---

## Overview

This document outlines the testing plan for multi-pet room check-in functionality. The goal is to ensure that multiple pets can be properly managed in a single reservation with correct billing, capacity validation, and kennel card generation.

---

## Test Scenarios

### 1. Multiple Pets in Same Reservation

#### Test Case 1.1: Create Reservation with 2 Pets
**Steps**:
1. Navigate to Reservations → New Reservation
2. Select a customer with multiple pets
3. Select 2 pets for the same reservation
4. Choose service type (BOARDING)
5. Select dates (e.g., 3 nights)
6. Choose suite type (e.g., STANDARD_PLUS_SUITE for multi-pet)
7. Submit reservation

**Expected Result**:
- ✅ Reservation created successfully
- ✅ Both pets listed in reservation details
- ✅ Correct suite type assigned (multi-pet capable)
- ✅ Single reservation ID for both pets

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

#### Test Case 1.2: Create Reservation with 3+ Pets
**Steps**:
1. Select customer with 3 or more pets
2. Add all pets to same reservation
3. Complete reservation creation

**Expected Result**:
- ✅ System handles 3+ pets
- ✅ Appropriate suite assigned
- ✅ All pets visible in reservation

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

### 2. Room Capacity Validation

#### Test Case 2.1: Exceed Suite Capacity
**Steps**:
1. Create reservation with 2 pets
2. Try to assign to STANDARD_SUITE (single pet capacity)
3. Observe system behavior

**Expected Result**:
- ✅ System prevents assignment OR
- ✅ System warns about capacity OR
- ✅ System auto-assigns appropriate suite

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

#### Test Case 2.2: Verify Suite Capacity Rules
**Steps**:
1. Check suite capacity definitions in Resources
2. Verify STANDARD_SUITE = 1 pet
3. Verify STANDARD_PLUS_SUITE = 2 pets
4. Verify VIP_SUITE = 2+ pets

**Expected Result**:
- ✅ Capacity rules clearly defined
- ✅ System enforces capacity limits

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

### 3. Check-in Process for Multiple Pets

#### Test Case 3.1: Check-in 2 Pets Simultaneously
**Steps**:
1. Navigate to reservation with 2 pets
2. Click "Check In"
3. Complete check-in process
4. Verify both pets checked in

**Expected Result**:
- ✅ Single check-in action for all pets
- ✅ Both pets marked as checked in
- ✅ Check-in timestamp recorded for both
- ✅ Suite assignment confirmed

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

#### Test Case 3.2: Partial Check-in (if supported)
**Steps**:
1. Try to check in only 1 pet from 2-pet reservation
2. Observe system behavior

**Expected Result**:
- ✅ System handles partial check-in OR
- ✅ System requires all pets checked in together

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

### 4. Billing Accuracy

#### Test Case 4.1: Verify Per-Pet Pricing
**Steps**:
1. Create 2-pet reservation for 3 nights
2. Check invoice/pricing
3. Verify calculation

**Expected Calculation**:
```
Pet 1: $X per night × 3 nights = $3X
Pet 2: $X per night × 3 nights = $3X
Total: $6X (or discounted rate if applicable)
```

**Expected Result**:
- ✅ Each pet charged separately
- ✅ Correct nightly rate applied
- ✅ Multi-pet discount applied (if applicable)
- ✅ Total matches expected calculation

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Actual Total: $______
- [ ] Notes:

---

#### Test Case 4.2: Add-ons for Multiple Pets
**Steps**:
1. Add add-on service (e.g., bath) for Pet 1 only
2. Add different add-on (e.g., nail trim) for Pet 2
3. Verify billing

**Expected Result**:
- ✅ Add-ons correctly attributed to specific pets
- ✅ Separate line items in invoice
- ✅ Correct total calculation

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

### 5. Kennel Card Generation

#### Test Case 5.1: Generate Cards for 2 Pets
**Steps**:
1. Check in 2-pet reservation
2. Navigate to kennel cards
3. Generate/view kennel cards

**Expected Result**:
- ✅ Separate kennel card for each pet
- ✅ Each card shows correct pet information
- ✅ Each card shows shared reservation details
- ✅ Suite assignment visible on both cards

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

#### Test Case 5.2: Verify Card Information
**Check each card contains**:
- [ ] Pet name
- [ ] Pet photo
- [ ] Customer name
- [ ] Check-in date
- [ ] Check-out date
- [ ] Suite number/name
- [ ] Special instructions
- [ ] Feeding schedule
- [ ] Medications
- [ ] Emergency contact

**Actual Result**:
- [ ] Pass
- [ ] Fail
- [ ] Notes:

---

## Edge Cases to Test

### Edge Case 1: Different Service Types
- Can 2 pets have different services in same reservation?
- Example: Pet 1 = BOARDING, Pet 2 = DAYCARE

### Edge Case 2: Different Check-out Dates
- Can pets in same reservation have different check-out dates?
- How does billing handle this?

### Edge Case 3: One Pet Cancellation
- What happens if one pet is removed from reservation?
- Does suite assignment change?
- How is billing adjusted?

### Edge Case 4: Suite Upgrade/Downgrade
- Can suite be changed after reservation created?
- Does system validate new suite capacity?

---

## Issues Found

### Issue #1: Cannot Assign Multiple Pets to Same Suite
**Severity**: High  
**Status**: Confirmed - Needs Implementation  
**Date Found**: November 20, 2025

**Description**:  
The reservation system prevents assigning multiple pets to the same kennel/suite, even for multi-pet capable suites (VIP_SUITE, STANDARD_PLUS_SUITE). Each pet must be assigned to a separate kennel, which doesn't support true family suites.

**Steps to Reproduce**:  
1. Create reservation with 2 pets (Bunny and Charlie Brown)
2. Select "Boarding | Indoor Suite" service
3. Try to assign both pets to kennel A03R
4. System marks A03R as "Selected for another pet" and prevents selection

**Expected Behavior**:  
- VIP_SUITE and STANDARD_PLUS_SUITE should allow 2+ pets in the same physical suite
- System should validate capacity (e.g., VIP = 2 pets max, STANDARD_PLUS = 2 pets max)
- Single kennel assignment for multiple pets from same family

**Actual Behavior**:  
- System prevents selecting the same kennel for multiple pets
- Each pet requires a separate kennel assignment
- No capacity-based multi-pet suite support

**Root Cause**:  
Frontend code in `ReservationForm.tsx` (lines ~1402-1411) disables suite options that are already assigned to another pet in the same booking:
```typescript
getOptionDisabled={(option) => {
  if (!option.id) return false;
  const isAssignedToOtherPet = Object.entries(petSuiteAssignments).some(
    ([assignedPetId, assignedSuiteId]) => 
      assignedPetId !== petId && assignedSuiteId === option.id
  );
  const isOccupied = occupiedSuiteIds.has(option.id);
  return isAssignedToOtherPet || isOccupied;
}}
```

**Proposed Solution**:  
1. Add suite capacity metadata to Resource model (maxPets field)
2. Modify frontend logic to allow same suite selection if capacity permits
3. Add capacity validation in backend reservation controller
4. Update UI to show capacity indicators (e.g., "VIP Suite - 2 pets max")

**Impact**:  
- Blocks true multi-pet family suite functionality
- Forces customers to book multiple adjacent kennels instead of one family suite
- Affects pricing and customer experience

**Priority**: High - Core feature for multi-pet reservations

**Screenshots**: See images in testing session  

---

## Test Summary

**Total Test Cases**: 11  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___  

**Overall Status**: ⏳ In Progress / ✅ Complete / ❌ Failed

---

## Recommendations

1. 
2. 
3. 

---

## Next Steps

1. Complete all test cases
2. Document any bugs found
3. Create GitHub issues for failures
4. Update roadmap based on findings
5. Determine if feature is production-ready

---

**Tested By**: _________________  
**Date Completed**: _________________  
**Sign-off**: _________________
