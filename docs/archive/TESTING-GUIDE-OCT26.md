# Testing Guide - October 26, 2025 Features
**Date:** October 26, 2025  
**Status:** Ready for Testing  
**Version:** 1.0

---

## 🎯 Overview

This guide covers testing for all features implemented on October 26, 2025:
1. Training Enrollment Enhancements
2. Payment Methods Settings
3. Dashboard & Widget Improvements
4. LTV Metrics in Reports
5. Tax Report Fixes
6. Taxable Toggle for Services/Products

---

## 🔧 Prerequisites

### Database Migrations
```bash
# Already applied - verify with:
cd services/customer
source ~/.nvm/nvm.sh && npx prisma migrate status

cd services/reservation-service
source ~/.nvm/nvm.sh && npx prisma migrate status
```

### Services Running
- Frontend: http://localhost:3000
- Customer Service: http://localhost:4004
- Reservation Service: http://localhost:4003
- PostgreSQL: localhost:5433

---

## 📋 Test Cases

### 1. Training Enrollment with Customer Search

#### Test 1.1: Open Enrollment Dialog
**Steps:**
1. Navigate to Training Calendar page
2. Locate "Upcoming Training Classes" widget
3. Find a class with available spots
4. Click "Enroll Pet" button

**Expected:**
- ✅ Enrollment dialog opens
- ✅ Customer search field is visible
- ✅ Pet dropdown is disabled (no customer selected)
- ✅ Amount is pre-filled with class price

#### Test 1.2: Customer Search
**Steps:**
1. Click in "Search Customer" field
2. Type a customer name (e.g., "John")
3. Select a customer from dropdown

**Expected:**
- ✅ Autocomplete shows matching customers
- ✅ Customer details visible (name, email, phone)
- ✅ Pet dropdown becomes enabled
- ✅ Pets load for selected customer

#### Test 1.3: Complete Enrollment (Cash)
**Steps:**
1. Select customer
2. Select pet
3. Keep payment method as "Cash"
4. Verify amount
5. Click "Complete Enrollment & Payment"

**Expected:**
- ✅ Enrollment processes successfully
- ✅ Dialog closes
- ✅ Class list refreshes
- ✅ Enrollment count increases

#### Test 1.4: Credit Card Payment Dialog
**Steps:**
1. Select customer and pet
2. Change payment method to "Credit Card"
3. Click "Complete Enrollment & Payment"

**Expected:**
- ✅ Credit card payment dialog opens
- ✅ Payment summary shows customer, pet, class
- ✅ Amount to charge is correct
- ✅ "Demo Mode" alert is visible

#### Test 1.5: Process Credit Card Payment
**Steps:**
1. In credit card dialog, click "Process Payment"
2. Wait for processing (2 seconds)

**Expected:**
- ✅ Button shows "Processing..."
- ✅ Button is disabled during processing
- ✅ Dialog cannot be closed during processing
- ✅ After 2 seconds, enrollment completes
- ✅ Both dialogs close
- ✅ Class list refreshes

#### Test 1.6: Validation
**Steps:**
1. Open enrollment dialog
2. Try to submit without selecting customer
3. Select customer, try to submit without pet
4. Set amount to $0

**Expected:**
- ✅ Error: "Please select both customer and pet"
- ✅ Submit button disabled until both selected
- ✅ Error: "Payment amount must be greater than zero"

---

### 2. Payment Methods Settings

#### Test 2.1: Navigate to Settings
**Steps:**
1. Go to Admin panel
2. Find "Payment Methods" card
3. Click to open

**Expected:**
- ✅ Payment Methods page loads
- ✅ Shows 3 methods: Cash, Check, Credit Card
- ✅ Summary shows "Active Methods: 3"

#### Test 2.2: Toggle Payment Methods
**Steps:**
1. Toggle "Check" to OFF
2. Click "Save Changes"
3. Toggle back to ON

**Expected:**
- ✅ Toggle switches work
- ✅ Success message appears
- ✅ Settings persist

#### Test 2.3: CardConnect Configuration
**Steps:**
1. Click "Configure" on Credit Card method
2. Configuration panel expands
3. Enter test credentials:
   - Merchant ID: TEST123
   - API Username: testuser
   - API Password: testpass
4. Toggle "Test Mode" ON
5. Click "Save Configuration"

**Expected:**
- ✅ Configuration panel expands/collapses
- ✅ All fields are editable
- ✅ Password field is masked
- ✅ Success message on save
- ✅ Status changes to "Configured"

---

### 3. Dashboard & Widget Improvements

#### Test 3.1: Dashboard Layout
**Steps:**
1. Navigate to Dashboard
2. Observe layout

**Expected:**
- ✅ No training/grooming widgets visible
- ✅ More space for reservation list
- ✅ Clean, focused interface

#### Test 3.2: Training Calendar Widget
**Steps:**
1. Navigate to Training Calendar page
2. Observe widget above calendar

**Expected:**
- ✅ "Upcoming Training Classes" widget visible
- ✅ Shows up to 6 classes
- ✅ Two-column layout on desktop
- ✅ Single column on mobile
- ✅ Times in 12-hour format (e.g., "6:00 PM")

