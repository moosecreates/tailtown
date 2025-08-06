/**
 * Create Reservation Controller
 * 
 * This file contains the controller method for creating new reservations.
 * It implements schema alignment strategy with defensive programming.
 */

import { Response } from 'express';
import { TenantRequest } from '../../types/request';
import { AppError } from '../../utils/service';
import { catchAsync } from '../../middleware/catchAsync';
import { logger } from '../../utils/logger';
import { detectReservationConflicts } from '../../utils/reservation-conflicts';
import { 
  ExtendedReservationWhereInput, 
  ExtendedCustomerWhereInput,
  ExtendedPetWhereInput,
  ExtendedResourceWhereInput,
  ExtendedReservationInclude
} from '../../types/prisma-extensions';
import { safeExecutePrismaQuery, prisma } from './utils/prisma-helpers';

/**
 * Helper function to determine suite type based on service type
 */
function determineSuiteType(serviceType: string): string | null {
  const serviceToSuiteMap: Record<string, string> = {
    'BOARDING': 'KENNEL',
    'DAYCARE': 'PLAY_AREA',
    'GROOMING': 'GROOMING_STATION',
    'TRAINING': 'TRAINING_AREA',
    'VET': 'EXAM_ROOM'
  };
  
  return serviceToSuiteMap[serviceType.toUpperCase()] || null;
}

