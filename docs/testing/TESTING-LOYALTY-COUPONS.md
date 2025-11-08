# Loyalty Rewards & Coupons Testing Guide

**Date:** November 2, 2025  
**Status:** ⚠️ NEEDS TESTING  
**Priority:** Medium

---

## ✅ Features Confirmed to Exist

Based on codebase analysis, these features are implemented:

### **Loyalty System:**
- ✅ `loyaltyService.ts` - Loyalty service
- ✅ `loyalty.controller.ts` - Backend controller
- ✅ `LoyaltyProgram.tsx` - Admin page
- ✅ `CustomerLoyaltyDashboard.tsx` - Customer view
- ✅ Database schema includes loyalty tables

### **Coupon System:**
- ✅ `couponService.ts` - Coupon service
- ✅ `coupon.controller.ts` - Backend controller
- ✅ `CouponManagement.tsx` - Admin page
- ✅ `CouponInput.tsx` - Checkout component
- ✅ Database schema includes coupon tables

### **Price Rules:**
- ✅ `priceRule.controller.ts` - Backend controller
- ✅ `PriceRules.tsx` - Admin page
- ✅ Dynamic pricing integration

---

## 🧪 Testing Checklist

### **1. Loyalty Rewards System**

#### **Admin Functions:**
- [ ] Access loyalty program settings
  - Go to `/admin/loyalty-program`
  - Verify page loads without errors

- [ ] Configure loyalty program
  - Set points per dollar spent
  - Set reward tiers
  - Configure redemption rules

- [ ] View customer loyalty data
  - Check points balances
  - View transaction history
  - See tier levels

#### **Customer Functions:**
- [ ] View loyalty dashboard
  - Check points display
  - View available rewards
  - See redemption history

- [ ] Earn points
  - Make a reservation
  - Verify points are awarded
  - Check points calculation is correct

- [ ] Redeem points
  - Apply points to reservation
  - Verify discount applied
  - Check points deducted

#### **Edge Cases:**
- [ ] Test with zero points
- [ ] Test with insufficient points
- [ ] Test point expiration (if applicable)
- [ ] Test tier upgrades/downgrades

---

### **2. Coupon System**

#### **Admin Functions:**
- [ ] Access coupon management
  - Go to `/admin/coupons`
  - Verify page loads

- [ ] Create new coupon
  - Set coupon code
  - Set discount type (percentage/fixed)
  - Set discount amount
  - Set expiration date
  - Set usage limits
  - Save coupon

- [ ] Edit existing coupon
  - Modify settings
  - Save changes
  - Verify updates

- [ ] Delete/deactivate coupon
  - Deactivate coupon
  - Verify it can't be used

- [ ] View coupon usage
  - Check usage count
  - See who used it
  - View redemption history

#### **Customer Functions:**
- [ ] Apply coupon at checkout
  - Enter coupon code
  - Click "Apply"
  - Verify discount applied
  - Check total is correct

- [ ] Invalid coupon handling
  - Try expired coupon
  - Try invalid code
  - Try already-used one-time coupon
  - Verify error messages

#### **Coupon Types to Test:**
- [ ] Percentage discount (e.g., 20% off)
- [ ] Fixed amount discount (e.g., $10 off)
- [ ] Free service/add-on
- [ ] First-time customer discount
- [ ] Minimum purchase requirement

#### **Edge Cases:**
- [ ] Expired coupon
- [ ] Coupon with usage limit reached
- [ ] Multiple coupons (if allowed)
- [ ] Coupon + loyalty points together
- [ ] Case sensitivity of codes
- [ ] Special characters in codes

---

### **3. Price Rules**

#### **Admin Functions:**
- [ ] Access price rules
  - Go to `/admin/price-rules`
  - Verify page loads

- [ ] Create price rule
  - Set conditions
  - Set discount
  - Set date range
  - Save rule

- [ ] Test automatic application
  - Make reservation that matches rule
  - Verify discount auto-applies

---

## 📋 Test Scenarios

### **Scenario 1: New Customer with Coupon**
```
1. Create new customer account
2. Browse services
3. Add to cart
4. Apply coupon code: WELCOME20
5. Verify 20% discount applied
6. Complete checkout
7. Verify coupon marked as used
```

### **Scenario 2: Loyalty Points Redemption**
```
1. Login as existing customer with points
2. View loyalty dashboard
3. Note current points balance
4. Make a reservation
5. Apply points at checkout
6. Verify discount applied
7. Complete checkout
8. Verify points deducted
9. Check new balance
```

