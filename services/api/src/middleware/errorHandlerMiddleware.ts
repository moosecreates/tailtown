import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { createErrorResponse } from '../responses/errorResponse';

/**
 * Global error handler middleware for Express applications
 * Formats errors into standardized API responses
 */
export function errorHandlerMiddleware() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      ...(err instanceof AppError && {
        code: err.code,
        status: err.status,
        isOperational: err.isOperational,
        details: err.details
      })
    });

    // If it's our AppError, use its status and code
    if (err instanceof AppError) {
      return res.status(err.status).json(
        createErrorResponse({
          code: err.code,
          message: err.message,
          details: err.details
        })
      );
    }

    // Handle known errors from libraries or frameworks
    if (err.name === 'ValidationError' || err.message.includes('validation failed')) {
      return res.status(400).json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.message
        })
      );
    }

    if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
      return res.status(401).json(
        createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        })
      );
    }

    if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
      return res.status(403).json(
        createErrorResponse({
          code: 'FORBIDDEN',
          message: 'Access forbidden'
        })
      );
    }

    // For unknown errors, return a generic error in production or more details in development
    const statusCode = 500;
    return res.status(statusCode).json(
      createErrorResponse({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined
      })
    );
  };
}
