# Staff Data Import Tool

**Comprehensive import solution for staff, availability, and permissions in Tailtown**

## 🎯 Overview

The Staff Data Import Tool allows you to import staff members, their work schedules, and role-based permissions from multiple sources into Tailtown Pet Resort Management System.

## 📋 Supported Import Sources

### 1. Gingr API Import
Import directly from your existing Gingr system:
```bash
node scripts/import-staff-data.js gingr <subdomain> <api-key>
```

### 2. CSV File Import
Import from spreadsheet files:
```bash
node scripts/import-staff-data.js csv <file-path>
```

### 3. JSON File Import
Import from structured data:
```bash
node scripts/import-staff-data.js json <file-path>
```

### 4. Password Hash Utility
Generate secure password hashes:
```bash
node scripts/import-staff-data.js hash-password
```

## 📁 Template Files

Ready-to-use templates are provided in the `templates/` directory:

### Staff Data Templates
- `templates/staff-import-template.csv` - CSV format for staff members
- `templates/staff-import-template.json` - JSON format with combined staff and availability
- `templates/availability-import-template.csv` - CSV format for work schedules

### Using Templates
```bash
# Copy and edit templates
cp templates/staff-import-template.csv my-staff.csv
cp templates/availability-import-template.csv my-availability.csv

# Import your edited files
node scripts/import-staff-data.js csv my-staff.csv
node scripts/import-staff-data.js csv my-availability.csv
```

## 🚀 Quick Start

### Step 1: Prepare Your Data
Choose one of the following:

**Option A: Use Gingr API**
```bash
node scripts/import-staff-data.js gingr yourkennel abc123api789
```

**Option B: Edit CSV Template**
```bash
cp templates/staff-import-template.csv my-staff.csv
# Edit in Excel or text editor
node scripts/import-staff-data.js csv my-staff.csv > staff-import.sql
```

**Option C: Use JSON Template**
```bash
cp templates/staff-import-template.json my-staff.json
# Edit in text editor
node scripts/import-staff-data.js json my-staff.json > staff-import.sql
```

### Step 2: Generate Password Hash
```bash
node scripts/import-staff-data.js hash-password
# Follow instructions to generate bcrypt hash
```

### Step 3: Update SQL
Replace `$2b$10$YourHashedPasswordHere` in the generated SQL with your actual hash.

### Step 4: Execute SQL
```bash
# Connect to database and run SQL
psql -U postgres -d customer -f staff-import.sql
```

### Step 5: Verify Import
1. Go to **Admin → Users** in Tailtown
2. Check all staff members appear
3. Verify roles and departments are correct
4. Test login with temporary password

## 📊 Data Fields

### Staff Data
| Field | Required | Description |
|-------|----------|-------------|
| firstName | ✅ | First name |
| lastName | ✅ | Last name |
| email | ✅ | Email address (unique) |
| phone | ❌ | Phone number |
| role | ❌ | Role title |
| department | ❌ | Department |
| position | ❌ | Position |
| isActive | ❌ | Employment status |
| address | ❌ | Street address |
| city | ❌ | City |
| state | ❌ | State |
| zipCode | ❌ | ZIP code |
| specialties | ❌ | Array of specialties |

### Availability Data
| Field | Required | Description |
|-------|----------|-------------|
| email | ✅ | Staff member email |
| dayOfWeek | ✅ | Day (0=Sunday, 6=Saturday) |
| startTime | ✅ | Start time (HH:MM) |
| endTime | ✅ | End time (HH:MM) |
| isAvailable | ❌ | Available for work |
| isRecurring | ❌ | Recurring schedule |

## 🔄 Role & Permission Mapping

### Automatic Role Detection
The system automatically maps roles based on title/keywords:

| Input Role/Title | Tailtown Role | Department |
|------------------|---------------|------------|
| Owner, Director | Administrator | Management |
| Manager, Admin | Manager | Management |
| Trainer, Instructor | Instructor | Training |
| Groomer, Lead Groomer | Staff | Grooming |
| Kennel Tech, Attendant | Staff | Kennel |
| Front Desk, Reception | Staff | Front Desk |
| Vet, Veterinarian | Staff | Veterinary |

### Permission Matrix
| Role | Manage Staff | Manage Customers | Manage Billing | Manage Reports |
|------|--------------|------------------|---------------|---------------|
| Administrator | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ✅ |
| Instructor | ❌ | ✅ | ❌ | ✅ |
| Staff | ❌ | ❌ | ❌ | ❌ |

## 🔐 Security

### Default Password
All imported staff receive: `TempPass@2024!`

This password meets all security requirements:
- ✅ 8+ characters
- ✅ Uppercase and lowercase letters
- ✅ Numbers and special characters
- ✅ No sequential or repeated characters

### Password Hashing
```bash
# Generate secure hash
node scripts/import-staff-data.js hash-password

# Or use online tool: https://bcrypt-generator.com/
```

## 📝 Example Usage

### Import from Gingr
```bash
node scripts/import-staff-data.js gingr tailtown abc123xyz456
```

### Import from CSV
```bash
node scripts/import-staff-data.js csv ./my-staff-data.csv
```

### Import from JSON
```bash
node scripts/import-staff-data.js json ./my-staff-data.json
```

### Generate Password Hash
```bash
node scripts/import-staff-data.js hash-password
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "No employees found" | Check Gingr API permissions |
| "Invalid CSV format" | Use provided templates |
| "Email already exists" | ON CONFLICT clause handles this |
| "Module not found" | Install dependencies: `npm install` |

### Gingr API Issues
1. Check API key has staff/employee permissions
2. Verify subdomain is correct
3. Test API access manually
4. Contact Gingr support for API access

### CSV Format Issues
1. Use provided CSV templates
2. Check for empty required fields
3. Save as UTF-8 format
4. Validate column headers

## 📚 Documentation

- **Complete Guide**: [docs/STAFF-DATA-IMPORT-GUIDE.md](./docs/STAFF-DATA-IMPORT-GUIDE.md)
- **Gingr Integration**: [docs/GINGR-EMPLOYEE-IMPORT.md](./docs/GINGR-EMPLOYEE-IMPORT.md)
- **Staff Management**: [docs/STAFF-MANAGEMENT.md](./docs/STAFF-MANAGEMENT.md)

## ✅ Success Checklist

After completing your import:

- [ ] All staff members appear in Admin → Users
- [ ] Roles and departments are correctly mapped
- [ ] Availability schedules are imported
- [ ] Permissions are appropriate for each role
- [ ] Staff can log in with temporary password
- [ ] Password change on first login works
- [ ] No duplicate email addresses exist

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
**Compatible:** Node.js 16+  
**Dependencies:** Built-in Node.js modules only
