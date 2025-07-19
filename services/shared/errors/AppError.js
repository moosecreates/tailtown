"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorType = void 0;
/**
 * Standardized error types across all services
 */
var ErrorType;
(function (ErrorType) {
    // Client errors (4xx)
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorType["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorType["RESOURCE_CONFLICT"] = "RESOURCE_CONFLICT";
    ErrorType["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Server errors (5xx)
    ErrorType["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorType["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorType["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorType["SCHEMA_ERROR"] = "SCHEMA_ERROR";
    // Special cases
    ErrorType["SCHEMA_ALIGNMENT_ERROR"] = "SCHEMA_ALIGNMENT_ERROR";
    ErrorType["MULTI_TENANT_ERROR"] = "MULTI_TENANT_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
/**
 * AppError class for standardized error handling
 */
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    type;
    details;
    context;
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
    constructor(message, statusCode = 500, type = ErrorType.SERVER_ERROR, isOperational = true, details, context) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        this.type = type;
        this.details = details;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Create a validation error
     *
     * @param message - Error message
     * @param details - Validation error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static validationError(message, details, context) {
        return new AppError(message, 400, ErrorType.VALIDATION_ERROR, true, details, context);
    }
    /**
     * Create an authentication error
     *
     * @param message - Error message
     * @param context - Additional context
     * @returns AppError instance
     */
    static authenticationError(message = 'Authentication required', context) {
        return new AppError(message, 401, ErrorType.AUTHENTICATION_ERROR, true, undefined, context);
    }
    /**
     * Create an authorization error
     *
     * @param message - Error message
     * @param context - Additional context
     * @returns AppError instance
     */
    static authorizationError(message = 'Not authorized', context) {
        return new AppError(message, 403, ErrorType.AUTHORIZATION_ERROR, true, undefined, context);
    }
    /**
     * Create a not found error
     *
     * @param resource - Resource type that wasn't found
     * @param id - ID of the resource
     * @param context - Additional context
     * @returns AppError instance
     */
    static notFoundError(resource, id, context) {
        const message = id
            ? `${resource} with ID ${id} not found`
            : `${resource} not found`;
        return new AppError(message, 404, ErrorType.RESOURCE_NOT_FOUND, true, { resource, id }, context);
    }
    /**
     * Create a conflict error
     *
     * @param message - Error message
     * @param details - Conflict details
     * @param context - Additional context
     * @returns AppError instance
     */
    static conflictError(message, details, context) {
        return new AppError(message, 409, ErrorType.RESOURCE_CONFLICT, true, details, context);
    }
    /**
     * Create a database error
     *
     * @param message - Error message
     * @param details - Error details
     * @param isOperational - Whether this is an operational error
     * @param context - Additional context
     * @returns AppError instance
     */
    static databaseError(message, details, isOperational = true, context) {
        return new AppError(message, 500, ErrorType.DATABASE_ERROR, isOperational, details, context);
    }
    /**
     * Create a schema alignment error
     *
     * @param message - Error message
     * @param details - Schema error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static schemaAlignmentError(message, details, context) {
        return new AppError(message, 500, ErrorType.SCHEMA_ALIGNMENT_ERROR, true, details, context);
    }
    /**
     * Create a server error
     *
     * @param message - Error message
     * @param details - Error details
     * @param context - Additional context
     * @returns AppError instance
     */
    static serverError(message = 'Internal server error', details, context) {
        return new AppError(message, 500, ErrorType.SERVER_ERROR, false, details, context);
    }
}
exports.AppError = AppError;
