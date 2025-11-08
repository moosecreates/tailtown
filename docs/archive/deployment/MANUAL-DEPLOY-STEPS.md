# Manual Deployment Steps - November 6, 2025

## SSH Key Issue

The automated deployment script is failing due to SSH key authentication issues. Please follow these manual steps instead.

---

## Step-by-Step Deployment

### Step 1: Commit Changes Locally

```bash
cd /Users/robweinstein/CascadeProjects/tailtown

# Add all the changes
git add services/customer/src/services/financialService.ts
git add services/customer/src/controllers/analytics.controller.ts
git add services/customer/src/routes/analytics-fixed.routes.ts
git add services/customer/src/index.ts
git add services/customer/prisma/schema.prisma
git add services/customer/prisma/migrations/20251106_add_missing_schema_fields/
git add services/customer/jest.config.js
git add services/customer/jest.setup.js
git add services/customer/src/__tests__/integration/
git add services/customer/TEST-SETUP-NOTES.md
git add MULTI-TENANCY-TESTS-SUMMARY.md
git add frontend/src/pages/analytics/AnalyticsDashboard.tsx
git add frontend/src/utils/formatters.ts

# Commit
git commit -m "Fix: Critical multi-tenancy bug in analytics and financial reports

- Add tenantId filtering to all financial service functions
- Update analytics controller to pass tenantId from requests
- Add safe migration for missing schema fields
- Add comprehensive tenant isolation tests (14/14 passing)
- Prevent server start during tests
- Redesign sales dashboard for better readability

SECURITY: Fixes data leakage where analytics showed data from all tenants"

# Push to repository
git push origin fix/invoice-tenant-id
```

### Step 2: SSH to Remote Server

**Try one of these methods:**

**Method 1: Using ttkey**
```bash
ssh -i ~/ttkey ubuntu@129.212.178.244
```

**Method 2: If you have SSH config**
```bash
ssh tailtown-server  # or whatever alias you use
```

**Method 3: Check your SSH config**
```bash
cat ~/.ssh/config | grep -A 10 "129.212.178.244"
```

**If SSH fails**, you may need to:
- Verify the SSH key is correct
- Check if the key needs to be re-added to the server
- Use a different authentication method (password, different key, etc.)

---

### Step 3: Once Connected - Backup Database

```bash
# Create backup
docker exec tailtown-postgres pg_dump -U postgres customer > ~/customer_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup was created
ls -lh ~/customer_backup_*.sql | tail -1
```

**✅ Checkpoint**: Backup file should be created (~125KB or larger)

---

### Step 4: Pull Latest Code

```bash
cd /var/www/tailtown

# Check current status
git status
git branch

# Pull latest changes
git fetch origin
git checkout fix/invoice-tenant-id
git pull origin fix/invoice-tenant-id

# Verify latest commit
git log -1 --oneline
```

**✅ Checkpoint**: Should see your commit message about multi-tenancy fix

---

### Step 5: Install Dependencies

```bash
cd /var/www/tailtown/services/customer

# Install any new dependencies
npm install

# Generate Prisma client
npx prisma generate
```

**✅ Checkpoint**: Prisma client should generate successfully

---

### Step 6: Run Database Migration

```bash
cd /var/www/tailtown/services/customer

# Run the migration
docker exec -i tailtown-postgres psql -U postgres -d customer < prisma/migrations/20251106_add_missing_schema_fields/migration.sql
```

**Expected output:**
```
NOTICE:  Added veterinarianId column to customers table
NOTICE:  Added vaccineRecordFiles column to pets table
NOTICE:  Added grooming_skills column to staff table
NOTICE:  Added max_appointments_per_day column to staff table
NOTICE:  Added average_service_time column to staff table
NOTICE:  Created index pets_veterinarian_id_idx
```

**✅ Checkpoint**: All columns should be added successfully

**Verify migration:**
```bash
docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'grooming_skills';"
```

Should return:
```
 column_name    
----------------
 grooming_skills
```

---

### Step 7: Build Application

```bash
cd /var/www/tailtown/services/customer

# Build the application
npm run build
```

**✅ Checkpoint**: Build should complete without errors

---

### Step 8: Restart Services

