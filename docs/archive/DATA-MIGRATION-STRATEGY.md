# Data Migration Strategy - Gingr to Tailtown
**Date:** October 26, 2025  
**Purpose:** Plan the best approach for migrating data from Gingr

---

## 🎯 Three Migration Scenarios

### **Scenario 1: Excel/CSV Field Mapping Tool**
**Use Case:** Importing from various software packages (Gingr, PetExec, Kennel Connection, etc.)

**Pros:**
- ✅ Universal solution - works with any software
- ✅ Reusable for future clients
- ✅ Visual interface for field mapping
- ✅ Handles data inconsistencies well
- ✅ Can preview before import
- ✅ Most flexible approach

**Cons:**
- ⏰ Takes longer to build (15-20 hours)
- 🔧 Requires manual field mapping per client
- 📊 Requires data export from source system first

**Effort:** 15-20 hours  
**Reusability:** HIGH - Use for all future clients

---

### **Scenario 2: Gingr SQL Direct Import**
**Use Case:** Direct database-to-database migration for Gingr clients

**Pros:**
- ✅ Fastest for Gingr-specific migrations
- ✅ Complete data access
- ✅ Can preserve relationships
- ✅ No data loss
- ✅ Automated once built

**Cons:**
- ❌ Only works for Gingr
- ❌ Requires Gingr database access (may not be available)
- ❌ Gingr schema may change between versions
- ❌ Not reusable for other software
- ⚠️ May require Gingr cooperation

**Effort:** 10-15 hours  
**Reusability:** LOW - Only Gingr clients

---

### **Scenario 3: Gingr API Integration**
**Use Case:** Real-time sync or gradual migration via API

**Pros:**
- ✅ Official supported method
- ✅ No database access needed
- ✅ Real-time data sync possible
- ✅ Cleaner, validated data
- ✅ Version-independent

**Cons:**
- ❌ API may have rate limits
- ❌ May not expose all data
- ❌ Requires API credentials
- ❌ Only works for Gingr
- ⏰ Slower for large datasets
- 💰 May require Gingr API subscription

**Effort:** 12-18 hours  
**Reusability:** LOW - Only Gingr clients

---

## 🏆 Recommended Approach: **Hybrid Strategy**

### **Phase 1: Build Universal CSV/Excel Mapper (Recommended First)**
**Why Start Here:**
1. **Works immediately** - Can import from any source
2. **Most flexible** - Handles any data format
3. **Reusable** - Every future client can use it
4. **Lower risk** - Doesn't depend on Gingr cooperation
5. **Better for business** - Competitive advantage over competitors

**Implementation:**
```
1. CSV/Excel Upload Interface (2 hours)
2. Field Mapping UI (3 hours)
3. Data Validation & Preview (3 hours)
4. Import Engine (4 hours)
5. Error Handling & Rollback (2 hours)
6. Testing & Documentation (2 hours)

Total: 16 hours (~2 days)
```

### **Phase 2: Add Gingr-Specific Optimizations (Optional)**
Once the universal tool works, add Gingr presets:
- Pre-mapped field templates for Gingr exports
- Gingr-specific data transformations
- One-click Gingr import with defaults

**Additional Effort:** 3-4 hours

---

## 📋 Detailed Implementation Plan

### **Universal CSV/Excel Import Tool**

#### **Step 1: Data Upload & Preview (2 hours)**
```typescript
// File: frontend/src/pages/admin/DataImport.tsx

Features:
- Drag-and-drop CSV/Excel upload
- File validation (size, format)
- Preview first 10 rows
- Column detection
- Data type inference
```

