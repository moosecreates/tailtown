import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all pets
export const getAllPets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const pets = await prisma.pet.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { owner: true },
    });
    
    const total = await prisma.pet.count();
    
    res.status(200).json({
      status: 'success',
      results: pets.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single pet by ID
export const getPetById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { owner: true },
    });
    
    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reservations for a pet
export const getPetReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { reservations: true },
    });
    
    if (!pet) {
      return next(new AppError('Pet not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      results: pet.reservations.length,
      data: pet.reservations,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new pet
export const createPet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let petData = { ...req.body };
    
    // Handle empty date strings
    if (petData.birthdate === '') {
      petData.birthdate = null;
    } else if (petData.birthdate) {
      petData.birthdate = new Date(petData.birthdate);
    }
    
    // Check if the customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: petData.customerId },
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    const newPet = await prisma.pet.create({
      data: petData,
    });
    
    res.status(201).json({
      status: 'success',
      data: newPet,
    });
  } catch (error) {
    next(error);
  }
};

// Update a pet
export const updatePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let petData = { ...req.body };
    
    // Handle empty date strings
    if (petData.birthdate === '') {
      petData.birthdate = null;
    } else if (petData.birthdate) {
      petData.birthdate = new Date(petData.birthdate);
    }
    
    // If customerId is being updated, check if the customer exists
    if (petData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: petData.customerId },
      });
      
      if (!customer) {
        return next(new AppError('Customer not found', 404));
      }
    }
    
    const updatedPet = await prisma.pet.update({
      where: { id },
      data: petData,
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedPet,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a pet
export const deletePet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    await prisma.pet.delete({
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
