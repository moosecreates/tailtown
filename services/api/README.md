# Tailtown API Service Layer

This package provides the foundation for Tailtown's SaaS architecture by establishing shared patterns, utilities, and interfaces for consistent API development across all microservices.

## Purpose

The API service layer addresses several key architectural requirements:

1. **Consistent API responses** - Standardized success and error formats
2. **Multi-tenancy support** - Built-in tenant isolation for SaaS scaling
3. **Robust error handling** - Structured error hierarchy with operational/programming error distinction
4. **Standardized validation** - Type-safe request validation with detailed error reporting
5. **Simplified service creation** - Factory pattern for quick bootstrapping of new services

## Getting Started

### Installation

From another service directory:

```bash
npm install --save ../api
```

### Creating a New Service

```typescript
import { createService } from '@tailtown/api';

const app = createService({
  name: 'reservation-service',
  version: 'v1'
});

// Define your routes
app.get('/api/v1/reservations', (req, res) => {
  // Your route logic here
});

// Register error handlers (must be done after all routes are defined)
app.registerErrorHandlers();

// Start the service
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Reservation service running on port ${PORT}`);
});
```

## Features

### Standardized API Responses

```typescript
import { createSuccessResponse, createPaginatedResponse } from '@tailtown/api';

// Basic success response
res.json(createSuccessResponse({ id: 1, name: 'Standard Suite' }));

// Paginated response
res.json(createPaginatedResponse(
  resources,
  { currentPage: 1, totalPages: 5, totalResults: 100 }
));
```

### Tenant Isolation

```typescript
import { tenantMiddleware, TenantRequest } from '@tailtown/api';

// Apply tenant middleware to all routes
app.use(tenantMiddleware());

// Use in route handler
app.get('/api/resources', (req: TenantRequest, res) => {
  const tenantId = req.tenantId;
  // Query resources with tenant isolation
});
```

### Structured Error Handling

```typescript
import { 
  AppError,
  createNotFoundError,
  createValidationError
} from '@tailtown/api';

// Throw domain-specific errors
if (!resource) {
  throw createNotFoundError('Resource', id);
}

// Custom error with details
if (!isValid) {
  throw createValidationError('Invalid reservation date', {
    field: 'startDate',
    reason: 'Date must be in the future'
  });
}
```

### Request Validation

```typescript
import { validateRequest } from '@tailtown/api';
import { z } from 'zod';

const createReservationSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  resourceId: z.string().uuid().optional(),
  suiteType: z.enum(['VIP_SUITE', 'STANDARD_PLUS_SUITE', 'STANDARD_SUITE'])
});

app.post('/api/reservations', (req, res, next) => {
  try {
    const { body } = validateRequest(req, { 
      body: createReservationSchema 
    });
    
    // body is now fully typed and validated
    const { startDate, endDate, resourceId, suiteType } = body;
    
    // Continue with business logic...
  } catch (error) {
    next(error);
  }
});
```

## Next Steps

1. Create new domain-specific services using this API layer
2. Migrate existing functionality from the monolithic structure
3. Implement service-to-service communication patterns

## Development Guidelines

1. Keep services small and focused on a specific domain
2. Use the shared interfaces for consistent API design
3. Ensure proper tenant isolation for all data access
4. Handle errors appropriately with the provided error classes
