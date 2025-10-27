# Gingr Kennel Synchronization Strategy

## Objective

**Gingr kennel/room assignments are the source of truth and should override Tailtown resources.**

When importing reservations from Gingr, we need to:
1. Extract kennel/room numbers from Gingr data
2. Match or create corresponding resources in Tailtown
3. Assign reservations to the correct Tailtown resources based on Gingr's kennel data

---

## Step 1: Identify Gingr Kennel Data Fields

**Action Required:** Determine which field(s) in Gingr contain kennel/room information.

### Possible Locations:
1. **Reservation object** - Check for fields like:
   - `room_id`, `kennel_id`, `suite_id`
   - `room_number`, `kennel_number`
   - `location`, `assigned_room`
   - `resource_id`, `resource_name`

2. **Nested in reservation data** - Check:
   - `reservation.room`
   - `reservation.location`
   - `reservation.resource`

3. **Services array** - Some systems store room in services:
   - `reservation.services[].room`

### How to Find It:

**Option A: Check Gingr Admin Panel**
- Export a reservation report/CSV
- Look for columns with kennel/room data

**Option B: API Inspection**
```bash
# Get a detailed reservation
curl -X POST https://tailtownpetresort.gingrapp.com/api/v1/reservations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"start_date": "2025-10-24", "end_date": "2025-10-26"}' \
  | jq '.[].keys' # List all fields
```

**Option C: Contact Gingr Support**
Ask: "Which API field contains the kennel/room assignment for each reservation?"

---

## Step 2: Map Gingr Kennels to Tailtown Resources

Once we know the Gingr field, we need to map kennel names/numbers to Tailtown resources.

### Mapping Strategy:

#### Option A: Exact Name Match
```javascript
// If Gingr uses "A01", "A02", etc.
const gingrKennel = "A01";
const tailtownResource = await prisma.resource.findFirst({
  where: { 
    tenantId: 'dev',
    name: gingrKennel  // Exact match
  }
});
```

#### Option B: Pattern Matching
```javascript
// If Gingr uses "Suite A01" but Tailtown uses "A01"
const gingrKennel = "Suite A01";
const kennelNumber = gingrKennel.match(/([A-Z]\d+)/)?.[1]; // Extract "A01"
const tailtownResource = await prisma.resource.findFirst({
  where: { 
    tenantId: 'dev',
    name: kennelNumber
  }
});
```

#### Option C: Create Missing Resources
```javascript
// If Gingr kennel doesn't exist in Tailtown, create it
if (!tailtownResource) {
  tailtownResource = await prisma.resource.create({
    data: {
      name: gingrKennel,
      type: determineTypeFromName(gingrKennel), // e.g., "VIP_SUITE"
      capacity: 1,
      isActive: true,
      tenantId: 'dev'
    }
  });
}
```

---

## Step 3: Update Migration Code

### Current Code (assigns default A01):
```typescript
// services/customer/src/controllers/gingr-migration.controller.ts
const reservationData = transformReservationToReservation(
  reservation,
  customerId,
  petId,
  serviceId
);

await fetch(`${RESERVATION_SERVICE_URL}/api/reservations`, {
  method: 'POST',
  body: JSON.stringify({
    ...reservationData,
    orderNumber: generateOrderNumber(),
    resourceId: defaultResourceId // ❌ Always A01
  })
});
```

### Updated Code (uses Gingr kennel):
```typescript
// Extract kennel from Gingr data
const gingrKennel = reservation.room_number || reservation.kennel_id; // Adjust field name

// Find or create matching Tailtown resource
let resourceId = defaultResourceId;
if (gingrKennel) {
  const resource = await findOrCreateResource(gingrKennel);
  resourceId = resource.id;
}

await fetch(`${RESERVATION_SERVICE_URL}/api/reservations`, {
  method: 'POST',
  body: JSON.stringify({
    ...reservationData,
    orderNumber: generateOrderNumber(),
    resourceId: resourceId // ✅ Uses Gingr kennel
  })
});
```

---

## Step 4: Implementation Script

### File: `services/customer/src/services/gingr-resource-mapper.service.ts`

