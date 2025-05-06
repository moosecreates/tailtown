import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ResourceType, ContactMethod } from '@prisma/client';
import AppError from '../utils/appError';

const prisma = new PrismaClient();

// Validate resource type
const validateResourceType = (type: string): string => {
  // Define valid resource types and their aliases
  const validTypeMap: Record<string, string> = {
    // Housing types
    'KENNEL': 'KENNEL',
    'DOG_KENNEL': 'KENNEL', // Alias
    'RUN': 'RUN',
    'SUITE': 'SUITE',
    'STANDARD_SUITE': 'STANDARD_SUITE',
    'STANDARD_PLUS_SUITE': 'STANDARD_PLUS_SUITE',
    'VIP_SUITE': 'VIP_SUITE',
    'LUXURY_SUITE': 'VIP_SUITE', // Alias
    
    // Play area types
    'PLAY_AREA': 'PLAY_AREA',
    'INDOOR_PLAY_YARD': 'PLAY_AREA', // Alias
    'OUTDOOR_PLAY_YARD': 'OUTDOOR_PLAY_YARD',
    'PRIVATE_PLAY_AREA': 'PRIVATE_PLAY_AREA',
    
    // Grooming types
    'GROOMING_TABLE': 'GROOMING_TABLE',
    'BATHING_STATION': 'BATHING_STATION',
    'DRYING_STATION': 'DRYING_STATION',
    
    // Training types
    'TRAINING_ROOM': 'TRAINING_ROOM',
    'AGILITY_COURSE': 'AGILITY_COURSE',
    
    // Staff types
    'GROOMER': 'GROOMER',
    'TRAINER': 'TRAINER',
    'ATTENDANT': 'ATTENDANT',
    'BATHER': 'BATHER',
    
    // Other
    'OTHER': 'OTHER'
  };
  
  // Normalize the input type
  const normalizedType = type.toUpperCase().trim();
  
  // Check if the normalized type is valid or has an alias
  if (validTypeMap[normalizedType]) {
    return validTypeMap[normalizedType];
  }
  
  // If not found, try to match with a similar type
  const similarTypes = Object.keys(validTypeMap).filter(validType => {
    return normalizedType.includes(validType) || validType.includes(normalizedType);
  });
  
  if (similarTypes.length > 0) {
    console.log(`Resource type '${type}' is not exact, but matched with '${similarTypes[0]}'`);
    return validTypeMap[similarTypes[0]];
  }
  
  // If no match found, throw an error
  throw new AppError(`Invalid resource type: ${type}. Valid types are: ${Object.keys(validTypeMap).join(', ')}`, 400);
};

// Get all resources
export const getAllResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract query parameters
    const { sortBy, sortOrder } = req.query;
    
    // Build the query
    const query: any = {
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
    };
    
    // Add ordering if specified
    if (sortBy && sortOrder) {
      query.orderBy = { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' };
    }
    
    const resources = await prisma.resource.findMany(query);

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
    const { maintenanceSchedule, capacity, type, ...resourceData } = req.body;
    
    // Validate and map the resource type
    let validType;
    try {
      validType = validateResourceType(type);
    } catch (typeError) {
      return next(typeError);
    }
    
    console.log('Creating resource with data:', { 
      ...resourceData, 
      type: validType, 
      capacity: capacity ? parseInt(capacity, 10) : 1 
    });
    
    const resource = await prisma.resource.create({
      data: {
        ...resourceData,
        type: validType as any, // Cast to any to satisfy TypeScript
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
    console.error('Error creating resource:', error);
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

// Get available resources by date range
export const getAvailableResourcesByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, serviceId } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return next(new AppError('Invalid date format. Please use YYYY-MM-DD format', 400));
    }
    
    console.log(`Getting available resources for dates: ${parsedStartDate.toISOString()} to ${parsedEndDate.toISOString()}`);
    console.log(`Service ID: ${serviceId || 'Not provided'}`);
    
    // First, check if we need to filter by service type
    let requiredResourceTypes: ResourceType[] = [];
    
    if (serviceId) {
      // Get the service to determine what resource types are needed
      const service = await prisma.service.findUnique({
        where: { id: serviceId as string }
      });
      
      if (!service) {
        return next(new AppError('Service not found', 404));
      }
      
      console.log(`Service category: ${service.serviceCategory}`);
      
      // Determine required resource types based on service category
      if (service.serviceCategory === 'BOARDING' || service.serviceCategory === 'DAYCARE') {
        // For boarding and daycare, we need kennel suites
        requiredResourceTypes = ['STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE'];
      } else if (service.serviceCategory === 'GROOMING') {
        // For grooming, we need grooming stations
        requiredResourceTypes = ['GROOMING_TABLE', 'BATHING_STATION', 'DRYING_STATION'];
      } else if (service.serviceCategory === 'TRAINING') {
        // For training, we need training areas
        requiredResourceTypes = ['TRAINING_ROOM', 'AGILITY_COURSE'];
      } else {
        // Default to all resource types if category is unknown
        requiredResourceTypes = [
          'STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE',
          'GROOMING_TABLE', 'BATHING_STATION', 'DRYING_STATION',
          'TRAINING_ROOM', 'AGILITY_COURSE'
        ];
      }
      
      console.log(`Required resource types: ${requiredResourceTypes.join(', ')}`);
    }
    
    // Base query to get resources
    const resources = await prisma.resource.findMany({
      where: {
        // Filter by resource type if we have determined required types
        ...(requiredResourceTypes.length > 0 ? {
          type: {
            in: requiredResourceTypes
          }
        } : {}),
        isActive: true,
        // Exclude resources in maintenance
        maintenanceStatus: {
          not: 'IN_MAINTENANCE'
        }
      },
      include: {
        // Include reservations that overlap with the date range
        reservations: {
          where: {
            OR: [
              {
                // Reservations that start during the requested period
                startDate: {
                  gte: parsedStartDate,
                  lt: parsedEndDate
                }
              },
              {
                // Reservations that end during the requested period
                endDate: {
                  gt: parsedStartDate,
                  lte: parsedEndDate
                }
              },
              {
                // Reservations that span the entire requested period
                AND: [
                  {
                    startDate: {
                      lte: parsedStartDate
                    }
                  },
                  {
                    endDate: {
                      gte: parsedEndDate
                    }
                  }
                ]
              }
            ],
            // Only consider active reservations
            status: {
              in: ['PENDING', 'CONFIRMED', 'CHECKED_IN']
            }
          }
        }
      }
    });
    
    console.log(`Found ${resources.length} total resources of required types`);
    
    // Filter out resources that have reservations during the requested time
    const availableResources = resources.filter((resource: any) => {
      // Check if the resource has any reservations in the specified time period
      return resource.reservations.length === 0;
    });
    
    console.log(`Found ${availableResources.length} available resources after filtering out reserved ones`);
    
    res.status(200).json({
      status: 'success',
      data: availableResources
    });
  } catch (error) {
    console.error('Error getting available resources:', error);
    next(error);
  }
};
