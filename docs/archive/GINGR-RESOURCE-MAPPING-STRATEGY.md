# Gingr Resource Mapping Strategy

## Problem Statement

**Current Situation:**
- All 1,157 imported Gingr reservations are assigned to resource A01 (default)
- Gingr's kennel/room system doesn't directly map to Tailtown's resource system
- Need to distribute reservations across correct kennels to reflect reality

---

## Gingr Data Structure Analysis

### What Gingr Provides:
1. **Locations** - Physical locations/facilities (e.g., "Main Building")
2. **Reservation Types** - Service types (e.g., "Boarding | Indoor Suite")
3. **Animals** - Pet information
4. **Owners** - Customer information

### What Gingr Does NOT Provide:
- ❌ Specific kennel/room assignments per reservation
- ❌ Room numbers or kennel IDs
- ❌ Resource allocation data

**Why:** Gingr's system likely handles room assignments internally or through a different system that's not exposed via their API.

---

## Solution Options

### Option 1: Manual Reassignment (Current Approach)
**Status:** ✅ Working, but tedious

**Process:**
1. View calendar showing reservations on A01
2. Click each reservation
3. Edit and assign correct kennel
4. Save

**Pros:**
- Accurate - you know which kennel each pet actually used
- No guesswork
- Works immediately

**Cons:**
- Time-consuming for 1,157 reservations
- Manual labor

**Best For:** Small datasets or when accuracy is critical

---

### Option 2: Smart Auto-Assignment Algorithm
**Status:** ⚠️ Requires development

**Strategy:**
Automatically distribute reservations across available kennels based on:
- Pet size/type → Kennel type (Standard, VIP, etc.)
- Date/time → Avoid conflicts
- Customer history → Preferred kennels
- Reservation duration → Suite availability

**Implementation Steps:**

1. **Create Mapping Rules:**
```javascript
// Example mapping logic
function assignKennel(reservation, pet, availableKennels) {
  // Rule 1: Match pet size to kennel type
  if (pet.weight > 50) {
    kennelType = 'STANDARD_PLUS_SUITE';
  } else {
    kennelType = 'STANDARD_SUITE';
  }
  
  // Rule 2: Find available kennel for date range
  const available = availableKennels.filter(k => 
    k.type === kennelType &&
    !hasConflict(k, reservation.startDate, reservation.endDate)
  );
  
  // Rule 3: Assign first available
  return available[0] || defaultKennel;
}
```

2. **Run Assignment Script:**
```bash
node scripts/auto-assign-kennels.js --dryRun  # Preview
node scripts/auto-assign-kennels.js --execute  # Apply
```

**Pros:**
- Fast - processes all reservations automatically
- Consistent logic
- Can be re-run if needed

**Cons:**
- May not match actual historical assignments
- Requires development time
- Needs validation

**Best For:** Large datasets where exact historical accuracy isn't critical

---

### Option 3: Hybrid Approach (Recommended)
**Status:** 💡 Best balance

**Strategy:**
1. **Auto-assign** based on rules (Option 2)
2. **Manual review** of conflicts or VIP customers
3. **Bulk edit** similar reservations

**Process:**
1. Run auto-assignment script
2. Review calendar for obvious conflicts
3. Manually adjust problem cases
4. Validate with staff who know the facility

**Pros:**
- 80/20 rule - automate bulk, manually fix edge cases
- Faster than full manual
- More accurate than pure automation

**Cons:**
- Still requires some manual work
- Needs script development

**Best For:** Most real-world scenarios

---

### Option 4: Import from Gingr Reports/Exports
**Status:** 🔍 Investigate

**Strategy:**
Check if Gingr has:
- CSV/Excel export with room assignments
- Reports showing historical kennel usage
- Database backup with room data

**Process:**
1. Export data from Gingr admin panel
2. Parse CSV/Excel for room assignments
3. Match by reservation ID or date+customer+pet
4. Update Tailtown reservations

