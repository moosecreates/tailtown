import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createNotFoundError,
  validateRequest,
  createSuccessResponse
} from '../../utils/api';
import { addOnsSchema } from '../../validation/reservation.schema';
import { 
  ExtendedReservationWhereInput, 
  ExtendedAddOnServiceWhereInput, 
  ExtendedReservationAddOnCreateInput 
} from '../../types/prisma-extensions';

const prisma = new PrismaClient();

/**
 * Add add-on services to an existing reservation
 */
export const addAddOnsToReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // Validate request body
    const { body } = validateRequest(req, { body: addOnsSchema });
    
    // Verify the reservation exists and belongs to this tenant
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        organizationId: tenantId
      } as ExtendedReservationWhereInput
    });
    
    if (!reservation) {
      return next(createNotFoundError('Reservation', id));
    }
    
    // Process each add-on
    const addOnResults = [];
    const errors = [];
    
    for (const addOnRequest of body.addOns) {
      const { serviceId, quantity } = addOnRequest;
      
      try {
        // Find the add-on service
        let addOnService = await prisma.addOnService.findFirst({
          where: {
            id: serviceId,
            organizationId: tenantId
          } as ExtendedAddOnServiceWhereInput
        });
        
        // If not found by ID, check if it's a service with add-ons
        if (!addOnService) {
          console.log(`[Reservation Service] No add-on service found with ID ${serviceId}, looking for add-ons associated with this service ID`);
          
          const addOnServices = await prisma.addOnService.findMany({
            where: { 
              serviceId: serviceId,
              organizationId: tenantId
            } as ExtendedAddOnServiceWhereInput
          });
          
          if (addOnServices.length > 0) {
            // Use the first add-on service associated with this service
            addOnService = addOnServices[0];
            console.log(`[Reservation Service] Found add-on service ${addOnService.name} (${addOnService.id}) associated with service ${serviceId}`);
          } else {
            // If still not found, check if it's a valid service ID at least
            const service = await prisma.service.findFirst({
              where: { 
                id: serviceId,
                organizationId: tenantId
              } as any // Using 'any' for simplicity since we didn't import ExtendedServiceWhereInput
            });
            
            if (!service) {
              const error = `Neither add-on service nor service found with ID ${serviceId}`;
              console.error(`[Reservation Service] ${error}`);
              errors.push(error);
              continue; // Skip this add-on but continue processing others
            }
            
            // Create a temporary add-on service object for processing
            addOnService = {
              id: serviceId,
              name: service.name,
              description: service.description || null,
              price: service.price,
              serviceId: service.id,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              duration: service.duration || null,
              // Cast to 'any' to allow organizationId in this dynamic object
              organizationId: tenantId
            } as any;
          }
        }
        
        // Create reservation add-on entries
        for (let i = 0; i < quantity; i++) {
          const reservationAddOn = await prisma.reservationAddOn.create({
            data: {
              reservationId: id,
              addOnId: addOnService!.id, // Add null check assertion
              price: addOnService!.price, // Add null check assertion
              notes: `Added as add-on to reservation`,
              organizationId: tenantId
            } as any, // Use 'any' to bypass strict typing temporarily
            include: {
              addOn: true
            }
          });
          
          addOnResults.push(reservationAddOn);
        }
      } catch (error) {
        console.error('[Reservation Service] Error processing add-on:', error);
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    
    // Return results, including any errors
    const success = addOnResults.length > 0;
    const message = success 
      ? `Successfully added ${addOnResults.length} add-on(s) to the reservation` 
      : 'Failed to add any add-ons to the reservation';
    
    const response = {
      addOns: addOnResults,
      errors: errors.length > 0 ? errors : undefined
    };
    
    return res.status(success ? 200 : 400).json(
      createSuccessResponse(response, message)
    );
  } catch (error) {
    console.error('[Reservation Service] Error in addAddOnsToReservation:', error);
    return next(error);
  }
};
