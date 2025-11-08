# Gingr Employee Import Tool
**Date:** October 30, 2025  
**Purpose:** Import employee list and roles from Gingr system

---

## 🎯 Overview

This tool fetches employees from your Gingr account and generates SQL to import them into Tailtown. It will:
- Fetch all employees from Gingr
- Map Gingr roles to Tailtown roles
- Determine appropriate departments and positions
- Generate SQL statements to create staff records
- Preserve employee information (name, email, phone)

---

## 📋 Prerequisites

1. **Gingr API Access**
   - Your Gingr subdomain (e.g., "mykennel" from mykennel.gingrapp.com)
   - Your Gingr API key with employee/staff access

2. **How to Get Your Gingr API Key:**
   - Log into your Gingr account
   - Go to **Settings** → **API Settings** or **Integrations**
   - Ensure the API key has permission to access employee data
   - Copy your API key

---

## 🚀 Usage

### Basic Usage

```bash
cd /Users/robweinstein/CascadeProjects/tailtown
node scripts/import-gingr-employees.js <subdomain> <api-key>
```

### Example

```bash
node scripts/import-gingr-employees.js tailtown abc123xyz456
```

---

## 📊 Output

The script will output:

### 1. Employee Summary
```
📊 EMPLOYEE SUMMARY
═══════════════════════════════

Total Employees: 12
```

### 2. Employee List with Mappings
```
👥 EMPLOYEES FOUND:
─────────────────────────────

1. Jenny Spinola
   Email: jenny@tailtown.com
   Phone: (555) 123-4567
   Gingr Role: Lead Groomer
   → Tailtown Role: Staff
   → Department: Grooming
   → Position: Lead Groomer
   Status: Active

2. Amy Rudd
   Email: amy@tailtown.com
   Gingr Role: Dog Trainer
   → Tailtown Role: Instructor
   → Department: Training
   → Position: Dog Trainer
   Status: Active
```

### 3. SQL Import Statements
```sql
💾 SQL TO IMPORT EMPLOYEES:
═══════════════════════════════

-- Jenny Spinola (jenny@tailtown.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  "isActive", 
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Jenny',
  'Spinola',
  'jenny@tailtown.com',
  '$2b$10$YourHashedPasswordHere',
  'Staff',
  'Grooming',
  'Lead Groomer',
  '(555) 123-4567',
  true,
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;
```

---

## 🔄 Role Mapping

### Gingr → Tailtown Role Mapping

| Gingr Role | Tailtown Role |
|------------|---------------|
| Owner, Director | Administrator |
| Manager, Admin | Manager |
| Trainer, Instructor | Instructor |
| All others | Staff |

### Department & Position Detection

The script analyzes role/title to determine:

**Grooming Department:**
- Lead Groomer (if "lead" or "manager" in title)
- Groomer (default)

**Training Department:**
- Dog Trainer
- Instructor

**Kennel Department:**
- Kennel Manager (if "manager" or "lead")
- Kennel Technician (default)

**Front Desk:**
- Front Desk Manager (if "manager")
- Front Desk Associate (default)

**Veterinary:**
- Veterinarian
- Vet Technician

**Management:**
- General Manager (default for managers)

---

## 🔐 Password Setup

### Default Password
All imported employees get the same temporary password:
```
TempPass@2024!
```

This password meets all Tailtown security requirements:
- ✅ 8+ characters
- ✅ Uppercase letter
- ✅ Lowercase letter
- ✅ Number
- ✅ Special character
- ✅ No sequential characters
- ✅ No repeated characters

### Hashing the Password

**Before running the SQL**, you must hash the password:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('TempPass@2024!', 10);
console.log(hash);
// Output: $2b$10$abc123...xyz789
```

Then replace `$2b$10$YourHashedPasswordHere` in the SQL with the actual hash.

### Security Best Practices

1. **Hash Once, Use Everywhere** - Hash the password once and use the same hash for all employees
2. **Force Password Change** - Require employees to change password on first login
3. **Communicate Securely** - Send temporary password via secure channel
4. **Document Process** - Keep record of who received credentials

---

## 📝 Next Steps

### After Running the Script:

1. **Review Employee List**
   - Verify all employees are found
   - Check role mappings are correct
   - Note any missing employees

2. **Hash the Password**
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TempPass@2024!', 10).then(console.log)"
   ```

3. **Update SQL with Hash**
   - Replace `$2b$10$YourHashedPasswordHere` with actual hash
   - Save the updated SQL

4. **Run SQL in Database**
   ```bash
   psql -U postgres -d tailtown -f employees.sql
   ```

