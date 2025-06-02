import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/service';
import { ExtendedReservationWhereInput, ExtendedReservationStatus, ExtendedReservationInclude } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Check if a resource is available (not occupied) for a specific date or date range
 * This is the backend implementation of what was previously the frontend isKennelOccupied function.
 * It properly handles tenant isolation and normalizes dates for consistent availability checks.
 * 
 * @route GET /api/v1/resources/availability
 * @param {string} req.query.resourceId - The ID of the resource to check
 * @param {string} req.query.date - The date to check in YYYY-MM-DD format
 * @param {string} [req.query.startDate] - Optional start date for a range check in YYYY-MM-DD format
 * @param {string} [req.query.endDate] - Optional end date for a range check in YYYY-MM-DD format
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 * @returns {Object} Response with isAvailable flag and any conflicting reservations
 */
export const checkResourceAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 401));
    }

    // Get query parameters
    const { resourceId, date, startDate, endDate } = req.query;
    
    if (!resourceId) {
      return next(new AppError('Resource ID is required', 400));
    }
    
    // Determine if we're checking for a single date or a date range
    let checkStartDate: Date;
    let checkEndDate: Date;

    if (date) {
      // If a single date is provided, we check just that date
      const parsedDate = new Date(date as string);
      if (isNaN(parsedDate.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }
      
      // Set the start and end date to be the same date (beginning and end of day)
      checkStartDate = new Date(parsedDate);
      checkStartDate.setHours(0, 0, 0, 0);
      
      checkEndDate = new Date(parsedDate);
      checkEndDate.setHours(23, 59, 59, 999);
    } else if (startDate && endDate) {
      // If start and end dates are provided, we check the entire range
      checkStartDate = new Date(startDate as string);
      checkEndDate = new Date(endDate as string);
      
      if (isNaN(checkStartDate.getTime()) || isNaN(checkEndDate.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }
    } else {
      return next(new AppError('Either date or both startDate and endDate are required', 400));
    }
    
    // Find any reservations that occupy this resource during the specified time
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        organizationId: tenantId,
        resourceId: resourceId as string,
        // Find reservations that overlap with the requested dates
        AND: [
          { startDate: { lte: checkEndDate } },
          { endDate: { gte: checkStartDate } }
        ],
        // Only check active reservations
        status: {
          in: [
            ExtendedReservationStatus.CONFIRMED, 
            ExtendedReservationStatus.CHECKED_IN, 
            ExtendedReservationStatus.PENDING_PAYMENT, 
            ExtendedReservationStatus.PARTIALLY_PAID
          ] as any
        }
      } as ExtendedReservationWhereInput,
      include: {
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
            breed: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      } as unknown as ExtendedReservationInclude
    });
    
    // Available if there are no overlapping reservations
    const isAvailable = overlappingReservations.length === 0;
    
    // Return the result including availability status and any occupying reservations
    res.status(200).json({
      status: 'success',
      data: {
        resourceId,
        checkDate: date ? date : null,
        checkStartDate: startDate ? startDate : checkStartDate.toISOString(),
        checkEndDate: endDate ? endDate : checkEndDate.toISOString(),
        isAvailable,
        occupyingReservations: isAvailable ? [] : overlappingReservations
      }
    });
  } catch (error) {
    console.error('Error checking resource availability:', error);
    return next(new AppError('Failed to check resource availability', 500));
  }
};

/**
 * Check availability for multiple resources at once
 * This batch endpoint allows efficient checking of multiple resources in a single request,
 * reducing network overhead and improving frontend performance. It's particularly useful
 * for calendar views that need to display multiple resources simultaneously.
 * 
 * @route POST /api/v1/resources/availability/batch
 * @param {string[]} req.body.resourceIds - Array of resource IDs to check
 * @param {string} [req.body.date] - Single date to check in YYYY-MM-DD format
 * @param {string} [req.body.startDate] - Start date for a range check in YYYY-MM-DD format
 * @param {string} [req.body.endDate] - End date for a range check in YYYY-MM-DD format
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 * @returns {Object} Response with availability status for each requested resource
 */
export const batchCheckResourceAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant ID is required', 401));
    }

    // Get request body - expecting an array of resource IDs and date ranges
    const { resources, date, startDate, endDate } = req.body;
    
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return next(new AppError('Resource IDs are required', 400));
    }
    
    // Determine if we're checking for a single date or a date range
    let checkStartDate: Date;
    let checkEndDate: Date;

    if (date) {
      // If a single date is provided, we check just that date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }
      
      // Set the start and end date to be the same date (beginning and end of day)
      checkStartDate = new Date(parsedDate);
      checkStartDate.setHours(0, 0, 0, 0);
      
      checkEndDate = new Date(parsedDate);
      checkEndDate.setHours(23, 59, 59, 999);
    } else if (startDate && endDate) {
      // If start and end dates are provided, we check the entire range
      checkStartDate = new Date(startDate);
      checkEndDate = new Date(endDate);
      
      if (isNaN(checkStartDate.getTime()) || isNaN(checkEndDate.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }
    } else {
      return next(new AppError('Either date or both startDate and endDate are required', 400));
    }
    
    // Find reservations for all the requested resources in the date range
    const allReservations = await prisma.reservation.findMany({
      where: {
        organizationId: tenantId,
        resourceId: {
          in: resources
        },
        // Find reservations that overlap with the requested dates
        AND: [
          { startDate: { lte: checkEndDate } },
          { endDate: { gte: checkStartDate } }
        ],
        // Only check active reservations
        status: {
          in: [
            ExtendedReservationStatus.CONFIRMED, 
            ExtendedReservationStatus.CHECKED_IN, 
            ExtendedReservationStatus.PENDING_PAYMENT, 
            ExtendedReservationStatus.PARTIALLY_PAID
          ] as any
        }
      } as ExtendedReservationWhereInput,
      include: {
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
        }
      }
    });
    
    // Group reservations by resource ID
    const reservationsByResource: Record<string, any[]> = {};
    resources.forEach(resourceId => {
      reservationsByResource[resourceId] = allReservations.filter(
        reservation => reservation.resourceId === resourceId
      );
    });
    
    // Prepare the response data
    const availabilityData = resources.map(resourceId => ({
      resourceId,
      isAvailable: reservationsByResource[resourceId].length === 0,
      occupyingReservations: reservationsByResource[resourceId]
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        checkDate: date ? date : null,
        checkStartDate: startDate ? startDate : checkStartDate.toISOString(),
        checkEndDate: endDate ? endDate : checkEndDate.toISOString(),
        resources: availabilityData
      }
    });
  } catch (error) {
    console.error('Error batch checking resource availability:', error);
    return next(new AppError('Failed to batch check resource availability', 500));
  }
};