#### **Step 2: Field Mapping Interface (3 hours)**
```typescript
// Interactive field mapper

Source Fields (from CSV) → Target Fields (Tailtown)
┌─────────────────────┐    ┌──────────────────────┐
│ First Name          │ →  │ firstName            │
│ Last Name           │ →  │ lastName             │
│ Email Address       │ →  │ email                │
│ Phone               │ →  │ phone                │
│ Pet Name            │ →  │ pets[].name          │
│ Pet Breed           │ →  │ pets[].breed         │
│ Pet Species         │ →  │ pets[].species       │
└─────────────────────┘    └──────────────────────┘

Features:
- Drag-and-drop field mapping
- Auto-suggest matching fields
- Required field validation
- Custom field transformations
- Save mapping templates
```

#### **Step 3: Data Validation & Preview (3 hours)**
```typescript
// Validation rules

Validations:
- Email format validation
- Phone number formatting
- Date format conversion
- Duplicate detection
- Required field checking
- Data type validation

Preview:
- Show first 10 records after transformation
- Highlight validation errors
- Allow manual corrections
- Show import summary (X records, Y errors)
```

#### **Step 4: Import Engine (4 hours)**
```typescript
// Backend: services/customer/src/controllers/import.controller.ts

Features:
- Batch processing (100 records at a time)
- Transaction support (rollback on error)
- Progress tracking
- Duplicate handling (skip/update/error)
- Relationship creation (customer → pets)
- Error logging
- Import history
```

#### **Step 5: Error Handling & Rollback (2 hours)**
```typescript
// Robust error handling

Features:
- Detailed error messages
- Row-level error tracking
- Partial import support
- Rollback capability
- Error export (CSV of failed records)
- Retry mechanism
```

#### **Step 6: Testing & Documentation (2 hours)**
```typescript
// Comprehensive testing

Tests:
- Unit tests for validators
- Integration tests for import
- Test with sample Gingr data
- Test with malformed data
- Performance testing (10k+ records)

Documentation:
- User guide with screenshots
- Field mapping reference
- Troubleshooting guide
- Sample CSV templates
```

---

## 🗂️ Data Structure Mapping

### **Gingr → Tailtown Field Mapping**

#### **Customers**
```
Gingr Field              → Tailtown Field
─────────────────────────────────────────────
FirstName                → firstName
LastName                 → lastName
Email                    → email
Phone                    → phone
Address                  → address
City                     → city
State                    → state
ZipCode                  → zipCode
EmergencyContact         → emergencyContactName
EmergencyPhone           → emergencyContactPhone
Notes                    → notes
CreatedDate              → createdAt
```

#### **Pets**
```
Gingr Field              → Tailtown Field
─────────────────────────────────────────────
PetName                  → name
Species                  → species
Breed                    → breed
Color                    → color
Gender                   → gender
BirthDate                → birthDate
Weight                   → weight
Microchip                → microchipNumber
VetName                  → veterinarianName
VetPhone                 → veterinarianPhone
Medications              → medications (JSON)
Allergies                → allergies
SpecialNeeds             → specialNeeds
Notes                    → notes
```

#### **Reservations**
```
Gingr Field              → Tailtown Field
─────────────────────────────────────────────
ReservationNumber        → orderNumber
CheckInDate              → startDate
CheckOutDate             → endDate
Status                   → status (map values)
ServiceType              → serviceId (lookup)
RoomType                 → resourceId (lookup)
TotalAmount              → (calculate from line items)
Notes                    → notes
```

#### **Invoices**
```
Gingr Field              → Tailtown Field
─────────────────────────────────────────────
InvoiceNumber            → invoiceNumber
InvoiceDate              → invoiceDate
DueDate                  → dueDate
Subtotal                 → subtotal
Tax                      → taxAmount
Total                    → total
Status                   → status (map values)
```

---

## 🔄 Data Transformation Rules

### **Status Mapping**
```typescript
// Gingr → Tailtown status mapping

const statusMap = {
  // Reservations
  'Pending': 'PENDING',
  'Confirmed': 'CONFIRMED',
  'Checked In': 'CHECKED_IN',
  'Checked Out': 'CHECKED_OUT',
  'Completed': 'COMPLETED',
  'Cancelled': 'CANCELLED',
  
  // Invoices
  'Unpaid': 'PENDING',
  'Paid': 'PAID',
  'Partially Paid': 'PARTIALLY_PAID',
  'Overdue': 'OVERDUE',
  'Cancelled': 'CANCELLED'
};
```

