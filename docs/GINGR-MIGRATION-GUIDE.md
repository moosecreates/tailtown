# Gingr Data Migration Guide

## Overview
Complete guide for migrating data from Gingr to Tailtown Pet Resort Management System.

## Current Status: ✅ READY TO MIGRATE

### What's Working:
- ✅ Gingr API client with rate limiting
- ✅ Data transformation (Gingr → Tailtown format)
- ✅ Duplicate prevention via externalId tracking
- ✅ Safe database migration (no data loss)
- ✅ Error tracking and reporting
- ✅ Progress monitoring

### Your Gingr Data:
- **11,809 customers** ready to migrate
- **18,389 pets** ready to migrate
- **35 service types** to map
- Historical reservations available (June 2025 - present)

---

## Migration Process

### Phase 1: Test Connection ✅ COMPLETE
```bash
curl -X POST http://localhost:4004/api/gingr/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "tailtownpetresort",
    "apiKey": "c84c09ecfacdf23a495505d2ae1df533"
  }'
```

### Phase 2: Test Data Fetch ✅ COMPLETE
```bash
curl -X POST http://localhost:4004/api/gingr/test \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "tailtownpetresort",
    "apiKey": "c84c09ecfacdf23a495505d2ae1df533",
    "startDate": "2025-10-01",
    "endDate": "2025-10-26"
  }'
```

### Phase 3: Run Migration
```bash
curl -X POST http://localhost:4004/api/gingr/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "tailtownpetresort",
    "apiKey": "c84c09ecfacdf23a495505d2ae1df533",
    "startDate": "2025-06-01",
    "endDate": "2025-10-26"
  }'
```

---

## Migration Details

### What Gets Migrated:

#### 1. Services (Reservation Types)
- **Source**: Gingr reservation types
- **Mapping**: 
  - Name → Name
  - Description → Description
  - Price → Price
  - ID → externalId (for tracking)
- **Default**: serviceCategory = 'BOARDING'

#### 2. Customers (Owners)
- **Source**: Gingr owners
- **Mapping**:
  - first_name → firstName
  - last_name → lastName
  - email → email
  - cell_phone/home_phone → phone/alternatePhone
  - address, city, state, zip → address fields
  - emergency_contact_name → emergencyContact
  - emergency_contact_phone → emergencyPhone
  - notes → notes (HTML stripped)
  - system_id → externalId

#### 3. Pets (Animals)
- **Source**: Gingr animals
- **Mapping**:
  - name → name
  - species → type (DOG, CAT, BIRD, RABBIT, etc.)
  - breed → breed
  - color → color
  - gender → gender (MALE, FEMALE, UNKNOWN)
  - birthday → birthdate
  - weight → weight
  - microchip → microchipNumber
  - vet_name → vetName
  - vet_phone → vetPhone
  - medications → medicationNotes
  - allergies → allergies
  - special_needs → specialNeeds
  - notes → behaviorNotes (HTML stripped)
  - id → externalId

#### 4. Reservations
- **Source**: Gingr reservations
- **Mapping**:
  - start_date → startDate
  - end_date → endDate
  - status_id → status (PENDING, CONFIRMED, CHECKED_IN, etc.)
  - check_in_stamp → checkInDate
  - check_out_stamp → checkOutDate
  - notes → notes (HTML stripped)
  - id → externalId
- **Generated**: orderNumber (unique)

---

## Safety Features

### Duplicate Prevention:
- Checks `externalId` before creating records
- For customers: also checks email
- Skips existing records (idempotent)

### Data Preservation:
- Uses `IF NOT EXISTS` for schema changes
- No data is deleted or overwritten
- Existing Tailtown data is untouched

### Error Handling:
- Tracks errors per entity type
- Continues migration even if individual records fail
- Returns detailed error report

### Progress Tracking:
- Phase-by-phase progress
- Total/completed/failed counts
- Execution time tracking

---

## Migration Response Format

```json
{
  "success": true,
  "progress": {
    "phase": "Complete",
    "total": 30233,
    "completed": 30200,
    "failed": 33,
    "errors": [
      {
        "type": "customer",
        "id": "12345",
        "error": "Email already exists"
      }
    ],
    "startTime": "2025-10-26T14:00:00.000Z",
    "endTime": "2025-10-26T14:15:00.000Z"
  },
  "stats": {
    "apiRequests": 150,
    "duration": 900000
  }
}
```

---

## Recommendations

### Before Migration:
1. ✅ Backup your database
2. ✅ Test with small date range first (1 month)
3. ✅ Verify data in Tailtown UI
4. ✅ Check for any errors in response

### After Migration:
1. Verify customer count matches
2. Verify pet count matches
3. Check a few sample reservations
4. Review error log for any issues
5. Map service categories if needed

### Re-running Migration:
- Safe to run multiple times
- Will skip existing records (via externalId)
- Only imports new/changed data

---

## Troubleshooting

### Issue: "Email already exists"
- **Cause**: Customer with same email already in Tailtown
- **Solution**: Migration will skip, existing customer is used

### Issue: "Customer not found for owner_id"
- **Cause**: Pet's owner failed to import
- **Solution**: Check errors array for owner import failure

### Issue: Rate limiting
- **Built-in**: 150ms delay between API requests
- **Automatic**: Handled by client

### Issue: 30-day limit on reservations
- **Built-in**: Automatically chunks requests
- **Transparent**: No action needed

---

## Next Steps

1. **Test Migration** (recommended):
   - Run with 1-month date range
   - Verify in UI
   - Check for errors

2. **Full Migration**:
   - Run with full date range (June 2025 - present)
   - Monitor progress
   - Review results

3. **Post-Migration**:
   - Update service categories as needed
   - Configure resources/suites
   - Train staff on new system

---

## Support

For issues or questions:
1. Check error messages in migration response
2. Review this guide
3. Check logs in customer service console
4. Contact support with error details

---

**Last Updated**: October 26, 2025  
**Status**: Ready for Production Migration
