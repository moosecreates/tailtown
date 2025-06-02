import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createNotFoundError,
  createSuccessResponse
} from '../../utils/api';
import {
  ExtendedPetWhereInput,
  ExtendedReservationWhereInput,
  ExtendedCustomerSelect
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Get all reservations for a specific pet
 */
export const getReservationsByPet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { petId } = req.params;
    const tenantId = req.tenantId;
    
    // Verify the pet exists and belongs to this tenant
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        organizationId: tenantId
      } as ExtendedPetWhereInput
    });
    
    if (!pet) {
      return next(createNotFoundError('Pet', petId));
    }
    
    // Get all reservations for this pet
    const reservations = await prisma.reservation.findMany({
      where: {
        petId,
        organizationId: tenantId
      } as ExtendedReservationWhereInput,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          } as ExtendedCustomerSelect
        },
        resource: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    
    return res.json(createSuccessResponse(reservations));
  } catch (error) {
    console.error('[Reservation Service] Error getting reservations by pet:', error);
    return next(error);
  }
};
