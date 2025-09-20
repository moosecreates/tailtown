# Order System API Documentation

## Overview

The Tailtown Order System provides a complete end-to-end order processing workflow through a 5-step process. This document outlines the API endpoints and data structures used in the order system.

## Order Processing Flow

### Step 1: Customer Information
- **Endpoint**: `GET /api/customers?search={query}`
- **Purpose**: Search and select customer and their pets
- **Service**: Customer Service (port 4004)

### Step 2: Reservation Details
- **Endpoint**: `POST /api/reservations`
- **Purpose**: Create reservation with service, dates, and resource assignment
- **Service**: Reservation Service (port 4003)

### Step 3: Add-On Services
- **Endpoint**: `GET /api/services/{serviceId}/add-ons`
- **Purpose**: Retrieve available add-on services for the selected service
- **Service**: Customer Service (port 4004)

### Step 4: Invoice Generation
- **Endpoint**: `POST /api/invoices`
- **Purpose**: Generate invoice with line items, tax calculation, and totals
- **Service**: Customer Service (port 4004)

### Step 5: Payment Processing
- **Endpoint**: `POST /api/payments`
- **Purpose**: Process payment and update invoice status
- **Service**: Customer Service (port 4004)

## Enhanced API Endpoints

### Reservation Details with Complete Data

#### GET /api/reservations/{id}

**Enhanced Response Format:**
```json
{
  "status": "success",
  "data": {
    "reservation": {
      "id": "uuid",
      "startDate": "2025-09-20T01:37:42.668Z",
      "endDate": "2025-09-20T02:37:42.668Z",
      "status": "CONFIRMED",
      "notes": "string",
      "customer": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string"
      },
      "pet": {
        "name": "string",
        "breed": "string",
        "birthdate": "date"
      },
      "service": {
        "id": "uuid",
        "name": "string",
        "price": 50.00,
        "description": "string"
      },
      "resource": {
        "name": "string",
        "type": "string"
      },
      "addOnServices": [
        {
          "id": "uuid",
          "price": 15.00,
          "notes": "string",
          "addOn": {
            "id": "uuid",
            "name": "string",
            "description": "string",
            "price": 15.00
          }
        }
      ],
      "invoice": {
        "id": "uuid",
        "invoiceNumber": "INV-20250920-7575",
        "status": "PAID",
        "total": 53.72,
        "subtotal": 50.00,
        "taxAmount": 3.72,
        "discount": 0,
        "payments": [
          {
            "id": "uuid",
            "amount": 53.72,
            "method": "CREDIT_CARD",
            "status": "PAID",
            "paymentDate": "2025-09-20T01:38:17.543Z"
          }
        ]
      }
    }
  }
}
```

### Customer Search

#### GET /api/customers?search={query}

**Headers Required:**
- `x-tenant-id: dev`
- `Content-Type: application/json`

**Response Format:**
```json
{
  "status": "success",
  "results": 1,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "pets": [
        {
          "id": "uuid",
          "name": "string",
          "breed": "string"
        }
      ]
    }
  ]
}
```

### Reservation Creation

#### POST /api/reservations

