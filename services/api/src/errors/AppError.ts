/**
 * Custom application error class that extends the native Error
 * Provides additional properties for better error handling and standardized error responses
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, status = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true, details?: unknown) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.isOperational = isOperational; // Indicates if this is an operational error (expected) or programming error
    this.details = details;
    
    // Capture stack trace (V8 specific)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a validation error with consistent format
 */
export function createValidationError(message: string, details?: unknown): AppError {
  return new AppError(message, 400, 'VALIDATION_ERROR', true, details);
}

/**
 * Creates a not found error with consistent format
 */
export function createNotFoundError(resource: string, id?: string | number): AppError {
  const message = id 
    ? `${resource} with ID '${id}' not found`
    : `${resource} not found`;
  
  return new AppError(message, 404, 'NOT_FOUND', true);
}

/**
 * Creates an unauthorized error with consistent format
 */
export function createUnauthorizedError(message = 'Unauthorized'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED', true);
}

/**
 * Creates a forbidden error with consistent format
 */
export function createForbiddenError(message = 'Forbidden'): AppError {
  return new AppError(message, 403, 'FORBIDDEN', true);
}

/**
 * Creates a conflict error with consistent format (e.g., duplicate resources)
 */
export function createConflictError(message: string, details?: unknown): AppError {
  return new AppError(message, 409, 'CONFLICT', true, details);
}
