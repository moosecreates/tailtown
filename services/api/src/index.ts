/**
 * Tailtown API Service
 * 
 * This package provides shared utilities, interfaces and middleware
 * for building consistent microservices in the Tailtown platform.
 */

// Error handling
export * from './errors/AppError';

// Interfaces
export * from './interfaces/ApiResponse';

// Middleware
export * from './middleware/errorHandlerMiddleware';
export * from './middleware/tenantMiddleware';

// Response formatters
export * from './responses/errorResponse';
export * from './responses/successResponse';

// Validation utilities
export * from './validation/validator';

/**
 * Create and configure an API service with standard middleware
 * and error handling.
 */
export * from './serviceFactory';
