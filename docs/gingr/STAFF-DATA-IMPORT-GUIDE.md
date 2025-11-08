# Staff Data Import Guide
**Date:** November 1, 2025  
**Purpose:** Comprehensive import of staff, availability, and permissions into Tailtown

---

## 🎯 Overview

This guide covers importing staff data from multiple sources into Tailtown, including:
- **Staff Members**: Names, contact info, roles, departments, positions
- **Availability**: Work schedules, days off, recurring availability
- **Permissions**: Role-based access control and department permissions

---

## 📋 Supported Import Sources

### 1. Gingr API Import
Import directly from your existing Gingr system:
- Employees/staff members
- Role and position mapping
- Availability schedules (if available)

### 2. CSV File Import
Import from spreadsheet files:
- Staff data with all fields
- Separate availability schedules
- Easy to edit in Excel/Google Sheets

### 3. JSON File Import
Import from structured data:
- Combined staff and availability
- Complex data structures
- Programmatic imports

---

## 🚀 Quick Start

### Install Dependencies
```bash
cd /Users/robweinstein/CascadeProjects/tailtown
npm install node-fetch csv-parse bcrypt
```

### Basic Usage Examples

#### Gingr Import
```bash
node scripts/import-staff-data.js gingr <subdomain> <api-key>
```

#### CSV Import
```bash
node scripts/import-staff-data.js csv ./templates/staff-import-template.csv
```

#### JSON Import
```bash
node scripts/import-staff-data.js json ./templates/staff-import-template.json
```

#### Hash Password
```bash
node scripts/import-staff-data.js hash-password
```

---

## 📊 Data Formats

### Staff Data Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| firstName | ✅ | First name | "John" |
| lastName | ✅ | Last name | "Smith" |
| email | ✅ | Email address (unique) | "john@tailtown.com" |
| phone | ❌ | Phone number | "(555) 123-4567" |
| role | ❌ | Role title | "Manager" |
| title | ❌ | Job title | "General Manager" |
| department | ❌ | Department | "Management" |
| position | ❌ | Position | "General Manager" |
| isActive | ❌ | Employment status | true |
| address | ❌ | Street address | "123 Main St" |
| city | ❌ | City | "Anytown" |
| state | ❌ | State | "ST" |
| zipCode | ❌ | ZIP code | "12345" |
| specialties | ❌ | Array of specialties | ["Leadership", "Operations"] |

### Availability Data Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| email | ✅ | Staff member email | "john@tailtown.com" |
| dayOfWeek | ✅ | Day (0=Sunday, 6=Saturday) | 1 |
| startTime | ✅ | Start time (HH:MM) | "09:00" |
| endTime | ✅ | End time (HH:MM) | "17:00" |
| isAvailable | ❌ | Available for work | true |
| isRecurring | ❌ | Recurring schedule | true |

---

## 🔄 Role & Permission Mapping

### Automatic Role Detection
The system automatically maps roles based on title/keywords:

| Gingr Role/Title | Tailtown Role | Department |
|------------------|---------------|------------|
| Owner, Director | Administrator | Management |
| Manager, Admin | Manager | Management |
| Trainer, Instructor | Instructor | Training |
| Groomer, Lead Groomer | Staff | Grooming |
| Kennel Tech, Attendant | Staff | Kennel |
| Front Desk, Reception | Staff | Front Desk |
| Vet, Veterinarian | Staff | Veterinary |

### Permission Matrix

| Role | Manage Staff | Manage Customers | Manage Billing | Manage Reports | Manage Schedule |
|------|--------------|------------------|---------------|---------------|----------------|
| Administrator | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| Instructor | ❌ | ✅ | ❌ | ✅ | ✅ |
| Staff | ❌ | ❌ | ❌ | ❌ | ❌ |

### Department Permissions

| Department | Can Manage Grooming | Can Manage Training | Can Manage Kennels |
|------------|-------------------|-------------------|------------------|
| Grooming | ✅ | ❌ | ❌ |
| Training | ❌ | ✅ | ❌ |
| Kennel | ❌ | ❌ | ✅ |
| Management | ✅ | ✅ | ✅ |

---

## 📝 Step-by-Step Import Process

### Step 1: Prepare Your Data

#### Option A: Use Templates
```bash
# Copy templates to edit
cp templates/staff-import-template.csv my-staff.csv
cp templates/availability-import-template.csv my-availability.csv
```

#### Option B: Export from Existing System
Export your staff data to CSV/JSON format matching the field requirements.

### Step 2: Validate Data Format
```bash
# Test CSV parsing
node scripts/import-staff-data.js csv my-staff.csv

# Test JSON parsing  
node scripts/import-staff-data.js json my-staff.json
```

### Step 3: Generate SQL
Run the import tool to generate SQL statements:
```bash
node scripts/import-staff-data.js csv my-staff.csv > staff-import.sql
```

