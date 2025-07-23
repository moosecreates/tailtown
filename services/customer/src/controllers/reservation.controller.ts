import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

// Create a dynamic Prisma client type to handle potential model name differences
type DynamicPrisma = PrismaClient & {
  reservation?: any;
  Reservation?: any;
  customer?: any;
  Customer?: any;
  pet?: any;
  Pet?: any;
  service?: any;
  Service?: any;
  addOnService?: any;
  AddOnService?: any;
  reservationAddOn?: any;
  ReservationAddOn?: any;
  resource?: any;
  Resource?: any;
};

const prisma = new PrismaClient() as DynamicPrisma;

// Helper function to generate a unique order number
async function generateOrderNumber(): Promise<string> {
  // Get the current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Get the count of reservations created today to use as a sequential number
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  
  // Try both reservation and Reservation model names
  let todayReservationsCount = 0;
  
  if (prisma.reservation) {
    todayReservationsCount = await prisma.reservation.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  } else if (prisma.Reservation) {
    todayReservationsCount = await prisma.Reservation.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }
  
  // Format the sequential number with leading zeros (e.g., 001, 002, etc.)
  const sequentialNumber = String(todayReservationsCount + 1).padStart(3, '0');
  
  // Combine to create the order number: RES-YYYYMMDD-001
  const orderNumber = `RES-${datePrefix}-${sequentialNumber}`;
  
  // Check if this order number already exists (just to be safe)
  let existingReservation = null;
  
  if (prisma.reservation) {
    existingReservation = await prisma.reservation.findUnique({
      where: { orderNumber }
    });
  } else if (prisma.Reservation) {
    existingReservation = await prisma.Reservation.findUnique({
      where: { orderNumber }
    });
  }
  
  if (existingReservation) {
    // In the unlikely case of a collision, recursively try again with an incremented number
    return generateOrderNumber();
  }
  
  return orderNumber;
}

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
    
    // Determine which Prisma model to use
    let reservationModel: any;
    let reservationModelName: string;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
      reservationModelName = 'reservation';
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
      reservationModelName = 'Reservation';
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    console.log(`Using ${reservationModelName} model for getAllReservations`);
    
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
        
        const validStatusArray = statusArray.filter(s => 
          validStatuses.includes(s as ReservationStatus)
        );
        
        if (validStatusArray.length > 0) {
          where.status = {
            in: validStatusArray as ReservationStatus[]
          };
        }
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

    // Use the determined model
    const [reservations, totalCount] = await Promise.all([
      reservationModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          pet: true,
          resource: true,
        },
      }),
      reservationModel.count({ where })
    ]);
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single reservation by ID
export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const reservation = await reservationModel.findUnique({
      where: { id },
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
      },
    });
    
    if (!reservation) {
      return next(new AppError('No reservation found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by customer ID
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
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const [reservations, totalCount] = await Promise.all([
      reservationModel.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          pet: true,
          service: true,
          resource: true,
        },
      }),
      reservationModel.count({ where: { customerId } })
    ]);
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by pet ID
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
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const [reservations, totalCount] = await Promise.all([
      reservationModel.findMany({
        where: { petId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          pet: true,
          service: true,
          resource: true,
        },
      }),
      reservationModel.count({ where: { petId } })
    ]);
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(totalCount / limit),
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
      return next(new AppError('Please provide both startDate and endDate', 400));
    }
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const [reservations, totalCount] = await Promise.all([
      reservationModel.findMany({
        where: {
          OR: [
            // Reservation starts within the range
            {
              startDate: {
                gte: start,
                lte: end
              }
            },
            // Reservation ends within the range
            {
              endDate: {
                gte: start,
                lte: end
              }
            },
            // Reservation spans the entire range
            {
              AND: [
                {
                  startDate: {
                    lte: start
                  }
                },
                {
                  endDate: {
                    gte: end
                  }
                }
              ]
            }
          ]
        },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          customer: true,
          pet: true,
          service: true,
          resource: true,
        },
      }),
      reservationModel.count({
        where: {
          OR: [
            { startDate: { gte: start, lte: end } },
            { endDate: { gte: start, lte: end } },
            {
              AND: [
                { startDate: { lte: start } },
                { endDate: { gte: end } }
              ]
            }
          ]
        }
      })
    ]);
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(totalCount / limit),
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
    
    // Validate status
    if (!Object.values(ReservationStatus).includes(status as ReservationStatus)) {
      return next(new AppError(`Invalid status: ${status}`, 400));
    }
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const [reservations, totalCount] = await Promise.all([
      reservationModel.findMany({
        where: { status: status as ReservationStatus },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          pet: true,
          service: true,
          resource: true,
        },
      }),
      reservationModel.count({ where: { status: status as ReservationStatus } })
    ]);
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: reservations,
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
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    const todayReservations = await reservationModel.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED']
        }
      },
      select: {
        totalAmount: true
      }
    });
    
    const totalRevenue = todayReservations.reduce(
      (sum, reservation) => sum + (reservation.totalAmount || 0),
      0
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        date: startOfDay.toISOString().split('T')[0],
        totalRevenue,
        reservationCount: todayReservations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new reservation
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Backend: createReservation called with body:', JSON.stringify(req.body, null, 2));
    
    const {
      customerId,
      petId,
      serviceId,
      startDate,
      endDate,
      status,
      notes,
      totalAmount,
      suiteType,
      resourceId
    } = req.body;
    
    // Validate required fields
    if (!customerId) {
      return next(new AppError('customerId is required', 400));
    }
    
    if (!petId) {
      return next(new AppError('petId is required', 400));
    }
    
    if (!serviceId) {
      return next(new AppError('serviceId is required', 400));
    }
    
    if (!startDate) {
      return next(new AppError('startDate is required', 400));
    }
    
    // Determine which Prisma model to use for each entity
    let reservationModel: any;
    let serviceModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    if (prisma.service) {
      serviceModel = prisma.service;
    } else if (prisma.Service) {
      serviceModel = prisma.Service;
    } else {
      return next(new AppError('Service model not found in Prisma client', 500));
    }
    
    // Get the service to check if it requires a suite type
    const service = await serviceModel.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return next(new AppError('Service not found', 404));
    }
    
    // Check if the service is BOARDING or DAYCARE, which require a suite type
    const requiresSuiteType = service.serviceCategory === 'BOARDING' || service.serviceCategory === 'DAYCARE';
    
    // Validate suite type if required
    if (requiresSuiteType) {
      if (!suiteType || !['VIP_SUITE', 'STANDARD_PLUS_SUITE', 'STANDARD_SUITE'].includes(suiteType)) {
        return next(new AppError('suiteType is required and must be one of VIP_SUITE, STANDARD_PLUS_SUITE, STANDARD_SUITE', 400));
      }
    }
    
    // Generate a unique order number
    const orderNumber = await generateOrderNumber();
    
    // Create the reservation
    const newReservation = await reservationModel.create({
      data: {
        customerId,
        petId,
        serviceId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        status: status || 'PENDING',
        notes,
        totalAmount,
        orderNumber,
        suiteType: requiresSuiteType ? suiteType : null,
        resourceId
      }
    });
    
    // Fetch the complete reservation with related data
    const completeReservation = await reservationModel.findUnique({
      where: { id: newReservation.id },
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: completeReservation
    });
  } catch (error) {
    console.error('Backend: Error in createReservation:', error);
    next(error);
  }
};

