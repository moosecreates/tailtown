/**
 * Get Reservation Controller
 * 
 * This file contains the controller methods for retrieving reservations.
 * It implements schema alignment strategy with defensive programming.
 * Optimized with caching and query performance monitoring.
 */

import { Request, Response } from 'express';
import { AppError } from '../../utils/service';
import { catchAsync } from '../../middleware/catchAsync';
import { logger } from '../../utils/logger';
import { ExtendedReservationWhereInput } from '../../types/prisma-extensions';
import { safeExecutePrismaQuery, prisma } from './utils/prisma-helpers';
import { reservationCache } from '../../utils/cache';
import { performance } from 'perf_hooks';

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
  // Start performance tracking
  const startTime = performance.now();
  
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
        logger.warn(`Invalid startDate parameter`, { requestId, startDate: req.query.startDate });
        warnings.push(`Invalid startDate parameter: ${req.query.startDate}, ignoring this filter`);
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
        logger.warn(`Invalid endDate parameter`, { requestId, endDate: req.query.endDate });
        warnings.push(`Invalid endDate parameter: ${req.query.endDate}, ignoring this filter`);
      }
    } catch (error) {
      logger.warn(`Error parsing endDate filter`, { requestId, endDate: req.query.endDate, error });
      warnings.push(`Error parsing endDate filter: ${req.query.endDate}, ignoring this filter`);
    }
  }
  
  // Generate cache key for this specific query
  // Only cache simple queries without complex filters
  let useCache = true;
  let cacheKey = ``;
  
  // Only use cache for simple pagination of recent reservations
  // Don't cache heavily filtered queries
  if (
    Object.keys(filter).length <= 2 && // Only organizationId and maybe status
    (!req.query.startDate && !req.query.endDate) && // No date filters
    (!req.query.customerId && !req.query.petId && !req.query.resourceId) // No specific ID filters
  ) {
    cacheKey = `reservations:${tenantId}:page${page}:limit${limit}`;
    
    if (req.query.status) {
      cacheKey += `:status${req.query.status}`;
    }
    
    logger.debug(`Query eligible for caching`, { requestId, cacheKey });
  } else {
    useCache = false;
    logger.debug(`Complex query not using cache`, { requestId });
  }
  
  let reservations: any[] = [];
  let totalCount = 0;
  let cachedData: { reservations: any[], totalCount: number } | null = null;
  
  // Try to get from cache if applicable
  if (useCache) {
    cachedData = reservationCache.get(cacheKey);
  }
  
  if (cachedData) {
    // Use cached data
    reservations = cachedData.reservations;
    totalCount = cachedData.totalCount;
    logger.info(`Cache hit for reservations list`, { 
      requestId, 
      cacheTime: performance.now() - startTime,
      resultCount: reservations.length
    });
  } else {
    // Fetch from database
    // Optimize query: Use two separate queries instead of one with count
    // This improves performance for large datasets
    
    // 1. Get total count (faster separate query)
    const countResult = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.count({
          where: filter as ExtendedReservationWhereInput
        });
      },
      0, // Default to 0 if there's an error
      `Error counting reservations with filter`,
      true // Enable throwError flag
    );
    
    // Ensure count is a number
    totalCount = typeof countResult === 'number' ? countResult : 0;
    
    // 2. Get paginated results with optimized select
    const dbReservations = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findMany({
          where: filter as ExtendedReservationWhereInput,
          skip,
          take: limit,
          orderBy: {
            startDate: 'desc'
          },
          select: { // Use select instead of include for better performance
            id: true,
            customerId: true,
            petId: true,
            startDate: true,
            endDate: true,
            status: true,
            price: true,
            suiteType: true,
            resourceId: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true
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
      `Error fetching reservations with pagination`,
      true // Enable throwError flag
    );
    
    // Ensure we have an array even if query returns null
    reservations = dbReservations || [];
    
    // Cache results if appropriate (including empty results)
    if (useCache) {
      reservationCache.set(cacheKey, { reservations, totalCount });
      logger.debug(`Cached reservation list results`, { requestId, cacheKey, resultCount: reservations.length });
    }
  }
  
  // Calculate pagination metadata with safety checks
  const safeCount = totalCount || 0;
  const totalPages = Math.ceil(safeCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Calculate total execution time
  const executionTime = performance.now() - startTime;
  
  logger.info(`Found ${reservations.length} reservations (page ${page}/${totalPages})`, { 
    requestId,
    totalCount: safeCount,
    pageSize: limit,
    executionTimeMs: executionTime.toFixed(2)
  });
  
  // Include execution time in response headers for monitoring
  res.set('X-Execution-Time', executionTime.toFixed(2));
  
  // Prepare response
  const responseData: any = {
    status: 'success',
    data: {
      results: reservations,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPrevPage
      }
    }
  };
  
  // Add cache info to response for debugging in development
  if (process.env.NODE_ENV === 'development') {
    responseData.debug = {
      cacheUsed: !!cachedData,
      executionTime: executionTime.toFixed(2)
    };
  }
  
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
  // Start performance tracking
  const startTime = performance.now();
  
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
  
  // Generate cache key based on tenant and reservation ID
  const cacheKey = `reservation:${tenantId}:${id}`;
  
  // Check if data is in cache first
  const cachedReservation = reservationCache.get(cacheKey);
  let reservation;
  
  if (cachedReservation) {
    reservation = cachedReservation;
    logger.info(`Cache hit for reservation: ${id}`, { requestId, cacheTime: performance.now() - startTime });
  } else {
    // Not in cache, fetch from database
    logger.debug(`Cache miss for reservation: ${id}, fetching from database`, { requestId });
    
    // Get reservation by ID
    reservation = await safeExecutePrismaQuery(
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
    
    // Store in cache if found
    if (reservation) {
      reservationCache.set(cacheKey, reservation);
    }
  }
  
  if (!reservation) {
    logger.warn(`Reservation not found or does not belong to tenant: ${tenantId}`, { requestId });
    throw AppError.notFoundError('Reservation not found');
  }
  
  // Calculate total execution time
  const executionTime = performance.now() - startTime;
  logger.info(`Found reservation: ${id}`, { requestId, executionTimeMs: executionTime.toFixed(2) });
  
  // Include execution time in response headers for monitoring
  res.set('X-Execution-Time', executionTime.toFixed(2));
  
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
