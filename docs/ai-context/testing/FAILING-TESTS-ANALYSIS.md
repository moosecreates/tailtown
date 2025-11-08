# Failing Tests Analysis & Rewrite Plan

## Overview
These tests are failing because the UI components have been redesigned. This document catalogs what each test suite is meant to test, so we can rewrite them for the current implementation.

## Failing Test Suites (9 total, 66 tests)

### 1. BelongingsForm.test.tsx
**Location:** `components/check-in/__tests__/BelongingsForm.test.tsx`
**Purpose:** Test the belongings inventory form during pet check-in
**What it should test:**
- Rendering empty state
- Quick-add buttons for common items (collar, leash, toy, bedding, food, bowl, medication)
- Adding custom belongings
- Editing belonging fields (description, quantity, color)
- Removing belongings
- Form validation

**Current Issues:** Form structure changed, field names/selectors outdated
**Failures:** 4 tests

---

### 2. StaffScheduleForm.test.tsx
**Location:** `components/staff/__tests__/StaffScheduleForm.test.tsx`
**Purpose:** Test staff scheduling and availability management
**What it should test:**
- Creating new schedule entries
- Editing existing schedules
- Deleting schedules
- Detecting time slot overlaps
- Validating schedule conflicts
- Handling recurring schedules

**Current Issues:** Overlap detection logic changed, form structure updated
**Failures:** 7 tests

---

### 3. UpcomingClasses.test.tsx
**Location:** `components/dashboard/__tests__/UpcomingClasses.test.tsx`
**Purpose:** Test the training classes display and enrollment
**What it should test:**
- Displaying class information (name, date, time, instructor)
- Enrollment dialog functionality
- Customer/pet selection
- Payment processing
- Class capacity limits
- Enrollment confirmation

**Current Issues:** UI redesigned, enrollment flow changed
**Failures:** ~10 tests

---

### 4. TenantStatusManager.test.tsx
**Location:** `components/super-admin/__tests__/TenantStatusManager.test.tsx`
**Purpose:** Test super admin tenant management controls
**What it should test:**
- Displaying tenant status
- Suspend tenant functionality
- Activate tenant functionality
- Delete tenant functionality
- Restore deleted tenant
- Status change confirmations

**Current Issues:** Admin controls redesigned, button labels changed
**Failures:** ~8 tests

---

### 5. ReservationForm.test.tsx
**Location:** `components/reservations/__tests__/ReservationForm.test.tsx`
**Purpose:** Test the main reservation creation/editing form
**What it should test:**
- Customer selection
- Pet selection
- Service selection
- Date range selection
- Add-ons selection
- Price calculation
- Form submission
- Validation errors

**Current Issues:** Form structure completely redesigned
**Failures:** ~12 tests

---

### 6. ReservationForm.validation.test.tsx
**Location:** `components/reservations/__tests__/ReservationForm.validation.test.tsx`
**Purpose:** Test reservation form validation rules
**What it should test:**
- Required field validation
- Date range validation
- Check-in before check-out
- Minimum stay requirements
- Maximum advance booking
- Pet selection requirements
- Service selection requirements

**Current Issues:** Validation logic changed
**Failures:** ~5 tests

---

### 7. GroomerSelector.test.tsx
**Location:** `components/reservations/__tests__/GroomerSelector.test.tsx`
**Purpose:** Test groomer selection for grooming appointments
**What it should test:**
- Displaying available groomers
- Filtering by availability
- Selecting preferred groomer
- Handling no groomers available
- Groomer schedule display

**Current Issues:** Component redesigned
**Failures:** ~5 tests

---

### 8. GroomerAvailability.test.tsx
**Location:** `components/reservations/__tests__/GroomerAvailability.test.tsx`
**Purpose:** Test groomer availability checking
**What it should test:**
- Checking groomer availability for date/time
- Displaying available time slots
- Handling fully booked groomers
- Concurrent appointment handling
- Break time handling

**Current Issues:** Availability logic changed
**Failures:** ~5 tests

---

### 9. TrainingClasses.validation.test.tsx
**Location:** `pages/training/__tests__/TrainingClasses.validation.test.tsx`
**Purpose:** Test training class creation/editing validation
**What it should test:**
- Class name validation
- Date/time validation
- Capacity validation
- Instructor assignment
- Pricing validation
- Recurring class setup

**Current Issues:** Validation rules changed
**Failures:** ~10 tests

---

## Rewrite Strategy

For each test suite:
1. **Examine current component** - Understand actual UI structure
2. **Identify core functionality** - What actually needs testing
3. **Rewrite tests** - Use current selectors, structure, and logic
4. **Focus on behavior** - Test what users do, not implementation details
5. **Keep tests simple** - One assertion per test when possible

## Priority Order

1. **High Priority** (Core business logic):
   - ReservationForm (main booking flow)
   - ReservationForm.validation (booking rules)
   - StaffScheduleForm (scheduling conflicts)

2. **Medium Priority** (Important features):
   - BelongingsForm (check-in process)
   - GroomerSelector/GroomerAvailability (grooming bookings)

3. **Lower Priority** (Admin/special features):
   - UpcomingClasses (training feature)
   - TrainingClasses.validation (training admin)
   - TenantStatusManager (super admin only)