**Headers Required:**
- `x-tenant-id: dev`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "customerId": "uuid",
  "petId": "uuid",
  "serviceId": "uuid",
  "startDate": "2025-09-20T01:37:42.668Z",
  "endDate": "2025-09-20T02:37:42.668Z",
  "status": "PENDING",
  "notes": "string",
  "resourceId": "uuid" // optional
}
```

**Response Format:**
```json
{
  "success": true,
  "status": "success",
  "data": {
    "reservation": {
      "id": "uuid",
      "tenantId": "dev",
      "startDate": "2025-09-20T01:37:42.668Z",
      "endDate": "2025-09-20T02:37:42.668Z",
      "status": "PENDING",
      "customerId": "uuid",
      "petId": "uuid",
      "serviceId": "uuid",
      "resourceId": "uuid",
      "customer": { /* customer details */ },
      "pet": { /* pet details */ },
      "service": { /* service details with price */ },
      "resource": { /* resource details */ }
    }
  },
  "warnings": [
    "No resources found for suite type: KENNEL. The reservation will be created without a resource assignment."
  ]
}
```

### Invoice Creation

#### POST /api/invoices

**Request Body:**
```json
{
  "customerId": "uuid",
  "reservationId": "uuid",
  "dueDate": "2025-09-27T01:38:17.543Z",
  "status": "DRAFT",
  "subtotal": 50.00,
  "taxRate": 0.0744,
  "taxAmount": 3.72,
  "discount": 0,
  "total": 53.72,
  "notes": "string",
  "lineItems": [
    {
      "description": "Reservation Service",
      "quantity": 1,
      "unitPrice": 50.00,
      "amount": 50.00,
      "taxable": true
    }
  ]
}
```

### Payment Processing

#### POST /api/payments

**Request Body:**
```json
{
  "invoiceId": "uuid",
  "customerId": "uuid",
  "amount": 53.72,
  "method": "CREDIT_CARD",
  "status": "PAID",
  "transactionId": "TXID-1726789097543",
  "notes": "Payment processed via CREDIT_CARD"
}
```

## CORS Configuration

### Required Headers
All services now support the following CORS configuration:

**Allowed Origins:** `*`
**Allowed Methods:** `GET, POST, PUT, PATCH, DELETE, OPTIONS`
**Allowed Headers:** `Content-Type, Authorization, x-tenant-id`
**Credentials:** `true`

### Tenant ID Requirement
All API requests must include the `x-tenant-id` header:
```
x-tenant-id: dev
```

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Start date must be before end date"
  }
}
```

#### CORS Error
```
Access to XMLHttpRequest at 'http://localhost:4004/api/customers' from origin 'http://localhost:3000' has been blocked by CORS policy: Request header field x-tenant-id is not allowed by Access-Control-Allow-Headers in preflight response.
```

#### Network Error
```json
{
  "message": "Network Error",
  "status": undefined,
  "data": undefined
}
```

## Service Architecture

### Customer Service (Port 4004)
- Customer search and management
- Invoice generation and management
- Payment processing
- Service and add-on management

### Reservation Service (Port 4003)
- Reservation creation and management
- Resource allocation and conflict detection
- Enhanced data retrieval with relations

### Frontend (Port 3000)
- Complete order processing UI
- 5-step wizard interface
- Real-time validation and error handling

## Testing the Order System

### Manual Testing Flow
1. **Start Services:**
   ```bash
   # Terminal 1: Customer Service
   cd services/customer && npm run dev
   
   # Terminal 2: Reservation Service  
   cd services/reservation-service && npm run dev
   
   # Terminal 3: Frontend
   cd frontend && npm start
   ```

2. **Set Tenant ID in Browser:**
   ```javascript
   localStorage.setItem("tailtown_tenant_id", "dev");
   ```

3. **Navigate to New Order:**
   - Go to http://localhost:3000/orders/new
   - Complete the 5-step order process

### API Testing with curl

#### Test Customer Search:
```bash
curl -H "x-tenant-id: dev" "http://localhost:4004/api/customers?search=ant"
```

#### Test Reservation Creation:
```bash
curl -X POST -H "Content-Type: application/json" -H "x-tenant-id: dev" \
  -d '{"customerId":"uuid","petId":"uuid","serviceId":"uuid","startDate":"2025-09-20T12:00:00.000Z","endDate":"2025-09-21T12:00:00.000Z","status":"PENDING","notes":""}' \
  "http://localhost:4003/api/reservations"
```

## Version History

### v2.0.0 (2025-09-19)
- Complete order system implementation
- Enhanced reservation API with full data relations
- Fixed CORS configuration across all services
- Implemented smart date validation and handling
- Added comprehensive error handling and user feedback
