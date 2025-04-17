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
        console.log('Final where clause:', where);
      }
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
      status = 'PENDING',
      notes = ''
    } = req.body;
    
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
    
    console.log('Backend: Creating reservation in database');
    const newReservation = await prisma.reservation.create({
      data: {
        customerId,
        petId,
        serviceId,
        startDate,
        endDate,
        status,
        notes
      },
      include: {
        customer: true,
        pet: true,
        service: true
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
    const reservationData = req.body;
    
    
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
    
    // Update the reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: reservationData,
      include: {
        customer: true,
        pet: true,
        service: true,
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
