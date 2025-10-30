# Gingr Suite Discovery Tool
**Date:** October 29, 2025  
**Purpose:** Discover all kennel/suite names from Gingr system

---

## 🎯 Overview

This tool fetches reservations from your Gingr account and extracts all unique kennel/suite names. It will show you:
- All suite names in your Gingr system
- How many times each suite was used
- SQL to create resources in Tailtown
- Normalized suite names (e.g., "A 02" → "A02")

---

## 📋 Prerequisites

1. **Gingr API Access**
   - Your Gingr subdomain (e.g., "mykennel" from mykennel.gingrapp.com)
   - Your Gingr API key

2. **How to Get Your Gingr API Key:**
   - Log into your Gingr account
   - Go to **Settings** → **API Settings** or **Integrations**
   - Copy your API key

---

## 🚀 Usage

### Basic Usage

```bash
cd /Users/robweinstein/CascadeProjects/tailtown
node scripts/discover-gingr-suites.js <subdomain> <api-key>
```

### With Date Range

```bash
node scripts/discover-gingr-suites.js <subdomain> <api-key> 2024-01-01 2024-12-31
```

### Example

```bash
node scripts/discover-gingr-suites.js tailtown abc123xyz456 2024-01-01 2024-12-31
```

---

## 📊 Output

The script will output:

### 1. Discovery Summary
```
📊 SUITE DISCOVERY RESULTS
═══════════════════════════════

Total Reservations: 1,234
Reservations with Lodging: 1,200
Unique Suites Found: 27
```

### 2. Normalized Suite Names
```
🏨 NORMALIZED SUITE NAMES:
─────────────────────────────
  A01        (used in 45 reservations)
  A02        (used in 52 reservations)
  A03        (used in 38 reservations)
  ...
```

### 3. Original Gingr Names
```
📝 ORIGINAL GINGR NAMES:
─────────────────────────────
  "A. Indoor - A 01" → A01
  "A. Indoor - A 02" → A02
  "Suite A03" → A03
  ...
```

### 4. SQL to Create Resources
```sql
💾 SQL TO CREATE RESOURCES:
─────────────────────────────
INSERT INTO resources (id, name, type, capacity, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'A01', 'STANDARD_SUITE', 1, true, 'dev', NOW(), NOW());

INSERT INTO resources (id, name, type, capacity, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'A02', 'STANDARD_SUITE', 1, true, 'dev', NOW(), NOW());
...
```

### 5. JavaScript Array
```javascript
📋 JAVASCRIPT ARRAY:
─────────────────────────────
const suites = [
  'A01',
  'A02',
  'A03',
  ...
];
```

---

## 🔧 How It Works

### 1. Fetches Reservations
- Queries Gingr API for all reservations in date range
- Handles Gingr's 30-day API limitation by chunking requests
- Processes all reservations to extract lodging data

### 2. Extracts Lodging Names
Looks for lodging in multiple field names:
- `lodging_label`, `lodging_id`, `lodging`
- `room_label`, `room_id`, `room`
- `kennel_label`, `kennel_id`, `kennel`
- `suite_label`, `suite_id`
- Nested structures: `reservation.lodging.label`, etc.

### 3. Normalizes Names
Converts various formats to consistent naming:
- `"A 02"` → `"A02"`
- `"A. Indoor - A 02"` → `"A02"`
- `"Suite A02"` → `"A02"`
- `"A2"` → `"A02"` (adds leading zero)

### 4. Generates Output
- SQL statements to create resources
- JavaScript array for programmatic use
- Statistics and mapping information

---

## 🎨 Suite Type Detection

The script automatically determines suite types:

- **VIP_SUITE:** Names starting with "V" or containing "VIP", "PREMIUM"
- **STANDARD_PLUS_SUITE:** Names containing "PLUS", "+", "DELUXE"
- **STANDARD_SUITE:** All other suites (default)

---

## 📝 Next Steps

### After Running the Script:

1. **Review the Output**
   - Check that all suites are found
   - Verify normalized names are correct
   - Note any missing or unexpected suites

