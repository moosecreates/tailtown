# Gingr Database Sync Guide

## Overview

This guide explains how to keep your Tailtown database synchronized with the Gingr database. The sync process ensures that new customers, pets, and reservations from Gingr are imported while preventing suite assignment overlaps.

## Sync Scripts

### 1. Full Sync (Recommended)

**Script:** `scripts/sync-all-gingr-data.mjs`

Syncs all data in the correct order:
1. Customers (owners)
2. Pets (animals)  
3. Reservations (with overlap prevention)

```bash
node scripts/sync-all-gingr-data.mjs
```

**When to use:**
- Daily/weekly scheduled sync
- After significant changes in Gingr
- Initial setup or major data refresh

### 2. Reservations Only

**Script:** `scripts/sync-gingr-reservations.mjs`

Syncs only reservations (faster, use when customers/pets are already up to date):

```bash
node scripts/sync-gingr-reservations.mjs
```

**Features:**
- Updates existing reservations (by externalId)
- Adds new reservations
- Intelligently assigns suites to avoid overlaps
- Validates no overlaps after sync

**When to use:**
- Quick updates when only reservation data changed
- After fixing overlaps to re-sync latest data
- Hourly sync for real-time updates

### 3. Individual Data Types

If you need to sync specific data types:

```bash
# Customers only
node scripts/import-gingr-customer-data.js

# Pets only
node scripts/import-gingr-pet-profiles.js
```

## How It Works

### Sync Process

1. **Fetch from Gingr API**
   - Retrieves data for date range (default: last 30 days to next 90 days)
   - Uses Gingr API credentials from script

2. **Map External IDs**
   - Loads existing mappings between Gingr IDs and Tailtown IDs
   - Customers: `externalId` → `id`
   - Pets: `externalId` → `id`
   - Services: `externalId` → `id`

3. **Categorize Records**
   - **Existing**: Records with matching `externalId` (will be updated)
   - **New**: Records not in database (will be inserted)
   - **Skipped**: Records with missing mappings

4. **Update Existing**
   - Updates fields like dates, status, notes
   - Preserves existing suite assignments
   - Updates timestamps

5. **Insert New with Smart Suite Assignment**
   - For each new reservation:
     - Checks all available suites (A, B, C, D rooms)
     - Finds first suite with no overlapping reservations
     - Assigns reservation to that suite
   - Prevents overlaps automatically

6. **Validate**
   - Runs overlap detection query
   - Reports any issues found

### Overlap Prevention

The sync script prevents overlaps by:

```javascript
// For each new reservation:
for (const resource of availableResources) {
  // Check if resource has overlapping reservations
  const hasOverlap = await checkOverlap(
    resource.id,
    reservation.startDate,
    reservation.endDate
  );
  
  if (!hasOverlap) {
    // Assign this resource
    return resource.id;
  }
}
```

**Overlap Logic:**
```sql
-- Two reservations overlap if:
r1.startDate < r2.endDate 
AND 
r1.endDate > r2.startDate
```

## Configuration

### Date Range

Default: Last 30 days to next 90 days

To modify, edit the script:

```javascript
// In sync-gingr-reservations.mjs
const startDate = new Date(today);
startDate.setDate(startDate.getDate() - 30);  // Change -30 to desired days
const endDate = new Date(today);
endDate.setDate(endDate.getDate() + 90);      // Change +90 to desired days
```

### Gingr API Credentials

Located in each script:

```javascript
const GINGR_CONFIG = {
  subdomain: 'tailtownpetresort',
  apiKey: 'c84c09ecfacdf23a495505d2ae1df533',
  baseUrl: 'https://tailtownpetresort.gingrapp.com/api/v1'
};
```

⚠️ **Security Note:** Consider moving credentials to environment variables.

### Tenant ID

```javascript
const TENANT_ID = 'dev';  // Change for production
```

## Scheduled Sync

### Recommended Schedule

**Production:**
- Full sync: Daily at 2 AM
- Reservation sync: Every 2 hours during business hours

**Development:**
- Full sync: Weekly
- Reservation sync: As needed

### Using Cron

```bash
# Daily full sync at 2 AM
0 2 * * * cd /path/to/tailtown && node scripts/sync-all-gingr-data.mjs >> logs/gingr-sync.log 2>&1

# Hourly reservation sync (9 AM - 6 PM)
0 9-18 * * * cd /path/to/tailtown && node scripts/sync-gingr-reservations.mjs >> logs/gingr-sync.log 2>&1
```

### Using Node Scheduler

```javascript
// In a background service
import schedule from 'node-schedule';
import { exec } from 'child_process';

// Daily at 2 AM
schedule.scheduleJob('0 2 * * *', () => {
  exec('node scripts/sync-all-gingr-data.mjs');
});

// Every 2 hours during business hours
schedule.scheduleJob('0 9-18/2 * * *', () => {
  exec('node scripts/sync-gingr-reservations.mjs');
});
```

## Troubleshooting

### Overlaps Detected After Sync

If overlaps are detected:

```bash
# Run the fix script
docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/fix-overlapping-reservations.sql

# Validate fixed
docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/validate-no-overlaps.sql
```

### Missing Mappings

If reservations are skipped due to missing mappings:

1. Check that customers/pets were synced first
2. Verify `externalId` fields are populated
3. Run full sync to ensure all dependencies exist

```bash
# Check for missing external IDs
docker exec tailtown-postgres psql -U postgres -d customer -c "
  SELECT 
    (SELECT COUNT(*) FROM customers WHERE externalId IS NULL) as customers_no_external_id,
    (SELECT COUNT(*) FROM pets WHERE externalId IS NULL) as pets_no_external_id,
    (SELECT COUNT(*) FROM services WHERE externalId IS NULL) as services_no_external_id;
"
```

### Sync Takes Too Long

For large datasets:

1. Reduce date range
2. Run reservation sync only (skip customers/pets)
3. Consider batching updates

### API Rate Limits

If hitting Gingr API limits:

1. Add delays between requests
2. Reduce sync frequency
3. Use smaller date ranges

## Monitoring

### Check Last Sync

```bash
# Check most recent reservation update
docker exec tailtown-postgres psql -U postgres -d customer -c "
  SELECT 
    MAX(updatedAt) as last_sync,
    COUNT(*) as total_reservations
  FROM reservations
  WHERE externalId IS NOT NULL;
"
```

### Sync Statistics

```bash
# Get sync statistics
docker exec tailtown-postgres psql -U postgres -d customer -c "
  SELECT 
    status,
    COUNT(*) as count,
    MIN(startDate) as earliest,
    MAX(endDate) as latest
  FROM reservations
  WHERE externalId IS NOT NULL
  GROUP BY status
  ORDER BY status;
"
```

### Overlap Check

```bash
# Quick overlap check
docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/validate-no-overlaps.sql
```

## Best Practices

1. **Always run full sync first** when setting up or after major changes
2. **Validate after each sync** to catch overlaps early
3. **Monitor sync logs** for skipped records
4. **Keep credentials secure** - use environment variables in production
5. **Test in development** before running in production
6. **Backup before major syncs** - take database snapshot
7. **Schedule during low-traffic hours** to minimize impact

## Related Documentation

- [Reservation Overlap Prevention](./RESERVATION-OVERLAP-PREVENTION.md)
- [Gingr API Documentation](https://gingrapp.com/api-docs)
- [Staff Data Import Guide](./STAFF-DATA-IMPORT-GUIDE.md)

## Support

If you encounter issues:

1. Check logs for error messages
2. Validate database state with provided queries
3. Run overlap fix script if needed
4. Review this guide for troubleshooting steps