// Update a reservation
export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    // Check if reservation exists
    const existingReservation = await reservationModel.findUnique({
      where: { id }
    });
    
    if (!existingReservation) {
      return next(new AppError('No reservation found with that ID', 404));
    }
    
    // Handle date conversions if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    
    // Update the reservation
    const updatedReservation = await reservationModel.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        pet: true,
        service: true,
        resource: true,
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedReservation
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
    
    // Determine which Prisma model to use
    let reservationModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    // Check if reservation exists
    const existingReservation = await reservationModel.findUnique({
      where: { id }
    });
    
    if (!existingReservation) {
      return next(new AppError('No reservation found with that ID', 404));
    }
    
    // Delete the reservation
    await reservationModel.delete({
      where: { id }
    });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Add add-ons to a reservation
export const addAddOnsToReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reservationId } = req.params;
    const { addOns } = req.body;
    
    console.log(`Backend: Adding add-ons to reservation ${reservationId}:`, JSON.stringify(addOns, null, 2));
    
    if (!Array.isArray(addOns) || addOns.length === 0) {
      return next(new AppError('Please provide an array of add-ons', 400));
    }
    
    // Determine which Prisma models to use
    let reservationModel: any;
    let reservationAddOnModel: any;
    
    if (prisma.reservation) {
      reservationModel = prisma.reservation;
    } else if (prisma.Reservation) {
      reservationModel = prisma.Reservation;
    } else {
      return next(new AppError('Reservation model not found in Prisma client', 500));
    }
    
    if (prisma.reservationAddOn) {
      reservationAddOnModel = prisma.reservationAddOn;
    } else if (prisma.ReservationAddOn) {
      reservationAddOnModel = prisma.ReservationAddOn;
    } else {
      return next(new AppError('ReservationAddOn model not found in Prisma client', 500));
    }
    
    // Check if reservation exists
    const existingReservation = await reservationModel.findUnique({
      where: { id: reservationId }
    });
    
    if (!existingReservation) {
      return next(new AppError('No reservation found with that ID', 404));
    }
    
    // Process each add-on
    const addOnResults = [];
    const errors = [];
    
    for (const addOn of addOns) {
      try {
        const { addOnServiceId, quantity, price } = addOn;
        
        if (!addOnServiceId) {
          errors.push('addOnServiceId is required for each add-on');
          continue;
        }
        
        // Create the reservation add-on
        const reservationAddOn = await reservationAddOnModel.create({
          data: {
            reservationId,
            addOnServiceId,
            quantity: quantity || 1,
            price: price || 0
          }
        });
        
        console.log(`Backend: Created reservation add-on: ${JSON.stringify(reservationAddOn)}`);
        addOnResults.push(reservationAddOn);
      } catch (error) {
        console.error('Backend: Error processing add-on:', error);
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    
    // Return results, including any errors
    const response = {
      success: addOnResults.length > 0,
      message: addOnResults.length > 0 
        ? `Successfully added ${addOnResults.length} add-on(s) to the reservation` 
        : 'Failed to add any add-ons to the reservation',
      addOns: addOnResults,
      errors: errors.length > 0 ? errors : undefined
    };
    
    console.log('Backend: Add-ons response:', JSON.stringify(response, null, 2));
    
    return res.status(addOnResults.length > 0 ? 200 : 400).json(response);
  } catch (error) {
    console.error('Backend: Error in addAddOnsToReservation:', error);
    return next(error);
  }
};
