import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import AppError from '../utils/appError';

// Get all resources
export const getAllResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        availabilitySlots: {
          where: {
            endTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// Get a single resource
export const getResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        availabilitySlots: {
          where: {
            endTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// Create a new resource
export const createResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { maintenanceSchedule, capacity, ...resourceData } = req.body;
    console.log('Creating resource with data:', { ...resourceData, capacity });
    
    const resource = await prisma.resource.create({
      data: {
        ...resourceData,
        capacity: capacity ? parseInt(capacity, 10) : 1,
        maintenanceSchedule: undefined,
        attributes: resourceData.attributes || {},
        isActive: resourceData.isActive ?? true
      },
      include: {
        availabilitySlots: true
      }
    });

    res.status(201).json({
      status: 'success',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// Update a resource
export const updateResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const resourceData = req.body;

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return next(new AppError(`Resource not found with id: ${id}`, 404));
    }
    
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        name: resourceData.name,
        type: resourceData.type,
        description: resourceData.description,
        capacity: resourceData.capacity,
        availability: resourceData.availability,
        location: resourceData.location,
        maintenanceSchedule: resourceData.maintenanceSchedule,
        attributes: resourceData.attributes,
        isActive: resourceData.isActive ?? existingResource.isActive,
        notes: resourceData.notes
      },
      include: {
        availabilitySlots: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// Delete a resource
export const deleteResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    await prisma.resource.delete({
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

// Create availability slot
export const createAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resourceId } = req.params;
    const slotData = req.body;
    
    const slot = await prisma.resourceAvailability.create({
      data: {
        resourceId,
        startTime: new Date(slotData.startTime),
        endTime: new Date(slotData.endTime),
        status: slotData.status,
        reason: slotData.reason
      }
    });

    res.status(201).json({
      status: 'success',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

// Update availability slot
export const updateAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const slotData = req.body;
    
    const slot = await prisma.resourceAvailability.update({
      where: { id },
      data: {
        startTime: new Date(slotData.startTime),
        endTime: new Date(slotData.endTime),
        status: slotData.status,
        reason: slotData.reason
      }
    });

    res.status(200).json({
      status: 'success',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

// Delete availability slot
export const deleteAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    await prisma.resourceAvailability.delete({
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
