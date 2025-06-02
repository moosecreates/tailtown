import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createValidationError, 
  createNotFoundError,
  validateRequest,
  createSuccessResponse
} from '../../utils/api';
import { createReservationSchema, SuiteTypeEnum } from '../../validation/reservation.schema';
import { generateOrderNumber } from '../../utils/orderNumber';
import {
  ExtendedReservationStatus,
  ExtendedReservationWhereInput,
  ExtendedCustomerWhereInput,
  ExtendedPetWhereInput,
  ExtendedResourceWhereInput,
  ExtendedPetSelect
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Creates a new reservation with validation of customer, pet, and service.
 * Ensures the pet belongs to the customer and service is available.
 * Handles proper kennel/suite matching based on suite type.
 */
export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Reservation Service] createReservation called with body:', req.body);
    
    // Extract tenant ID from request (added by tenant middleware)
    const tenantId = req.tenantId;
    
    // Validate request body against the schema
    const { body } = validateRequest(req, { body: createReservationSchema });
    
    // Ensure suiteType is valid (fix for previously identified bug)
    const { suiteType } = body;
    if (!suiteType || !SuiteTypeEnum.safeParse(suiteType).success) {
      return next(createValidationError(
        'suiteType is required and must be one of VIP_SUITE, STANDARD_PLUS_SUITE, STANDARD_SUITE',
        { field: 'suiteType' }
      ));
    }
    
    // Verify customer exists and belongs to this tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: body.customerId,
        organizationId: tenantId
      } as ExtendedCustomerWhereInput
    });
    
    if (!customer) {
      return next(createNotFoundError('Customer', body.customerId));
    }
    
    // Verify pet exists, belongs to this tenant, and is associated with the customer
    const pet = await prisma.pet.findFirst({
      where: {
        id: body.petId,
        organizationId: tenantId,
        customerId: body.customerId
      } as ExtendedPetWhereInput
    });
    
    if (!pet) {
      return next(createNotFoundError('Pet', body.petId, 'associated with this customer'));
    }
    
    // Generate a unique order number
    const orderNumber = await generateOrderNumber(tenantId);
    
    // Find a suitable kennel/resource based on the suiteType if resourceId not provided
    let resourceId = body.resourceId;
    
    if (!resourceId) {
      console.log(`[Reservation Service] No resourceId provided, finding available ${suiteType}`);
      
      const availableResource = await findAvailableKennel(
        tenantId,
        suiteType,
        new Date(body.startDate),
        new Date(body.endDate)
      );
      
      if (!availableResource) {
        return next(createValidationError(
          `No available ${suiteType} found for the selected dates`,
          { dates: `${body.startDate} to ${body.endDate}` }
        ));
      }
      
      resourceId = availableResource.id;
      console.log(`[Reservation Service] Assigned resource: ${resourceId}`);
    } else {
      // Verify the resource exists, belongs to this tenant, and matches the suite type
      const resource = await prisma.resource.findFirst({
        where: {
          id: resourceId,
          organizationId: tenantId
        } as ExtendedResourceWhereInput
      });
      
      if (!resource) {
        return next(createNotFoundError('Resource', resourceId));
      }
      
      // Check if the resource type matches the selected suite type
      // For Standard Plus Suite, we allow matching with any Standard Plus kennel
      if (suiteType === 'STANDARD_PLUS_SUITE') {
        const isStandardPlus = 
          resource.type === 'STANDARD_PLUS_SUITE' || 
          resource.name?.includes('Standard Plus') ||
          resource.description?.includes('Standard Plus');
          
        if (!isStandardPlus) {
          return next(createValidationError(
            'The selected resource is not a Standard Plus Suite',
            { resourceId, resourceType: resource.type }
          ));
        }
      } else if (resource.type !== suiteType) {
        return next(createValidationError(
          `The selected resource is not a ${suiteType}`,
          { resourceId, resourceType: resource.type }
        ));
      }
      
      // Check if the resource is available for the selected dates
      const isAvailable = await checkKennelAvailability(
        tenantId,
        resourceId,
        new Date(body.startDate),
        new Date(body.endDate)
      );
      
      if (!isAvailable) {
        return next(createValidationError(
          'The selected resource is not available for the selected dates',
          { dates: `${body.startDate} to ${body.endDate}` }
        ));
      }
    }
    
    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        ...body,
        orderNumber,
        resourceId,
        organizationId: tenantId
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
            size: true
          } as ExtendedPetSelect
        },
        resource: true
      }
    });
    
    return res.status(201).json(createSuccessResponse(
      reservation,
      'Reservation created successfully'
    ));
  } catch (error) {
    console.error('[Reservation Service] Error creating reservation:', error);
    return next(error);
  }
};

/**
 * Find an available kennel matching the requested suite type
 */
async function findAvailableKennel(
  tenantId: string,
  suiteType: string,
  startDate: Date,
  endDate: Date
) {
  console.log(`[Reservation Service] Finding available ${suiteType} kennel from ${startDate} to ${endDate}`);
  
  // Get all resources of the requested type that belong to this tenant
  let whereClause = {
    organizationId: tenantId,
    isActive: true
  } as ExtendedResourceWhereInput;
  
  // Special handling for Standard Plus Suite (fix for previously identified issue)
  if (suiteType === 'STANDARD_PLUS_SUITE') {
    // Use type assertion to avoid TypeScript errors with dynamic property access
    (whereClause as any).OR = [
      { type: 'STANDARD_PLUS_SUITE' },
      { name: { contains: 'Standard Plus' } },
      { description: { contains: 'Standard Plus' } }
    ];
  } else {
    // Use type assertion to avoid TypeScript errors with dynamic property access
    (whereClause as any).type = suiteType;
  }
  
  const kennels = await prisma.resource.findMany({
    where: whereClause as any // Type assertion for the dynamic where clause
  });
  
  console.log(`[Reservation Service] Found ${kennels.length} kennels of type ${suiteType}`);
  
  // Check each kennel for availability
  for (const kennel of kennels) {
    const isAvailable = await checkKennelAvailability(
      tenantId,
      kennel.id,
      startDate,
      endDate
    );
    
    if (isAvailable) {
      console.log(`[Reservation Service] Found available kennel: ${kennel.id}`);
      return kennel;
    }
  }
  
  console.log(`[Reservation Service] No available kennels found for ${suiteType}`);
  return null;
}

/**
 * Check if a kennel is available for the specified date range
 */
async function checkKennelAvailability(
  tenantId: string,
  kennelId: string,
  startDate: Date,
  endDate: Date,
  currentReservationId?: string
) {
  // Find any overlapping reservations for this kennel
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      organizationId: tenantId,
      resourceId: kennelId,
      // Exclude the current reservation if updating
      ...(currentReservationId ? { id: { not: currentReservationId } } : {}),
      // Find reservations that overlap with the requested dates
      // A reservation overlaps if:
      // 1. It starts before the requested end date AND
      // 2. It ends after the requested start date
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } }
      ],
      // Only check active reservations
      status: {
        in: [ExtendedReservationStatus.CONFIRMED, ExtendedReservationStatus.CHECKED_IN, ExtendedReservationStatus.PENDING_PAYMENT, ExtendedReservationStatus.PARTIALLY_PAID] as any
      }
    } as ExtendedReservationWhereInput
  });
  
  // The kennel is available if there are no overlapping reservations
  return overlappingReservations.length === 0;
}
