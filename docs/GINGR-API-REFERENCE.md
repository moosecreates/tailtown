# Gingr API Reference Documentation

**Date:** October 30, 2025  
**Source:** Official Gingr API Documentation  
**Base URL:** `https://{your_subdomain}.gingrapp.com/api/v1`

---

## 🔑 Authentication

All API calls require a `key` parameter with your user-specific API key.

**Authentication Methods:**
- **GET requests:** Pass `key` as query parameter
- **POST requests:** Pass `key` in form data body

---

## 📋 Table of Contents

1. [Reservations](#reservations)
2. [Owners (Customers)](#owners-customers)
3. [Animals (Pets)](#animals-pets)
4. [Transactions & Invoices](#transactions--invoices)
5. [Services & Products](#services--products)
6. [Subscriptions](#subscriptions)
7. [Staff & Timeclock](#staff--timeclock)
8. [System Data](#system-data)
9. [Operations](#operations)
10. [Custom Fields](#custom-fields)

---

## Reservations

### Get Reservations
**Endpoint:** `POST /reservations`

Retrieve a list of reservations within a given date range, or all currently checked in reservations.

**Required Parameters:**
- `key` - User-specific API key
- **Either:**
  - `start_date` - 'YYYY-MM-DD'
  - `end_date` - 'YYYY-MM-DD' (max 30-day range)
- **Or:**
  - `checked_in` - true (ignores start/end date)

**Optional Parameters:**
- `location_id` - Location ID or null (returns all locations)

**Example:**
```bash
curl "https://{subdomain}.gingrapp.com/api/v1/reservations" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=utf-8' \
  --data-urlencode "start_date=2024-01-01" \
  --data-urlencode "end_date=2024-01-31" \
  --data-urlencode "key={api_key}"
```

**Important:** Maximum date range is 30 days.

---

### Get Reservation Widget Data
**Endpoint:** `GET /reservation_widget_data`

Retrieve a summary of reservations for a given date (check-ins, check-outs, overnights).

**Required Parameters:**
- `key` - API key
- `timestamp` - Date in YYYY-MM-DD format

---

### Get Reservations by Animal
**Endpoint:** `GET /reservations_by_animal`

Retrieve reservations for a specific animal.

**Required Parameters:**
- `key` - API key
- `id` - Animal ID

**Optional Parameters:**
- `restrict_to` - Filter: "pending_requests", "currently_checked_in", "future", "past", "wait_listed"
- `params` - Array of:
  - `fromDate` - ISO 8601 format
  - `toDate` - ISO 8601 format
  - `reservationTypeIds` - Array of type IDs
  - `animalIds` - Array of animal IDs
  - `cancelledOnly` - Boolean
  - `confirmedOnly` - Boolean
  - `completedOnly` - Boolean
  - `limit` - Number of records

**Note:** Only returns data for the location the API user is logged into.

---

### Get Reservations by Owner
**Endpoint:** `GET /reservations_by_owner`

Retrieve reservations for a specific owner.

**Required Parameters:**
- `key` - API key
- `id` - Owner ID

**Optional Parameters:** Same as reservations_by_animal

**Note:** Only returns data for the location the API user is logged into.

---

### Get Reservation Types
**Endpoint:** `GET /reservation_types`

Retrieve list of reservation types.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `id` - Reservation type ID
- `active_only` - true/false

---

### Get Existing Reservation Estimate
**Endpoint:** `GET /existing_reservation_estimate`

Retrieve estimated cost for a future reservation.

**Required Parameters:**
- `key` - API key
- `id` - Reservation ID

---

### Recently Cancelled Reservations
**Endpoint:** `POST /recently_cancelled_reservations`

Get reservations cancelled within a date range.

**Required Parameters:**
- `key` - API key
- `start_date` - 'YYYY-MM-DD'
- `end_date` - 'YYYY-MM-DD'

**Optional Parameters:**
- `location_id` - Filter by location

---

## Owners (Customers)

### Get Owner
**Endpoint:** `GET /owner`

Retrieve information about a specific owner.

**Required Parameters:**
- `key` - API key

**Optional Parameters (one required):**
- `id` - Owner ID
- `animal_id` - Animal ID
- `reservation_id` - Reservation ID
- `phone` - Cell phone number
- `email` - Email address

---

### Get Owners
**Endpoint:** `GET /owners`

Retrieve a list of owners.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `params` - Key-value array of where clauses

**Example:**
```bash
curl "https://{subdomain}.gingrapp.com/api/v1/owners" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=utf-8' \
  --data-urlencode "key={api_key}" \
  --data-urlencode "params[zip]=80302"
```

---

### New/Modified Owners
**Endpoint:** `POST /new_modified_owners`

Get customers created or modified within date range.

**Required Parameters:**
- `key` - API key
- `start_date` - 'YYYY-MM-DD'
- `end_date` - 'YYYY-MM-DD'

**Optional Parameters:**
- `location_id` - Filter by home location

---

### Authorize Owner
**Endpoint:** `POST /authorize_owner`

Verify owner account exists and password matches.

**Required Parameters:**
- `email` - Customer email
- `password` - Customer password
- `key` - API key

---

## Animals (Pets)

### Get Animals
**Endpoint:** `GET /animals`

Retrieve a list of animals.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `params` - Key-value array of where clauses

**Example (animals with November birthday):**
```bash
curl "https://{subdomain}.gingrapp.com/api/v1/animals" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=utf-8' \
  --data-urlencode "params[month(from_unixtime(birthday))]=11" \
  --data-urlencode "key={api_key}"
```

---

### Get Feeding Info
**Endpoint:** `GET /get_feeding_info`

Retrieve animal's feeding information.

**Required Parameters:**
- `key` - API key
- `animal_id` - Animal ID

---

### Get Medication Info
**Endpoint:** `GET /get_medication_info`

Retrieve animal's medication information.

**Required Parameters:**
- `key` - API key
- `animal_id` - Animal ID

---

### Get Animal Immunizations
**Endpoint:** `GET /get_animal_immunizations`

Retrieve immunization records for an animal.

**Required Parameters:**
- `key` - API key
- `animal_id` - Animal ID

---

## Transactions & Invoices

### List Transactions
**Endpoint:** `GET /list_transactions`

Retrieve list of transactions.

**Required Parameters:**
- `key` - API key
- `from_date` - 'YYYY-MM-DD'
- `to_date` - 'YYYY-MM-DD'

**Note:** Only returns POS Transactions before August 1, 2019.

---

### List Invoices
**Endpoint:** `GET /list_invoices`

Retrieve list of invoices.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `per_page` - Number of results (enables pagination with `page`)
- `page` - Result number to begin page (requires `per_page`)
- `complete` - Boolean (true=Invoices, false=Estimates)
- `closed_only` - Boolean (true=closed only, false=all)
- `from_date` - 'YYYY-MM-DD'
- `to_date` - 'YYYY-MM-DD'

**Note:** Only returns Invoices created on/after August 1, 2019.

**Pagination:** When `per_page=10`, second page uses `page=11`, third uses `page=21`.

---

### Get Transaction
**Endpoint:** `POST /transaction`

Retrieve transaction and payment details.

**Required Parameters:**
- `key` - API key
- `id` - POS Transaction ID

---

## Services & Products

### Get Services by Type
**Endpoint:** `GET /get_services_by_type`

Retrieve allowable additional services for a reservation type.

**Required Parameters:**
- `key` - API key
- `type_id` - Reservation type ID

**Optional Parameters:**
- `location_id` - Location ID

---

### Get All Retail Items
**Endpoint:** `GET /get_all_retail_items`

Retrieve list of all retail items for sale.

**Required Parameters:**
- `key` - API key

---

## Subscriptions

### Get Subscription
**Endpoint:** `GET /get_subscription`

Retrieve a single subscription by ID.

**Required Parameters:**
- `key` - API key
- `id` - Subscription ID

---

### Get Subscriptions
**Endpoint:** `GET /get_subscriptions`

Retrieve list of subscriptions.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `include_deleted` - true/false (include canceled subscriptions)
- `bill_day_of_month` - Filter by renewal day
- `owner_id` - Filter by owner
- `limit` - Number of results
- `offset` - Pagination offset
- `location_id` - Filter by location
- `package_id` - Filter by package

---

## Staff & Timeclock

### Timeclock Report
**Endpoint:** `GET /timeclock_report`

Retrieve list of timeclock records.

**Required Parameters:**
- `key` - API key
- `start_date` - 'YYYY-MM-DD'
- `end_date` - 'YYYY-MM-DD'
- `location_id` - Location ID

**Optional Parameters:**
- `include_deleted` - Boolean
- `include_clocked_in` - Boolean
- `user_ids` - Array of user IDs

**Note:** This is the only staff-related endpoint available. Employee/staff management data is not exposed via API.

---

## System Data

### Get Locations
**Endpoint:** `GET /get_locations`

Retrieve list of locations.

**Required Parameters:**
- `key` - API key

---

### Get Species
**Endpoint:** `GET /get_species`

Retrieve list of species.

**Required Parameters:**
- `key` - API key

---

### Get Breeds
**Endpoint:** `GET /get_breeds`

Retrieve list of breeds.

**Required Parameters:**
- `key` - API key

---

### Get Vets
**Endpoint:** `GET /get_vets?vetFlag=true`

Retrieve list of vet names.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `vetFlag=true` - Return all vet information

---

### Get Temperaments
**Endpoint:** `GET /get_temperaments`

Retrieve list of temperaments.

**Required Parameters:**
- `key` - API key

---

### Get Immunization Types
**Endpoint:** `GET /get_immunization_types`

Retrieve list of immunizations for a species.

**Required Parameters:**
- `key` - API key
- `species_id` - Species ID

---

### Get Forms
**Endpoint:** `GET /forms/get_form`

Returns form's data structure.

**Required Parameters:**
- `form` - Either "owner_form" or "animal_form"

---

## Operations

### Back of House (Digital Whiteboard)
**Endpoint:** `GET /back_of_house`

Retrieve data for digital whiteboard.

**Required Parameters:**
- `key` - API key
- `location_id` - Location ID
- `type_ids` - Array of reservation type IDs

**Optional Parameters:**
- `mins_future` - Restrict to next/last X minutes
- `full_day` - Include all check-ins/outs today (ignores mins_future)

**Example:**
```bash
curl 'https://{subdomain}.gingrapp.com/api/v1/back_of_house?key={api_key}&location_id=1&full_day=true'
```

**Response:**
```json
{
  "success": true,
  "error": false,
  "data": {
    "checking_in": [...],
    "checking_out": [...]
  }
}
```

---

### Quick Check-in
**Endpoint:** `GET /quick_checkin`

Check in pet(s) for existing reservation, or create and check in.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `animal_id` - Animal ID
- `owner_id` - Owner ID
- `type_id` - Reservation type (defaults to system's quick type)

---

### Receive Call
**Endpoint:** `POST /receive_call`

Notify Gingr of incoming phone call (triggers in-app alert).

**Required Parameters:**
- `key` - API key
- `From` - Phone number making the call
- `Called` - Phone number receiving the call
- `CallStatus` - One of: initiated, ringing, answered, completed, in-progress, no-answer
- `CallSid` - Unique identifier for the call

**Optional Parameters:**
- `CallDuration` - Length of call in seconds

---

### Report Card Files
**Endpoint:** `GET /report_card_files`

Retrieve recently uploaded report card files.

**Required Parameters:**
- `key` - API key

**Optional Parameters:**
- `number` - days (today - X days)
- `limit` - Integer
- `location_id` - Location ID

---

## Custom Fields

### Custom Field Search
**Endpoint:** `GET /custom_field_search`

Retrieve custom field information for owner/animal.

**Required Parameters:**
- `key` - API key
- `form_id` - Form ID (owner_form=1, animal_form=2)
- `field_name` - Technical name of field
- `search` - Search term

**Example:**
```
https://{subdomain}.gingrapp.com/api/v1/custom_field_search?key={api_key}&form_id=1&field_name=[field_name]&search=[search_term]
```

**Response:**
```json
{
  "success": true,
  "error": false,
  "data": [{
    "system_id": "1694",
    "first_name": "Alexandra",
    "last_name": "Smith",
    "home_phone": "(555) 555-5555",
    ...
  }]
}
```

---

## 📝 Important Notes

### Date Ranges
- Maximum 30-day range for reservation queries
- Use YYYY-MM-DD format for dates
- ISO 8601 format for detailed timestamps

### Location Filtering
- Many endpoints support `location_id` parameter
- Null/omitted returns data from all locations
- Some endpoints only return data for user's current location

### Pagination
- Use `per_page` and `page` together
- `page` increments by `per_page` amount
- Example: per_page=10, page 2 starts at 11, page 3 at 21

### Transaction History Split
- Transactions before Aug 1, 2019: Use `/list_transactions`
- Invoices after Aug 1, 2019: Use `/list_invoices`

### Staff Data Limitation
- **Employee/staff management data is NOT available via API**
- Only timeclock records are accessible
- See [GINGR-EMPLOYEE-LIMITATION.md](./GINGR-EMPLOYEE-LIMITATION.md) for alternatives

---

## 🔐 Authentication Example

### GET Request
```bash
curl "https://{subdomain}.gingrapp.com/api/v1/owners?key={api_key}"
```

### POST Request
```bash
curl "https://{subdomain}.gingrapp.com/api/v1/reservations" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=utf-8' \
  --data-urlencode "key={api_key}" \
  --data-urlencode "start_date=2024-01-01" \
  --data-urlencode "end_date=2024-01-31"
```

---

## 📚 Related Documentation

- [Gingr Suite Discovery Tool](./GINGR-SUITE-DISCOVERY.md)
- [Gingr Employee Import Limitation](./GINGR-EMPLOYEE-LIMITATION.md)
- [Gingr Migration Guide](./GINGR-MIGRATION.md) (if exists)

---

**Last Updated:** October 30, 2025  
**API Version:** v1  
**Source:** Official Gingr API Documentation

---

## 💡 Quick Reference

| Category | Key Endpoints |
|----------|---------------|
| **Reservations** | `/reservations`, `/reservations_by_animal`, `/reservations_by_owner` |
| **Customers** | `/owner`, `/owners`, `/new_modified_owners` |
| **Pets** | `/animals`, `/get_feeding_info`, `/get_medication_info` |
| **Financial** | `/list_invoices`, `/list_transactions`, `/transaction` |
| **Operations** | `/back_of_house`, `/quick_checkin`, `/reservation_widget_data` |
| **System** | `/get_locations`, `/get_species`, `/get_breeds`, `/get_vets` |
| **Timeclock** | `/timeclock_report` |

---

This comprehensive reference covers all available Gingr API endpoints for integration with Tailtown.
