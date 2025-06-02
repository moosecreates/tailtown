# Tailtown API Service Layer Documentation

## Overview

The API Service Layer is a foundational component of Tailtown's SaaS architecture refactoring. It provides shared utilities, interfaces, and middleware to ensure consistent API design and behavior across all microservices. This document outlines the core components, design patterns, and implementation guidelines for the service layer.

## Architecture Goals

- **Multi-tenancy support**: Proper tenant isolation for SaaS scaling
- **Standardized responses**: Consistent API response formats
- **Robust error handling**: Structured error hierarchy
- **Request validation**: Type-safe validation with detailed error reporting
- **Service abstraction**: Simplified bootstrapping of new services

## Core Components

### 1. API Response Interfaces

Located in `src/interfaces/ApiResponse.ts`, these interfaces ensure all services return responses with consistent structure:

```typescript
// Success response
{
  status: 'success',
  data: { ... },  // Typed data payload
  message?: '...' // Optional success message
}

// Paginated response
{
  status: 'success',
  data: [ ... ],        // Array of items
  results: 10,          // Number of items returned
  currentPage: 2,       // Current page number
  totalPages: 5,        // Total available pages
  totalResults?: 50     // Optional total count
}

// Error response
{
  status: 'error',
  error: {
    code: 'VALIDATION_ERROR', // Machine-readable error code
    message: '...',           // Human-readable error message
    details?: { ... }         // Optional additional details
  }
}
```

### 2. Tenant Middleware

Located in `src/middleware/tenantMiddleware.ts`, this middleware:

- Extracts tenant ID from multiple sources (headers, JWT tokens, query params)
- Validates tenant access
- Attaches tenant information to the request object
- Rejects requests without proper tenant identification when required

```typescript
// Usage in services
app.use(tenantMiddleware({
  required: true,
  validateTenant: async (tenantId) => {
    // Custom tenant validation logic
    return true;
  }
}));
```

### 3. Error Handling

Located in `src/errors/AppError.ts` and `src/middleware/errorHandlerMiddleware.ts`, provides:

- Custom `AppError` class extending native Error
- Helper functions for common error types (validation, not found, unauthorized)
- Global error handler middleware
- Standardized error response formatting

```typescript
// Using error classes
throw createNotFoundError('Resource', id);
throw createValidationError('Field is required', { field: 'name' });

// Error middleware (automatically registered)
app.registerErrorHandlers();
```

### 4. Request Validation

Located in `src/validation/validator.ts`, provides:

- Zod-based validation utilities
- Type-safe request validation (body, query, params)
- Detailed validation error reporting

```typescript
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

// Validate request body
const { body } = validateRequest(req, { body: schema });
```

### 5. Service Factory

Located in `src/serviceFactory.ts`, provides:

- Express app factory with standardized configuration
- Common middleware setup
- Health check endpoint
- Error handler registration

```typescript
const app = createService({
  name: 'reservation-service',
  version: 'v1'
});

// Register routes
app.get('/api/v1/reservations', ...);

// Register error handlers (must be last)
app.registerErrorHandlers();
```

## Implementation Guidelines

### Creating New Services

1. Create service directory with standard structure:
   ```
   /services/[service-name]/
     ├── src/
     │   ├── controllers/       # Business logic
     │   ├── routes/            # API endpoints
     │   ├── models/            # Data models
     │   ├── middleware/        # Service-specific middleware
     │   ├── utils/             # Utility functions
     │   └── index.ts           # Service entry point
     ├── tests/                 # Service tests
     └── package.json           # Service dependencies
   ```

2. Initialize the service:
   ```typescript
   import { createService, tenantMiddleware } from '@tailtown/api';

   const app = createService({
     name: 'reservation-service',
     version: 'v1'
   });

   // Apply tenant middleware
   app.use(tenantMiddleware());

   // Register routes
   // ...

   // Register error handlers (must be last)
   app.registerErrorHandlers();

   // Start the service
   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => {
     console.log(`Reservation service running on port ${PORT}`);
   });
   ```

### Route Implementation

Routes should follow a consistent pattern:

1. Use the appropriate HTTP method
2. Apply middleware for validation and authorization
3. Use the standardized response formatters
4. Handle errors with consistent error types

```typescript
import { validateRequest, createSuccessResponse } from '@tailtown/api';
import { z } from 'zod';

const createReservationSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  // ...other fields
});

router.post('/', async (req, res, next) => {
  try {
    const { body } = validateRequest(req, { 
      body: createReservationSchema 
    });
    
    const reservation = await reservationService.create(body, req.tenantId);
    
    res.status(201).json(createSuccessResponse(
      reservation, 
      'Reservation created successfully'
    ));
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

### Multi-Tenancy Implementation

Every data access operation must include tenant isolation:

```typescript
// In a controller or service
async function getResources(tenantId: string) {
  // Always filter by tenantId
  return await prisma.resource.findMany({
    where: { 
      organizationId: tenantId,
      // ...other filters
    }
  });
}
```

### Error Handling Best Practices

1. Use specific error types for different scenarios
2. Include meaningful error messages
3. Add details when appropriate (but avoid sensitive information)
4. Let the global error handler format the response

```typescript
import { createNotFoundError, createValidationError } from '@tailtown/api';

async function getResourceById(id: string, tenantId: string) {
  const resource = await prisma.resource.findFirst({
    where: { id, organizationId: tenantId }
  });
  
  if (!resource) {
    throw createNotFoundError('Resource', id);
  }
  
  return resource;
}
```

## Migration Strategy

The API Service Layer is designed to support incremental migration:

1. Create new domain-specific services using the API layer
2. Implement feature flags to toggle between old and new implementations
3. Gradually migrate functionality from monolithic services
4. Establish consistent patterns across all services
5. Remove deprecated code once new implementations are stable

## Testing Guidelines

Services should include comprehensive testing:

1. Unit tests for business logic
2. Integration tests for API endpoints
3. Tests for multi-tenancy isolation
4. Error handling tests

## Security Considerations

1. Always validate and sanitize input
2. Use the tenant middleware to enforce tenant isolation
3. Implement proper authentication and authorization
4. Follow secure coding practices
5. Don't expose sensitive information in error responses (automatically handled in production)

## Implementation Notes

This section tracks implementation decisions, lessons learned, and refinements to the strategy as the refactoring progresses.

| Date | Component | Decision | Rationale |
|------|-----------|----------|-----------|
| 2025-06-01 | Core Service Layer | Created base API service abstraction | Foundation for domain-driven architecture with consistent interfaces |
| 2025-06-01 | Tenant Middleware | Implemented multi-source tenant ID extraction | Flexibility to handle tenant IDs from headers, JWT claims, or query parameters |

## Next Steps

- Implement the Reservation Service using this architecture
- Create a Resource Service for kennel management
- Establish cross-service communication patterns
- Enhance frontend API clients to work with the new service architecture
