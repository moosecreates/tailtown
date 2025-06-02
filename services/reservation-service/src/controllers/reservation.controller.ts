import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createValidationError, 
  createNotFoundError,
  createSuccessResponse,
  validateRequest
} from '../utils/api';
import { z } from 'zod';

// Define types for tenant request handling
declare global {
  namespace Express {
    interface Request {
      tenantId: string;
    }
  }
}

const prisma = new PrismaClient();

/**
 * Get all reservations with pagination and filtering
 */
export const getAllReservations = async (req: Request, res: Response, next: NextFunction) => {
  // Validate pagination params
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;
  
  try {
    // Extract tenant ID from request (added by tenant middleware)
    const tenantId = req.tenantId;
    
    // Get all reservations for this tenant with pagination
    const totalResults = await prisma.reservation.count({
      where: { organizationId: tenantId } as any // Type assertion for tenant filtering
    });
    
    const reservations = await prisma.reservation.findMany({
      where: { organizationId: tenantId } as any, // Type assertion for tenant filtering
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
            breed: true
          }
        },
        resource: true
      } as any, // Type assertion for the entire include object to handle addOns
      orderBy: {
        startDate: 'desc'
      },
      skip: offset,
      take: limit
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalResults / limit);
    
    return res.json(createSuccessResponse({
      results: reservations,
      currentPage: page,
      totalPages,
      totalResults
    }));
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a reservation by ID
 */
export const getReservationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // Find the reservation and verify it belongs to this tenant
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        organizationId: tenantId
      } as any, // Type assertion for tenant filtering
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
            breed: true
          }
        },
        resource: true
      } as any // Type assertion for the entire include object to handle addOns
    });
    
    if (!reservation) {
      return next(createNotFoundError('Reservation', id));
    }
    
    return res.json(createSuccessResponse(reservation));
  } catch (error) {
    console.error('[Reservation Service] Error getting reservation by ID:', error);
    return next(error);
  }
};

// Export specialized controllers from the barrel file
export * from './reservation';