### Step 4: Hash Password
```bash
# Generate hashed password
node scripts/import-staff-data.js hash-password
# Output: $2b$10$abc123...xyz789
```

### Step 5: Update SQL
Replace `$2b$10$YourHashedPasswordHere` with the actual hash.

### Step 6: Execute SQL
```bash
# Connect to database and run SQL
psql -U postgres -d customer -f staff-import.sql
```

### Step 7: Verify Import
1. Go to **Admin → Users** in Tailtown
2. Check all staff members appear
3. Verify roles and departments are correct
4. Test login with temporary password

---

## 🔐 Security Setup

### Default Password
All imported staff receive: `TempPass@2024!`

This password meets all security requirements:
- ✅ 8+ characters
- ✅ Uppercase and lowercase letters
- ✅ Numbers and special characters
- ✅ No sequential or repeated characters

### Password Hashing
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('TempPass@2024!', 10);
// Use this hash in your SQL
```

### Security Best Practices
1. **Force Password Change** - Require staff to change password on first login
2. **Secure Distribution** - Send credentials via secure channels only
3. **Audit Access** - Review who has access to what
4. **Regular Updates** - Update passwords and permissions regularly

---

## 📋 Template Files

### CSV Templates
- `templates/staff-import-template.csv` - Staff member data
- `templates/availability-import-template.csv` - Work schedules

### JSON Template
- `templates/staff-import-template.json` - Combined staff and availability

### Using Templates
```bash
# Copy and edit templates
cp templates/staff-import-template.csv my-staff.csv
# Edit in Excel or text editor
# Import your edited file
node scripts/import-staff-data.js csv my-staff.csv
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No employees found" | Gingr API permissions | Check API key has staff access |
| "Invalid CSV format" | Missing headers | Use provided templates |
| "Email already exists" | Duplicate staff | ON CONFLICT clause handles this |
| "Invalid day of week" | Wrong day format | Use 0-6 (Sunday-Saturday) |
| "Missing password hash" | Security requirement | Hash password before importing |

### Gingr API Issues
1. **Check API Key**: Ensure key has staff/employee permissions
2. **Verify Subdomain**: Confirm your Gingr subdomain is correct
3. **Test Endpoints**: Try accessing Gingr API directly
4. **Contact Support**: Reach out to Gingr for API access

### CSV Format Issues
1. **Use Templates**: Start with provided CSV templates
2. **Check Headers**: Ensure all required columns exist
3. **Validate Data**: Check for empty required fields
4. **Encoding**: Save as UTF-8 format

### Database Issues
1. **Check Connection**: Verify database connection details
2. **Schema Sync**: Ensure Prisma schema is up to date
3. **Permissions**: Confirm database user has INSERT permissions
4. **Constraints**: Check for unique constraint violations

---

## 📊 Import Examples

### Example 1: Small Team Import
```csv
firstName,lastName,email,role,department,position
John,Smith,john@tailtown.com,Manager,Management,General Manager
Jane,Doe,jane@tailtown.com,Groomer,Grooming,Lead Groomer
```

### Example 2: Full Staff with Availability
```json
{
  "staff": [
    {
      "firstName": "John",
      "lastName": "Smith", 
      "email": "john@tailtown.com",
      "role": "Manager",
      "department": "Management"
    }
  ],
  "availability": [
    {
      "email": "john@tailtown.com",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

### Example 3: Gingr Import
```bash
node scripts/import-staff-data.js gingr mykennel abc123api789
```

---

## 📞 Support & Resources

### Documentation
- [Gingr Integration Guide](./GINGR-INTEGRATION.md)
- [Staff Management](./STAFF-MANAGEMENT.md)
- [User Permissions](./USER-PERMISSIONS.md)

### Templates Location
```
templates/
├── staff-import-template.csv
├── availability-import-template.csv
└── staff-import-template.json
```

### Script Location
```
scripts/import-staff-data.js
```

---

## ✅ Success Checklist

After completing your import:

- [ ] All staff members appear in Admin → Users
- [ ] Roles and departments are correctly mapped
- [ ] Availability schedules are imported
- [ ] Permissions are appropriate for each role
- [ ] Staff can log in with temporary password
- [ ] Password change on first login works
- [ ] All Gingr data (if applicable) is migrated
- [ ] No duplicate email addresses exist
- [ ] Database constraints are satisfied

---

## 🎉 Import Complete!

Once you've completed these steps, you'll have:
- ✅ Complete staff roster in Tailtown
- ✅ Proper role and department assignments
- ✅ Work schedules and availability
- ✅ Role-based permissions configured
- ✅ Secure login credentials distributed

Your Tailtown system is now ready with all your staff members imported and configured!

---

**Created:** November 1, 2025  
**Status:** Ready to use  
**Tested:** With sample data templates