2. **Create Resources in Database**
   - Copy the SQL statements
   - Run them in your PostgreSQL database
   - Or use the Tailtown admin interface

3. **Verify in Tailtown**
   - Go to Admin → Resources
   - Check that all suites appear
   - Test creating a reservation with a suite

---

## 🐛 Troubleshooting

### No Reservations Found
**Problem:** Script returns 0 reservations

**Solutions:**
1. Check your API key is correct
2. Verify your subdomain is correct
3. Expand the date range (try last 2 years)
4. Check Gingr API permissions

### No Lodging Information Found
**Problem:** Reservations found but no lodging data

**Solutions:**
1. Check if lodging is assigned in Gingr
2. Field name might be different - check raw output
3. Contact Gingr support for field name

### API Error
**Problem:** "Gingr API error: 401 Unauthorized"

**Solutions:**
1. Verify API key is correct
2. Check API key hasn't expired
3. Ensure API access is enabled in Gingr

### Connection Error
**Problem:** "ENOTFOUND" or connection timeout

**Solutions:**
1. Check internet connection
2. Verify subdomain is correct
3. Check if Gingr is accessible

---

## 💡 Tips

### Best Date Range
- Use **last 12 months** for most accurate results
- Include busy seasons to capture all suites
- Longer ranges = more complete data

### Multiple Runs
- Run script multiple times with different date ranges
- Compare results to ensure consistency
- Use longest date range for final import

### Data Validation
- Cross-reference with Gingr dashboard
- Check that suite counts make sense
- Verify VIP/Premium suites are detected correctly

---

## 🔐 Security Notes

- **Never commit API keys** to version control
- Store API key securely (password manager)
- Rotate API keys periodically
- Use read-only API keys if available

---

## 📞 Support

### If You Need Help:

1. **Check the output** - Script provides detailed error messages
2. **Review Gingr documentation** - API field names may vary
3. **Test with small date range** - Easier to debug
4. **Share sample output** - Helps identify issues

### Common Issues:

| Issue | Solution |
|-------|----------|
| No suites found | Expand date range or check field names |
| Wrong suite names | Adjust normalization logic |
| Duplicate suites | Check for variations in Gingr naming |
| Missing suites | Check if they were used in date range |

---

## 📚 Related Documentation

- [Gingr API Documentation](https://gingrapp.com/api-docs)
- [Gingr Migration Guide](./GINGR-MIGRATION.md)
- [Resource Management](./RESOURCE-MANAGEMENT.md)

---

## ✅ Example Output

```bash
$ node scripts/discover-gingr-suites.js tailtown abc123 2024-01-01 2024-12-31

🏨 Gingr Suite Discovery Tool
═══════════════════════════════
Subdomain: tailtown
Date Range: 2024-01-01 to 2024-12-31

📅 Fetching reservations from 2024-01-01 to 2024-12-31...
  Fetching 2024-01-01 to 2024-01-30... ✅ 156 reservations
  Fetching 2024-01-31 to 2024-03-01... ✅ 142 reservations
  ...

✅ Total reservations fetched: 1,234

📊 SUITE DISCOVERY RESULTS
═══════════════════════════════

Total Reservations: 1,234
Reservations with Lodging: 1,200
Unique Suites Found: 27

🏨 NORMALIZED SUITE NAMES:
─────────────────────────────
  A01        (used in 45 reservations)
  A02        (used in 52 reservations)
  A03        (used in 38 reservations)
  A04        (used in 41 reservations)
  ...
  A27        (used in 39 reservations)

✅ Discovery complete!
```

---

**Created:** October 29, 2025  
**Status:** Ready to use  
**Tested:** Not yet tested with live Gingr API

---

## 🎉 Success!

Once you run this script, you'll have:
- ✅ Complete list of all suites in your Gingr system
- ✅ SQL to create them in Tailtown
- ✅ Normalized, consistent naming
- ✅ Usage statistics for each suite

This will ensure your Tailtown system matches your Gingr setup perfectly!
