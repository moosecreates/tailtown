/**
 * Shared AppError Class
 *
 * This class extends the built-in Error class to provide a standardized
 * error handling mechanism across all services. It includes:
 * - HTTP status codes
 * - Error types for categorization
 * - Operational flag to distinguish between operational and programming errors
 * - Additional context for debugging
 */
/**
 * Standardized error types across all services
 */
export declare enum ErrorType {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
    BAD_REQUEST = "BAD_REQUEST",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    SERVER_ERROR = "SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    SCHEMA_ERROR = "SCHEMA_ERROR",
    SCHEMA_ALIGNMENT_ERROR = "SCHEMA_ALIGNMENT_ERROR",
    MULTI_TENANT_ERROR = "MULTI_TENANT_ERROR"
}
/**
 * Interface for error context
 */
export interface ErrorContext {
    [key: string]: any;
}
/**
 * AppError class for standardized error handling
 */
export declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    type: ErrorType;
    details?: any;
    context?: ErrorContext;
    /**
     * Create a new AppError
     *
     * @param message - Error message
     * @param statusCode - HTTP status code
     * @param type - Error type from ErrorType enum
     * @param isOperational - Whether this is an operational error (true) or programming error (false)
     * @param details - Additional error details
     * @param context - Contextual information for debugging
     */
    constructor(message: string, statusCode?: number, type?: ErrorType, isOperational?: boolean, details?: any, context?: ErrorContext);
    /**
     * Create a validation error
     *
     * @param message - Error message
     * @param details - Validation error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static validationError(message: string, details?: any, context?: ErrorContext): AppError;
    /**
     * Create an authentication error
     *
     * @param message - Error message
     * @param context - Additional context
     * @returns AppError instance
     */
    static authenticationError(message?: string, context?: ErrorContext): AppError;
    /**
     * Create an authorization error
     *
     * @param message - Error message
     * @param context - Additional context
     * @returns AppError instance
     */
    static authorizationError(message?: string, context?: ErrorContext): AppError;
    /**
     * Create a not found error
     *
     * @param resource - Resource type that wasn't found
     * @param id - ID of the resource
     * @param context - Additional context
     * @returns AppError instance
     */
    static notFoundError(resource: string, id?: string | number, context?: ErrorContext): AppError;
    /**
     * Create a conflict error
     *
     * @param message - Error message
     * @param details - Conflict details
     * @param context - Additional context
     * @returns AppError instance
     */
    static conflictError(message: string, details?: any, context?: ErrorContext): AppError;
    /**
     * Create a database error
     *
     * @param message - Error message
     * @param details - Error details
     * @param isOperational - Whether this is an operational error
     * @param context - Additional context
     * @returns AppError instance
     */
    static databaseError(message: string, details?: any, isOperational?: boolean, context?: ErrorContext): AppError;
    /**
     * Create a schema alignment error
     *
     * @param message - Error message
     * @param details - Schema error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static schemaAlignmentError(message: string, details?: any, context?: ErrorContext): AppError;
    /**
     * Create a server error
     *
     * @param message - Error message
     * @param details - Error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static serverError(message?: string, details?: any, context?: ErrorContext): AppError;
}
