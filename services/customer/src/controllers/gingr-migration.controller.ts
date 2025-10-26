/**
 * Gingr Migration Controller
 * Handles data migration from Gingr to Tailtown
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import GingrApiClient from '../services/gingr-api.service';
import {
  transformOwnerToCustomer,
  transformAnimalToPet,
  transformReservationToReservation,
  generateOrderNumber
} from '../services/gingr-transform.service';

const prisma = new PrismaClient();

interface MigrationProgress {
  phase: string;
  total: number;
  completed: number;
  failed: number;
  errors: Array<{
    type: string;
    id: string;
    error: string;
  }>;
  startTime: Date;
  endTime?: Date;
}

/**
 * Start Gingr data migration
 * POST /api/gingr-migration/start
 */
export const startMigration = async (req: Request, res: Response, next: NextFunction) => {
  const { subdomain, apiKey, startDate, endDate } = req.body;

  if (!subdomain || !apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Subdomain and API key are required'
    });
  }

  const progress: MigrationProgress = {
    phase: 'Initializing',
    total: 0,
    completed: 0,
    failed: 0,
    errors: [],
    startTime: new Date()
  };

  try {
    // Initialize Gingr API client
    const gingr = new GingrApiClient({ subdomain, apiKey });
    console.log('[Migration] Starting Gingr migration...');

    // Phase 1: Fetch all data
    progress.phase = 'Fetching data from Gingr';
    console.log('[Migration] Phase 1: Fetching data...');

    const owners = await gingr.fetchAllOwners();
    console.log(`[Migration] Fetched ${owners.length} owners`);

    const animals = await gingr.fetchAllAnimals();
    console.log(`[Migration] Fetched ${animals.length} animals`);

    const reservations = await gingr.fetchAllReservations(
      new Date(startDate),
      new Date(endDate)
    );
    console.log(`[Migration] Fetched ${reservations.length} reservations`);

    const reservationTypes = await gingr.fetchReservationTypes();
    console.log(`[Migration] Fetched ${reservationTypes.length} reservation types`);

    progress.total = owners.length + animals.length + reservations.length + reservationTypes.length;

    // Phase 2: Import reservation types (services)
    progress.phase = 'Importing services';
    console.log('[Migration] Phase 2: Importing services...');

    const serviceMap = new Map<string, string>(); // Gingr type ID -> Tailtown service ID

    for (const type of reservationTypes) {
      try {
        // Check if service already exists by name
        let service = await prisma.service.findFirst({
          where: {
            tenantId: 'dev',
            name: type.name
          }
        });

        if (!service) {
          service = await prisma.service.create({
            data: {
              name: type.name,
              description: type.description || '',
              price: type.price || 0,
              duration: 60, // Default duration
              isActive: true,
              tenantId: 'dev'
            }
          });
        }

        serviceMap.set(type.id, service.id);
        progress.completed++;
      } catch (error: any) {
        progress.failed++;
        progress.errors.push({
          type: 'service',
          id: type.id,
          error: error.message
        });
      }
    }

    // Phase 3: Import customers
    progress.phase = 'Importing customers';
    console.log('[Migration] Phase 3: Importing customers...');

    const customerMap = new Map<string, string>(); // Gingr owner ID -> Tailtown customer ID

    for (const owner of owners) {
      try {
        // Check if customer already exists
        let customer = await prisma.customer.findFirst({
          where: {
            tenantId: 'dev',
            externalId: owner.system_id
          }
        });

        if (!customer) {
          const customerData = transformOwnerToCustomer(owner);
          customer = await prisma.customer.create({
            data: customerData
          });
        }

        customerMap.set(owner.system_id, customer.id);
        progress.completed++;
      } catch (error: any) {
        progress.failed++;
        progress.errors.push({
          type: 'customer',
          id: owner.system_id,
          error: error.message
        });
      }
    }

    // Phase 4: Import pets
    progress.phase = 'Importing pets';
    console.log('[Migration] Phase 4: Importing pets...');

    const petMap = new Map<string, string>(); // Gingr animal ID -> Tailtown pet ID

    for (const animal of animals) {
      try {
        const customerId = customerMap.get(animal.owner_id);

        if (!customerId) {
          throw new Error(`Customer not found for owner_id: ${animal.owner_id}`);
        }

        // Check if pet already exists
        let pet = await prisma.pet.findFirst({
          where: {
            tenantId: 'dev',
            externalId: animal.id
          }
        });

        if (!pet) {
          const petData = transformAnimalToPet(animal, customerId);
          pet = await prisma.pet.create({
            data: petData
          });
        }

        petMap.set(animal.id, pet.id);
        progress.completed++;
      } catch (error: any) {
        progress.failed++;
        progress.errors.push({
          type: 'pet',
          id: animal.id,
          error: error.message
        });
      }
    }

    // Phase 5: Import reservations
    progress.phase = 'Importing reservations';
    console.log('[Migration] Phase 5: Importing reservations...');

    for (const reservation of reservations) {
      try {
        const customerId = customerMap.get(reservation.owner_id);
        const petId = petMap.get(reservation.animal_id);
        const serviceId = serviceMap.get(reservation.type_id);

        if (!customerId) {
          throw new Error(`Customer not found for owner_id: ${reservation.owner_id}`);
        }

        if (!petId) {
          throw new Error(`Pet not found for animal_id: ${reservation.animal_id}`);
        }

        if (!serviceId) {
          throw new Error(`Service not found for type_id: ${reservation.type_id}`);
        }

        // Check if reservation already exists
        const existingReservation = await prisma.reservation.findFirst({
          where: {
            tenantId: 'dev',
            externalId: reservation.id
          }
        });

        if (!existingReservation) {
          const reservationData = transformReservationToReservation(
            reservation,
            customerId,
            petId,
            serviceId
          );

          await prisma.reservation.create({
            data: {
              ...reservationData,
              orderNumber: generateOrderNumber()
            }
          });
        }

        progress.completed++;
      } catch (error: any) {
        progress.failed++;
        progress.errors.push({
          type: 'reservation',
          id: reservation.id,
          error: error.message
        });
      }
    }

    // Complete
    progress.phase = 'Complete';
    progress.endTime = new Date();

    const stats = gingr.getStats();
    console.log(`[Migration] Complete! API requests made: ${stats.totalRequests}`);

    res.json({
      success: true,
      progress,
      stats: {
        apiRequests: stats.totalRequests,
        duration: progress.endTime.getTime() - progress.startTime.getTime()
      }
    });

  } catch (error: any) {
    console.error('[Migration] Error:', error);
    progress.phase = 'Failed';
    progress.endTime = new Date();

    res.status(500).json({
      success: false,
      error: error.message,
      progress
    });
  }
};

/**
 * Test Gingr API connection
 * POST /api/gingr-migration/test
 */
export const testConnection = async (req: Request, res: Response, next: NextFunction) => {
  const { subdomain, apiKey } = req.body;

  if (!subdomain || !apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Subdomain and API key are required'
    });
  }

  try {
    const gingr = new GingrApiClient({ subdomain, apiKey });

    // Try to fetch locations as a simple test
    const locations = await gingr.fetchLocations();

    res.json({
      success: true,
      message: 'Connection successful',
      locations
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default {
  startMigration,
  testConnection
};