```typescript
/**
 * Maps Gingr kennel/room data to Tailtown resources
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

interface ResourceCache {
  [gingrKennel: string]: string; // Gingr kennel → Tailtown resource ID
}

const resourceCache: ResourceCache = {};

/**
 * Find or create a Tailtown resource matching the Gingr kennel
 */
export async function findOrCreateResource(
  gingrKennel: string,
  reservationServiceUrl: string = 'http://localhost:4003'
): Promise<{ id: string; name: string }> {
  
  // Check cache first
  if (resourceCache[gingrKennel]) {
    return { id: resourceCache[gingrKennel], name: gingrKennel };
  }
  
  // Clean/normalize the kennel name
  const normalizedName = normalizeKennelName(gingrKennel);
  
  // Try to find existing resource
  const response = await fetch(
    `${reservationServiceUrl}/api/resources?name=${encodeURIComponent(normalizedName)}`,
    { headers: { 'x-tenant-id': 'dev' } }
  );
  
  const data = await response.json();
  const resources = data.data?.resources || [];
  
  if (resources.length > 0) {
    const resource = resources[0];
    resourceCache[gingrKennel] = resource.id;
    return resource;
  }
  
  // Resource doesn't exist - create it
  console.log(`[Resource Mapper] Creating new resource: ${normalizedName}`);
  
  const createResponse = await fetch(
    `${reservationServiceUrl}/api/resources`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'dev'
      },
      body: JSON.stringify({
        name: normalizedName,
        type: determineResourceType(normalizedName),
        capacity: 1,
        isActive: true,
        tenantId: 'dev'
      })
    }
  );
  
  const newResource = await createResponse.json();
  resourceCache[gingrKennel] = newResource.id;
  
  return newResource;
}

/**
 * Normalize kennel names for consistency
 */
function normalizeKennelName(gingrKennel: string): string {
  // Remove common prefixes/suffixes
  let normalized = gingrKennel
    .replace(/^(Suite|Room|Kennel)\s+/i, '')
    .trim();
  
  // Ensure format like "A01" not "A1"
  const match = normalized.match(/^([A-Z])(\d+)$/);
  if (match) {
    const letter = match[1];
    const number = match[2].padStart(2, '0');
    normalized = `${letter}${number}`;
  }
  
  return normalized;
}

/**
 * Determine resource type from kennel name
 */
function determineResourceType(kennelName: string): string {
  const name = kennelName.toUpperCase();
  
  if (name.includes('VIP') || name.startsWith('V')) {
    return 'VIP_SUITE';
  } else if (name.includes('PLUS') || name.includes('+')) {
    return 'STANDARD_PLUS_SUITE';
  } else {
    return 'STANDARD_SUITE';
  }
}

/**
 * Extract kennel from Gingr reservation data
 */
export function extractGingrKennel(reservation: any): string | null {
  // TODO: Update these field names based on actual Gingr API structure
  return reservation.room_number 
      || reservation.kennel_id
      || reservation.room
      || reservation.resource_name
      || null;
}
```

---

## Step 5: Update Migration Controller

### File: `services/customer/src/controllers/gingr-migration.controller.ts`

Add import:
```typescript
import { findOrCreateResource, extractGingrKennel } from '../services/gingr-resource-mapper.service';
```

Update reservation creation:
```typescript
// In Phase 5: Import reservations
for (const reservation of reservations) {
  try {
    const customerId = customerMap.get(reservation.owner.id);
    const petId = petMap.get(reservation.animal.id);
    const serviceId = serviceMap.get(reservation.reservation_type.id);
    
    // ... validation ...
    
    // Extract kennel from Gingr data
    const gingrKennel = extractGingrKennel(reservation);
    
    // Find or create matching resource
    let resourceId = defaultResourceId;
    if (gingrKennel) {
      try {
        const resource = await findOrCreateResource(gingrKennel, RESERVATION_SERVICE_URL);
        resourceId = resource.id;
        console.log(`[Migration] Mapped Gingr kennel "${gingrKennel}" → Tailtown resource "${resource.name}"`);
      } catch (error) {
        console.warn(`[Migration] Could not map kennel "${gingrKennel}", using default`);
      }
    }
    
    const reservationData = transformReservationToReservation(
      reservation,
      customerId,
      petId,
      serviceId
    );
    
    await fetch(`${RESERVATION_SERVICE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'dev'
      },
      body: JSON.stringify({
        ...reservationData,
        orderNumber: generateOrderNumber(),
        resourceId: resourceId
      })
    });
    
    progress.completed++;
  } catch (error: any) {
    // ... error handling ...
  }
}
```

---

## Step 6: Re-run Migration

Once the code is updated:

```bash
# 1. Delete existing imported reservations (optional - if you want clean slate)
cd /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service
node delete-imported-reservations.js  # Create this script if needed

# 2. Re-run migration with updated code
curl -X POST http://localhost:4004/api/gingr/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "tailtownpetresort",
    "apiKey": "c84c09ecfacdf23a495505d2ae1df533",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  }'
```

---

## Step 7: Verify Results

After re-running migration:

1. **Check calendar** - Reservations should be on correct kennels
2. **Check new resources** - Any Gingr kennels not in Tailtown should be created
3. **Check logs** - Should show kennel mapping: "A01" → "A01", etc.

---

## Action Items

### Immediate (Required):
1. ✅ **Identify Gingr kennel field** - Check API response or contact Gingr support
2. ⏳ **Update extraction function** - Modify `extractGingrKennel()` with correct field name
3. ⏳ **Test with sample data** - Verify kennel extraction works
4. ⏳ **Update migration code** - Add resource mapping logic
5. ⏳ **Re-run migration** - Import with correct kennel assignments

### Optional (Nice to have):
- Create script to update existing 1,157 reservations if Gingr has historical kennel data
- Add validation to ensure all Gingr kennels exist in Tailtown before migration
- Create report showing Gingr kennel → Tailtown resource mapping

---

## Questions to Answer

**Critical:** What is the exact field name in Gingr API that contains kennel/room assignments?

Please provide:
- Field name (e.g., `room_number`, `kennel_id`)
- Sample value (e.g., "A01", "Suite 12", "VIP-1")
- Where it appears in the reservation object

Once we have this information, I can update the code immediately.

---

**Last Updated:** October 26, 2025  
**Status:** Waiting for Gingr kennel field identification