/**
 * Create a new reservation
 * Implements schema alignment strategy with defensive programming
 * Uses standardized error handling pattern
 * 
 * @route POST /api/v1/reservations
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const createReservation = catchAsync(async (req: Request, res: Response) => {
  // Generate a unique request ID for logging
  const requestId = `create-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  logger.info(`Processing create reservation request`, { requestId });
  
  // Get tenant ID from request - added by tenant middleware
  // In development mode, we use a default tenant ID if not provided
  const isDev = process.env.NODE_ENV === 'development';
  const tenantId = req.tenantId || (isDev ? 'dev-tenant-001' : undefined);
  
  if (!tenantId) {
    logger.warn(`Missing tenant ID in request`, { requestId });
    throw AppError.authorizationError('Tenant ID is required');
  } else if (isDev && !req.tenantId) {
    logger.info(`Using default tenant ID in development mode: ${tenantId}`, { requestId });
  }

  // Validate required fields
  const { 
    customerId, 
    petId, 
    startDate, 
    endDate, 
    serviceType,
    suiteType: requestedSuiteType,
    resourceId: requestedResourceId,
    status,
    price,
    deposit,
    notes,
    staffNotes,
    addOnServices
  } = req.body;

  // Validate required fields
  if (!customerId) {
    logger.warn(`Missing required field: customerId`, { requestId });
    throw AppError.validationError('Customer ID is required');
  }
  
  if (!petId) {
    logger.warn(`Missing required field: petId`, { requestId });
    throw AppError.validationError('Pet ID is required');
  }
  
  if (!startDate) {
    logger.warn(`Missing required field: startDate`, { requestId });
    throw AppError.validationError('Start date is required');
  }
  
  if (!endDate) {
    logger.warn(`Missing required field: endDate`, { requestId });
    throw AppError.validationError('End date is required');
  }
  
  if (!serviceType) {
    logger.warn(`Missing required field: serviceType`, { requestId });
    throw AppError.validationError('Service type is required');
  }
  
  // Parse dates
  let parsedStartDate: Date;
  let parsedEndDate: Date;
  
  try {
    parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      logger.warn(`Invalid start date format: ${startDate}`, { requestId });
      throw AppError.validationError('Invalid start date format. Use YYYY-MM-DD');
    }
  } catch (error) {
    logger.warn(`Error parsing start date: ${startDate}`, { requestId, error });
    throw AppError.validationError('Invalid start date format. Use YYYY-MM-DD');
  }
  
  try {
    parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      logger.warn(`Invalid end date format: ${endDate}`, { requestId });
      throw AppError.validationError('Invalid end date format. Use YYYY-MM-DD');
    }
  } catch (error) {
    logger.warn(`Error parsing end date: ${endDate}`, { requestId, error });
    throw AppError.validationError('Invalid end date format. Use YYYY-MM-DD');
  }
  
  // Check if start date is before end date
  if (parsedStartDate >= parsedEndDate) {
    logger.warn(`Start date must be before end date: ${startDate} - ${endDate}`, { requestId });
    throw AppError.validationError('Start date must be before end date');
  }
  
  // Verify customer exists and belongs to tenant
  await safeExecutePrismaQuery(
    async () => {
      return await prisma.customer.findFirstOrThrow({
        where: {
          id: customerId,
          // organizationId removed as it's not in the schema
        } as ExtendedCustomerWhereInput
      });
    },
    null,
    `Error verifying customer with ID ${customerId}`,
    true // Enable throwError flag
  );
  
  logger.info(`Verified customer exists: ${customerId}`, { requestId });
  
  // Verify pet exists and belongs to tenant
  await safeExecutePrismaQuery(
    async () => {
      return await prisma.pet.findFirstOrThrow({
        where: {
          id: petId,
          // organizationId removed as it's not in the schema
        } as ExtendedPetWhereInput
      });
    },
    null,
    `Error verifying pet with ID ${petId}`,
    true // Enable throwError flag
  );
  
  logger.info(`Verified pet exists: ${petId}`, { requestId });
  
  // Determine suite type based on service type if not provided
  let determinedSuiteType = requestedSuiteType;
  
  if (!determinedSuiteType) {
    determinedSuiteType = determineSuiteType(serviceType);
    if (!determinedSuiteType) {
      logger.warn(`Could not determine suite type from service type ${serviceType}`, { requestId });
      throw AppError.validationError(`Could not determine suite type from service type ${serviceType}`);
    }
    logger.info(`Determined suite type: ${determinedSuiteType} from service type: ${serviceType}`, { requestId });
  }
  
  // Warnings to collect during processing
  const warnings: string[] = [];
  
  // Handle resource assignment
  let assignedResourceId = requestedResourceId;
  
  if (assignedResourceId) {
    // Verify resource exists and belongs to tenant
    await safeExecutePrismaQuery(
      async () => {
        return await prisma.resource.findFirstOrThrow({
          where: {
            id: assignedResourceId,
            // organizationId removed as it's not in the schema
          } as ExtendedResourceWhereInput
        });
      },
      null,
      `Error verifying resource with ID ${assignedResourceId}`,
      true // Enable throwError flag
    );
    
    logger.info(`Verified resource exists: ${assignedResourceId}`, { requestId });
    
    // Check if resource is available for the requested dates
    const conflictResult = await detectReservationConflicts({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      resourceId: assignedResourceId,
      tenantId
    });
    
    if (conflictResult.hasConflicts) {
      logger.warn(`Resource ${assignedResourceId} has conflicts for the requested dates`, { 
        requestId, 
        conflicts: conflictResult.warnings 
      });
      throw AppError.conflictError(
        `Resource is not available for the requested dates: ${conflictResult.warnings.join(', ')}`
      );
    }
  } else if (determinedSuiteType) {
    // Try to auto-assign a resource if none was specified but we have a suite type
    logger.info(`Attempting to auto-assign a resource for suite type: ${determinedSuiteType}`, { requestId });
    
    try {
      // First get all resources matching the suite type
      const resources = await prisma.resource.findMany({
        where: {
          // organizationId removed as it's not in the schema,
          type: determinedSuiteType
        } as ExtendedResourceWhereInput
      });
      
      if (resources.length === 0) {
        logger.warn(`No resources found for suite type: ${determinedSuiteType}`, { requestId });
        warnings.push(`No resources found for suite type: ${determinedSuiteType}. The reservation will be created without a resource assignment.`);
      } else {
        // Then filter out resources with overlapping reservations
        const availableResources = [];
        
        for (const resource of resources) {
          try {
            const resourceConflict = await detectReservationConflicts({
              startDate: parsedStartDate,
              endDate: parsedEndDate,
              resourceId: resource.id,
              tenantId
            });
            
            if (!resourceConflict.hasConflicts) {
              availableResources.push(resource.id);
            }
          } catch (error) {
            logger.error(`Error checking availability for resource ${resource.id}:`, { 
              requestId, 
              error, 
              resourceId: resource.id 
            });
          }
        }
        
        if (availableResources.length > 0) {
          // Assign the first available resource
          assignedResourceId = availableResources[0];
          logger.info(`Auto-assigned resource: ${assignedResourceId}`, { requestId });
        } else {
          // Check if the pet already has a reservation during this time
          const petConflictResult = await detectReservationConflicts({
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            tenantId,
            petId
          });
          
          if (petConflictResult.hasConflicts) {
            logger.warn(`Pet has conflicts for the requested dates`, { 
              requestId, 
              conflicts: petConflictResult.warnings 
            });
            throw AppError.conflictError(
              `Pet already has a reservation during this time: ${petConflictResult.warnings.join(', ')}`
            );
          }
          
          logger.warn(`No available resources found for suite type: ${determinedSuiteType}`, { requestId });
          warnings.push(`No available resources found for suite type: ${determinedSuiteType}. The reservation will be created without a resource assignment.`);
        }
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Re-throw AppErrors (like conflicts)
      }
      
      logger.warn(`Error auto-assigning resource:`, { requestId, error });
      warnings.push('Failed to auto-assign a resource. The reservation will be created without a resource assignment.');
    }
  }
  
  // Create the reservation
  logger.info(`Creating reservation`, { 
    requestId, 
    customerId, 
    petId, 
    resourceId: assignedResourceId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    suiteType: determinedSuiteType,
    serviceType
  });
  
  // Prepare reservation data
  const reservationData: any = {
    customer: {
      connect: { id: customerId }
    },
    pet: {
      connect: { id: petId }
    },
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    service: {
      connect: { type: serviceType }
    },
    // suiteType is handled through resource assignment
    // organizationId removed as it's not in the schema
    status: status || 'PENDING'
  };
  
  // Add optional fields if provided
  if (assignedResourceId) {
    reservationData.resource = {
      connect: { id: assignedResourceId }
    };
  }
  if (price !== undefined) reservationData.price = parseFloat(String(price));
  if (deposit !== undefined) reservationData.deposit = parseFloat(String(deposit));
  if (notes !== undefined) reservationData.notes = notes;
  if (staffNotes !== undefined) reservationData.staffNotes = staffNotes;
  
  // Create reservation with safe execution and error propagation
  const newReservation = await safeExecutePrismaQuery(
    async () => {
      return await prisma.reservation.create({
        data: reservationData,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          pet: {
            select: {
              name: true,
              breed: true,
              birthdate: true // Changed from age to birthdate as age doesn't exist in schema
            }
          },
          resource: {
            select: {
              name: true,
              type: true,
              location: true
            }
          }
        } as unknown as ExtendedReservationInclude
      });
    },
    null,
    `Error creating reservation`,
    true // Enable throwError flag
  );
  
  // Process add-on services if provided
  if (addOnServices && Array.isArray(addOnServices) && newReservation) {
    try {
      logger.info(`Processing ${addOnServices.length} add-on services`, { requestId });
      
      for (const addOn of addOnServices) {
        if (addOn.serviceId) {
          await safeExecutePrismaQuery(
            async () => {
              return await prisma.reservationAddOn.create({
                data: {
                  reservationId: newReservation.id,
                  serviceId: addOn.serviceId,
                  quantity: addOn.quantity || 1,
                  notes: addOn.notes || '',
                  // organizationId removed as it's not in the schema
                } as any
              });
            },
            null,
            `Error adding add-on service ${addOn.serviceId} to reservation ${newReservation.id}`
          );
        }
      }
    } catch (error) {
      logger.warn(`Error processing add-on services:`, { requestId, error });
      warnings.push('There was an issue processing add-on services, but the reservation was created successfully.');
    }
  }

  // Add null check for newReservation before accessing id
  logger.success(`Reservation created successfully`, { requestId, reservationId: newReservation?.id || 'unknown' });
  
  // Prepare response with warnings if any
  const responseData: any = {
    success: true,
    status: 'success',
    data: {
      reservation: newReservation
    }
  };
  
  // Add message about resource assignment if needed
  if (!assignedResourceId) {
    responseData.data.message = 'Reservation created without a specific resource assignment. Please assign a resource when available.';
  }
  
  // Add warnings to response if any were detected
  if (warnings.length > 0) {
    responseData.warnings = warnings;
    logger.warn(`Response includes warnings`, { requestId, warningCount: warnings.length });
  }

  res.status(201).json(responseData);
});
