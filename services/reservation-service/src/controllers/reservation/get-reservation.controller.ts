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
  ExtendedReservationWhereInput
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
  // In development mode, use a default tenant ID if not provided
  const isDev = process.env.NODE_ENV === 'development';
  const tenantId = req.tenantId || (isDev ? 'dev' : undefined);
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
  // Note: organizationId removed as it's not in the schema
  const filter: any = {};
  
  // Enforce tenant scoping for multi-tenancy
  filter.tenantId = tenantId;
  
  // Add optional filters if provided
  if (req.query.status) {
    // Handle comma-separated status values
    const statusValues = (req.query.status as string).split(',');
    if (statusValues.length > 1) {
      filter.status = { in: statusValues };
      logger.info(`Filtering by multiple statuses: ${statusValues.join(', ')}`, { requestId });
    } else {
      filter.status = req.query.status;
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
  // Support overlapping range when both startDate and endDate are provided
  let rangeApplied = false;
  if (req.query.startDate && req.query.endDate) {
    try {
      const startStr = req.query.startDate as string;
      const endStr = req.query.endDate as string;
      const [sy, sm, sd] = startStr.split('-').map(n => parseInt(n, 10));
      const [ey, em, ed] = endStr.split('-').map(n => parseInt(n, 10));

      const startOfRange = new Date(sy, (sm || 1) - 1, sd || 1, 0, 0, 0, 0);
      const endOfRange = new Date(ey, (em || 1) - 1, ed || 1, 23, 59, 59, 999);

      if (!isNaN(startOfRange.getTime()) && !isNaN(endOfRange.getTime())) {
        const andConds = [
          // reservation starts on/before range end
          { startDate: { lte: endOfRange } },
          // reservation ends on/after range start
          { endDate: { gte: startOfRange } }
        ];
        filter.AND = Array.isArray(filter.AND) ? [...filter.AND, ...andConds] : andConds;
        rangeApplied = true;
        logger.info(`Filtering reservations overlapping range ${startStr} - ${endStr}`, { requestId, startOfRange, endOfRange });
      } else {
        logger.warn(`Invalid startDate/endDate range provided`, { requestId, startDate: req.query.startDate, endDate: req.query.endDate });
        warnings.push(`Invalid date range: startDate=${req.query.startDate}, endDate=${req.query.endDate}`);
      }
    } catch (error) {
      logger.warn(`Error parsing date range`, { requestId, startDate: req.query.startDate, endDate: req.query.endDate, error });
      warnings.push(`Error parsing date range: startDate=${req.query.startDate}, endDate=${req.query.endDate}`);
    }
  }

  // If no valid range, support single-day filtering via 'date' or 'startDate'
  if (!rangeApplied) {
    const dateParam = req.query.startDate || req.query.date;
    if (dateParam) {
      try {
        const dateStr = dateParam as string;
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
          filter.startDate = { gte: startOfDay, lte: endOfDay };
          logger.info(`Filtering reservations for date: ${dateStr}, using start: ${startOfDay.toISOString()} and end: ${endOfDay.toISOString()}`, { requestId });
        } else {
          logger.warn(`Invalid date filter format`, { requestId, dateParam });
          warnings.push(`Invalid date filter: ${dateParam}, ignoring this filter`);
        }
      } catch (error) {
        logger.warn(`Error parsing date filter`, { requestId, dateParam, error });
        warnings.push(`Error parsing date filter: ${dateParam}, ignoring this filter`);
      }
    }

    if (req.query.endDate) {
      try {
        const endDate = new Date(req.query.endDate as string);
        if (!isNaN(endDate.getTime())) {
          filter.endDate = { lte: endDate };
        } else {
          logger.warn(`Invalid endDate filter`, { requestId, endDate: req.query.endDate });
          warnings.push(`Invalid endDate filter: ${req.query.endDate}, ignoring this filter`);
        }
      } catch (error) {
        logger.warn(`Error parsing endDate filter`, { requestId, endDate: req.query.endDate, error });
        warnings.push(`Error parsing endDate filter: ${req.query.endDate}, ignoring this filter`);
      }
    }
  }

  // Determine ordering
  const allowedSortFields = ['startDate', 'endDate', 'createdAt', 'updatedAt'];
  const sortByParam = (req.query.sortBy as string) || 'startDate';
  const sortField = allowedSortFields.includes(sortByParam) ? sortByParam : 'startDate';
  const sortOrderParam = (req.query.sortOrder as string) === 'asc' ? 'asc' : ((req.query.sortOrder as string) === 'desc' ? 'desc' : 'desc');
  const orderByClause: any = { [sortField]: sortOrderParam };
  
  // Get total count for pagination
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
        orderBy: orderByClause,
        select: {
          // Base fields (explicitly exclude cutOffDate and organizationId by not selecting them)
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
          petId: true,
          serviceId: true,
          resourceId: true,
          // Relations (keep minimal, safe fields)
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          pet: {
            select: {
              name: true
            }
          },
          resource: {
            select: {
              name: true,
              type: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    },
    [], // Default to empty array if there's an error
    `Error fetching reservations with filter`,
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
    results: reservations ? reservations.length : 0,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage
    },
    data: {
      reservations: reservations || []
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
  // In development mode, use a default tenant ID if not provided
  const isDev = process.env.NODE_ENV === 'development';
  const tenantId = req.tenantId || (isDev ? 'dev-tenant-001' : undefined);
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
          tenantId
        } as ExtendedReservationWhereInput,
        select: {
          // Base fields (explicitly exclude cutOffDate and organizationId by not selecting them)
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          customerId: true,
          petId: true,
          serviceId: true,
          resourceId: true,
          // Relations (minimal)
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          pet: {
            select: {
              name: true
            }
          },
          resource: {
            select: {
              name: true,
              type: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          },
          addOnServices: {
            select: {
              id: true,
              addOnId: true
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
