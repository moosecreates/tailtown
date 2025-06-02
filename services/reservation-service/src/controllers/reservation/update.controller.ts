import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createValidationError, 
  createNotFoundError,
  validateRequest,
  createSuccessResponse
} from '../../utils/api';
import { updateReservationSchema, SuiteTypeEnum } from '../../validation/reservation.schema';
import {
  ExtendedReservationStatus,
  ExtendedReservationWhereInput,
  ExtendedCustomerWhereInput,
  ExtendedPetWhereInput,
  ExtendedResourceWhereInput,
  ExtendedPetSelect,
  ExtendedCustomerSelect,
  ExtendedReservation,
  ExtendedReservationInclude
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Updates an existing reservation with validation of status changes.
 * Ensures all relationships remain valid after the update.
 * Handles proper kennel/suite matching based on suite type.
 */
export const updateReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Reservation Service] updateReservation called for ID:', req.params.id);
    
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // Validate request body against the schema
    const { body } = validateRequest(req, { body: updateReservationSchema });
    
    // Verify the reservation exists and belongs to this tenant
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        id,
        organizationId: tenantId
      } as ExtendedReservationWhereInput,
      include: {
        customer: true,
        pet: true,
        resource: true
      }
    });
    
    if (!existingReservation) {
      return next(createNotFoundError('Reservation', id));
    }
    
    // If changing customer, verify the new customer exists and belongs to this tenant
    if (body.customerId && body.customerId !== existingReservation.customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: body.customerId,
          organizationId: tenantId
        } as ExtendedCustomerWhereInput
      });
      
      if (!customer) {
        return next(createNotFoundError('Customer', body.customerId));
      }
    }
    
    // If changing pet, verify the pet exists, belongs to this tenant, and is associated with the customer
    if (body.petId && body.petId !== existingReservation.petId) {
      const customerId = body.customerId || existingReservation.customerId;
      
      const pet = await prisma.pet.findFirst({
        where: {
          id: body.petId,
          organizationId: tenantId,
          customerId
        } as ExtendedPetWhereInput
      });
      
      if (!pet) {
        return next(createNotFoundError('Pet', body.petId, 'associated with this customer'));
      }
    }
    
    // Check if we're updating dates or resource, which requires availability check
    const isChangingDates = body.startDate || body.endDate;
    const isChangingResource = body.resourceId && body.resourceId !== existingReservation.resourceId;
    const isChangingSuiteType = body.suiteType && body.suiteType !== (existingReservation as ExtendedReservation).suiteType;
    
    // Determine the dates to check for availability
    const startDate = body.startDate 
      ? new Date(body.startDate) 
      : existingReservation.startDate;
      
    const endDate = body.endDate 
      ? new Date(body.endDate) 
      : existingReservation.endDate;
    
    // Ensure end date is after start date
    if (startDate >= endDate) {
      return next(createValidationError(
        'End date must be after start date',
        { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      ));
    }
    
    // Handle resource changes based on suite type
    // Use non-null assertion for resourceId since it should always be present for a valid reservation
    let resourceId = existingReservation.resourceId!;
    const suiteType = body.suiteType || (existingReservation as ExtendedReservation).suiteType;
    
    // If changing resource or suite type, validate the new resource
    if (isChangingResource || isChangingSuiteType) {
      // If resourceId is provided, verify it's valid and available
      if (body.resourceId) {
        resourceId = body.resourceId;
        
        // Verify the resource exists and belongs to this tenant
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
            (resource.name ? resource.name.includes('Standard Plus') : false) ||
            (resource.description ? resource.description.includes('Standard Plus') : false);
            
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
        if (isChangingDates || isChangingResource) {
          // Use non-null assertion on the id since we already verified the reservation exists
          const isAvailable = await checkKennelAvailability(
            tenantId,
            resourceId!, // Non-null assertion since resourceId should be valid at this point
            startDate,
            endDate,
            id! // Non-null assertion since we already verified the reservation exists
          );
          
          if (!isAvailable) {
            return next(createValidationError(
              'The selected resource is not available for the selected dates',
              { dates: `${startDate.toISOString()} to ${endDate.toISOString()}` }
            ));
          }
        }
      } 
      // If changing suite type but not resource, find a new resource
      else if (isChangingSuiteType) {
        console.log(`[Reservation Service] Finding available ${suiteType} for updated reservation`);
        
        const availableResource = await findAvailableKennel(
          tenantId,
          suiteType,
          startDate,
          endDate,
          id // Exclude current reservation
        );
        
        if (!availableResource) {
          return next(createValidationError(
            `No available ${suiteType} found for the selected dates`,
            { dates: `${startDate.toISOString()} to ${endDate.toISOString()}` }
          ));
        }
        
        resourceId = availableResource.id;
        console.log(`[Reservation Service] Assigned new resource: ${resourceId}`);
      }
      // If only changing dates, check if current resource is still available
      else if (isChangingDates) {
        // Use non-null assertion on the id since we already verified the reservation exists
        const isAvailable = await checkKennelAvailability(
          tenantId,
          resourceId!, // Non-null assertion since resourceId should be valid at this point
          startDate,
          endDate,
          id! // Non-null assertion since we already verified the reservation exists
        );
        
        if (!isAvailable) {
          return next(createValidationError(
            'The current resource is not available for the new dates',
            { dates: `${startDate.toISOString()} to ${endDate.toISOString()}` }
          ));
        }
      }
    }
    
    // Update the reservation
    const updateData = {
      ...body,
      resourceId
    };
    const updatedReservation = await prisma.reservation.update({
      where: {
        id
      },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          } as ExtendedCustomerSelect
        },
        pet: {
          select: {
            id: true,
            name: true,
            breed: true,
            size: true
          } as ExtendedPetSelect
        },
        resource: true,
        // Using the extended reservation include type to properly handle addOns
        addOns: {
          include: {
            addOn: true
          }
        }
      } as ExtendedReservationInclude
    });
    
    return res.json(createSuccessResponse(
      updatedReservation,
      'Reservation updated successfully'
    ));
  } catch (error) {
    console.error('[Reservation Service] Error updating reservation:', error);
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
  endDate: Date,
  currentReservationId?: string
) {
  console.log(`[Reservation Service] Finding available ${suiteType} kennel from ${startDate} to ${endDate}`);
  
  // Get all resources of the requested type that belong to this tenant
  let whereClause = {
    organizationId: tenantId,
    isActive: true
  } as ExtendedResourceWhereInput;
  
  // Special handling for Standard Plus Suite (fix for previously identified issue)
  if (suiteType === 'STANDARD_PLUS_SUITE') {
    (whereClause as any).OR = [
      { type: 'STANDARD_PLUS_SUITE' },
      { name: { contains: 'Standard Plus' } },
      { description: { contains: 'Standard Plus' } }
    ];
  } else {
    (whereClause as any).type = suiteType;
  }
  
  const kennels = await prisma.resource.findMany({
    where: whereClause as any
  });
  
  console.log(`[Reservation Service] Found ${kennels.length} kennels of type ${suiteType}`);
  
  // Check each kennel for availability
  for (const kennel of kennels) {
    const isAvailable = await checkKennelAvailability(
      tenantId,
      kennel.id,
      startDate,
      endDate,
      currentReservationId
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
