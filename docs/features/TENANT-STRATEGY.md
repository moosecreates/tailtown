# Tenant Strategy Guide

**Last Updated**: November 5, 2025  
**Purpose**: Define the purpose and usage of each tenant in the Tailtown system

---

## 🎯 Tenant Overview

Tailtown is a **multi-tenant SaaS platform**. Each tenant represents a separate pet resort business with completely isolated data.

---

## 🏢 Current Tenants

### 1. **Tailtown** (Production)
**Subdomain**: `tailtown.canicloud.com` (or primary domain)  
**Purpose**: **YOUR PRODUCTION BUSINESS**  
**Status**: 🔴 **PRODUCTION - CRITICAL**

**Use For**:
- ✅ Real business operations
- ✅ Real customers and pets
- ✅ Real reservations and invoicing
- ✅ Staff daily operations
- ✅ Primary testing with real data
- ✅ Finding and fixing critical bugs

**DO NOT**:
- ❌ Test experimental features here first
- ❌ Use for customer demos
- ❌ Make breaking changes without testing elsewhere
- ❌ Populate with fake/test data

**Data**:
- Real customers from your business
- Real pets with medical records
- Real reservations and history
- Real financial data
- Real staff accounts

**Priority**: **HIGHEST** - This must work flawlessly at all times

---

### 2. **BranGro** (Customer Demo Site)
**Subdomain**: `brangro.canicloud.com`  
**Purpose**: **CUSTOMER DEMO & TESTING**  
**Status**: 🟡 **DEMO - NON-CRITICAL**

**Use For**:
- ✅ Customer demonstrations
- ✅ Sales presentations
- ✅ Testing new features before Tailtown rollout
- ✅ Validating multi-tenant isolation
- ✅ Training new staff
- ✅ Finding bugs in a safe environment

**DO NOT**:
- ❌ Treat as production
- ❌ Store real customer data here
- ❌ Use for primary development

**Data**:
- Mock/demo customers (20)
- Mock pets (20)
- Sample reservations (10)
- Demo staff accounts (4)
- Template POS products (6)

**Priority**: **MEDIUM** - Should work well but not critical

---

### 3. **Dev** (Development)
**Subdomain**: `dev.canicloud.com` or `localhost`  
**Purpose**: **LOCAL DEVELOPMENT & EXPERIMENTS**  
**Status**: 🟢 **DEVELOPMENT - SAFE TO BREAK**

**Use For**:
- ✅ Local development
- ✅ Testing breaking changes
- ✅ Experimental features
- ✅ Database migrations testing
- ✅ Learning new features
- ✅ Code that might break things

**DO NOT**:
- ❌ Use for customer demos
- ❌ Store important data here
- ❌ Expect data to persist

**Data**:
- Frequently reset/cleared
- Test data only
- Can be deleted anytime

**Priority**: **LOW** - Safe to break, reset anytime

---

## 🔄 Development Workflow

### Recommended Flow

```
1. DEV Tenant
   ↓ (Develop & test new feature)
   
2. BranGro Tenant
   ↓ (Validate with demo data)
   
3. Tailtown Tenant
   ↓ (Deploy to production)
   
4. Future Customer Tenants
   (Roll out to paying customers)
```

### Example: Adding a New Feature

**Step 1: Develop in DEV**
```bash
# Work locally with dev tenant
# Break things, experiment, iterate
# Test database migrations
```

**Step 2: Test in BranGro**
```bash
# Deploy to BranGro
# Test with realistic demo data
# Verify multi-tenant isolation
# Get feedback from team
```

**Step 3: Deploy to Tailtown**
```bash
# Deploy to production (Tailtown)
# Monitor closely
# Fix any issues immediately
# Verify with real data
```

**Step 4: Roll Out to Customers**
```bash
# Once stable in Tailtown
# Deploy to customer tenants
# Monitor each deployment
```

---

## 🎯 Which Tenant Should I Use?

### For Daily Development
**Use**: `dev` tenant (local)
- Fast iteration
- Safe to break
- No impact on anyone

### For Testing Bug Fixes
**Use**: `brangro` tenant first, then `tailtown`
- Test fix in BranGro with demo data
- Verify in Tailtown with real data
- Deploy if both work

### For Finding Bugs
**Use**: `tailtown` tenant
- Real data reveals real issues
- Production-like scenarios
- Critical bugs surface here

### For Customer Demos
**Use**: `brangro` tenant
- Clean demo data
- No real customer info exposed
- Safe to show prospects

### For Training Staff
**Use**: `brangro` tenant
- Practice without risk
- Demo data to learn with
- Won't affect real operations

---

## 📊 Tenant Comparison

