# Error Handling System

This document outlines the standardized error handling system implemented across all Tailtown microservices.

## Overview

The Tailtown error handling system provides a consistent approach to error management across all services, ensuring:

- Standardized error types and HTTP status codes
- Detailed error logging with contextual information
- Consistent error responses for clients
- Type-safe error handling with TypeScript
- Graceful handling of expected and unexpected errors

## Components

### 1. AppError Class

The `AppError` class is the foundation of our error handling system. It extends the built-in `Error` class with additional properties:

- `statusCode`: HTTP status code to return to the client
- `status`: String representation of the error status ('fail' or 'error')
- `isOperational`: Flag indicating whether this is an expected operational error
- `type`: Standardized error type from the `ErrorType` enum
- `details`: Additional error details
- `context`: Contextual information for debugging

The class provides static factory methods for common error types:

```typescript
// Example: Create a not found error
const error = AppError.notFoundError('User', '123');

// Example: Create a validation error
const error = AppError.validationError('Invalid input', { field: 'email' });
```

### 2. Error Types

We use a standardized set of error types across all services:

| Error Type | Description | HTTP Status Code |
|------------|-------------|------------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `AUTHENTICATION_ERROR` | Authentication required | 401 |
| `AUTHORIZATION_ERROR` | Insufficient permissions | 403 |
| `RESOURCE_NOT_FOUND` | Requested resource not found | 404 |
| `RESOURCE_CONFLICT` | Resource already exists | 409 |
| `BAD_REQUEST` | General bad request | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `EXTERNAL_SERVICE_ERROR` | External service failure | 500 |
| `SCHEMA_ERROR` | Database schema error | 500 |
| `SCHEMA_ALIGNMENT_ERROR` | Schema mismatch between environments | 500 |
| `MULTI_TENANT_ERROR` | Multi-tenant isolation error | 500 |

### 3. Error Handler Middleware

The error handler middleware processes all errors thrown in the application:

- Formats errors differently for development and production environments
- Adds request context to errors for better debugging
- Handles specific error types (Prisma, JWT, validation, etc.)
- Provides consistent error responses

### 4. Async Error Handler

The `catchAsync` utility wraps async controller functions to automatically catch errors:

```typescript
const getUser = catchAsync(async (req, res, next) => {
  // Your controller logic here
  // Any thrown errors will be caught and passed to the error handler
});
```

## Usage Guidelines

### In Controllers

1. **Use the `catchAsync` wrapper for all async controller functions**:

```typescript
export const getUser = catchAsync(async (req, res, next) => {
  // Controller logic
});
```

2. **Throw appropriate AppError instances for expected errors**:

```typescript
if (!user) {
  throw AppError.notFoundError('User', id);
}

if (!isAuthorized) {
  throw AppError.authorizationError('Not authorized to access this resource');
}
```

3. **Add context to errors for better debugging**:

```typescript
throw AppError.databaseError(
  'Failed to update user',
  { originalError: error.message },
  { userId: id, updates: req.body }
);
```

### In Services

1. **Use try/catch blocks to handle expected errors**:

```typescript
try {
  return await prisma.user.findUnique({ where: { id } });
} catch (error) {
  // Transform database errors into AppErrors
  if (error.code === 'P2025') {
    throw AppError.notFoundError('User', id);
  }
  throw error; // Let the error handler middleware handle other errors
}
```

2. **Validate inputs before database operations**:

```typescript
if (!email || !isValidEmail(email)) {
  throw AppError.validationError('Invalid email address', { field: 'email' });
}
```

### In Error Responses

All error responses follow this structure:

```json
{
  "success": false,
  "status": "fail",
  "message": "User with ID 123 not found",
  "error": {
    "type": "RESOURCE_NOT_FOUND"
  },
  "requestId": "req-123-456-789",
  "timestamp": "2023-06-02T12:34:56.789Z"
}
```

In development, additional information is included:

```json
{
  "success": false,
  "status": "fail",
  "message": "User with ID 123 not found",
  "error": {
    "type": "RESOURCE_NOT_FOUND",
    "details": {
      "resource": "User",
      "id": "123"
    },
    "stack": "Error: User with ID 123 not found\n    at ...",
    "context": {
      "requestInfo": {
        "method": "GET",
        "path": "/api/users/123"
      }
    }
  },
  "requestId": "req-123-456-789",
  "timestamp": "2023-06-02T12:34:56.789Z"
}
```

## Integration with Existing Services

To integrate this error handling system into an existing service:

1. Import the shared error handling components:

```typescript
import { AppError, ErrorType } from '../shared/errors/AppError';
import { errorHandler, catchAsync } from '../shared/errors/errorHandler';
```

2. Register the error handler middleware in your Express app:

```typescript
// Must be registered after all routes
app.use(errorHandler);
```

3. Update controllers to use the `catchAsync` wrapper and `AppError` class.

4. Update error handling in services to use `AppError` instances.

## Logging

All errors are logged with contextual information:

- Error message and type
- HTTP method and path
- Request headers and query parameters
- Stack trace (in development or for unexpected errors)

Example log output:

```
[2023-06-02T12:34:56.789Z] [tailtown-service] [ERROR] [GET] /api/users/123 - RESOURCE_NOT_FOUND: User with ID 123 not found | context: {"requestInfo":{"method":"GET","path":"/api/users/123"}}
```

## Best Practices

1. **Be specific with error messages**: Provide clear, actionable error messages.

2. **Use appropriate error types**: Choose the most specific error type for each situation.

3. **Add context to errors**: Include relevant information for debugging.

4. **Handle expected errors**: Use try/catch blocks for expected errors.

5. **Let the middleware handle unexpected errors**: Don't catch errors unless you're transforming them.

6. **Validate inputs early**: Validate inputs before performing operations.

7. **Don't expose sensitive information**: Be careful not to include sensitive data in error responses.

8. **Use the catchAsync wrapper**: Always use catchAsync for async controller functions.

## Schema Alignment Considerations

Our error handling system integrates with the schema alignment strategy:

- Schema-related errors are categorized as `SCHEMA_ALIGNMENT_ERROR`
- Detailed logging helps identify schema mismatches
- Graceful degradation when schema elements are missing

## Example Implementation

See the `controllerErrorHandling.ts` file for complete examples of how to implement this error handling system in controllers.