#### Test 3.3: Widget Responsiveness
**Steps:**
1. Resize browser window
2. Test mobile, tablet, desktop sizes

**Expected:**
- ✅ Mobile (<960px): 1 column
- ✅ Desktop (≥960px): 2 columns
- ✅ All content readable at all sizes

---

### 4. Admin Panel Compression

#### Test 4.1: Admin Panel Layout
**Steps:**
1. Navigate to Admin panel (/settings)
2. Observe card layout

**Expected:**
- ✅ Compact card design
- ✅ Mobile: 1 column
- ✅ Small (≥600px): 2 columns
- ✅ Medium (≥900px): 3 columns
- ✅ Large (≥1200px): 4 columns
- ✅ All cards clickable
- ✅ Hover effects work

---

### 5. LTV Metrics in Reports

#### Test 5.1: Customer Value Report
**Steps:**
1. Navigate to Analytics > Customer Value Report
2. Select time period
3. Observe metrics

**Expected:**
- ✅ "Avg. Customer Value" card shows value
- ✅ "Avg. LTV" card shows lifetime value
- ✅ Table has "Period Spend" column
- ✅ Table has "LTV" column
- ✅ LTV shows total lifetime value per customer

#### Test 5.2: Lifetime Value Report
**Steps:**
1. Navigate to Reports > Customer Reports
2. Select "Lifetime Value" report type
3. Click "GENERATE REPORT"

**Expected:**
- ✅ "Average LTV" shows calculated value (not $0.00)
- ✅ "Total LTV" shows sum of all customer values
- ✅ "Top Customers" shows count
- ✅ Table shows customer spending data

---

### 6. Tax Report Fixes

#### Test 6.1: Tax Report Calculation
**Steps:**
1. Navigate to Reports > Tax Reports
2. Select period (e.g., "This Month")
3. Click "GENERATE REPORT"

**Expected:**
- ✅ "Total Revenue" shows correct sum
- ✅ "Taxable Revenue" shows taxable amount
- ✅ "Tax Collected" shows tax amount
- ✅ Total Revenue = Taxable + Non-taxable
- ✅ No $0.00 when data exists

---

### 7. Taxable Toggle Feature

#### Test 7.1: Service Taxable Toggle
**Steps:**
1. Navigate to Services
2. Edit an existing service
3. Locate "Taxable" toggle
4. Toggle OFF
5. Save service

**Expected:**
- ✅ "Taxable" toggle visible
- ✅ Appears before "Requires Staff"
- ✅ Defaults to ON for new services
- ✅ Can be toggled OFF
- ✅ Saves correctly

#### Test 7.2: Product Taxable Toggle
**Steps:**
1. Navigate to Products & POS
2. Click "Add Product"
3. Locate "Taxable" checkbox
4. Uncheck it
5. Fill other fields and save

**Expected:**
- ✅ "Taxable" checkbox visible
- ✅ Defaults to checked
- ✅ Can be unchecked
- ✅ Saves correctly

#### Test 7.3: Tax Calculation with Non-Taxable Items
**Steps:**
1. Create a non-taxable service
2. Create a reservation with that service
3. Complete checkout
4. Check invoice

**Expected:**
- ✅ Non-taxable service shows no tax
- ✅ Taxable items still have tax
- ✅ Tax total is correct
- ✅ Invoice breakdown is accurate

---

## 🐛 Known Issues

### Issue 1: CardConnect Integration
**Status:** Placeholder only  
**Impact:** Credit card payments are simulated  
**Workaround:** Use Cash or Check for real transactions  
**Fix:** Implement CardConnect SDK (planned)

### Issue 2: Payment Method Backend
**Status:** Frontend only  
**Impact:** Settings don't persist to database  
**Workaround:** Settings stored in component state  
**Fix:** Create backend API (planned)

---

## ✅ Test Results Template

```
Date: ___________
Tester: ___________

Training Enrollment:
[ ] Test 1.1 - Open Dialog
[ ] Test 1.2 - Customer Search
[ ] Test 1.3 - Cash Payment
[ ] Test 1.4 - Credit Card Dialog
[ ] Test 1.5 - Process Payment
[ ] Test 1.6 - Validation

Payment Methods:
[ ] Test 2.1 - Navigate
[ ] Test 2.2 - Toggle Methods
[ ] Test 2.3 - CardConnect Config

Dashboard & Widgets:
[ ] Test 3.1 - Dashboard Layout
[ ] Test 3.2 - Training Widget
[ ] Test 3.3 - Responsiveness

Admin Panel:
[ ] Test 4.1 - Compressed Layout

Reports:
[ ] Test 5.1 - Customer Value
[ ] Test 5.2 - Lifetime Value
[ ] Test 6.1 - Tax Report

Taxable Toggle:
[ ] Test 7.1 - Service Toggle
[ ] Test 7.2 - Product Toggle
[ ] Test 7.3 - Tax Calculation

Issues Found:
_________________________________
_________________________________
_________________________________
```

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all services are running
3. Check database migrations are applied
4. Review this testing guide
5. Contact development team

---

**Last Updated:** October 26, 2025 8:22 PM  
**Next Review:** After production deployment
