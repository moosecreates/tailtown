import { StatusCodes } from 'http-status-codes';
import { ApiErrorResponse } from '../interfaces/ApiResponse';
import { AppError } from '../errors/AppError';

interface ErrorOptions {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

/**
 * Creates a standardized error response object
 * @param options - Error details including code, message, and optional details
 * @returns A formatted error response object
 */
export function createErrorResponse(options: ErrorOptions): ApiErrorResponse {
  return {
    status: 'error',
    error: {
      code: options.code,
      message: options.message,
      ...(options.details && { details: options.details })
    }
  };
}

/**
 * Converts an AppError instance to a standardized API error response
 * @param error - The AppError instance
 * @returns A formatted error response object
 */
export function errorToResponse(error: AppError | Error): ApiErrorResponse {
  if (error instanceof AppError) {
    return createErrorResponse({
      code: error.code,
      message: error.message,
      details: error.details
    });
  } else {
    return createErrorResponse({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
}
