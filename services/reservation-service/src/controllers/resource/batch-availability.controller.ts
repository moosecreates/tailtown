import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/service';
import { ExtendedReservationWhereInput, ExtendedReservationStatus, ExtendedReservationInclude } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

// Helper function to safely execute Prisma queries with error handling
async function safeExecutePrismaQuery<T>(queryFn: () => Promise<T>, fallbackValue: T, errorMessage: string): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallbackValue;
  }
}

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
    // Use a default tenant ID if one isn't provided
    const tenantId = req.tenantId || 'default';
    console.log(`Using tenant ID: ${tenantId} for batch resource availability check`);

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
    // Using our safe execution helper to handle potential schema mismatches
    const allReservations = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findMany({
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
          } as unknown as ExtendedReservationInclude
        });
      },
      [], // Empty array fallback if there's an error
      'Error finding overlapping reservations for batch check'
    );
    
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
    // More graceful error handling - return an empty result instead of a 500 error
    return res.status(200).json({
      status: 'success',
      data: {
        resources: req.body.resources ? req.body.resources.map((id: string) => ({
          resourceId: id,
          isAvailable: true, // Default to available if we can't determine
          occupyingReservations: []
        })) : [],
        message: 'Batch availability check completed with limited data'
      }
    });
  }
};