**Pros:**
- Most accurate if data exists
- One-time import

**Cons:**
- Depends on Gingr having this data
- May require Gingr support assistance

**Best For:** If Gingr tracks room assignments elsewhere

---

## Recommended Implementation Plan

### Phase 1: Investigate (30 minutes)
1. ✅ Check Gingr admin panel for room assignment reports
2. ✅ Contact Gingr support about room data availability
3. ✅ Review any CSV exports for room/kennel columns

### Phase 2: Quick Wins (1-2 hours)
1. **Group by Service Type:**
   - All "VIP Suite" → Assign to VIP kennels
   - All "Standard Suite" → Assign to Standard kennels
   - All "Day Camp" → No kennel needed

2. **Bulk Update Script:**
```sql
-- Example: Assign all VIP reservations to VIP kennels
UPDATE reservations 
SET "resourceId" = (
  SELECT id FROM resources 
  WHERE type = 'VIP_SUITE' 
  AND "tenantId" = 'dev'
  LIMIT 1
)
WHERE "serviceId" IN (
  SELECT id FROM services 
  WHERE name LIKE '%VIP%'
  AND "tenantId" = 'dev'
)
AND "externalId" IS NOT NULL;
```

### Phase 3: Smart Assignment (2-4 hours)
1. Create auto-assignment script
2. Test on sample data
3. Run with --dryRun
4. Review results
5. Execute

### Phase 4: Manual Cleanup (1-2 hours)
1. Review calendar for conflicts
2. Fix overlapping assignments
3. Adjust VIP/special cases
4. Validate with staff

---

## Quick Start: Bulk Update by Service Type

Here's a ready-to-use script for the most common case:

```javascript
// File: scripts/assign-kennels-by-service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignKennelsByService() {
  try {
    // Get all resources grouped by type
    const vipSuites = await prisma.resource.findMany({
      where: { tenantId: 'dev', type: 'VIP_SUITE', isActive: true }
    });
    
    const standardSuites = await prisma.resource.findMany({
      where: { tenantId: 'dev', type: 'STANDARD_SUITE', isActive: true }
    });
    
    // Get all imported reservations
    const reservations = await prisma.reservation.findMany({
      where: { tenantId: 'dev', externalId: { not: null } },
      include: { service: true }
    });
    
    console.log(`Processing ${reservations.length} reservations...`);
    
    let updated = 0;
    for (const reservation of reservations) {
      let targetResource = null;
      
      // Match by service name
      if (reservation.service.name.includes('VIP')) {
        targetResource = vipSuites[updated % vipSuites.length];
      } else {
        targetResource = standardSuites[updated % standardSuites.length];
      }
      
      if (targetResource) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { resourceId: targetResource.id }
        });
        updated++;
      }
    }
    
    console.log(`✅ Updated ${updated} reservations`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

assignKennelsByService();
```

**Usage:**
```bash
cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service
node ../scripts/assign-kennels-by-service.js
```

---

## Decision Matrix

| Approach | Time | Accuracy | Effort | Recommended For |
|----------|------|----------|--------|-----------------|
| Manual | High | 100% | High | < 100 reservations |
| Auto-assign | Low | 70-80% | Medium | > 500 reservations |
| Hybrid | Medium | 90-95% | Medium | Most cases |
| Gingr Export | Low | 100% | Low | If data exists |

---

## Next Steps

1. **Immediate:** Try Option 4 - check Gingr for room assignment data
2. **Short-term:** Implement bulk update by service type (Quick Start script)
3. **Medium-term:** Build smart auto-assignment if needed
4. **Long-term:** Manual review and cleanup

---

## Questions to Ask Gingr Support

1. "Does the API provide room/kennel assignments for reservations?"
2. "Can we export a report showing which kennel each reservation used?"
3. "Is there a database field for room assignments we can access?"
4. "What's the best way to get historical room assignment data?"

---

**Last Updated:** October 26, 2025  
**Status:** All options documented, Quick Start script ready
