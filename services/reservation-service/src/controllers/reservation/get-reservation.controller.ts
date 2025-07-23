/**
 * Get Reservation Controller
 * 
 * This file contains the controller methods for retrieving reservations.
 * It implements schema alignment strategy with defensive programming.
 */

import { Request, Response } from 'express';
import { AppError } from '../../utils/service';
import { catchAsync } from '../../middleware/catchAsync';
import { logger } from '../../utils/logger';
import { 
  ExtendedReservationWhereInput,
  ExtendedReservationInclude
} from '../../types/prisma-extensions';
import { safeExecutePrismaQuery, prisma } from './utils/prisma-helpers';

/**
 * Get all reservations with pagination and filtering
 * Implements schema alignment strategy with defensive programming
 * Uses standardized error handling pattern
 * 
 * @route GET /api/v1/reservations
 * @param {number} req.query.page - Page number for pagination
 * @param {number} req.query.limit - Number of items per page
 * @param {string} req.query.status - Filter by reservation status
 * @param {string} req.query.startDate - Filter by start date
 * @param {string} req.query.endDate - Filter by end date
 * @param {string} req.query.customerId - Filter by customer ID
 * @param {string} req.query.petId - Filter by pet ID
 * @param {string} req.query.resourceId - Filter by resource ID
 * @param {string} req.query.suiteType - Filter by suite type
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getAllReservations = catchAsync(async (req: Request, res: Response) => {
  // Generate a unique request ID for logging
  const requestId = `getAll-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  logger.info(`Processing get all reservations request`, { requestId, query: req.query });
  
  // Get tenant ID from request - added by tenant middleware
  const tenantId = req.tenantId;
  if (!tenantId) {
    logger.warn(`Missing tenant ID in request`, { requestId });
    throw AppError.authorizationError('Tenant ID is required');
  }

  // Parse pagination parameters with validation
  let page = 1;
  let limit = 10;
  const warnings: string[] = [];
  
  if (req.query.page) {
    const parsedPage = parseInt(req.query.page as string);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    } else {
      logger.warn(`Invalid page parameter`, { requestId, page: req.query.page });
      warnings.push(`Invalid page parameter: ${req.query.page}, using default: 1`);
    }
  }
  
  if (req.query.limit) {
    const parsedLimit = parseInt(req.query.limit as string);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      limit = parsedLimit;
    } else {
      logger.warn(`Invalid limit parameter`, { requestId, limit: req.query.limit });
      warnings.push(`Invalid limit parameter: ${req.query.limit}, using default: 10`);
    }
  }
  
  // Calculate skip value for pagination
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {
    organizationId: tenantId
  };
  
  // Add optional filters if provided
  if (req.query.status) {
    // Handle comma-separated status values
    const statusString = req.query.status as string;
    
    // Map frontend status values to database enum values
    const statusMap: { [key: string]: string } = {
      'PENDING': 'PENDING_PAYMENT',
      'CONFIRMED': 'CONFIRMED',
      'CHECKED_IN': 'CHECKED_IN',
      'CHECKED_OUT': 'CHECKED_OUT',
      'COMPLETED': 'COMPLETED',
      'NO_SHOW': 'NO_SHOW',
      'CANCELLED': 'CANCELLED',
      'DRAFT': 'DRAFT',
      'PARTIALLY_PAID': 'PARTIALLY_PAID'
    };
    
    if (statusString.includes(',')) {
      // Multiple statuses - use IN operator
      const mappedStatuses = statusString.split(',').map(s => {
        const trimmed = s.trim();
        return statusMap[trimmed] || trimmed; // Use mapping or original if not found
      });
      filter.status = {
        in: mappedStatuses
      };
    } else {
      // Single status
      const trimmed = statusString.trim();
      filter.status = statusMap[trimmed] || trimmed;
    }
  }
  
  if (req.query.customerId) {
    filter.customerId = req.query.customerId;
  }
  
  if (req.query.petId) {
    filter.petId = req.query.petId;
  }
  
  if (req.query.resourceId) {
    filter.resourceId = req.query.resourceId;
  }
  
  if (req.query.suiteType) {
    filter.suiteType = req.query.suiteType;
  }
  
  // Handle date filters
  if (req.query.startDate) {
    try {
      const startDate = new Date(req.query.startDate as string);
      if (!isNaN(startDate.getTime())) {
        filter.startDate = {
          gte: startDate
        };
      } else {
        logger.warn(`Invalid startDate filter`, { requestId, startDate: req.query.startDate });
        warnings.push(`Invalid startDate filter: ${req.query.startDate}, ignoring this filter`);
      }
    } catch (error) {
      logger.warn(`Error parsing startDate filter`, { requestId, startDate: req.query.startDate, error });
      warnings.push(`Error parsing startDate filter: ${req.query.startDate}, ignoring this filter`);
    }
  }
  
  if (req.query.endDate) {
    try {
      const endDate = new Date(req.query.endDate as string);
      if (!isNaN(endDate.getTime())) {
        filter.endDate = {
          lte: endDate
        };
      } else {
        logger.warn(`Invalid endDate filter`, { requestId, endDate: req.query.endDate });
        warnings.push(`Invalid endDate filter: ${req.query.endDate}, ignoring this filter`);
      }
    } catch (error) {
      logger.warn(`Error parsing endDate filter`, { requestId, endDate: req.query.endDate, error });
      warnings.push(`Error parsing endDate filter: ${req.query.endDate}, ignoring this filter`);
    }
  }
  
  // Count total number of reservations matching filter
  const totalCount = await safeExecutePrismaQuery(
    async () => {
      return await prisma.reservation.count({
        where: filter as ExtendedReservationWhereInput
      });
    },
    0, // Default to 0 if there's an error
    `Error counting reservations with filter`,
    true // Enable throwError flag
  );
  
  // Get reservations with pagination
  const reservations = await safeExecutePrismaQuery(
    async () => {
      return await prisma.reservation.findMany({
        where: filter as ExtendedReservationWhereInput,
        skip,
        take: limit,
        orderBy: {
          startDate: 'desc'
        },
        select: {
          id: true,
          customerId: true,
          petId: true,
          startDate: true,
          endDate: true,
          status: true,
          price: true,
          suiteType: true,
          resourceId: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          pet: {
            select: {
              name: true,
              breed: true
            }
          },
          resource: {
            select: {
              name: true,
              type: true
            }
          }
        }
      });
    },
    [], // Default to empty array if there's an error
    `Error fetching reservations with pagination and filter`,
    true // Enable throwError flag
  );
  
  // Calculate pagination metadata
  const totalPages = Math.ceil((totalCount || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  logger.info(`Found ${reservations ? reservations.length : 0} reservations (page ${page}/${totalPages})`, { 
    requestId,
    totalCount,
    pageSize: limit
  });
  
  // Prepare response
  const responseData: any = {
    status: 'success',
    data: {
      reservations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }
  };
  
  // Add warnings if any
  if (warnings.length > 0) {
    responseData.warnings = warnings;
    logger.warn(`Response includes warnings`, { requestId, warningCount: warnings.length });
  }
  
  res.status(200).json(responseData);
});

/**
 * Get a single reservation by ID
 * Implements schema alignment strategy with defensive programming
 * Uses standardized error handling pattern
 * 
 * @route GET /api/v1/reservations/:id
 * @param {string} req.params.id - Reservation ID
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getReservationById = catchAsync(async (req: Request, res: Response) => {
  // Generate a unique request ID for logging
  const requestId = `getById-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  logger.info(`Processing get reservation by ID request for ID: ${req.params.id}`, { requestId });
  
  // Get tenant ID from request - added by tenant middleware
  const tenantId = req.tenantId;
  if (!tenantId) {
    logger.warn(`Missing tenant ID in request`, { requestId });
    throw AppError.authorizationError('Tenant ID is required');
  }

  const { id } = req.params;
  if (!id) {
    logger.warn(`Missing reservation ID in request`, { requestId });
    throw AppError.validationError('Reservation ID is required');
  }
  
  // Get reservation by ID
  const reservation = await safeExecutePrismaQuery(
    async () => {
      return await prisma.reservation.findFirst({
        where: {
          id,
          organizationId: tenantId
        } as ExtendedReservationWhereInput,
        select: {
          id: true,
          customerId: true,
          petId: true,
          startDate: true,
          endDate: true,
          status: true,
          price: true,
          suiteType: true,
          resourceId: true,
          createdAt: true,
          updatedAt: true,
          notes: true,
          organizationId: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          pet: {
            select: {
              name: true,
              breed: true,
              size: true,
              weight: true,
              birthDate: true,
            }
          },
          resource: {
            select: {
              name: true,
              type: true
            }
          },
          addOns: {
            select: {
              id: true,
              addOnId: true,
              price: true,
              notes: true
            }
          }
        }
      });
    },
    null, // Default to null if there's an error
    `Error fetching reservation with ID ${id}`,
    true // Enable throwError flag
  );
  
  if (!reservation) {
    logger.warn(`Reservation not found or does not belong to tenant: ${tenantId}`, { requestId });
    throw AppError.notFoundError('Reservation not found');
  }
  
  logger.info(`Found reservation: ${id}`, { requestId });
  
  res.status(200).json({
    status: 'success',
    data: {
      reservation
    }
  });
});

/**
 * Get today's revenue from reservations
 * Simple implementation that returns 0 for now
 * 
 * @route GET /api/v1/reservations/revenue/today
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getTodayRevenue = catchAsync(async (req: Request, res: Response) => {
  // Generate a unique request ID for logging
  const requestId = `revenue-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  logger.info(`Processing today revenue request`, { requestId });
  
  // Get tenant ID from request - added by tenant middleware
  const tenantId = req.tenantId;
  if (!tenantId) {
    logger.warn(`Missing tenant ID in request`, { requestId });
    throw AppError.authorizationError('Tenant ID is required');
  }

  // For now, return a simple response
  // This can be enhanced later to calculate actual revenue
  const revenue = 0;
  
  logger.info(`Today revenue calculated`, { requestId, revenue });
  
  res.status(200).json({
    status: 'success',
    data: {
      revenue
    }
  });
});
