/**
 * Error Handling Middleware
 * 
 * This middleware handles errors thrown in the application and sends appropriate responses.
 * It implements our schema alignment strategy by gracefully handling errors
 * and providing consistent error responses.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

// Handle Prisma-specific errors
const handlePrismaError = (err: any) => {
  if (err.code === 'P2002') {
    return new AppError(`Duplicate field value: ${err.meta?.target?.join(', ')}`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  if (err.code === 'P2003') {
    return new AppError('Foreign key constraint failed', 400);
  }
  return err;
};

// Handle development errors with full details
const sendErrorDev = (err: any, res: Response) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  logger.error(`DEV ERROR: ${err.message}`);
  
  res.status(statusCode).json({
    success: false,
    status: status,
    message: err.message || 'An unexpected error occurred',
    error: {
      type: err.type || 'SERVER_ERROR',
      details: err.details || null,
      stack: err.stack
    }
  });
};

// Handle production errors with limited details
const sendErrorProd = (err: any, res: Response) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(statusCode).json({
      success: false,
      status: status,
      message: err.message,
      error: {
        type: err.type || 'SERVER_ERROR'
      }
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for developers
    logger.error(`UNEXPECTED ERROR: ${JSON.stringify(err)}`);
    
    // Send generic message to client
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong',
      error: {
        type: 'SERVER_ERROR'
      }
    });
  }
};

// Main error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Ensure response hasn't been sent already
  if (res.headersSent) {
    return _next(err);
  }
  
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Handle Prisma-specific errors
  if (err.code && err.code.startsWith('P')) {
    // Prisma error codes start with P
    err.type = 'DATABASE_ERROR';
    err.isOperational = true;
    
    // Handle specific Prisma errors
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        err.statusCode = 409;
        err.message = 'A record with this data already exists';
        break;
      case 'P2025': // Record not found
        err.statusCode = 404;
        err.message = 'Record not found';
        break;
      default:
        err.message = 'Database operation failed';
    }
    
    // Log the Prisma error for debugging schema issues
    logger.error(`Prisma error ${err.code}: ${err.message}`);
    if (err.meta) {
      logger.debug(`Error metadata: ${JSON.stringify(err.meta)}`);
    }
  }
  
  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = 'Invalid JSON in request body';
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.isOperational = true;
    err.type = 'VALIDATION_ERROR';
  }

  // Different error handling based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
