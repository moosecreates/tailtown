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
  app.use(cors());
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
 * Error class for application-specific errors
 */
export class AppError extends Error {
  type: string;
  details?: any;
  
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    
    // Map status code to error type
    if (statusCode === 400) this.type = 'VALIDATION_ERROR';
    else if (statusCode === 401) this.type = 'UNAUTHORIZED_ERROR';
    else if (statusCode === 403) this.type = 'FORBIDDEN_ERROR';
    else if (statusCode === 404) this.type = 'NOT_FOUND_ERROR';
    else this.type = 'SERVER_ERROR';
    
    this.details = details;
  }
}
