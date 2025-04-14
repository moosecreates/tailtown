import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ReservationStatus, ServiceCategory } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all reservations
export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reservations = await prisma.reservation.findMany({
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        customer: true,
        pet: true,
      },
    });
    
    const total = await prisma.reservation.count();
    
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
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservationData = req.body;
    
    // Validate service category
    const validServiceCategories = Object.values(ServiceCategory);
    if (!validServiceCategories.includes(reservationData.serviceCategory)) {
      return next(new AppError(`Invalid service category. Must be one of: ${validServiceCategories.join(', ')}`, 400));
    }
    
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
    
    // Create the reservation
    const newReservation = await prisma.reservation.create({
      data: reservationData,
    });
    
    res.status(201).json({
      status: 'success',
      data: newReservation,
    });
  } catch (error) {
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
    const reservationData = req.body;
    
    // If serviceCategory is being updated, validate it
    if (reservationData.serviceCategory) {
      const validServiceCategories = Object.values(ServiceCategory);
      if (!validServiceCategories.includes(reservationData.serviceCategory)) {
        return next(new AppError(`Invalid service category. Must be one of: ${validServiceCategories.join(', ')}`, 400));
      }
    }
    
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
