import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../reservation-service/src/utils/service';
import { catchAsync } from '../../reservation-service/src/middleware/catchAsync';
import { logger } from '../../reservation-service/src/utils/logger';

// Type for Prisma errors
interface PrismaError {
  code: string;
  message: string;
  meta?: any;
}

// Function to check if an error is a Prisma error
function isPrismaError(error: unknown): error is PrismaError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  );
}

// Function to check if an error has a message property
function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export const controllerErrorHandling = {
  /**
   * Get a resource by ID
   */
  getById: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const organizationId = req.tenantId;
    
    if (!id) {
      logger.warn('Missing ID parameter in getById request');
      throw AppError.validationError('ID is required');
    }
    
    if (!organizationId) {
      logger.warn('Missing tenant ID in getById request');
      throw AppError.authorizationError('Tenant ID is required');
    }
    
    try {
      // This would be customized per resource type
      const resource = { id, name: 'Example resource' };
      
      if (!resource) {
        throw AppError.notFoundError('Resource not found');
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          resource
        }
      });
    } catch (error: unknown) {
      
      // Handle database-specific errors
      if (isPrismaError(error)) {
        // Let the middleware handle Prisma errors
        throw error;
      }
      
      // For unexpected errors, create a server error with details
      throw AppError.serverError(
        'Failed to retrieve resource',
        hasErrorMessage(error) ? { 
          originalError: error.message,
          resourceId: id, 
          organizationId 
        } : { resourceId: id, organizationId }
      );
    }
  }),
  
  /**
   * Create a new resource
   */
  create: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const organizationId = req.tenantId;
    
    if (!name) {
      logger.warn('Missing name parameter in create request');
      throw AppError.validationError('Name is required');
    }
    
    if (!organizationId) {
      logger.warn('Missing tenant ID in create request');
      throw AppError.authorizationError('Tenant ID is required');
    }
    
    try {
      // This would be customized per resource type
      const resource = { id: 'new-id', name, description, organizationId };
      
      res.status(201).json({
        status: 'success',
        data: {
          resource
        }
      });
    } catch (error: unknown) {
      // Handle specific Prisma errors
      if (isPrismaError(error)) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          logger.warn('Unique constraint violation in create operation', {
            error: error.message,
            meta: error.meta
          });
          
          throw AppError.validationError(
            'This resource already exists',
            { field: error.meta?.target || 'unknown field' }
          );
        }
        
        // Re-throw other Prisma errors for the global handler
        throw error;
      }
      
      // For other error types, we might need specialized handling
      if (hasErrorMessage(error) && error.message.includes('column does not exist')) {
        logger.error('Schema mismatch error in create operation', {
          errorDetails: error.message,
          body: req.body
        });
        
        throw AppError.serverError(
          'Database schema mismatch',
          { hint: 'The server expected a different data structure' }
        );
      }
      
      // For unexpected errors, create a server error
      throw AppError.serverError(
        'Failed to create resource',
        hasErrorMessage(error) ? { 
          originalError: error.message,
          name, 
          organizationId 
        } : { name, organizationId }
      );
    }
  }),
  
  /**
   * Update an existing resource
   */
  update: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const organizationId = req.tenantId;
    
    if (!id) {
      logger.warn('Missing ID parameter in update request');
      throw AppError.validationError('ID is required');
    }
    
    if (!organizationId) {
      logger.warn('Missing tenant ID in update request');
      throw AppError.authorizationError('Tenant ID is required');
    }
    
    try {
      // This would be customized per resource type
      const resource = { id, ...req.body, organizationId };
      
      res.status(200).json({
        status: 'success',
        data: {
          resource
        }
      });
    } catch (error: unknown) {
      // Handle specific Prisma errors
      if (isPrismaError(error)) {
        if (error.code === 'P2003') {
          // Foreign key constraint violation
          logger.warn('Foreign key constraint violation in update operation', {
            error: error.message,
            meta: error.meta
          });
          
          throw AppError.validationError(
            'Related resource not found',
            { field: error.meta?.target || 'unknown field' }
          );
        }
        
        // Re-throw other Prisma errors for the global handler
        throw error;
      }
      
      // For unexpected errors, create a server error
      throw AppError.serverError(
        'Failed to update resource',
        hasErrorMessage(error) ? { 
          originalError: error.message,
          resourceId: id, 
          organizationId 
        } : { resourceId: id, organizationId }
      );
    }
  }),
  
  /**
   * Delete a resource
   */
  delete: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const organizationId = req.tenantId;
    
    if (!id) {
      logger.warn('Missing ID parameter in delete request');
      throw AppError.validationError('ID is required');
    }
    
    if (!organizationId) {
      logger.warn('Missing tenant ID in delete request');
      throw AppError.authorizationError('Tenant ID is required');
    }
    
    try {
      // This would be customized per resource type
      // Simulate deletion
      const deleted = true;
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error: unknown) {
      // For unexpected errors, create a server error
      throw AppError.serverError(
        'Failed to delete resource',
        hasErrorMessage(error) ? { 
          originalError: error.message,
          resourceId: id, 
          organizationId 
        } : { resourceId: id, organizationId }
      );
    }
  })
};
