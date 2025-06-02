import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createValidationError,
  createSuccessResponse
} from '../../utils/api';
import { ExtendedReservationStatus, ExtendedReservationWhereInput, ExtendedReservation, ExtendedPetSelect } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Get reservations filtered by status
 */
export const getReservationsByStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.params;
    const tenantId = req.tenantId;
    
    // Validate status parameter
    if (!Object.values(ExtendedReservationStatus).includes(status as ExtendedReservationStatus)) {
      return next(createValidationError(`Invalid status: ${status}`));
    }
    
    // Get reservations by status for this tenant
    const reservations = await prisma.reservation.findMany({
      where: {
        organizationId: tenantId,
        status: status as any
      } as ExtendedReservationWhereInput,
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
        startDate: 'desc'
      }
    });
    
    return res.json(createSuccessResponse(reservations));
  } catch (error) {
    console.error('[Reservation Service] Error getting reservations by status:', error);
    return next(error);
  }
};
