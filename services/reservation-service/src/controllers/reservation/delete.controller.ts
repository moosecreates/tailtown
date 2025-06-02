import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createNotFoundError,
  createValidationError,
  createSuccessResponse
} from '../../utils/api';
import { ExtendedReservationWhereInput } from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Deletes a reservation if it's in a deletable status
 */
export const deleteReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // Find the reservation and verify it belongs to this tenant
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        organizationId: tenantId
      } as ExtendedReservationWhereInput
    });
    
    if (!reservation) {
      return next(createNotFoundError('Reservation', id));
    }
    
    // Check if the reservation can be deleted
    // Only allow deletion of reservations with certain statuses
    const deletableStatuses = ['DRAFT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    
    if (!deletableStatuses.includes(reservation.status)) {
      return next(createValidationError(
        `Cannot delete a reservation with status ${reservation.status}`,
        { 
          currentStatus: reservation.status,
          deletableStatuses
        }
      ));
    }
    
    // Delete associated add-ons first to prevent foreign key constraint errors
    await prisma.reservationAddOn.deleteMany({
      where: { reservationId: id }
    });
    
    // Delete the reservation
    await prisma.reservation.delete({
      where: { id }
    });
    
    return res.json(createSuccessResponse(
      { id },
      'Reservation deleted successfully'
    ));
  } catch (error) {
    console.error('[Reservation Service] Error deleting reservation:', error);
    return next(error);
  }
};
