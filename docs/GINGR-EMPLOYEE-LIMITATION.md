# Gingr Employee Import Limitation

**Date:** October 30, 2025  
**Status:** API Limitation Discovered

---

## 🚫 Issue

Gingr's API **does not expose employee/staff data**. We attempted to import employees using the import tool but discovered:

### Endpoints Tested:
- `/get_staff` → 404 Not Found
- `/staff` → 404 Not Found  
- `/get_employees` → 404 Not Found

### API Response:
```
404 Page Not Found
"Ooops! We can't find what you're looking for."
```

---

## 💡 Why This Happens

Employee data is typically **not exposed via API** for several reasons:
1. **Privacy concerns** - Employee personal information is sensitive
2. **Security** - HR data requires higher security clearance
3. **Compliance** - GDPR, labor laws, etc.
4. **Business logic** - Gingr may want to keep employee management in-app only

---

## ✅ Alternative Solutions

### Option 1: Manual Entry (Recommended for Small Teams)

**Best for:** 5-15 employees

**Steps:**
1. Go to **Admin → Manage Staff** in Tailtown
2. Click **"Add Staff Member"**
3. Enter employee information:
   - Name
   - Email
   - Role (Administrator, Manager, Staff, Instructor)
   - Department (Grooming, Training, Kennel, etc.)
   - Position
   - Phone (optional)

**Advantages:**
- ✅ Complete control over data
- ✅ Can verify information as you enter
- ✅ Opportunity to update outdated info
- ✅ Set proper roles from the start

---

### Option 2: CSV Import (Recommended for Large Teams)

**Best for:** 15+ employees

**Steps:**

1. **Export from Gingr:**
   - Log into Gingr
   - Go to Staff/Employee management
   - Export to CSV/Excel (if available)
   - Or manually create a spreadsheet

2. **Create CSV file** with this format:
   ```csv
   firstName,lastName,email,role,department,position,phone
   Jenny,Spinola,jenny@example.com,Staff,Grooming,Lead Groomer,(555) 123-4567
   Amy,Rudd,amy@example.com,Instructor,Training,Dog Trainer,(555) 234-5678
   Annie,Chavez,annie@example.com,Staff,Grooming,Groomer,(555) 345-6789
   ```

3. **Create SQL from CSV:**
   ```bash
   # We can create a script to convert CSV to SQL
   node scripts/csv-to-staff-sql.js employees.csv
   ```

4. **Run SQL in database:**
   ```bash
   psql -U postgres -d tailtown -f employees.sql
   ```

---

### Option 3: Database Export/Import

**Best for:** Technical users with database access

If you have direct database access to Gingr (unlikely):

1. Export staff table from Gingr database
2. Map fields to Tailtown schema
3. Import into Tailtown database

**Note:** This typically requires Gingr support assistance.

---

## 📋 Employee Data Checklist

When adding employees manually or via CSV, collect:

### Required:
- ✅ First Name
- ✅ Last Name
- ✅ Email (must be unique)
- ✅ Role (Administrator, Manager, Staff, Instructor)
- ✅ Department
- ✅ Position

### Optional but Recommended:
- Phone number
- Address
- Hire date
- Specialties
- Profile photo

---

## 🎯 Recommended Approach

### For Tailtown Pet Resort:

Based on typical pet resort staffing (10-20 employees), we recommend:

**Option 1: Manual Entry** (30-60 minutes total)

1. **Gather Information First:**
   - Create a spreadsheet with all employee info
   - Verify emails are correct
   - Determine proper roles and departments

2. **Batch Entry:**
   - Set aside 30-60 minutes
   - Enter all employees at once
   - Use consistent naming/formatting

3. **Verify:**
   - Check each employee can log in
   - Verify roles and permissions
   - Update any missing information

---

## 🔐 Default Password

For manually added employees, use the secure default password:

```
TempPass@2024!
```

This meets all security requirements:
- ✅ 8+ characters
- ✅ Uppercase letter
- ✅ Lowercase letter
- ✅ Number
- ✅ Special character
- ✅ No sequential characters

**Important:** Require employees to change password on first login!

---

## 📝 Role Mapping Guide

Use this guide when entering employees from Gingr:

| Gingr Role/Title | Tailtown Role | Department | Position |
|------------------|---------------|------------|----------|
| Owner, Director | Administrator | Management | General Manager |
| Manager | Manager | Management | General Manager |
| Lead Groomer | Staff | Grooming | Lead Groomer |
| Groomer | Staff | Grooming | Groomer |
| Dog Trainer | Instructor | Training | Dog Trainer |
| Kennel Manager | Manager | Kennel | Kennel Manager |
| Kennel Tech | Staff | Kennel | Kennel Technician |
| Front Desk Manager | Manager | Front Desk | Front Desk Manager |
| Receptionist | Staff | Front Desk | Front Desk Associate |
| Veterinarian | Staff | Veterinary | Veterinarian |
| Vet Tech | Staff | Veterinary | Vet Technician |

---

## 🛠️ Future Enhancement

We could create a CSV import tool:

```bash
# Future tool
node scripts/import-staff-csv.js employees.csv
```

This would:
1. Read CSV file
2. Validate data
3. Generate SQL with hashed passwords
4. Provide import instructions

**Let me know if you'd like me to create this tool!**

---

## 📞 Support

### If You Need Help:

1. **Manual Entry Questions:**
   - What role should this person have?
   - Which department fits best?
   - How to handle multiple roles?

2. **CSV Import:**
   - Need help creating the CSV?
   - Want the CSV-to-SQL conversion tool?
   - Database import assistance?

3. **Gingr Questions:**
   - Contact Gingr support about API access
   - Ask if employee export is available
   - Request feature for future API versions

---

## ✅ Current Status

- ❌ Gingr API employee import: **Not Available**
- ✅ Manual entry via Tailtown UI: **Available**
- ✅ CSV import (with tool): **Can be created**
- ✅ Direct database import: **Available**

---

## 🎉 Next Steps

1. **Decide on approach:**
   - Manual entry (quick for small teams)
   - CSV import (better for larger teams)

2. **Gather employee information:**
   - Names, emails, roles
   - Departments and positions
   - Phone numbers (optional)

3. **Add to Tailtown:**
   - Use Admin → Manage Staff
   - Or request CSV import tool

4. **Notify employees:**
   - Send login credentials
   - Provide temporary password
   - Request password change

---

**Created:** October 30, 2025  
**Discovered:** Gingr API does not expose employee data  
**Recommendation:** Manual entry or CSV import

---

Would you like me to create a CSV-to-SQL conversion tool to make bulk import easier?
