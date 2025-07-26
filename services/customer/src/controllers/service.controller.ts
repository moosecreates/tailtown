import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all services with filtering options
export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const category = req.query.category as string | undefined;
    
    // Build where condition
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (category) {
      where.serviceCategory = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const services = await prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });
    
    const total = await prisma.service.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// Get a single service by ID
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    // Build the where condition
    const where: any = { id };
    if (!includeDeleted) {
      where.isActive = true;
    }
    
    const service = await prisma.service.findFirst({
      where
      // Removed invalid include statements that were causing errors
    });
    
    if (!service) {
      return next(new AppError('Service not found or inactive', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// Create a new service
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceData = req.body;
    const { availableAddOns, ...mainServiceData } = serviceData;
    
    // Create service with transaction to handle add-ons
    const newService = await prisma.$transaction(async (prismaClient: any) => {
      // Create the main service
      const service = await prismaClient.service.create({
        data: {
          name: mainServiceData.name,
          description: mainServiceData.description,
          duration: mainServiceData.duration,
          price: mainServiceData.price,
          color: mainServiceData.color,
          serviceCategory: mainServiceData.serviceCategory,
          isActive: mainServiceData.isActive,
          capacityLimit: mainServiceData.capacityLimit,
          requiresStaff: mainServiceData.requiresStaff,
          notes: mainServiceData.notes
        }
      });
      
      // Create any add-on services if provided
      if (availableAddOns && availableAddOns.length > 0) {
        await Promise.all(
          availableAddOns.map((addOn: any) => 
            prismaClient.addOnService.create({
              data: {
                ...addOn,
                serviceId: service.id
              }
            })
          )
        );
      }
      
      // Return the service with add-ons included
      return prismaClient.service.findUnique({
        where: { id: service.id },
        include: {
          availableAddOns: true
        }
      });
    });
    
    res.status(201).json({
      status: 'success',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

// Update a service
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    console.log('Received service data:', JSON.stringify(serviceData, null, 2));
    const { availableAddOns, ...mainServiceData } = serviceData;
    console.log('Main service data:', JSON.stringify(mainServiceData, null, 2));
    
    // Check if service exists
    const serviceExists = await prisma.service.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!serviceExists) {
      return next(new AppError('Service not found', 404));
    }
    
    // Update only the main service data without touching add-ons
    // This avoids foreign key constraint issues with add-ons used in reservations
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: mainServiceData.name,
        description: mainServiceData.description,
        duration: mainServiceData.duration,
        price: mainServiceData.price,
        color: mainServiceData.color,
        serviceCategory: mainServiceData.serviceCategory,
        isActive: mainServiceData.isActive,
        capacityLimit: mainServiceData.capacityLimit,
        requiresStaff: mainServiceData.requiresStaff,
        notes: mainServiceData.notes
      },
      include: {
        availableAddOns: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
};

// Delete a service
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const forceDelete = req.query.force === 'true';
    
    // Check if service exists
    const serviceExists = await prisma.service.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!serviceExists) {
      return next(new AppError('Service not found', 404));
    }
    
    // Check for existing reservations using this service
    const activeReservationsCount = await prisma.reservation.count({
      where: { 
        serviceId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN']
        }
      }
    });
    
    // If there are active reservations and force is not true, perform a soft delete instead
    if (activeReservationsCount > 0 && !forceDelete) {
      console.log(`Service ${id} has active reservations, performing soft delete instead`);
      
      // Soft delete - mark as inactive but keep the record
      await prisma.service.update({
        where: { id },
        data: { isActive: false }
      });
      
      // Also mark all add-ons as inactive
      await prisma.addOnService.updateMany({
        where: { serviceId: id },
        data: { isActive: false }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Service has been deactivated (soft deleted) because it has active reservations'
      });
    }
    
    // Check if there are any historical reservations
    const historicalReservationsCount = await prisma.reservation.count({
      where: {
        serviceId: id,
        status: {
          notIn: ['PENDING', 'CONFIRMED', 'CHECKED_IN']
        }
      }
    });
    
    // If there are historical reservations, perform a soft delete instead
    if (historicalReservationsCount > 0) {
      // Soft delete - mark as inactive but keep the record
      await prisma.service.update({
        where: { id },
        data: { isActive: false }
      });
      
      // Also mark all add-ons as inactive
      await prisma.addOnService.updateMany({
        where: { serviceId: id },
        data: { isActive: false }
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Service has been deactivated (soft deleted)'
      });
    } else {
      // No historical reservations, perform hard delete
      await prisma.$transaction([
        // First delete any add-on services
        prisma.addOnService.deleteMany({ where: { serviceId: id } }),
        // Then delete the service
        prisma.service.delete({ where: { id } })
      ]);
      
      res.status(204).send();
    }
  } catch (error) {
    next(error);
  }
};

// Deactivate a service (soft delete)
export const deactivateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const serviceExists = await prisma.service.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!serviceExists) {
      return next(new AppError('Service not found', 404));
    }
    
    // Update service to inactive
    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedService
    });
  } catch (error) {
    next(error);
  }
};

// Get add-on services for a service
export const getServiceAddOns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const serviceExists = await prisma.service.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!serviceExists) {
      return next(new AppError('Service not found', 404));
    }
    
    const addOns = await prisma.addOnService.findMany({
      where: { serviceId: id },
      orderBy: { name: 'asc' }
    });
    
    res.status(200).json({
      status: 'success',
      results: addOns.length,
      data: addOns
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations for a service
export const getServiceReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Check if service exists
    const serviceExists = await prisma.service.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!serviceExists) {
      return next(new AppError('Service not found', 404));
    }
    
    // Build where condition
    const where: any = {
      serviceId: id
    };
    
    if (status) {
      where.status = status;
    }
    
    // Date filtering
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        where.AND.push({
          startDate: {
            gte: startDate
          }
        });
      }
      
      if (endDate) {
        where.AND.push({
          endDate: {
            lte: endDate
          }
        });
      }
    }
    
    const reservations = await prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        addOnServices: true
      },
      orderBy: { startDate: 'desc' }
    });
    
    const total = await prisma.reservation.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: reservations.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};
