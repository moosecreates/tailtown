# Room Size System Refactoring

**Date**: November 21, 2025  
**Version**: 1.3.0  
**Status**: Completed

## Overview

This document details the refactoring of Tailtown's kennel/suite system from arbitrary suite types to a standardized room size classification based on capacity. This change provides a clearer, more maintainable system for managing boarding resources.

## Motivation

### Problems with Old System
- **Inconsistent Naming**: Suite types (`STANDARD_SUITE`, `STANDARD_PLUS_SUITE`, `VIP_SUITE`) didn't clearly indicate capacity
- **Duplicate Data**: Capacity stored separately from type, leading to potential inconsistencies
- **Poor UX**: Users had to remember which suite type held how many pets
- **Maintenance Burden**: Multiple fields to keep in sync

### Benefits of New System
- **Clear Capacity**: Room size directly indicates max pets (Junior=1, Queen=2, King=3, VIP=4)
- **Single Source of Truth**: `maxPets` derived from `size`, no duplication
- **Better UX**: Immediate understanding of room capacity
- **Scalability**: Easy to add new room sizes (e.g., CAT, OVERFLOW)

## Schema Changes

### Database Schema

#### New Enum: RoomSize
```prisma
enum RoomSize {
  JUNIOR    // 1 pet - smallest rooms
  QUEEN     // 2 pets - medium rooms  
  KING      // 3 pets - large rooms
  VIP       // 4 pets - premium rooms
  CAT       // 1 pet - cat-specific rooms
  OVERFLOW  // Variable - overflow/special use
}
```

#### Resource Model Updates
```prisma
model Resource {
  // ... existing fields ...
  
  // NEW FIELDS
  size      RoomSize?  @map("room_size")
  maxPets   Int?       @map("max_pets")
  
  // DEPRECATED (kept for backward compatibility)
  capacity  Int?       // Use maxPets instead
}
```

### Migration Strategy

#### Phase 1: Schema Migration
```sql
-- Create room_size enum
CREATE TYPE "RoomSize" AS ENUM ('JUNIOR', 'QUEEN', 'KING', 'VIP', 'CAT', 'OVERFLOW');

-- Add columns to resources table
ALTER TABLE "resources" 
  ADD COLUMN "room_size" "RoomSize",
  ADD COLUMN "max_pets" INTEGER;
```

#### Phase 2: Data Migration
Automatic classification based on kennel name suffix:
- **R suffix** (e.g., A01R, A02R) → JUNIOR (1 pet)
- **Q suffix** (e.g., B01Q, B02Q) → QUEEN (2 pets)
- **K suffix** (e.g., C01K, C02K) → KING (3 pets)
- **V suffix** (e.g., D01V, D02V) → VIP (4 pets)

```sql
-- Parse kennel names and set room sizes
UPDATE resources 
SET 
  room_size = CASE 
    WHEN name LIKE '%R' THEN 'JUNIOR'::RoomSize
    WHEN name LIKE '%Q' THEN 'QUEEN'::RoomSize
    WHEN name LIKE '%K' THEN 'KING'::RoomSize
    WHEN name LIKE '%V' THEN 'VIP'::RoomSize
    ELSE 'JUNIOR'::RoomSize
  END,
  max_pets = CASE 
    WHEN name LIKE '%R' THEN 1
    WHEN name LIKE '%Q' THEN 2
    WHEN name LIKE '%K' THEN 3
    WHEN name LIKE '%V' THEN 4
    ELSE 1
  END
WHERE type = 'KENNEL';
```

## Frontend Changes

### Resources Management Page

#### Before
```tsx
<TableCell>{resource.capacity || '-'}</TableCell>
```

#### After
```tsx
<TableCell>{resource.maxPets || '-'}</TableCell>
```

#### ResourceDetails Form
- **Added**: Room Size dropdown (JUNIOR, QUEEN, KING, VIP, CAT, OVERFLOW)
- **Added**: Max Pets field (auto-populated based on size)
- **Removed**: Capacity field
- **Auto-population**: Size and maxPets set automatically when kennel name changes

### Calendar View

#### Before
```tsx
// Displayed: "Standard", "Standard+", "VIP"
<Chip label="Standard" color="default" />
```

#### After
```tsx
// Displays: "Junior (1)", "Queen (2)", "King (3)", "VIP (4)"
<Chip label="Junior (1)" color="default" />
<Chip label="Queen (2)" color="primary" />
<Chip label="King (3)" color="secondary" />
<Chip label="VIP (4)" color="error" />
```

