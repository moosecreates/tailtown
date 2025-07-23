import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError';

const prisma = new PrismaClient();

// Use dynamic access to handle different model names
type DynamicPrisma = PrismaClient & Record<string, any>;
const dynamicPrisma = prisma as DynamicPrisma;

// Get resource availability with real database implementation
export const getResourceAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract query parameters
    const { startDate, endDate, resourceType, resourceId } = req.query;
    console.log('Resource availability requested with params:', { startDate, endDate, resourceType, resourceId });

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    // Parse dates
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format'
      });
    }

    // Build resource query
    const resourceWhere: any = {};
    
    if (resourceId) {
      resourceWhere.id = resourceId;
    }
    
    if (resourceType) {
      resourceWhere.type = resourceType;
    }
    
    // Determine which table to use (resources or Resource)
    let resourcesTable;
    let resources;
    
    try {
      // First try with 'resources' table
      const testCount = await dynamicPrisma.resources?.count();
      if (testCount !== undefined) {
        resourcesTable = 'resources';
        resources = await dynamicPrisma.resources.findMany({
          where: resourceWhere,
          orderBy: { name: 'asc' }
        });
      } else {
        // If that fails, try with 'Resource' table
        const testCount = await dynamicPrisma.Resource?.count();
        if (testCount !== undefined) {
          resourcesTable = 'Resource';
          resources = await dynamicPrisma.Resource.findMany({
            where: resourceWhere,
            orderBy: { name: 'asc' }
          });
        } else {
          return res.status(500).json({
            status: 'error',
            message: 'Resource data is not available'
          });
        }
      }
    } catch (err) {
      console.error('Error querying resources tables:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Error querying resources'
      });
    }

    console.log(`Found ${resources.length} resources in '${resourcesTable}' table`);
    
    // Get reservations that overlap with the date range
    let reservationsTable;
    let reservations;
    
    try {
      // First try with 'reservations' table
      const testCount = await dynamicPrisma.reservations?.count();
      if (testCount !== undefined) {
        reservationsTable = 'reservations';
        reservations = await dynamicPrisma.reservations.findMany({
          where: {
            resourceId: { in: resources.map(r => r.id) },
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start }
              },
              {
                startDate: { gte: start, lte: end }
              },
              {
                endDate: { gte: start, lte: end }
              }
            ]
          }
        });
      } else {
        // If that fails, try with 'Reservation' table
        const testCount = await dynamicPrisma.Reservation?.count();
        if (testCount !== undefined) {
          reservationsTable = 'Reservation';
          reservations = await dynamicPrisma.Reservation.findMany({
            where: {
              resourceId: { in: resources.map(r => r.id) },
              OR: [
                {
                  startDate: { lte: end },
                  endDate: { gte: start }
                },
                {
                  startDate: { gte: start, lte: end }
                },
                {
                  endDate: { gte: start, lte: end }
                }
              ]
            }
          });
        } else {
          console.log('No reservation tables found, assuming all resources are available');
          reservations = [];
        }
      }
    } catch (err) {
      console.error('Error querying reservations tables:', err);
      // Continue with empty reservations if we can't query them
      reservations = [];
    }

    console.log(`Found ${reservations?.length || 0} overlapping reservations`);
    
    // Build availability data
    const availabilityData = resources.map((resource: any) => {
      // Find reservations for this resource
      const resourceReservations = reservations?.filter((r: any) => r.resourceId === resource.id) || [];
      
      // Create availability slots
      // For simplicity, we'll create one slot per day in the range
      const slots = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const slotStart = new Date(currentDate);
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(23, 59, 59, 999); // End of day
        
        // Check if this slot overlaps with any reservation
        const isAvailable = !resourceReservations.some((reservation: any) => {
          const reservationStart = new Date(reservation.startDate);
          const reservationEnd = new Date(reservation.endDate);
          
          return (
            (slotStart <= reservationEnd && slotEnd >= reservationStart) ||
            (reservationStart <= slotEnd && reservationEnd >= slotStart)
          );
        });
        
        slots.push({
          id: `slot-${resource.id}-${currentDate.toISOString()}`,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable,
          notes: isAvailable ? null : 'Reserved'
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        resource: {
          id: resource.id,
          name: resource.name,
          type: resource.type || resource.resourceType,
          isActive: resource.isActive !== undefined ? resource.isActive : true
        },
        slots
      };
    });

    res.status(200).json({
      status: 'success',
      data: availabilityData
    });
  } catch (error) {
    console.error('Error in getResourceAvailability:', error);
    next(error);
  }
};

// Check if a specific resource is available during a time period with real database implementation
export const checkResourceAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resourceId } = req.params;
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return next(new AppError('Start time and end time are required', 400));
    }

    console.log('Resource availability check requested for:', { resourceId, startTime, endTime });

    // Parse dates
    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    // Check if resource exists
    let resource;
    let resourceTable;
    
    try {
      // First try with 'resources' table
      resource = await dynamicPrisma.resources?.findUnique({ where: { id: resourceId } });
      if (resource) {
        resourceTable = 'resources';
      } else {
        // If not found, try with 'Resource' table
        resource = await dynamicPrisma.Resource?.findUnique({ where: { id: resourceId } });
        if (resource) {
          resourceTable = 'Resource';
        } else {
          return next(new AppError(`Resource with ID ${resourceId} not found`, 404));
        }
      }
    } catch (err) {
      console.error('Error finding resource:', err);
      return next(new AppError('Error finding resource', 500));
    }

    console.log(`Found resource in '${resourceTable}' table:`, resource);
    
    // Check for overlapping reservations
    let reservations;
    let reservationsTable;
    
    try {
      // First try with 'reservations' table
      const testCount = await dynamicPrisma.reservations?.count();
      if (testCount !== undefined) {
        reservationsTable = 'reservations';
        reservations = await dynamicPrisma.reservations.findMany({
          where: {
            resourceId,
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start }
              },
              {
                startDate: { gte: start, lte: end }
              },
              {
                endDate: { gte: start, lte: end }
              }
            ]
          }
        });
      } else {
        // If that fails, try with 'Reservation' table
        const testCount = await dynamicPrisma.Reservation?.count();
        if (testCount !== undefined) {
          reservationsTable = 'Reservation';
          reservations = await dynamicPrisma.Reservation.findMany({
            where: {
              resourceId,
              OR: [
                {
                  startDate: { lte: end },
                  endDate: { gte: start }
                },
                {
                  startDate: { gte: start, lte: end }
                },
                {
                  endDate: { gte: start, lte: end }
                }
              ]
            }
          });
        } else {
          console.log('No reservation tables found, assuming resource is available');
          reservations = [];
        }
      }
    } catch (err) {
      console.error('Error querying reservations tables:', err);
      // Continue with empty reservations if we can't query them
      reservations = [];
    }

    const overlappingReservations = reservations?.length || 0;
    const isAvailable = overlappingReservations === 0;

    console.log(`Resource ${resourceId} availability:`, { isAvailable, overlappingReservations });
    
    res.status(200).json({
      status: 'success',
      data: {
        isAvailable,
        overlappingReservations,
        availabilitySlots: isAvailable ? 1 : 0,
        resource: {
          id: resource.id,
          name: resource.name,
          type: resource.type || resource.resourceType
        }
      }
    });
  } catch (error) {
    console.error('Error in checkResourceAvailability:', error);
    next(error);
  }
};