| Feature | Dev | BranGro | Tailtown |
|---------|-----|---------|----------|
| **Purpose** | Development | Demo/Testing | Production |
| **Data Type** | Test/Fake | Demo/Mock | Real |
| **Priority** | Low | Medium | **CRITICAL** |
| **Can Break?** | ✅ Yes | ⚠️ Preferably not | ❌ **NEVER** |
| **Real Customers** | ❌ No | ❌ No | ✅ **YES** |
| **Use for Demos** | ❌ No | ✅ **YES** | ❌ No |
| **Primary Testing** | ⚠️ Initial | ⚠️ Validation | ✅ **Final** |
| **Data Persistence** | ❌ Temporary | ✅ Stable | ✅ **Permanent** |

---

## 🚀 Future Customer Tenants

As you onboard paying customers, each will get their own tenant:

### Example Future Tenants
- `happypaws.canicloud.com` - Happy Paws Pet Resort
- `waggingtails.canicloud.com` - Wagging Tails Daycare
- `poshpaws.canicloud.com` - Posh Paws Boarding
- etc.

### Customer Tenant Strategy
1. **Clone from BranGro template** - Start with demo data structure
2. **Import customer's data** - Migrate from their old system
3. **Customize branding** - Logo, colors, etc.
4. **Train their staff** - Use their tenant for training
5. **Go live** - Switch from old system to Tailtown

---

## 🔒 Data Isolation

### How It Works
Each tenant's data is **completely isolated**:

```sql
-- Every query includes tenant filter
SELECT * FROM customers WHERE tenant_id = 'tailtown';
SELECT * FROM pets WHERE tenant_id = 'brangro';
SELECT * FROM reservations WHERE tenant_id = 'dev';
```

### Verification
- ✅ BranGro customers never appear in Tailtown
- ✅ Tailtown reservations never appear in BranGro
- ✅ Each tenant has separate staff accounts
- ✅ Products, invoices, all data isolated

---

## ⚠️ Important Reminders

### For Tailtown Tenant (Production)
1. **Always test in BranGro first** before deploying to Tailtown
2. **Back up before major changes** (database migrations, etc.)
3. **Monitor after deployments** - Check logs, test critical features
4. **Fix bugs immediately** - Production issues are top priority
5. **Never delete real data** - Be extremely careful with delete operations

### For BranGro Tenant (Demo)
1. **Keep data clean** - Remove test junk periodically
2. **Maintain realistic scenarios** - Good for demos
3. **Update when adding features** - Keep it current
4. **Use for training** - Safe environment to learn

### For Dev Tenant (Development)
1. **Break things freely** - That's what it's for
2. **Reset data often** - Keep it clean
3. **Test migrations here first** - Before BranGro/Tailtown
4. **Experiment** - Try new ideas safely

---

## 📝 Best Practices

### Before Making Changes
1. ✅ Identify which tenant(s) will be affected
2. ✅ Test in dev first
3. ✅ Validate in BranGro
4. ✅ Deploy to Tailtown during low-traffic times
5. ✅ Monitor after deployment

### When Finding Bugs
1. ✅ Note which tenant you found it in
2. ✅ Try to reproduce in BranGro (if found in Tailtown)
3. ✅ Fix and test in dev
4. ✅ Validate fix in BranGro
5. ✅ Deploy to Tailtown
6. ✅ Verify fix in production

### When Onboarding Customers
1. ✅ Create new tenant (subdomain)
2. ✅ Clone BranGro structure
3. ✅ Import customer data
4. ✅ Test thoroughly in their tenant
5. ✅ Train their staff
6. ✅ Go live and monitor

---

## 🎯 Quick Reference

**"I want to..."**

- **Add a new feature** → Start in `dev`, test in `brangro`, deploy to `tailtown`
- **Fix a bug** → Reproduce in `brangro`, fix in `dev`, test in `brangro`, deploy to `tailtown`
- **Demo to a prospect** → Use `brangro`
- **Train new staff** → Use `brangro`
- **Test with real data** → Use `tailtown` (carefully!)
- **Experiment with code** → Use `dev`
- **Run your business** → Use `tailtown`

---

## 📞 Questions?

**Q: Can I test in Tailtown directly?**  
A: Only for final validation with real data. Always test in dev/BranGro first.

**Q: What if I break BranGro?**  
A: Not ideal but not critical. Fix it when you can.

**Q: What if I break Tailtown?**  
A: 🚨 **CRITICAL** - Drop everything and fix immediately.

**Q: Should I add test data to Tailtown?**  
A: ❌ **NO** - Only real business data belongs in Tailtown.

**Q: Can I delete the dev tenant?**  
A: Yes, it's meant to be reset/cleared frequently.

**Q: How do I switch between tenants?**  
A: Use different subdomains: `tailtown.canicloud.com`, `brangro.canicloud.com`, `dev.canicloud.com`

---

**Remember**: Tailtown is YOUR business - treat it like production! 🎯

**Last Updated**: November 5, 2025  
**Next Review**: When onboarding first paying customer
