# API Service Layer Documentation

This document outlines the design, implementation, and best practices for the API service layer used across all Tailtown microservices.

## Overview

The API service layer provides a consistent approach to building RESTful APIs across all microservices. It includes shared utilities for:

- Request validation
- Error handling
- Response formatting
- Multi-tenancy support
- Authentication and authorization
- Schema alignment and validation

## Core Components

### Service Factory

The service factory provides a standardized way to create Express.js applications with consistent middleware and error handling:

```typescript
import { createService } from './utils/service';

const app = createService({
  name: 'reservation-service',
  version: 'v1'
});
```

### Tenant Middleware

All services use tenant middleware to ensure proper multi-tenant isolation:

```typescript
app.use(tenantMiddleware({
  required: true,
  validateTenant: async (tenantId) => true // Replace with actual validation
}));
```

### Error Handling

Standardized error handling with the AppError class:

```typescript
import { AppError } from './utils/service';

// In controller
if (!resourceId) {
  return next(new AppError('Resource ID is required', 400));
}
```

## Route Design Best Practices

### Route Ordering

**Critical: Always define specific routes before parameterized routes.**

Express.js processes routes in the order they are defined. This can lead to unexpected behavior when parameterized routes (e.g., `/:id`) are defined before specific routes (e.g., `/availability`).

#### ❌ Incorrect Route Ordering

```typescript
// This will cause issues - parameterized route will catch specific routes
router.get('/:id', getResourceById);
router.get('/availability', checkResourceAvailability); // Never reached
```

#### ✅ Correct Route Ordering

```typescript
// Specific routes first
router.get('/availability', checkResourceAvailability);
router.get('/health', healthCheck);

// Then parameterized routes
router.get('/:id', getResourceById);
router.get('/:id/availability', getResourceAvailability);
```

### Route Organization

Organize routes by resource and HTTP method:

```typescript
// Resource routes
router.get('/', getAllResources);
router.post('/', createResource);

// Single resource routes
router.get('/:id', getResourceById);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);

// Nested resource routes
router.get('/:id/reservations', getResourceReservations);
```

## Schema Alignment Strategy

Our API service layer implements a robust schema alignment strategy to handle database schema differences across environments:

### Defensive Programming

Controllers use defensive programming to handle missing tables or columns:

```typescript
// Safe execution helper
async function safeExecutePrismaQuery<T>(
  queryFn: () => Promise<T>, 
  fallbackValue: T, 
  errorMessage: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallbackValue;
  }
}

// In controller
const resources = await safeExecutePrismaQuery(
  () => prisma.resource.findMany({ where: { organizationId: tenantId } }),
  [], // Fallback to empty array
  'Error fetching resources'
);
```

### Schema Validation

Services validate database schema on startup:

```typescript
app.listen(PORT, async () => {
  console.log(`Service running on port ${PORT}`);
  
  // Validate schema on startup
  const { isValid, missingTables, missingColumns } = await validateSchema(prisma);
  
  if (!isValid) {
    console.warn('Schema validation detected issues');
    // Log detailed information about missing tables and columns
  }
});
```

## Response Format

All API responses follow a consistent format:

```json
{
  "status": "success",
  "data": {
    "resource": {
      "id": "123",
      "name": "Standard Suite"
    }
  }
}
```

Error responses:

```json
{
  "status": "error",
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Resource ID is required"
  }
}
```

## Migration Guidelines

When migrating existing services to use the API service layer:

1. Replace custom Express setup with the service factory
2. Implement tenant middleware
3. Update error handling to use AppError
4. Ensure routes follow the ordering best practices
5. Implement schema validation and defensive programming
6. Update response formats to match the standard

## Database Interaction and Migration

Each service manages its own database interactions using Prisma ORM. For database schema changes, migrations, and validation, refer to:

- [Database Migration Guide](../../services/reservation-service/docs/DATABASE-MIGRATION.md)
- [Schema Alignment Strategy](../development/SchemaAlignmentStrategy.md)
- [Schema Validation System](/services/reservation-service/docs/SCHEMA-VALIDATION.md)

The Schema Validation System provides comprehensive validation of database schemas, detailed reporting of issues, and automatic migration capabilities to ensure consistency across environments.
