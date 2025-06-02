/**
 * Resource Controller
 * 
 * This controller handles CRUD operations for resources (kennels, suites, etc.)
 * It implements our schema alignment strategy with defensive programming
 * and graceful error handling for potential schema mismatches.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ExtendedResourceWhereInput, ExtendedReservationWhereInput } from '../../types/prisma-extensions';
import { AppError } from '../../utils/service';

// Simple logger implementation
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => process.env.NODE_ENV !== 'production' ? console.debug(`[DEBUG] ${message}`) : null
};

const prisma = new PrismaClient();

// Helper function to safely execute Prisma queries with error handling
async function safeExecutePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T | null = null,
  errorMessage = 'Error executing database query'
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    logger.error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    logger.debug('This error might be due to schema mismatches between environments');
    return fallbackValue;
  }
}

/**
 * Get all resources with pagination and filtering
 * Implements schema alignment strategy with fallback to empty array
 */
export const getAllResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: ExtendedResourceWhereInput = {
      organizationId: tenantId
    };

    // Add type filter if provided
    if (req.query.type) {
      whereConditions.type = req.query.type as any; // Type assertion for resource type
    }

    // Add name search if provided
    if (req.query.search) {
      whereConditions.name = {
        contains: req.query.search as string,
        mode: 'insensitive'
      };
    }

    // Get total count with safe execution
    const totalCount = await safeExecutePrismaQuery(
      async () => {
        return await prisma.resource.count({
          where: whereConditions as any // Type assertion to handle organizationId
        });
      },
      0, // Zero fallback if there's an error
      'Error counting resources'
    );

    // Get resources with safe execution
    const resources = await safeExecutePrismaQuery(
      async () => {
        return await prisma.resource.findMany({
          where: whereConditions as any, // Type assertion to handle organizationId
          skip,
          take: limit,
          orderBy: {
            name: 'asc'
          }
        });
      },
      [], // Empty array fallback if there's an error
      'Error fetching resources'
    );

    // Return paginated results
    res.status(200).json({
      status: 'success',
      results: resources?.length || 0,
      totalPages: Math.ceil((totalCount || 0) / limit),
      currentPage: page,
      data: resources || []
    });
  } catch (error) {
    logger.error(`Error in getAllResources: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while fetching resources', 500));
  }
};

/**
 * Get a single resource by ID
 * Implements schema alignment strategy with fallback to null
 */
export const getResourceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (!id) {
      return next(new AppError('Resource ID is required', 400));
    }

    // Get resource with safe execution
    const resource = await safeExecutePrismaQuery(
      async () => {
        return await prisma.resource.findFirst({
          where: {
            id,
            organizationId: tenantId
          } as any, // Type assertion to handle organizationId
        });
      },
      null, // Null fallback if there's an error
      `Error fetching resource with ID: ${id}`
    );

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: resource
    });
  } catch (error) {
    logger.error(`Error in getResourceById: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while fetching the resource', 500));
  }
};

/**
 * Create a new resource
 * Implements schema alignment strategy with proper error handling
 */
