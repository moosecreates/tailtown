/**
 * Local implementation of service utilities that were previously imported from @tailtown/api
 * This provides the core functionality needed for the service to operate independently
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

/**
 * Create and configure an Express service with standard middleware
 */
export function createService(options: {
  name: string;
  version: string;
}) {
  const app = express();
  
  // Apply standard middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true
  }));
  app.use(helmet());
  app.use(morgan('dev'));
  
  // Add health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'up',
      service: options.name,
      version: options.version,
      timestamp: new Date().toISOString()
    });
  });
  
  // Add error handlers method to the Express app
  const appWithErrorHandlers = app as Express & { registerErrorHandlers: () => void };
  
  appWithErrorHandlers.registerErrorHandlers = () => {
    // 404 handler
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND_ERROR',
          message: `Route ${req.method} ${req.path} not found`
        }
      });
    });
    
    // Global error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(`[${options.name}] Error:`, err);
      
      // Determine status code based on error type
      let statusCode = 500;
      if (err.type === 'VALIDATION_ERROR') statusCode = 400;
      if (err.type === 'NOT_FOUND_ERROR') statusCode = 404;
      if (err.type === 'UNAUTHORIZED_ERROR') statusCode = 401;
      if (err.type === 'FORBIDDEN_ERROR') statusCode = 403;
      
      res.status(statusCode).json({
        success: false,
        error: {
          type: err.type || 'SERVER_ERROR',
          message: err.message || 'An unexpected error occurred',
          details: err.details || undefined
        }
      });
    });
  };
  
  return appWithErrorHandlers;
}

/**
 * Middleware to validate tenant ID in requests
 * This ensures proper multi-tenant isolation
 */
export function tenantMiddleware(options: {
  required: boolean;
  validateTenant?: (tenantId: string) => Promise<boolean>;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get tenant ID from header
      const tenantId = req.headers['x-tenant-id'] as string;
      
      // Check if tenant ID is required but missing
      if (options.required && !tenantId) {
        return res.status(401).json({
          success: false,
          error: {
            type: 'UNAUTHORIZED_ERROR',
            message: 'Tenant ID is required but was not provided'
          }
        });
      }
      
      // If tenant ID is provided, validate it if a validation function is provided
      if (tenantId && options.validateTenant) {
        const isValid = await options.validateTenant(tenantId);
        if (!isValid) {
          return res.status(403).json({
            success: false,
            error: {
              type: 'FORBIDDEN_ERROR',
              message: 'Invalid tenant ID'
            }
          });
        }
      }
      
      // Add tenant ID to request
      if (tenantId) {
        (req as any).tenantId = tenantId;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Enhanced Error class for application-specific errors
 * Includes factory methods for creating standardized error instances
 */
export class AppError extends Error {
  type: string;
  statusCode: number;
  isOperational: boolean;
  details?: any;
  
  constructor(message: string, statusCode: number = 500, details?: any, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Map status code to error type
    if (statusCode === 400) this.type = 'VALIDATION_ERROR';
    else if (statusCode === 401) this.type = 'UNAUTHORIZED_ERROR';
    else if (statusCode === 403) this.type = 'FORBIDDEN_ERROR';
    else if (statusCode === 404) this.type = 'NOT_FOUND_ERROR';
    else if (statusCode === 409) this.type = 'CONFLICT_ERROR';
    else if (statusCode === 422) this.type = 'UNPROCESSABLE_ENTITY';
    else this.type = 'SERVER_ERROR';
    
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Create a validation error (400)
   * @param message - Error message
   * @param details - Additional error details
   */
  static validationError(message: string, details?: any): AppError {
    return new AppError(message, 400, details, true);
  }
  
  /**
   * Create an authorization error (401)
   * @param message - Error message
   * @param details - Additional error details
   */
  static authorizationError(message: string, details?: any): AppError {
    return new AppError(message, 401, details, true);
  }
  
  /**
   * Create a forbidden error (403)
   * @param message - Error message
   * @param details - Additional error details
   */
  static forbiddenError(message: string, details?: any): AppError {
    return new AppError(message, 403, details, true);
  }
  
  /**
   * Create a not found error (404)
   * @param resource - Resource type that wasn't found
   * @param id - ID of the resource that wasn't found
   * @param details - Additional error details
   */
  static notFoundError(resource: string, id?: string | number, details?: any): AppError {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    return new AppError(message, 404, details, true);
  }
  
  /**
   * Create a conflict error (409)
   * @param message - Error message
   * @param details - Additional error details
   */
  static conflictError(message: string, details?: any): AppError {
    return new AppError(message, 409, details, true);
  }
  
  /**
   * Create a database error (500)
   * @param message - Error message
   * @param details - Additional error details
   * @param isOperational - Whether this is an operational error
   */
  static databaseError(message: string, details?: any, isOperational = true): AppError {
    return new AppError(message, 500, details, isOperational);
  }
  
  /**
   * Create a server error (500)
   * @param message - Error message
   * @param details - Additional error details
   * @param isOperational - Whether this is an operational error
   */
  static serverError(message: string, details?: any, isOperational = true): AppError {
    return new AppError(message, 500, details, isOperational);
  }
}