```bash
# Restart customer service
pm2 restart customer-service

# Check status
pm2 status

# View logs to ensure no errors
pm2 logs customer-service --lines 50
```

**✅ Checkpoint**: Service should restart successfully, no errors in logs

---

### Step 9: Health Check

```bash
# Check service health
curl http://localhost:4004/health

# Should return something like:
# {"status":"up","service":"customer-service","timestamp":"2025-11-06T..."}
```

**✅ Checkpoint**: Health endpoint should respond with status "up"

---

### Step 10: Verify on Dashboard

1. **Open browser**: https://dev.canicloud.com
2. **Login** to the dashboard
3. **Navigate to Sales Dashboard**
4. **Verify the following**:

   **Before Fix** (what you saw):
   - ❌ ~23,628 customers (all tenants)
   - ❌ Inflated revenue numbers

   **After Fix** (what you should see now):
   - ✅ ~1,157 customers (dev tenant only)
   - ✅ Accurate revenue for dev tenant
   - ✅ Service revenue matches expectations
   - ✅ Numbers consistent across date ranges

5. **Test different date ranges**:
   - Month view
   - All-time view
   - Verify numbers are consistent

---

## Verification Queries

If you want to verify the data directly in the database:

```bash
# Connect to database
docker exec -it tailtown-postgres psql -U postgres -d customer

# Check customer count per tenant
SELECT "tenantId", COUNT(*) as customer_count 
FROM customers 
GROUP BY "tenantId";

# Check invoice count and revenue per tenant
SELECT "tenantId", COUNT(*) as invoice_count, SUM(total) as total_revenue
FROM invoices 
GROUP BY "tenantId";

# Verify dev tenant specifically
SELECT COUNT(*) as dev_customers 
FROM customers 
WHERE "tenantId" = 'dev';

SELECT COUNT(*) as dev_invoices, SUM(total) as dev_revenue
FROM invoices 
WHERE "tenantId" = 'dev';

# Exit psql
\q
```

---

## Rollback (If Needed)

If something goes wrong:

### Option 1: Rollback Code
```bash
cd /var/www/tailtown
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>
cd services/customer
npm run build
pm2 restart customer-service
```

### Option 2: Restore Database
```bash
# Find your backup
ls -lh ~/customer_backup_*.sql

# Restore it
docker exec -i tailtown-postgres psql -U postgres -d customer < ~/customer_backup_YYYYMMDD_HHMMSS.sql

# Restart service
pm2 restart customer-service
```

---

## Troubleshooting

### SSH Connection Issues

If you can't connect via SSH:
1. Check if you have the correct SSH key
2. Verify the key permissions: `ls -la ~/ttkey` (should be 600)
3. Try adding the key to ssh-agent: `ssh-add ~/ttkey`
4. Check if you have an SSH config: `cat ~/.ssh/config`
5. Contact server administrator if key needs to be re-added

### Build Errors

If build fails:
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### PM2 Errors

If PM2 won't restart:
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs customer-service

# Try stopping and starting
pm2 stop customer-service
pm2 start customer-service

# Or reload PM2
pm2 reload customer-service
```

### Migration Errors

If migration fails:
```bash
# Check what columns exist
docker exec tailtown-postgres psql -U postgres -d customer -c "\d staff"

# The migration is safe - it checks IF NOT EXISTS
# You can run it multiple times without issues
```

---

## Success Checklist

- [ ] Code committed and pushed
- [ ] SSH connection established
- [ ] Database backup created
- [ ] Code pulled on server
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Migration run successfully
- [ ] Application built
- [ ] Service restarted
- [ ] Health check passing
- [ ] Dashboard verified
- [ ] Customer count correct (~1,157)
- [ ] Revenue accurate
- [ ] No errors in logs

---

## Support Files

- `DEPLOYMENT-CHECKLIST-NOV-6-2025.md` - Detailed deployment guide
- `SESSION-SUMMARY-NOV-6-2025.md` - Complete session summary
- `QUICK-REFERENCE.md` - Quick reference card
- Database backup: `~/tailtown_customer_backup_20251106_195115.sql`

---

**Need Help?**

If you encounter any issues during deployment, refer to:
1. The detailed logs: `pm2 logs customer-service`
2. The database backup location
3. The rollback procedures above

**Good luck with the deployment!** 🚀
