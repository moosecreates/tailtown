import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createNotFoundError,
  createSuccessResponse
} from '../../utils/api';
import {
  ExtendedCustomerWhereInput,
  ExtendedReservationWhereInput,
  ExtendedPetSelect
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Get all reservations for a specific customer
 */
export const getReservationsByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const tenantId = req.tenantId;
    
    // Verify the customer exists and belongs to this tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId: tenantId
      } as ExtendedCustomerWhereInput
    });
    
    if (!customer) {
      return next(createNotFoundError('Customer', customerId));
    }
    
    // Get all reservations for this customer
    const reservations = await prisma.reservation.findMany({
      where: {
        customerId,
        organizationId: tenantId
      } as ExtendedReservationWhereInput,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
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
    console.error('[Reservation Service] Error getting reservations by customer:', error);
    return next(error);
  }
};
