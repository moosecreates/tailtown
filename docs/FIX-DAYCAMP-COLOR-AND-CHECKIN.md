# Fix: Day Camp Color & Check-In Errors
**Date:** October 27, 2025  
**Issues:** Day Camp showing wrong color, Check-in 500 error

---

## 🎨 Issue 1: Day Camp Color Not Orange

### Problem:
Jesse (A10) is a Day Camp dog but showing blue color instead of orange.

### Root Cause:
The service "Day Camp | Full Day" has `serviceCategory: 'BOARDING'` in the database instead of `'DAYCARE'`.

Console shows:
```javascript
{
  name: 'Day Camp | Full Day', 
  serviceCategory: 'BOARDING'  // ❌ Should be 'DAYCARE'
}
```

### Solution:

#### Option 1: Run SQL Script (Recommended)
```bash
# Connect to your PostgreSQL database
psql -h localhost -p 5433 -U postgres -d customer

# Run the fix script
\i fix-daycamp-service-category.sql
```

#### Option 2: Manual SQL
```sql
-- Fix Day Camp service category
UPDATE services 
SET "serviceCategory" = 'DAYCARE'
WHERE name LIKE '%Day Camp%' 
  OR name LIKE '%Daycare%'
  OR name LIKE '%Day Care%';

-- Verify
SELECT id, name, "serviceCategory", price 
FROM services 
WHERE "serviceCategory" = 'DAYCARE';
```

#### Option 3: Update via Admin UI
1. Navigate to Admin > Services
2. Find "Day Camp | Full Day" service
3. Edit the service
4. Change Category to "DAYCARE"
5. Save

### After Fix:
- Refresh browser
- Jesse (A10) should now show **orange** background
- All Day Camp reservations will be orange

---

## ❌ Issue 2: Check-In 500 Error

### Problem:
When clicking "Start Check-In", getting error:
```
GET http://localhost:4003/api/check-in-templates/default 500 (Internal Server Error)
Error loading check-in data: AxiosError
```

### Root Cause:
No default check-in template exists in the database.

### Solution:

#### Option 1: Run SQL Script (Recommended)
```bash
# Connect to your PostgreSQL database
psql -h localhost -p 5433 -U postgres -d customer

# Run the fix script
\i create-default-checkin-template.sql
```

#### Option 2: Manual SQL
```sql
-- Create default check-in template
INSERT INTO check_in_templates (
  id,
  "tenantId",
  name,
  description,
  "isDefault",
  sections,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'dev',
  'Standard Check-In',
  'Default check-in template for all reservations',
  true,
  '[]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
```

#### Option 3: Create via API (if endpoint exists)
```bash
curl -X POST http://localhost:4003/api/check-in-templates \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: dev" \
  -d '{
    "name": "Standard Check-In",
    "description": "Default check-in template",
    "isDefault": true,
    "sections": []
  }'
```

### After Fix:
- Refresh browser
- Click "Start Check-In" on any reservation
- Check-in workflow should load without errors

---

## 🚀 Quick Fix Commands

### Connect to Database:
```bash
# Mac/Linux
psql -h localhost -p 5433 -U postgres -d customer

# Or if you have a different setup
psql postgresql://postgres:password@localhost:5433/customer
```

### Run Both Fixes:
```sql
-- Fix 1: Day Camp Service Category
UPDATE services 
SET "serviceCategory" = 'DAYCARE'
WHERE name LIKE '%Day Camp%' 
  OR name LIKE '%Daycare%'
  OR name LIKE '%Day Care%';

-- Fix 2: Create Default Check-In Template
INSERT INTO check_in_templates (
  id,
  "tenantId",
  name,
  description,
  "isDefault",
  sections,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'dev',
  'Standard Check-In',
  'Default check-in template for all reservations',
  true,
  '[]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify both fixes
SELECT name, "serviceCategory" FROM services WHERE name LIKE '%Day Camp%';
SELECT name, "isDefault" FROM check_in_templates WHERE "tenantId" = 'dev';
```

---

## ✅ Verification

### Test Day Camp Color:
1. Navigate to Dashboard
2. Find Jesse (A10) in the list
3. **Expected:** Orange background
4. Navigate to Calendar
5. Find Jesse's reservation
6. **Expected:** Orange cell

### Test Check-In:
1. Navigate to Dashboard or Calendar
2. Find any CONFIRMED reservation
3. Click "Start Check-In" button
4. **Expected:** Check-in workflow opens without errors
5. Should see check-in form with sections

---

## 🐛 Troubleshooting

### Day Camp Still Not Orange:
1. **Clear browser cache** (Cmd+Shift+R)
2. **Check database:**
   ```sql
   SELECT id, name, "serviceCategory" 
   FROM services 
   WHERE name LIKE '%Day Camp%';
   ```
3. **Verify it says 'DAYCARE' not 'BOARDING'**
4. If still wrong, run UPDATE again

### Check-In Still Failing:
1. **Check if template exists:**
   ```sql
   SELECT * FROM check_in_templates 
   WHERE "tenantId" = 'dev' AND "isDefault" = true;
   ```
2. **If no results, run INSERT again**
3. **Check backend logs** for more details
4. **Restart reservation service:**
   ```bash
   cd services/reservation-service
   npm run dev
   ```

### Still Having Issues:
1. Check backend console for errors
2. Check browser console for errors
3. Verify database connection
4. Restart all services

---

## 📝 Prevention

### For Future Services:
When creating Day Camp/Daycare services:
1. Always set `serviceCategory` to `'DAYCARE'`
2. Not `'BOARDING'` or `'OTHER'`
3. This ensures proper color coding

### For Check-In Templates:
1. Always have at least one default template
2. Only one template can be default per tenant
3. Create templates via Admin UI when available

---

## 🎯 Summary

**Issue 1:** Day Camp service had wrong category → Fixed with SQL UPDATE  
**Issue 2:** Missing default check-in template → Fixed with SQL INSERT

**Files Created:**
- `fix-daycamp-service-category.sql` - SQL to fix service category
- `create-default-checkin-template.sql` - SQL to create template
- This guide

**Next Steps:**
1. Run the SQL scripts
2. Refresh browser
3. Test both fixes
4. Verify colors and check-in work

---

**Last Updated:** October 27, 2025 8:21 AM  
**Status:** Ready to apply fixes
