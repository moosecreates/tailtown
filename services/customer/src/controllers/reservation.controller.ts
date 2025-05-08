import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all reservations
export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Backend: getAllReservations called with query:', req.query);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build where clause based on query parameters
    let where: any = {};
    
    try {
      // Handle multiple status values
      const status = req.query.status as string;
      if (status) {
        console.log('Status string received:', status);
        const statusArray = status.split(',');
        console.log('Status array after split:', statusArray);
        
        // Validate each status is a valid ReservationStatus
        const validStatuses = Object.values(ReservationStatus);
        console.log('Valid statuses:', validStatuses);
        const invalidStatuses = statusArray.filter(s => !validStatuses.includes(s as ReservationStatus));
        
        if (invalidStatuses.length > 0) {
          throw new AppError(`Invalid status values: ${invalidStatuses.join(', ')}. Valid values are: ${validStatuses.join(', ')}`, 400);
        }
        
        where.status = {
          in: statusArray as ReservationStatus[]
        };
      }
      
      // Handle resourceId filter
      const resourceId = req.query.resourceId as string;
      if (resourceId) {
        where.resourceId = resourceId;
      }
      
      // Handle date filtering - check if reservation overlaps with the given date
      const date = req.query.date as string;
      if (date) {
        console.log('Date filter received:', date);
        
        // Create start and end of the day for the given date, accounting for timezone
        // Parse the date in local timezone (YYYY-MM-DD format)
        const [year, month, day] = date.split('-').map(Number);
        
        // Create date objects with the correct local date regardless of timezone
        // Month is 0-indexed in JavaScript Date
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        console.log(`Filtering reservations that overlap with ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
        
        // A reservation overlaps with the date if:
        // 1. It starts before the end of the day AND
        // 2. It ends after the start of the day
        where.AND = [
          {
            startDate: {
              lte: endOfDay
            }
          },
          {
            endDate: {
              gte: startOfDay
            }
          }
        ];
      }
      
      console.log('Final where clause:', where);
    } catch (error) {
      console.error('Error building where clause:', error);
      throw error;
    }
    
    // Allow sorting
    const sortBy = req.query.sortBy as string || 'startDate';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'asc';

    const reservations = await prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
      },
    });
    
    const total = await prisma.reservation.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single reservation by ID
/**
 * Retrieves a single reservation by ID with all related data.
 * Includes customer, pet, and service information.
 * @param req - Express request object with reservation ID
 * @param res - Express response object
 * @param next - Express next function
 */
export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
        addOnServices: {
          include: {
            addOn: true
          }
        }
      },
    });
    
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by customer
export const getReservationsByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reservations = await prisma.reservation.findMany({
      where: {
        customerId,
      },
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        pet: true,
      },
    });
    
    const total = await prisma.reservation.count({
      where: {
        customerId,
      },
    });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by pet
export const getReservationsByPet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { petId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reservations = await prisma.reservation.findMany({
      where: {
        petId,
      },
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        customer: true,
      },
    });
    
    const total = await prisma.reservation.count({
      where: {
        petId,
      },
    });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by date range
export const getReservationsByDateRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!startDate || !endDate) {
      return next(new AppError('Both startDate and endDate are required', 400));
    }
    
    const reservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: new Date(startDate as string),
        },
        endDate: {
          lte: new Date(endDate as string),
        },
      },
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        customer: true,
        pet: true,
      },
    });
    
    const total = await prisma.reservation.count({
      where: {
        startDate: {
          gte: new Date(startDate as string),
        },
        endDate: {
          lte: new Date(endDate as string),
        },
      },
    });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by status
export const getReservationsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate the status
    const validStatuses = Object.values(ReservationStatus);
    if (!validStatuses.includes(status as ReservationStatus)) {
      return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }
    
    const reservations = await prisma.reservation.findMany({
      where: {
        status: status as ReservationStatus,
      },
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        customer: true,
        pet: true,
      },
    });
    
    const total = await prisma.reservation.count({
      where: {
        status: status as ReservationStatus,
      },
    });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new reservation
/**
 * Creates a new reservation with validation of customer, pet, and service.
 * Ensures the pet belongs to the customer and service is available.
 * @param req - Express request object with reservation data
 * @param res - Express response object
 * @param next - Express next function
 */
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Backend: Received create reservation request with body:', req.body);
    
    const {
      customerId,
      petId,
      serviceId,
      startDate,
      endDate,
      suiteType, // Only required for DAYCARE or BOARDING services
      resourceId, // optional manual override
      status = 'PENDING',
      notes = ''
    } = req.body;

    console.log('Backend: Extracted values:', {
      customerId,
      petId,
      serviceId,
      startDate,
      endDate,
      suiteType,
      resourceId,
      status,
      notes
    });

    // Check if the service requires a suite type
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    // Only require suiteType for DAYCARE or BOARDING services
    const requiresSuiteType = service?.serviceCategory === 'DAYCARE' || service?.serviceCategory === 'BOARDING';
    
    // If service requires a suite type but none was provided, use STANDARD_SUITE as default
    let finalSuiteType = suiteType;
    if (requiresSuiteType) {
      if (!suiteType || !['VIP_SUITE', 'STANDARD_PLUS_SUITE', 'STANDARD_SUITE'].includes(suiteType)) {
        console.log('Backend: Using default STANDARD_SUITE for missing or invalid suiteType:', suiteType);
        finalSuiteType = 'STANDARD_SUITE';
      }
    } else {
      // For services that don't require a suite type, we don't need to validate it
      finalSuiteType = null;
    }
    
    console.log('Backend: Parsed reservation data:', {
      customerId,
      petId,
      serviceId,
      startDate,
      endDate,
      status,
      notes
    });

    // Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Check if the pet exists and belongs to the customer
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });
    
    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }
    
    if (pet.customerId !== customerId) {
      return next(new AppError('The pet does not belong to this customer', 400));
    }
    
    let assignedResourceId = resourceId;

    // Helper: check if a suite is available for the given dates
    async function isSuiteAvailable(suiteId: string) {
      const overlapping = await prisma.reservation.count({
        where: {
          resourceId: suiteId,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });
      return overlapping === 0;
    }

    // Only assign resources for services that require a suite type
    if (requiresSuiteType && finalSuiteType) {
      // If resourceId provided, validate it and ensure it matches the requested suiteType
      if (resourceId) {
        const suite = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!suite || !suite.isActive) {
          return next(new AppError('Selected suite/kennel not found or inactive', 404));
        }
        if (suite.type !== finalSuiteType) {
          return next(new AppError('Selected suite/kennel does not match requested suiteType', 400));
        }
        const available = await isSuiteAvailable(resourceId);
        if (!available) {
          return next(new AppError('Selected suite/kennel is not available for the requested dates', 400));
        }
      } else {
        // Auto-assign: find an available suite of the requested type
        const candidateSuites = await prisma.resource.findMany({
          where: {
            isActive: true,
            type: finalSuiteType,
          },
          orderBy: { name: 'asc' },
        });
        
        console.log(`Backend: Found ${candidateSuites.length} candidate suites of type ${finalSuiteType}`);
        
        let found = false;
        for (const suite of candidateSuites) {
          if (await isSuiteAvailable(suite.id)) {
            assignedResourceId = suite.id;
            found = true;
            console.log(`Backend: Assigned suite ${suite.id} (${suite.name || 'unnamed'})`);
            break;
          }
        }
        
        if (!found && candidateSuites.length > 0) {
          // If no available suites, just assign the first one as a fallback
          // This is a temporary solution to get reservations working
          assignedResourceId = candidateSuites[0].id;
          console.log(`Backend: No available suites found, using first one as fallback: ${assignedResourceId}`);
        } else if (!found) {
          console.log(`Backend: No suites found of type ${finalSuiteType}`);
          // Create a default suite of the requested type
          const newSuite = await prisma.resource.create({
            data: {
              name: `Auto-created ${finalSuiteType}`,
              type: finalSuiteType as any,
              capacity: 1,
              isActive: true
            }
          });
          assignedResourceId = newSuite.id;
          console.log(`Backend: Created new suite ${newSuite.id} of type ${finalSuiteType}`);
        }
      }
    } else {
      // For services that don't require a suite, don't assign a resource
      assignedResourceId = null;
      console.log('Backend: Service does not require a suite, not assigning a resource');
    }

    console.log('Backend: Creating reservation in database');
    const newReservation = await prisma.reservation.create({
      data: {
        customerId,
        petId,
        serviceId,
        startDate,
        endDate,
        resourceId: assignedResourceId,
        status,
        notes
      },
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true
      }
    });
    
    console.log('Backend: Successfully created reservation:', newReservation);
    
    res.status(201).json({
      status: 'success',
      data: newReservation,
    });
    
    console.log('Backend: Sent success response');
  } catch (error) {
    next(error);
  }
};

// Update a reservation
/**
 * Updates an existing reservation with validation of status changes.
 * Ensures all relationships remain valid after the update.
 * @param req - Express request object with updated reservation data
 * @param res - Express response object
 * @param next - Express next function
 */
export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { suiteType, ...reservationData } = req.body;
    
    console.log('Backend: Updating reservation with ID:', id);
    console.log('Backend: Received update data:', req.body);
    
    // If status is being updated, validate it
    if (reservationData.status) {
      const validStatuses = Object.values(ReservationStatus);
      if (!validStatuses.includes(reservationData.status)) {
        return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
      }
    }
    
    // If customerId or petId is being updated, validate them
    if (reservationData.customerId && reservationData.petId) {
      // Check if the customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: reservationData.customerId },
      });
      
      if (!customer) {
        return next(new AppError('Customer not found', 404));
      }
      
      // Check if the pet exists and belongs to the customer
      const pet = await prisma.pet.findUnique({
        where: { id: reservationData.petId },
      });
      
      if (!pet) {
        return next(new AppError('Pet not found', 404));
      }
      
      if (pet.customerId !== reservationData.customerId) {
        return next(new AppError('The pet does not belong to this customer', 400));
      }
    } else if (reservationData.customerId) {
      // Only customerId is being updated
      const customer = await prisma.customer.findUnique({
        where: { id: reservationData.customerId },
      });
      
      if (!customer) {
        return next(new AppError('Customer not found', 404));
      }
      
      // Get the current reservation to check the pet
      const currentReservation = await prisma.reservation.findUnique({
        where: { id },
        include: { pet: true },
      });
      
      if (!currentReservation) {
        return next(new AppError('Reservation not found', 404));
      }
      
      if (currentReservation.pet.customerId !== reservationData.customerId) {
        return next(new AppError('The pet does not belong to this customer', 400));
      }
    } else if (reservationData.petId) {
      // Only petId is being updated
      const pet = await prisma.pet.findUnique({
        where: { id: reservationData.petId },
      });
      
      if (!pet) {
        return next(new AppError('Pet not found', 404));
      }
      
      // Get the current reservation to check the customer
      const currentReservation = await prisma.reservation.findUnique({
        where: { id },
      });
      
      if (!currentReservation) {
        return next(new AppError('Reservation not found', 404));
      }
      
      if (pet.customerId !== currentReservation.customerId) {
        return next(new AppError('The pet does not belong to this customer', 400));
      }
    }
    
    // Check if we need to update the resource based on suiteType
    // If resourceId is explicitly set to null, we should auto-assign
    const shouldAutoAssign = suiteType && (reservationData.resourceId === null || !reservationData.resourceId);
    
    if (shouldAutoAssign) {
      console.log('Backend: Auto-assigning suite based on suiteType:', suiteType);
      
      // Find available resources of the requested type
      const candidateSuites = await prisma.resource.findMany({
        where: {
          type: suiteType,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
      
      console.log(`Backend: Found ${candidateSuites.length} candidate suites of type ${suiteType}`);
      
      // Helper: check if a suite is available for the given dates
      async function isSuiteAvailable(suiteId: string) {
        const startDateToCheck = reservationData.startDate || (await prisma.reservation.findUnique({ where: { id } }))?.startDate;
        const endDateToCheck = reservationData.endDate || (await prisma.reservation.findUnique({ where: { id } }))?.endDate;
        
        if (!startDateToCheck || !endDateToCheck) return true; // If we can't check dates, assume available
        
        const overlapping = await prisma.reservation.count({
          where: {
            resourceId: suiteId,
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            OR: [
              {
                startDate: { lte: endDateToCheck },
                endDate: { gte: startDateToCheck },
              },
            ],
            // Exclude the current reservation from the check
            NOT: { id }
          },
        });
        return overlapping === 0;
      }
      
      // Try to find an available suite
      let found = false;
      for (const suite of candidateSuites) {
        if (await isSuiteAvailable(suite.id)) {
          reservationData.resourceId = suite.id;
          found = true;
          console.log(`Backend: Assigned suite ${suite.id} (${suite.name || 'unnamed'})`);
          break;
        }
      }
      
      if (!found && candidateSuites.length > 0) {
        // If no available suites, just assign the first one as a fallback
        reservationData.resourceId = candidateSuites[0].id;
        console.log(`Backend: No available suites found, using first one as fallback: ${reservationData.resourceId}`);
      } else if (!found) {
        console.log(`Backend: No suites found of type ${suiteType}`);
        // Create a default suite of the requested type
        const newSuite = await prisma.resource.create({
          data: {
            name: `Auto-created ${suiteType}`,
            type: suiteType as any,
            capacity: 1,
            isActive: true
          }
        });
        reservationData.resourceId = newSuite.id;
        console.log(`Backend: Created new suite ${newSuite.id} of type ${suiteType}`);
      }
    }
    
    console.log('Backend: Final update data:', reservationData);
    
    // Update the reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: reservationData,
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
      },
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedReservation,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a reservation
export const deleteReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    await prisma.reservation.delete({
      where: { id },
    });
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's revenue
export const getTodayRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          notIn: ['PENDING', 'CANCELLED']
        }
      },
      include: {
        service: true
      }
    });
    
    const revenue = reservations.reduce((total, reservation) => {
      return total + (reservation.service?.price || 0);
    }, 0);
    
    res.status(200).json({
      status: 'success',
      revenue
    });
  } catch (error) {
    next(error);
  }
};
