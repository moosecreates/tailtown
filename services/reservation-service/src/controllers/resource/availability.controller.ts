import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/service';
import { ExtendedReservationWhereInput, ExtendedReservationStatus } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Check if a resource is available (not occupied) for a specific date or date range
 * This is the backend implementation of what was previously the frontend isKennelOccupied function
 * 
 * @route GET /api/resources/availability
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
      }
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
 * 
 * @route POST /api/resources/availability/batch
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