#### Color Coding
- **Junior (1)**: Default (gray)
- **Queen (2)**: Primary (blue)
- **King (3)**: Secondary (purple)
- **VIP (4)**: Error (red)
- **Cat (1)**: Info (cyan)
- **Overflow**: Warning (orange)

### Data Loading Changes

#### useKennelData Hook
```typescript
// Before
const suitesResponse = await resourceService.getAllResources(
  1, 1000, 'name', 'asc', 'suite'
);

// After
const suitesResponse = await resourceService.getAllResources(
  1, 1000, 'name', 'asc', 'KENNEL'
);
```

## Backend Changes

### Resource Controller

#### Create Resource
```typescript
// Added size field to creation
const resource = await prisma.resource.create({
  data: {
    name,
    type,
    size,        // NEW
    maxPets,     // NEW
    // ... other fields
  }
});
```

#### Update Resource
```typescript
// Added size field to updates
const resource = await prisma.resource.update({
  where: { id },
  data: {
    size,        // NEW
    maxPets,     // NEW
    // ... other fields
  }
});
```

### API Response Format

#### Before
```json
{
  "id": "123",
  "name": "A01R",
  "type": "KENNEL",
  "capacity": 1
}
```

#### After
```json
{
  "id": "123",
  "name": "A01R",
  "type": "KENNEL",
  "size": "JUNIOR",
  "maxPets": 1,
  "capacity": 1  // Deprecated but kept for compatibility
}
```

## Infrastructure Changes

### Nginx Configuration

Fixed routing issue where `/api/resources` was being routed to customer-service instead of reservation-service.

#### wildcard-subdomains config
```nginx
# Added exact match location for /api/resources
location = /api/resources {
    proxy_pass http://localhost:4003;
    proxy_set_header X-Tenant-Id $http_x_tenant_id;
    # ... other headers
}
```

## Testing

### Manual Testing Checklist
- [x] Resources page displays Max Pets column
- [x] ResourceDetails form shows Room Size dropdown
- [x] Auto-population works when changing kennel name
- [x] Calendar displays room sizes instead of suite types
- [x] Calendar loads all kennels correctly
- [x] Creating new resources saves size and maxPets
- [x] Updating existing resources preserves size and maxPets

### Database Verification
```sql
-- Verify all kennels have room sizes
SELECT 
  COUNT(*) as total,
  COUNT(room_size) as with_size,
  COUNT(max_pets) as with_max_pets
FROM resources 
WHERE type = 'KENNEL';

-- Check distribution of room sizes
SELECT 
  room_size,
  COUNT(*) as count,
  AVG(max_pets) as avg_capacity
FROM resources 
WHERE type = 'KENNEL'
GROUP BY room_size
ORDER BY room_size;
```

## Rollback Plan

If issues arise, the system can be rolled back:

1. **Frontend**: Revert to displaying `capacity` instead of `maxPets`
2. **Backend**: Remove `size` field validation from controllers
3. **Database**: Fields can remain (no data loss) but won't be used

The old `capacity` field is still populated, so no data migration is needed for rollback.

## Future Enhancements

### Potential Improvements
1. **Dynamic Pricing**: Base pricing on room size
2. **Availability Rules**: Different booking rules per size
3. **Capacity Validation**: Prevent overbooking based on maxPets
4. **Reporting**: Analytics by room size utilization
5. **Multi-Pet Discounts**: Automatic discounts for Queen/King/VIP rooms

### Cleanup Tasks
- Remove deprecated `capacity` field after 3 months
- Remove old suite type enum values
- Update all legacy references to suite types

## Related Documentation

- **Changelog**: `/CHANGELOG.md` - Version 1.3.0
- **Schema**: `/services/reservation-service/prisma/schema.prisma`
- **Migrations**: `/services/reservation-service/prisma/migrations/`
- **Frontend Components**: 
  - `/frontend/src/pages/resources/`
  - `/frontend/src/components/calendar/`

## Support

For questions or issues related to this refactoring:
- Check the changelog for known issues
- Review the migration SQL scripts
- Verify nginx configuration is correct
- Ensure Prisma client is regenerated after schema changes

---

**Last Updated**: November 21, 2025  
**Author**: Development Team  
**Review Status**: Completed