### **Scenario 3: Expired Coupon**
```
1. Create coupon with past expiration date
2. Try to apply at checkout
3. Verify error message shown
4. Verify discount NOT applied
```

### **Scenario 4: Coupon Usage Limit**
```
1. Create coupon with 1-time use limit
2. Apply and complete first order
3. Try to apply same coupon again
4. Verify error: "Coupon already used"
```

### **Scenario 5: Loyalty + Coupon Combo**
```
1. Customer with loyalty points
2. Add items to cart
3. Apply coupon code
4. Apply loyalty points
5. Verify both discounts applied correctly
6. Check final total is accurate
```

---

## 🔍 What to Check

### **Database Verification:**
```sql
-- Check loyalty tables exist
SELECT * FROM loyalty_programs LIMIT 1;
SELECT * FROM loyalty_transactions LIMIT 1;

-- Check coupon tables exist
SELECT * FROM coupons LIMIT 1;
SELECT * FROM coupon_usage LIMIT 1;

-- Check price rules
SELECT * FROM price_rules LIMIT 1;
```

### **API Endpoints:**
```bash
# Loyalty endpoints
GET /api/loyalty/program
GET /api/loyalty/customer/:id
POST /api/loyalty/redeem

# Coupon endpoints
GET /api/coupons
POST /api/coupons
POST /api/coupons/validate
POST /api/coupons/apply

# Price rules
GET /api/price-rules
POST /api/price-rules
```

### **Frontend Routes:**
```
/admin/loyalty-program
/admin/coupons
/admin/price-rules
/customer/loyalty (customer dashboard)
```

---

## 🐛 Common Issues to Watch For

### **Loyalty System:**
- Points not calculating correctly
- Points not deducting on redemption
- Tier upgrades not triggering
- Points expiring incorrectly
- Negative point balances

### **Coupon System:**
- Expired coupons still working
- Usage limits not enforced
- Case-sensitive codes
- Discount calculation errors
- Multiple coupons stacking incorrectly

### **Integration:**
- Coupons + loyalty points = wrong total
- Discounts not showing on invoice
- Tax calculation with discounts
- Refunds with coupons/points used

---

## 📊 Success Criteria

### **Loyalty System:**
- ✅ Points awarded correctly on purchases
- ✅ Points redeemable for discounts
- ✅ Points balance accurate
- ✅ Transaction history visible
- ✅ No negative balances
- ✅ Tier system working (if applicable)

### **Coupon System:**
- ✅ Coupons apply correct discount
- ✅ Expired coupons rejected
- ✅ Usage limits enforced
- ✅ Invalid codes show error
- ✅ Discount shows on invoice
- ✅ Admin can manage coupons

### **Overall:**
- ✅ No calculation errors
- ✅ No security issues
- ✅ Good user experience
- ✅ Clear error messages
- ✅ Audit trail exists

---

## 🚀 Quick Test Commands

### **Create Test Coupon (via API):**
```bash
curl -X POST http://localhost:4004/api/coupons \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: dev" \
  -d '{
    "code": "TEST20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "expirationDate": "2025-12-31",
    "usageLimit": 100,
    "isActive": true
  }'
```

### **Check Loyalty Points:**
```bash
curl http://localhost:4004/api/loyalty/customer/CUSTOMER_ID \
  -H "x-tenant-id: dev"
```

---

## 📝 Test Report Template

```markdown
## Loyalty & Coupon Testing Report

**Date:** ___________
**Tester:** ___________
**Environment:** Production/Staging/Dev

### Loyalty System
- [ ] Points accumulation: PASS/FAIL
- [ ] Points redemption: PASS/FAIL
- [ ] Dashboard display: PASS/FAIL
- [ ] Transaction history: PASS/FAIL

### Coupon System
- [ ] Coupon creation: PASS/FAIL
- [ ] Coupon application: PASS/FAIL
- [ ] Expiration handling: PASS/FAIL
- [ ] Usage limits: PASS/FAIL

### Issues Found:
1. ___________
2. ___________

### Recommendations:
1. ___________
2. ___________
```

---

## 🎯 Priority Testing Order

1. **High Priority:**
   - Coupon application at checkout
   - Discount calculation accuracy
   - Expiration date enforcement

2. **Medium Priority:**
   - Loyalty points accumulation
   - Points redemption
   - Admin management pages

3. **Low Priority:**
   - Edge cases
   - Error message wording
   - UI/UX improvements

---

**Remember:** Test in a non-production environment first!

**Status:** Ready for testing after deployment ✅