### **Date Format Conversion**
```typescript
// Handle various date formats

const parseDateFormats = [
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'M/D/YY',
  // ... more formats
];

function parseDate(dateString: string): Date {
  // Try each format until one works
  // Return null if none work
}
```

### **Phone Number Formatting**
```typescript
// Standardize phone numbers

function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if can't format
}
```

---

## 🚀 Quick Start: Gingr Export Instructions

### **For Gingr Users:**

1. **Export Customers**
   - Go to Customers → Export
   - Select "All Fields"
   - Format: CSV
   - Save as `gingr_customers.csv`

2. **Export Pets**
   - Go to Pets → Export
   - Include Customer ID for linking
   - Save as `gingr_pets.csv`

3. **Export Reservations**
   - Go to Reservations → Export
   - Include Customer ID and Pet ID
   - Date range: All historical data
   - Save as `gingr_reservations.csv`

4. **Export Invoices**
   - Go to Billing → Export
   - Include all payment history
   - Save as `gingr_invoices.csv`

---

## 📊 Migration Checklist

### **Pre-Migration**
- [ ] Export all data from Gingr
- [ ] Review data quality
- [ ] Clean up duplicates in source
- [ ] Document custom fields
- [ ] Backup Tailtown database
- [ ] Test import with sample data (10-20 records)

### **Migration**
- [ ] Import customers first
- [ ] Import pets (linked to customers)
- [ ] Import services/resources
- [ ] Import reservations (linked to customers/pets)
- [ ] Import invoices
- [ ] Import payments
- [ ] Verify data integrity

### **Post-Migration**
- [ ] Verify record counts match
- [ ] Test key workflows
- [ ] Check customer/pet relationships
- [ ] Verify financial totals
- [ ] Test search functionality
- [ ] Train staff on new system

---

## ⏱️ Timeline Estimate

### **Option A: Universal Tool First (Recommended)**
- Week 1: Build CSV import tool (16 hours)
- Week 2: Test with Gingr data (4 hours)
- Week 3: Perform actual migration (8 hours)
- **Total: 28 hours (~3.5 weeks)**

### **Option B: Gingr SQL Direct**
- Week 1: Analyze Gingr schema (8 hours)
- Week 2: Build migration scripts (12 hours)
- Week 3: Test and migrate (8 hours)
- **Total: 28 hours (~3.5 weeks)**
- **Risk:** Only works if you have Gingr database access

### **Option C: Gingr API**
- Week 1: API integration (12 hours)
- Week 2: Data sync logic (10 hours)
- Week 3: Testing and migration (8 hours)
- **Total: 30 hours (~4 weeks)**
- **Risk:** Depends on API availability and limits

---

## 💡 Final Recommendation

### **Start with Universal CSV Tool**

**Reasoning:**
1. ✅ **Works immediately** - No dependency on Gingr
2. ✅ **Future-proof** - Works with any software
3. ✅ **Lower risk** - Doesn't require special access
4. ✅ **Better ROI** - Reusable for all future clients
5. ✅ **Competitive advantage** - Easy onboarding for any client

**Then optimize:**
- Add Gingr preset templates (save 80% of mapping time)
- Add other software presets as needed
- Build API integrations for real-time sync (future feature)

---

## 🎯 Next Steps

1. **Confirm Gingr export format** - Get sample CSV files
2. **Start building universal import tool** - 16 hours
3. **Test with sample Gingr data** - 4 hours
4. **Perform full migration** - 8 hours

**Total: ~4 weeks to production migration**

---

**Last Updated:** October 26, 2025  
**Status:** Ready to begin  
**Recommended:** Start with Universal CSV Tool
