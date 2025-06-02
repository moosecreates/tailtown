import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createSuccessResponse } from '../../utils/api';
import {
  ExtendedReservationStatus,
  ExtendedReservationWhereInput,
  ExtendedReservationInclude,
  ExtendedReservation
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Gets today's total revenue from all sources.
 * 
 * This endpoint calculates revenue from two sources:
 * 1. Service Revenue: The base price of all scheduled services for today
 * 2. Add-On Revenue: The price of all add-on services for today
 * 
 * This implementation follows our financial data architecture principles:
 * - Separates operational from reporting data
 * - Uses tenant-specific indexing for multi-tenant performance
 * - Provides summary data for dashboard reporting
 */
export const getTodayRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    
    // Get the current date range (start/end of today)
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    console.log(`[Reservation Service] Calculating revenue for ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    // Get all active reservations for today
    const todayReservations = await prisma.reservation.findMany({
      where: {
        organizationId: tenantId,
        // Reservations that are active today (overlap with today's date range)
        AND: [
          { startDate: { lte: endOfDay } },
          { endDate: { gte: startOfDay } }
        ],
        // Only include confirmed or checked-in reservations
        status: {
          in: [ExtendedReservationStatus.CONFIRMED, ExtendedReservationStatus.CHECKED_IN, ExtendedReservationStatus.PENDING_PAYMENT, ExtendedReservationStatus.PARTIALLY_PAID] as any
        }
      } as ExtendedReservationWhereInput,
      include: {
        addOns: true
      } as ExtendedReservationInclude
    }) as ExtendedReservation[];
    
    console.log(`[Reservation Service] Found ${todayReservations.length} active reservations today`);
    
    // Calculate service revenue (base reservation price)
    const baseRevenue = todayReservations.reduce((total, reservation) => {
      return total + ((reservation as ExtendedReservation).price || 0);
    }, 0);
    
    // Calculate add-on revenue
    const addOnRevenue = todayReservations.reduce((total, reservation) => {
      return total + ((reservation as ExtendedReservation).addOns || []).reduce((addOnTotal: number, addOn: any) => {
        return addOnTotal + (addOn.price || 0);
      }, 0);
    }, 0);
    
    // Calculate total revenue
    const totalRevenue = baseRevenue + addOnRevenue;
    
    // Format the response
    const revenueData = {
      date: startOfDay.toISOString().split('T')[0],
      serviceRevenue: baseRevenue,
      addOnRevenue: addOnRevenue,
      totalRevenue: totalRevenue,
      reservationCount: todayReservations.length
    };
    
    return res.json(createSuccessResponse(revenueData));
  } catch (error) {
    console.error('[Reservation Service] Error calculating today\'s revenue:', error);
    return next(error);
  }
};