export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    const { name, type, capacity, description, isActive } = req.body;

    // Validate required fields
    if (!name) {
      return next(new AppError('Name is required', 400));
    }

    if (!type) {
      return next(new AppError('Type is required', 400));
    }

    // Create resource with safe execution
    const newResource = await safeExecutePrismaQuery(
      async () => {
        // Use type assertion to handle fields not in the base Prisma schema
        const data: any = {
          name,
          type,
          capacity: capacity ? parseInt(capacity) : undefined,
          description,
          isActive: isActive !== undefined ? isActive : true,
          organizationId: tenantId
        };
        
        return await prisma.resource.create({
          data
        });
      },
      null, // Null fallback if there's an error
      'Error creating resource'
    );

    if (!newResource) {
      return next(new AppError('Failed to create resource', 500));
    }

    res.status(201).json({
      status: 'success',
      data: newResource
    });
  } catch (error) {
    logger.error(`Error in createResource: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while creating the resource', 500));
  }
};

/**
 * Update an existing resource
 * Implements schema alignment strategy with proper error handling
 */
export const updateResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (!id) {
      return next(new AppError('Resource ID is required', 400));
    }

    const { name, type, capacity, description, isActive } = req.body;

    // Build update data object
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update resource with safe execution
    const updatedResource = await safeExecutePrismaQuery(
      async () => {
        // Use type assertion for where clause to handle organizationId
        const whereClause: any = {
          id
        };
        
        // Add organizationId for tenant isolation
        whereClause.organizationId = tenantId;
        
        return await prisma.resource.update({
          where: whereClause,
          data: updateData
        });
      },
      null, // Null fallback if there's an error
      `Error updating resource with ID: ${id}`
    );

    if (!updatedResource) {
      return next(new AppError('Resource not found or update failed', 404));
    }

    res.status(200).json({
      status: 'success',
      data: updatedResource
    });
  } catch (error) {
    logger.error(`Error in updateResource: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while updating the resource', 500));
  }
};

/**
 * Delete a resource
 * Implements schema alignment strategy with proper error handling
 */
export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (!id) {
      return next(new AppError('Resource ID is required', 400));
    }

    // Check if resource is used in any reservations
    const reservationsUsingResource = await safeExecutePrismaQuery(
      async () => {
        const whereConditions: ExtendedReservationWhereInput = {
          resourceId: id,
          organizationId: tenantId
        };
        
        return await prisma.reservation.count({
          where: whereConditions as any // Type assertion to handle organizationId
        });
      },
      0, // Zero fallback if there's an error
      `Error checking reservations for resource with ID: ${id}`
    );

    if (reservationsUsingResource && reservationsUsingResource > 0) {
      return next(new AppError('Cannot delete resource that is used in reservations', 400));
    }

    // Delete resource with safe execution
    const deletedResource = await safeExecutePrismaQuery(
      async () => {
        // Use type assertion for where clause to handle organizationId
        const whereClause: any = {
          id
        };
        
        // Add organizationId for tenant isolation
        whereClause.organizationId = tenantId;
        
        return await prisma.resource.delete({
          where: whereClause
        });
      },
      null, // Null fallback if there's an error
      `Error deleting resource with ID: ${id}`
    );

    if (!deletedResource) {
      return next(new AppError('Resource not found or delete failed', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteResource: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while deleting the resource', 500));
  }
};

/**
 * Get resource availability for a date range
 * This is a convenience method that wraps the availability controller
 */
export const getResourceAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 400));
    }

    if (!id) {
      return next(new AppError('Resource ID is required', 400));
    }

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    // Parse dates
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    // Check for overlapping reservations with safe execution
    const overlappingReservations = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findMany({
          where: {
            resourceId: id,
            organizationId: tenantId,
            OR: [
              {
                // Reservation starts during the requested period
                startDate: {
                  gte: parsedStartDate,
                  lte: parsedEndDate
                }
              },
              {
                // Reservation ends during the requested period
                endDate: {
                  gte: parsedStartDate,
                  lte: parsedEndDate
                }
              },
              {
                // Reservation spans the entire requested period
                AND: [
                  {
                    startDate: {
                      lte: parsedStartDate
                    }
                  },
                  {
                    endDate: {
                      gte: parsedEndDate
                    }
                  }
                ]
              }
            ]
          } as any, // Type assertion to handle organizationId
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        });
      },
      [], // Empty array fallback if there's an error
      `Error checking availability for resource with ID: ${id}`
    );

    // Determine if resource is available
    const isAvailable = !overlappingReservations || overlappingReservations.length === 0;

    res.status(200).json({
      status: 'success',
      data: {
        resourceId: id,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        isAvailable,
        overlappingReservations: overlappingReservations || []
      }
    });
  } catch (error) {
    logger.error(`Error in getResourceAvailability: ${error instanceof Error ? error.message : String(error)}`);
    return next(new AppError('An error occurred while checking resource availability', 500));
  }
};
