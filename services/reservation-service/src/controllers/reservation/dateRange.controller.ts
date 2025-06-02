import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  validateRequest,
  createSuccessResponse
} from '../../utils/api';
import { dateRangeSchema } from '../../validation/reservation.schema';
import { ExtendedReservationStatus, ExtendedReservationWhereInput, ExtendedReservation, ExtendedPetSelect } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Get reservations within a specific date range
 * This is a critical endpoint for calendar display
 */
export const getReservationsByDateRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract tenant ID from request (added by tenant middleware)
    const tenantId = req.tenantId;
    
    // Validate query parameters
    const { query } = validateRequest(req, {
      query: dateRangeSchema
    });
    
    // Parse dates and normalize time components to avoid comparison issues
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`[Reservation Service] Getting reservations from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Get all valid statuses for user-visible reservations
    const validStatuses = [
      ExtendedReservationStatus.CONFIRMED,
      ExtendedReservationStatus.CHECKED_IN,
      ExtendedReservationStatus.CHECKED_OUT,
      ExtendedReservationStatus.CANCELED,
      ExtendedReservationStatus.NO_SHOW,
      ExtendedReservationStatus.COMPLETED
    ];
    
    // Get reservations that overlap with the specified date range
    const reservations = await prisma.reservation.findMany({
      where: {
        organizationId: tenantId,
        // Find reservations that overlap with the requested dates:
        // 1. It starts before the requested end date AND
        // 2. It ends after the requested start date
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } }
        ],
        // Only include active reservations
        status: {
          in: validStatuses as any // Type assertion needed for enum compatibility
        }
      } as ExtendedReservationWhereInput, // Type assertion for tenant isolation
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
            size: true
          } as ExtendedPetSelect
        },
        resource: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    // Enhance the response with additional data to help with calendar display
    // This addresses the previous issues with kennel matching in the calendar
    const enhancedReservations = reservations.map(reservation => {
      // Use type assertion to access extended properties
      const typedReservation = reservation as unknown as ExtendedReservation;
      
      // Ensure we have all possible ID references for kennel matching
      return {
        ...reservation,
        // Add explicit resourceId reference if it's missing but resource is present
        resourceId: reservation.resourceId || typedReservation.resource?.id,
        // Add explicit suiteType reference
        suiteType: typedReservation.suiteType || typedReservation.resource?.type,
        // Flag for Standard Plus Suite for easier frontend filtering
        isStandardPlusSuite: 
          typedReservation.suiteType === 'STANDARD_PLUS_SUITE' || 
          typedReservation.resource?.type === 'STANDARD_PLUS_SUITE' ||
          (reservation.staffNotes && reservation.staffNotes.includes('Standard Plus')) ||
          (typedReservation.resource?.name && typedReservation.resource.name.includes('Standard Plus'))
      };
    });
    
    return res.json(createSuccessResponse(enhancedReservations));
  } catch (error) {
    console.error('[Reservation Service] Error getting reservations by date range:', error);
    return next(error);
  }
};
