# Tailtown API Documentation

**Version:** 1.0.0  
**Last Updated:** November 7, 2025  
**Base URL (Production):** https://canicloud.com/api (multi-tenant subdomains)  
**Base URL (Local Development):** http://localhost:4004/api (developers only)

**Production Examples:**
- Tailtown: `https://tailtown.canicloud.com/api`
- BranGro: `https://brangro.canicloud.com/api`

---

## 📚 Table of Contents

1. [Authentication](#authentication)
2. [API Services](#api-services)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)

---

## 🔐 Authentication

### JWT Token Authentication

All API requests (except login) require a valid JWT token in the Authorization header.

```bash
Authorization: Bearer <your_jwt_token>
```

### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
}
```

### Multi-Tenant Header

All requests must include the tenant identifier:

```bash
x-tenant-id: your-tenant-subdomain
```

---

## 🏗️ API Services

### Customer Service (Port 4004)

Handles customers, pets, staff, and business operations.

#### Endpoints

**Customers**
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Pets**
- `GET /api/pets` - List all pets
- `GET /api/pets/:id` - Get pet details
- `POST /api/pets` - Create pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet
- `POST /api/pets/:id/photo` - Upload pet photo
- `GET /api/pets/:id/vaccine-compliance` - Check vaccine compliance

**Staff**
- `GET /api/staff` - List all staff
- `GET /api/staff/:id` - Get staff details
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `POST /api/staff/:id/photo` - Upload profile photo
- `DELETE /api/staff/:id/photo` - Delete profile photo

**Products**
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/inventory/adjust` - Adjust inventory

**Business Settings**
- `GET /api/business-settings` - Get business settings
- `PUT /api/business-settings` - Update business settings

### Reservation Service (Port 4003)

Handles reservations, resources, and scheduling.

#### Endpoints

**Reservations**
- `GET /api/reservations` - List all reservations
- `GET /api/reservations/:id` - Get reservation details
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation
- `POST /api/reservations/:id/check-in` - Check in reservation
- `POST /api/reservations/:id/check-out` - Check out reservation

**Resources**
- `GET /api/resources` - List all resources (kennels/suites)
- `GET /api/resources/:id` - Get resource details
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `POST /api/resources/availability/batch` - Check availability for multiple resources

**Training Classes**
- `GET /api/training-classes` - List all training classes
- `GET /api/training-classes/:id` - Get class details
- `POST /api/training-classes` - Create training class
- `PUT /api/training-classes/:id` - Update training class
- `DELETE /api/training-classes/:id` - Delete training class
- `GET /api/training-classes/:id/sessions` - Get class sessions
- `POST /api/training-classes/:id/enroll` - Enroll in class

---

## 🔄 Common Patterns

### Standard Response Format

All successful API responses follow this format:

```json
{
  "status": "success",
  "data": { ... },
  "results": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 50
  }
}
```

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Query Parameters

Most list endpoints support these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction (`asc` or `desc`)
- `search` - Search query
- `filter` - Filter criteria (endpoint-specific)

**Example:**
```bash
GET /api/customers?page=2&limit=25&sortBy=lastName&sortOrder=asc&search=smith
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Messages

**Authentication Errors:**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

**Validation Errors:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "phone",
      "message": "Phone number must be in format XXX-XXX-XXXX"
    }
  ]
}
```

**Not Found:**
```json
{
  "status": "error",
  "message": "Customer not found"
}
```

---

## 🚦 Rate Limiting

### Limits

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 login attempts per 15 minutes per IP
- **Password Reset:** 3 requests per hour per email

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

### Rate Limit Exceeded Response

```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## 📄 Pagination

### Request

```bash
GET /api/customers?page=2&limit=25
```

### Response

```json
{
  "status": "success",
  "results": 25,
  "pagination": {
    "page": 2,
    "limit": 25,
    "totalPages": 10,
    "totalResults": 250,
    "hasNextPage": true,
    "hasPrevPage": true
  },
  "data": [...]
}
```

### Large Datasets

For endpoints that may return large datasets (>1000 items), use the `limit=1000` parameter to fetch all pages:

```bash
GET /api/resources?limit=1000
```

The API will automatically fetch all pages and return the complete dataset.

---

## 🔍 Search

### Customer Search

Search customers by name, email, or phone:

```bash
GET /api/customers?search=john
GET /api/customers?search=555-0112
GET /api/customers?search=john@example.com
```

### Pet Search

Search pets by name or breed:

```bash
GET /api/pets?search=max
GET /api/pets?search=golden retriever
```

### Phone Number Search

Phone numbers can be searched with or without formatting:

```bash
GET /api/customers?search=5550112      # Unformatted
GET /api/customers?search=555-0112     # Formatted
GET /api/customers?search=0112         # Last 4 digits
```

---

## 📊 Filtering

### Date Range Filtering

```bash
GET /api/reservations?startDate=2025-11-01&endDate=2025-11-30
```

### Status Filtering

```bash
GET /api/reservations?status=CONFIRMED
GET /api/customers?isActive=true
```

### Type Filtering

```bash
GET /api/resources?type=SUITE
GET /api/products?isService=false
```

---

## 🔧 Advanced Features

### Batch Operations

Some endpoints support batch operations:

```bash
POST /api/resources/availability/batch
Content-Type: application/json

{
  "resourceIds": ["uuid1", "uuid2", "uuid3"],
  "startDate": "2025-11-01",
  "endDate": "2025-11-07"
}
```

### File Uploads

File upload endpoints use `multipart/form-data`:

```bash
POST /api/pets/:id/photo
Content-Type: multipart/form-data

photo: <file>
```

### Bulk Import

```bash
POST /api/customers/import
Content-Type: application/json

{
  "customers": [
    { "firstName": "John", "lastName": "Doe", "email": "john@example.com" },
    { "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com" }
  ]
}
```

---

## 📝 Examples

### Create a Customer

```bash
curl -X POST https://canicloud.com/api/customers \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: brangro" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-0123",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  }'
```

### Create a Reservation

```bash
curl -X POST https://canicloud.com/api/reservations \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: brangro" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "petIds": ["pet-uuid-1", "pet-uuid-2"],
    "resourceId": "resource-uuid",
    "startDate": "2025-11-10",
    "endDate": "2025-11-15",
    "serviceType": "BOARDING",
    "status": "CONFIRMED"
  }'
```

### Search Customers by Phone

```bash
curl -X GET "https://canicloud.com/api/customers?search=5550112" \
  -H "Authorization: Bearer <token>" \
  -H "x-tenant-id: brangro"
```

---

## 🔗 Related Documentation

- [Authentication Guide](./AUTHENTICATION.md)
- [Customer API Reference](./CUSTOMER-API.md)
- [Reservation API Reference](./RESERVATION-API.md)
- [Error Codes Reference](./ERROR-CODES.md)

---

## 📞 Support

For API support or questions:
- **Documentation:** [DOCUMENTATION-INDEX.md](../../DOCUMENTATION-INDEX.md)
- **Email:** rob@tailtownpetresort.com
- **GitHub Issues:** https://github.com/moosecreates/tailtown/issues

---

**Last Updated:** November 7, 2025  
**API Version:** 1.0.0

**Note:** All curl examples in this document use production URLs. For local development, replace `https://canicloud.com` with `http://localhost:4004`.
