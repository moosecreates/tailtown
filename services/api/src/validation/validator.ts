import { Request } from 'express';
import { z } from 'zod';
import { createValidationError } from '../errors/AppError';

/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema for validation
 * @param data - Data to validate
 * @returns Validated and typed data if valid
 * @throws AppError with validation details if invalid
 */
export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError('Validation failed', {
        validationErrors: error.errors
      });
    }
    throw error;
  }
}

/**
 * Options for the request validation function
 */
export interface ValidateRequestOptions<T> {
  // Zod schema for request body validation
  body?: z.ZodType<T>;
  
  // Zod schema for query parameters validation
  query?: z.ZodType<any>;
  
  // Zod schema for request parameters (route params) validation
  params?: z.ZodType<any>;
}

/**
 * Validates request data (body, query, params) against provided schemas
 * @param req - Express request object
 * @param options - Validation schema options
 * @returns Object containing validated data
 * @throws AppError with validation details if invalid
 */
export function validateRequest<T = any>(
  req: Request,
  options: ValidateRequestOptions<T>
): {
  body: T;
  query: any;
  params: any;
} {
  const result: any = {};
  
  // Validate body if schema provided
  if (options.body) {
    try {
      result.body = validateWithZod(options.body, req.body);
    } catch (error) {
      throw createValidationError('Invalid request body', {
        source: 'body',
        ...(error instanceof Error && { details: error.message })
      });
    }
  } else {
    result.body = req.body;
  }
  
  // Validate query if schema provided
  if (options.query) {
    try {
      result.query = validateWithZod(options.query, req.query);
    } catch (error) {
      throw createValidationError('Invalid query parameters', {
        source: 'query',
        ...(error instanceof Error && { details: error.message })
      });
    }
  } else {
    result.query = req.query;
  }
  
  // Validate params if schema provided
  if (options.params) {
    try {
      result.params = validateWithZod(options.params, req.params);
    } catch (error) {
      throw createValidationError('Invalid route parameters', {
        source: 'params',
        ...(error instanceof Error && { details: error.message })
      });
    }
  } else {
    result.params = req.params;
  }
  
  return result;
}