5. **Verify in Tailtown**
   - Go to Admin → Manage Staff
   - Check that all employees appear
   - Verify roles and departments are correct

6. **Notify Employees**
   - Send login credentials securely
   - Include temporary password
   - Request password change on first login

---

## 🐛 Troubleshooting

### No Employees Found

**Problem:** Script returns 0 employees

**Solutions:**
1. Check API key has employee/staff permissions
2. Verify subdomain is correct
3. Try accessing Gingr staff page manually
4. Contact Gingr support about API access

### API Endpoint Not Found

**Problem:** "Could not fetch employees from any known endpoint"

**Solutions:**
1. Gingr might use different endpoint names
2. Check Gingr API documentation
3. Contact Gingr support for correct endpoint
4. Try adding `?include=staff` or similar parameters

### Wrong Role Mappings

**Problem:** Employees assigned incorrect roles/departments

**Solutions:**
1. Check Gingr role/title fields
2. Adjust mapping logic in script
3. Manually correct in Tailtown after import
4. Re-run script with updated mappings

### Missing Email Addresses

**Problem:** Some employees don't have emails in Gingr

**Solutions:**
1. Script generates temporary emails: `firstname.lastname@temp.com`
2. Update emails in Tailtown after import
3. Add emails to Gingr before importing

---

## 💡 Tips

### Before Importing

- **Clean Gingr Data** - Update employee info in Gingr first
- **Test with Subset** - Try importing 1-2 employees first
- **Backup Database** - Always backup before bulk imports

### During Import

- **Review Mappings** - Check that roles make sense
- **Note Conflicts** - ON CONFLICT clause prevents duplicates
- **Keep SQL File** - Save generated SQL for records

### After Import

- **Verify Access** - Test login for each employee
- **Update Profiles** - Add photos, specialties, etc.
- **Set Schedules** - Import or create work schedules
- **Train Staff** - Show employees how to use Tailtown

---

## 🔐 Security Notes

- **Never commit API keys** to version control
- **Hash passwords** before inserting into database
- **Use secure channels** to communicate credentials
- **Force password changes** on first login
- **Audit access** regularly

---

## 📞 Support

### If You Need Help:

1. **Check Gingr API docs** - Endpoint names may vary
2. **Test API access** - Use curl or Postman
3. **Review error messages** - Script provides detailed errors
4. **Contact Gingr support** - For API-specific issues

### Common Issues:

| Issue | Solution |
|-------|----------|
| No employees found | Check API permissions |
| Wrong roles | Adjust mapping logic |
| Missing data | Update in Gingr first |
| Duplicate emails | Use ON CONFLICT clause |

---

## 📚 Related Documentation

- [Gingr Suite Discovery](./GINGR-SUITE-DISCOVERY.md)
- [Staff Management](./STAFF-MANAGEMENT.md)
- [Password Security](./PASSWORD-SECURITY.md)

---

## ✅ Example Output

```bash
$ node scripts/import-gingr-employees.js tailtown abc123

👥 Gingr Employee Import Tool
═══════════════════════════════
Subdomain: tailtown

📥 Fetching employees from Gingr...

✅ Found 12 employees using /staff endpoint

📊 EMPLOYEE SUMMARY
═══════════════════════════════

Total Employees: 12

👥 EMPLOYEES FOUND:
─────────────────────────────

1. Jenny Spinola
   Email: jenny@tailtown.com
   Phone: (555) 123-4567
   Gingr Role: Lead Groomer
   → Tailtown Role: Staff
   → Department: Grooming
   → Position: Lead Groomer
   Status: Active

2. Amy Rudd
   Email: amy@tailtown.com
   Gingr Role: Dog Trainer
   → Tailtown Role: Instructor
   → Department: Training
   → Position: Dog Trainer
   Status: Active

[... more employees ...]

💾 SQL TO IMPORT EMPLOYEES:
═══════════════════════════════

[SQL statements here]

📝 NEXT STEPS:
═══════════════════════════════
1. Review the employee list above
2. Hash the password "TempPass@2024!" with bcrypt
3. Replace "$2b$10$YourHashedPasswordHere" with the actual hash
4. Run the SQL in your PostgreSQL database
5. Notify employees to log in and change their password

✅ Import complete!
```

---

**Created:** October 30, 2025  
**Status:** Ready to use  
**Tested:** Not yet tested with live Gingr API

---

## 🎉 Success!

Once you run this script, you'll have:
- ✅ Complete list of all employees from Gingr
- ✅ Proper role and department mappings
- ✅ SQL to create staff records in Tailtown
- ✅ Consistent employee data across systems

This will ensure your Tailtown system has all your staff members ready to go!
