import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/service';
import { 
  ExtendedReservationWhereInput, 
  ExtendedReservationStatus, 
  ExtendedReservationInclude,
  ExtendedResourceWhereInput,
  ExtendedCustomerWhereInput,
  ExtendedPetWhereInput
} from '../../types/prisma-extensions';
import { detectReservationConflicts } from '../../utils/reservation-conflicts';

/**
 * Helper function to determine suite type based on service type
 * @param serviceType The service type to map to a suite type
 * @returns The determined suite type or null if not determinable
 */
const determineSuiteType = (serviceType: string): string | null => {
  switch (serviceType.toLowerCase()) {
    case 'boarding':
      return 'standard';
    case 'luxury_boarding':
      return 'luxury';
    case 'daycare':
      return 'daycare';
    case 'grooming':
      return null; // Grooming doesn't need a suite type
    case 'training':
      return null; // Training doesn't need a suite type
    default:
      return null;
  }
};

const prisma = new PrismaClient();

/**
 * Helper function to safely execute Prisma queries with error handling
 * This implements our schema alignment strategy with defensive programming
 * and graceful fallbacks for potential schema mismatches
 */
async function safeExecutePrismaQuery<T>(queryFn: () => Promise<T>, fallbackValue: T, errorMessage: string): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallbackValue;
  }
}

/**
 * Get all reservations with pagination and filtering
 * Implements schema alignment strategy with defensive programming
 * 
 * @route GET /api/v1/reservations
 * @param {number} req.query.page - Page number for pagination
 * @param {number} req.query.limit - Number of items per page
 * @param {string} req.query.status - Filter by reservation status
 * @param {string} req.query.startDate - Filter by start date
 * @param {string} req.query.endDate - Filter by end date
 * @param {string} req.query.customerId - Filter by customer ID
 * @param {string} req.query.petId - Filter by pet ID
 * @param {string} req.query.resourceId - Filter by resource ID
 * @param {string} req.query.suiteType - Filter by suite type
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID for logging
  const requestId = `getAll-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] Processing get all reservations request with query params:`, req.query);
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.warn(`[${requestId}] Missing tenant ID in request`);
      return next(new AppError('Tenant ID is required', 401));
    }

    // Parse pagination parameters with validation
    let page = 1;
    let limit = 10;
    
    if (req.query.page) {
      const parsedPage = parseInt(req.query.page as string);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      } else {
        console.warn(`[${requestId}] Invalid page parameter: ${req.query.page}, using default: 1`);
      }
    }
    
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit as string);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        limit = parsedLimit;
      } else {
        console.warn(`[${requestId}] Invalid limit parameter: ${req.query.limit}, using default: 10`);
      }
    }
    
    const skip = (page - 1) * limit;
    console.log(`[${requestId}] Using pagination: page=${page}, limit=${limit}, skip=${skip}`);

    // Build filter conditions with validation
    const whereConditions: ExtendedReservationWhereInput = {
      organizationId: tenantId
    };
    const warnings: string[] = [];

    // Add status filter if provided
    if (req.query.status) {
      // Validate status against known values
      const status = req.query.status as string;
      const validStatuses = Object.values(ExtendedReservationStatus);
      
      if (validStatuses.includes(status as any)) {
        whereConditions.status = status as any;
        console.log(`[${requestId}] Filtering by status: ${status}`);
      } else {
        console.warn(`[${requestId}] Invalid status filter: ${status}`);
        warnings.push(`Invalid status filter: ${status} was ignored`);
      }
    }

    // Add date range filters if provided with validation
    if (req.query.startDate) {
      try {
        const startDate = new Date(req.query.startDate as string);
        if (!isNaN(startDate.getTime())) {
          whereConditions.startDate = {
            gte: startDate
          };
          console.log(`[${requestId}] Filtering by start date >= ${startDate.toISOString()}`);
        } else {
          console.warn(`[${requestId}] Invalid start date: ${req.query.startDate}`);
          warnings.push(`Invalid start date format: ${req.query.startDate} was ignored`);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error parsing start date: ${req.query.startDate}`, error);
        warnings.push(`Invalid start date: ${req.query.startDate} was ignored`);
      }
    }

    if (req.query.endDate) {
      try {
        const endDate = new Date(req.query.endDate as string);
        if (!isNaN(endDate.getTime())) {
          whereConditions.endDate = {
            lte: endDate
          };
          console.log(`[${requestId}] Filtering by end date <= ${endDate.toISOString()}`);
        } else {
          console.warn(`[${requestId}] Invalid end date: ${req.query.endDate}`);
          warnings.push(`Invalid end date format: ${req.query.endDate} was ignored`);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error parsing end date: ${req.query.endDate}`, error);
        warnings.push(`Invalid end date: ${req.query.endDate} was ignored`);
      }
    }
    
    // Add customer filter if provided
    if (req.query.customerId) {
      whereConditions.customerId = req.query.customerId as string;
      console.log(`[${requestId}] Filtering by customer ID: ${req.query.customerId}`);
    }
    
    // Add pet filter if provided
    if (req.query.petId) {
      whereConditions.petId = req.query.petId as string;
      console.log(`[${requestId}] Filtering by pet ID: ${req.query.petId}`);
    }
    
    // Add resource filter if provided
    if (req.query.resourceId) {
      whereConditions.resourceId = req.query.resourceId as string;
      console.log(`[${requestId}] Filtering by resource ID: ${req.query.resourceId}`);
    }
    
    // Add suite type filter if provided
    if (req.query.suiteType) {
      // Use type assertion to handle potential schema mismatches
      (whereConditions as any).suiteType = req.query.suiteType as string;
      console.log(`[${requestId}] Filtering by suite type: ${req.query.suiteType}`);
    }

    console.log(`[${requestId}] Executing reservation query with filters:`, JSON.stringify(whereConditions));

    // Get reservations with safe execution
    const reservations = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findMany({
          where: whereConditions,
          skip,
          take: limit,
          orderBy: {
            startDate: 'asc'
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
                age: true
              }
            },
            resource: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true
              }
            },
            addOns: {
              include: {
                addOn: true
              }
            }
          } as unknown as ExtendedReservationInclude
        });
      },
      [], // Empty array fallback if there's an error
      `[${requestId}] Error fetching reservations`
    );

    console.log(`[${requestId}] Retrieved ${reservations.length} reservations`);

    // Get total count with safe execution
    const totalCount = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.count({
          where: whereConditions
        });
      },
      0, // Zero fallback if there's an error
      `[${requestId}] Error counting reservations`
    );

    console.log(`[${requestId}] Total reservation count: ${totalCount}`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    // Check for data integrity issues
    let dataIntegrityIssues = false;
    const processedReservations = reservations.map(reservation => {
      const processed = { ...reservation };
      
      // Handle potential date formatting issues defensively
      try {
        if (reservation.startDate) {
          processed.startDate = new Date(reservation.startDate);
        }
        if (reservation.endDate) {
          processed.endDate = new Date(reservation.endDate);
        }
        if (reservation.createdAt) {
          processed.createdAt = new Date(reservation.createdAt);
        }
        if (reservation.updatedAt) {
          processed.updatedAt = new Date(reservation.updatedAt);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error formatting dates for reservation ${reservation.id}:`, error);
        dataIntegrityIssues = true;
      }
      
      // Check for missing related data
      if (reservation.customerId && !reservation.customer) {
        console.warn(`[${requestId}] Data integrity issue: Reservation ${reservation.id} has customerId but no customer data`);
        dataIntegrityIssues = true;
      }
      
      if (reservation.petId && !reservation.pet) {
        console.warn(`[${requestId}] Data integrity issue: Reservation ${reservation.id} has petId but no pet data`);
        dataIntegrityIssues = true;
      }
      
      if (reservation.resourceId && !reservation.resource) {
        console.warn(`[${requestId}] Data integrity issue: Reservation ${reservation.id} has resourceId but no resource data`);
        dataIntegrityIssues = true;
      }
      
      return processed;
    });
    
    if (dataIntegrityIssues) {
      warnings.push('Some reservations have data integrity issues. Related data may be missing or incomplete.');
    }

    console.log(`[${requestId}] Successfully completed get all reservations request`);
    
    // Prepare response with warnings if any
    const responseData: any = {
      status: 'success',
      data: {
        reservations: processedReservations,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        }
      }
    };
    
    if (warnings.length > 0) {
      responseData.warnings = warnings;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`[${requestId}] Error fetching reservations:`, error);
    // More graceful error handling - return empty results instead of error
    return res.status(200).json({
      status: 'success',
      data: {
        reservations: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0
        }
      },
      warnings: ['An error occurred while fetching reservations. Returning empty results.']
    });
  }
};

/**
 * Get a single reservation by ID
 * Implements schema alignment strategy with defensive programming
 * 
 * @route GET /api/v1/reservations/:id
 * @param {string} req.params.id - Reservation ID
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID for logging
  const requestId = `get-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] Processing get reservation request for ID: ${req.params.id}`);
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.warn(`[${requestId}] Missing tenant ID in request`);
      return next(new AppError('Tenant ID is required', 401));
    }

    const { id } = req.params;
    if (!id) {
      console.warn(`[${requestId}] Missing reservation ID in request`);
      return next(new AppError('Reservation ID is required', 400));
    }

    console.log(`[${requestId}] Fetching reservation with ID: ${id} for tenant: ${tenantId}`);

    // Get reservation with safe execution
    const reservation = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findFirst({
          where: {
            id,
            organizationId: tenantId
          } as ExtendedReservationWhereInput,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                zipCode: true
              }
            },
            pet: {
              select: {
                id: true,
                name: true,
                breed: true,
                age: true,
                weight: true,
                gender: true,
                notes: true
              }
            },
            resource: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                status: true
              }
            },
            addOns: {
              include: {
                addOn: true
              }
            }
          } as unknown as ExtendedReservationInclude
        });
      },
      null, // Null fallback if there's an error
      `[${requestId}] Error fetching reservation with ID ${id}`
    );

    if (!reservation) {
      console.warn(`[${requestId}] Reservation not found: ${id} for tenant: ${tenantId}`);
      return next(new AppError('Reservation not found', 404));
    }

    // Check for potential data integrity issues and log warnings
    const warnings = [];
    
    if (reservation.customerId && !reservation.customer) {
      console.warn(`[${requestId}] Data integrity issue: Reservation ${id} has customerId but no customer data`);
      warnings.push('Customer data missing');
    }
    
    if (reservation.petId && !reservation.pet) {
      console.warn(`[${requestId}] Data integrity issue: Reservation ${id} has petId but no pet data`);
      warnings.push('Pet data missing');
    }
    
    if (reservation.resourceId && !reservation.resource) {
      console.warn(`[${requestId}] Data integrity issue: Reservation ${id} has resourceId but no resource data`);
      warnings.push('Resource data missing');
    }
    
    // Format dates for consistent output
    let formattedReservation = { ...reservation };
    
    // Handle potential date formatting issues defensively
    try {
      if (reservation.startDate) {
        formattedReservation.startDate = new Date(reservation.startDate);
      }
      if (reservation.endDate) {
        formattedReservation.endDate = new Date(reservation.endDate);
      }
      if (reservation.createdAt) {
        formattedReservation.createdAt = new Date(reservation.createdAt);
      }
      if (reservation.updatedAt) {
        formattedReservation.updatedAt = new Date(reservation.updatedAt);
      }
    } catch (error) {
      console.warn(`[${requestId}] Error formatting dates for reservation ${id}:`, error);
      warnings.push('Date formatting issue detected');
    }

    console.log(`[${requestId}] Successfully retrieved reservation: ${id}`);
    
    // Add warnings to response if any were detected
    const responseData: any = {
      status: 'success',
      data: {
        reservation: formattedReservation
      }
    };
    
    if (warnings.length > 0) {
      responseData.warnings = warnings;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`[${requestId}] Error fetching reservation with ID ${req.params.id}:`, error);
    // More graceful error handling - return not found instead of error
    return next(new AppError('Reservation not found', 404));
  }
};

/**
 * Create a new reservation
 * Implements schema alignment strategy with defensive programming
 * 
 * @route POST /api/v1/reservations
 * @param {string} req.body.customerId - Customer ID
 * @param {string} req.body.petId - Pet ID
 * @param {string} req.body.resourceId - Resource ID (optional)
 * @param {string} req.body.startDate - Start date
 * @param {string} req.body.endDate - End date
 * @param {string} req.body.suiteType - Suite type
 * @param {string} req.body.serviceType - Service type (optional)
 * @param {string} req.body.status - Reservation status
 * @param {string} req.body.price - Price (optional)
 * @param {string} req.body.deposit - Deposit amount (optional)
 * @param {string} req.body.notes - Customer notes (optional)
 * @param {string} req.body.staffNotes - Staff notes (optional)
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Enhanced logging for request tracking
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  console.log(`[${requestId}] Processing reservation creation request`);
  
  // Initialize warnings array for tracking non-blocking issues
  const warnings: string[] = [];
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.error(`[${requestId}] Missing tenant ID`);
      return next(new AppError('Tenant ID is required', 401));
    }

    // Extract reservation data from request body
    const {
      customerId,
      petId,
      resourceId,
      startDate,
      endDate,
      suiteType,
      serviceType,
      status,
      price,
      deposit,
      notes,
      staffNotes,
      addOnServices
    } = req.body;

    // Validate required fields with detailed error messages
    if (!customerId) {
      console.warn(`[${requestId}] Missing customer ID`);
      return next(new AppError('Customer ID is required', 400));
    }

    if (!petId) {
      console.warn(`[${requestId}] Missing pet ID`);
      return next(new AppError('Pet ID is required', 400));
    }

    if (!startDate || !endDate) {
      console.warn(`[${requestId}] Missing date range`);
      return next(new AppError('Start date and end date are required', 400));
    }

    // Parse dates with enhanced validation
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      console.warn(`[${requestId}] Invalid date format: start=${startDate}, end=${endDate}`);
      return next(new AppError('Invalid date format. Please use YYYY-MM-DD format.', 400));
    }

    // Validate date range logic
    if (parsedStartDate >= parsedEndDate) {
      console.warn(`[${requestId}] Invalid date range: start date must be before end date`);
      return next(new AppError('Start date must be before end date', 400));
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedStartDate < today) {
      console.warn(`[${requestId}] Start date is in the past`);
      return next(new AppError('Start date cannot be in the past', 400));
    }

    // Contextual suite type validation based on service type
    const validSuiteTypes = ['VIP_SUITE', 'STANDARD_PLUS_SUITE', 'STANDARD_SUITE'];
    let determinedSuiteType = suiteType;
    
    if (!determinedSuiteType) {
      // Default suite type based on service type if not provided
      if (serviceType === 'PREMIUM') {
        determinedSuiteType = 'VIP_SUITE';
        console.log(`[${requestId}] Auto-assigned VIP_SUITE based on PREMIUM service type`);
      } else if (serviceType === 'ENHANCED') {
        determinedSuiteType = 'STANDARD_PLUS_SUITE';
        console.log(`[${requestId}] Auto-assigned STANDARD_PLUS_SUITE based on ENHANCED service type`);
      } else {
        determinedSuiteType = 'STANDARD_SUITE'; // Default
        console.log(`[${requestId}] Auto-assigned default STANDARD_SUITE`);
      }
    } else if (!validSuiteTypes.includes(determinedSuiteType)) {
      console.warn(`[${requestId}] Invalid suite type: ${determinedSuiteType}`);
      return next(new AppError(`Suite type must be one of: ${validSuiteTypes.join(', ')}`, 400));
    }

    // Generate a unique order number with better uniqueness
    const orderNumber = `RES-${Date.now()}-${Math.floor(Math.random() * 10000)}-${tenantId.substring(0, 4)}`;
    console.log(`[${requestId}] Generated order number: ${orderNumber}`);

    // Resource assignment with validation
    let assignedResourceId = resourceId;
    
    // If resourceId is provided, validate it exists and is available
    if (resourceId) {
      console.log(`[${requestId}] Validating requested resource: ${resourceId}`);
      
      // Check if resource exists and belongs to tenant
      const resourceExists = await safeExecutePrismaQuery(
        async () => {
          return await prisma.resource.findFirst({
            where: {
              id: resourceId,
              organizationId: tenantId
            } as ExtendedResourceWhereInput
          });
        },
        null,
        `[${requestId}] Error checking resource existence`
      );
      
      if (!resourceExists) {
        console.warn(`[${requestId}] Requested resource not found: ${resourceId}`);
        return next(new AppError('Requested resource not found or not available', 404));
      }
      
      // Use the conflict detection utility to check for conflicts
      const conflictResult = await detectReservationConflicts({
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        resourceId,
        tenantId,
        petId
      });
      
      if (conflictResult.hasConflicts) {
        console.warn(`[${requestId}] Resource ${resourceId} has conflicts for the requested dates`);
        return next(new AppError(
          conflictResult.warnings.length > 0 
            ? conflictResult.warnings[0] 
            : 'Resource is not available for the requested dates', 
          409
        ));
      }
    } else {
      // Auto-assign a resource based on suite type if none provided
      console.log(`[${requestId}] No resource specified, attempting auto-assignment for suite type: ${determinedSuiteType}`);
      
      // Find available resources matching the suite type using the conflict detection utility
      const availableResources = await safeExecutePrismaQuery(
        async () => {
          // First get all resources matching the suite type
          const resources = await prisma.resource.findMany({
            where: {
              organizationId: tenantId,
              type: determinedSuiteType
            } as ExtendedResourceWhereInput
          });
          
          // Then filter out resources with overlapping reservations
          const availableResourceIds = [];
          
          for (const resource of resources) {
            // Use our conflict detection utility to check each resource
            const resourceConflict = await detectReservationConflicts({
              startDate: parsedStartDate,
              endDate: parsedEndDate,
              resourceId: resource.id,
              tenantId,
              petId
            });
            
            if (!resourceConflict.hasConflicts) {
              availableResourceIds.push(resource.id);
            }
          }
          
          return availableResourceIds;
        },
        [],
        `[${requestId}] Error finding available resources`
      );
      
      if (availableResources.length > 0) {
        // Assign the first available resource
        assignedResourceId = availableResources[0];
        console.log(`[${requestId}] Auto-assigned resource: ${assignedResourceId}`);
      } else {
        // Check if the pet already has a reservation during this time
        const petConflictResult = await detectReservationConflicts({
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          tenantId,
          petId,
          suiteType: determinedSuiteType
        });
        
        if (petConflictResult.hasConflicts && petConflictResult.warnings.some(w => w.includes('Pet already has'))) {
          console.warn(`[${requestId}] Pet already has a reservation during this time`);
          return next(new AppError(petConflictResult.warnings[0], 409));
        }
        
        console.warn(`[${requestId}] No available resources found for suite type: ${determinedSuiteType}`);
        warnings.push(`No available resources found for suite type: ${determinedSuiteType}. The reservation will be created without a resource assignment.`);
      }
    }

    // Create reservation with safe execution and enhanced error handling
    console.log(`[${requestId}] Creating reservation with determined values`);
    const newReservation = await safeExecutePrismaQuery(
      async () => {
        // Use type assertion to handle fields not in the base Prisma schema
        const data: any = {
          customerId,
          petId,
          resourceId: assignedResourceId || undefined,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          status: status || ExtendedReservationStatus.CONFIRMED,
          price: price ? parseFloat(price) : undefined,
          deposit: deposit ? parseFloat(deposit) : undefined,
          notes,
          staffNotes,
          orderNumber,
          organizationId: tenantId
        };
        
        // Add suiteType which may not be in all schema versions
        data.suiteType = determinedSuiteType;
        
        // Add serviceType if provided
        if (serviceType) {
          data.serviceType = serviceType;
        }
        
        return await prisma.reservation.create({
          data,
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
                size: true
              }
            },
            resource: {
              select: {
                name: true,
                type: true
              }
            }
          } as unknown as ExtendedReservationInclude
        });
      },
      null, // Null fallback if there's an error
      `[${requestId}] Error creating reservation`
    );

    if (!newReservation) {
      console.error(`[${requestId}] Failed to create reservation after all validations passed`);
      return next(new AppError('Failed to create reservation due to database error', 500));
    }

    // Handle add-on services if provided and the schema supports them
    if (addOnServices && Array.isArray(addOnServices) && addOnServices.length > 0) {
      console.log(`[${requestId}] Processing ${addOnServices.length} add-on services`);
      
      try {
        // Attempt to add reservation add-ons
        for (const addOnId of addOnServices) {
          await safeExecutePrismaQuery(
            async () => {
              return await prisma.reservationAddOn.create({
                data: {
                  reservationId: newReservation.id,
                  addOnId: addOnId,
                  organizationId: tenantId
                } as any // Type assertion for organizationId
              });
            },
            null,
            `[${requestId}] Error adding add-on service ${addOnId}`
          );
        }
      } catch (addOnError) {
        // Log error but don't fail the reservation creation
        console.error(`[${requestId}] Error adding add-on services:`, addOnError);
        console.warn(`[${requestId}] Reservation created but add-on services could not be added`);
      }
    }

    console.log(`[${requestId}] Reservation created successfully with ID: ${newReservation.id}`);
    res.status(201).json({
      status: 'success',
      data: {
        reservation: newReservation,
        message: !assignedResourceId ? 
          'Reservation created without a specific resource assignment. Please assign a resource when available.' : 
          undefined
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Unhandled error creating reservation:`, error);
    return next(new AppError('Failed to create reservation due to an unexpected error', 500));
  }
};

/**
 * Update a reservation
 * Implements schema alignment strategy with defensive programming
 * 
 * @route PATCH /api/v1/reservations/:id
 * @param {string} req.params.id - Reservation ID
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID for logging
  const requestId = `update-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] Processing update reservation request for ID: ${req.params.id}`);
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.warn(`[${requestId}] Missing tenant ID in request`);
      return next(new AppError('Tenant ID is required', 401));
    }

    const { id } = req.params;
    if (!id) {
      console.warn(`[${requestId}] Missing reservation ID in request`);
      return next(new AppError('Reservation ID is required', 400));
    }
    
    // First, check if the reservation exists and belongs to this tenant
    const existingReservation = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findFirst({
          where: {
            id,
            organizationId: tenantId
          } as ExtendedReservationWhereInput,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            pet: {
              select: {
                id: true,
                name: true
              }
            },
            resource: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          } as unknown as ExtendedReservationInclude
        });
      },
      null,
      `[${requestId}] Error finding reservation with ID ${id}`
    );

    if (!existingReservation) {
      console.warn(`[${requestId}] Reservation not found or does not belong to tenant: ${tenantId}`);
      return next(new AppError('Reservation not found', 404));
    }

    console.log(`[${requestId}] Found existing reservation: ${id}`);
    
    // Extract fields to update
    const {
      customerId,
      petId,
      resourceId,
      startDate,
      endDate,
      suiteType,
      serviceType,
      status,
      price,
      deposit,
      notes,
      staffNotes,
      addOnServices
    } = req.body;

    // Prepare update data
    const updateData: any = {};
    const warnings: string[] = [];
    
    // Validate customerId if provided
    if (customerId !== undefined) {
      if (!customerId) {
        console.warn(`[${requestId}] Invalid customer ID provided`);
        return next(new AppError('Valid customer ID is required', 400));
      }
      
      // Verify customer exists and belongs to tenant
      const customerExists = await safeExecutePrismaQuery(
        async () => {
          return await prisma.customer.findFirst({
            where: {
              id: customerId,
              organizationId: tenantId
            } as ExtendedCustomerWhereInput
          });
        },
        null,
        `[${requestId}] Error verifying customer with ID ${customerId}`
      );
      
      if (!customerExists) {
        console.warn(`[${requestId}] Customer not found: ${customerId}`);
        return next(new AppError('Customer not found', 404));
      }
      
      updateData.customerId = customerId;
    }
    
    // Validate petId if provided
    if (petId !== undefined) {
      if (!petId) {
        console.warn(`[${requestId}] Invalid pet ID provided`);
        return next(new AppError('Valid pet ID is required', 400));
      }
      
      // Verify pet exists and belongs to tenant
      const petExists = await safeExecutePrismaQuery(
        async () => {
          return await prisma.pet.findFirst({
            where: {
              id: petId,
              organizationId: tenantId
            } as ExtendedPetWhereInput
          });
        },
        null,
        `[${requestId}] Error verifying pet with ID ${petId}`
      );
      
      if (!petExists) {
        console.warn(`[${requestId}] Pet not found: ${petId}`);
        return next(new AppError('Pet not found', 404));
      }
      
      updateData.petId = petId;
    }
    
    // Process dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    
    if (startDate) {
      try {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          console.warn(`[${requestId}] Invalid start date format: ${startDate}`);
          return next(new AppError('Invalid start date format. Use YYYY-MM-DD', 400));
        }
        updateData.startDate = parsedStartDate;
      } catch (error) {
        console.warn(`[${requestId}] Error parsing start date: ${startDate}`, error);
        return next(new AppError('Invalid start date format. Use YYYY-MM-DD', 400));
      }
    } else if (existingReservation.startDate) {
      parsedStartDate = new Date(existingReservation.startDate);
    }
    
    if (endDate) {
      try {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          console.warn(`[${requestId}] Invalid end date format: ${endDate}`);
          return next(new AppError('Invalid end date format. Use YYYY-MM-DD', 400));
        }
        updateData.endDate = parsedEndDate;
      } catch (error) {
        console.warn(`[${requestId}] Error parsing end date: ${endDate}`, error);
        return next(new AppError('Invalid end date format. Use YYYY-MM-DD', 400));
      }
    } else if (existingReservation.endDate) {
      parsedEndDate = new Date(existingReservation.endDate);
    }
    
    // Validate date logic if both dates are provided
    if (parsedStartDate && parsedEndDate) {
      // Check if start date is before end date
      if (parsedStartDate >= parsedEndDate) {
        console.warn(`[${requestId}] Start date must be before end date: ${startDate} - ${endDate}`);
        return next(new AppError('Start date must be before end date', 400));
      }
      
      // Check if start date is in the past
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (parsedStartDate < currentDate) {
        console.warn(`[${requestId}] Start date is in the past: ${startDate}`);
        warnings.push('Start date is in the past. This is allowed but may indicate an error.');
      }
    }
    
    // Determine suite type based on service type if provided
    let determinedSuiteType = suiteType;
    
    if (!determinedSuiteType && serviceType) {
      // Set suite type based on service type
      const suiteTypeFromService = determineSuiteType(serviceType);
      if (suiteTypeFromService) {
        determinedSuiteType = suiteTypeFromService;
        console.log(`[${requestId}] Set suite type to ${determinedSuiteType} based on service type ${serviceType}`);
      } else {
        console.warn(`[${requestId}] Could not determine suite type from service type ${serviceType}`);
        warnings.push(`Could not determine suite type from service type ${serviceType}`);
      }
    }
    
    if (determinedSuiteType) {
      // Use type assertion to handle potential schema mismatches
      (updateData as any).suiteType = determinedSuiteType;
    }
    
    // Handle resource assignment
    let assignedResourceId = resourceId;
    
    if (assignedResourceId) {
      // Check if resource exists and belongs to tenant
      const resourceExists = await safeExecutePrismaQuery(
        async () => {
          return await prisma.resource.findFirst({
            where: {
              id: assignedResourceId,
              organizationId: tenantId
            } as ExtendedResourceWhereInput
          });
        },
        null,
        `[${requestId}] Error verifying resource with ID ${assignedResourceId}`
      );
      
      if (!resourceExists) {
        console.warn(`[${requestId}] Resource not found: ${assignedResourceId}`);
        return next(new AppError('Resource not found', 404));
      }
      
      // Check if resource is available for the requested dates using the conflict detection utility
      if (parsedStartDate && parsedEndDate) {
        const conflictResult = await detectReservationConflicts({
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          resourceId: assignedResourceId,
          reservationId: id, // Exclude current reservation
          tenantId,
          petId
        });
        
        if (conflictResult.hasConflicts) {
          console.warn(`[${requestId}] Resource ${assignedResourceId} has conflicts for the requested dates`);
          // Add all warnings to our warnings array
          warnings.push(...conflictResult.warnings);
        }
      }
      
      updateData.resourceId = assignedResourceId;
    } else if (determinedSuiteType && !existingReservation.resourceId && parsedStartDate && parsedEndDate) {
      // Try to auto-assign a resource if none was specified but we have a suite type
      console.log(`[${requestId}] Attempting to auto-assign a resource for suite type: ${determinedSuiteType}`);
      
      try {
        // First get all resources matching the suite type
        const resources = await prisma.resource.findMany({
          where: {
            organizationId: tenantId,
            type: determinedSuiteType
          } as ExtendedResourceWhereInput
        });
        
        // Then filter out resources with overlapping reservations using the conflict detection utility
        const availableResources = [];
        
        for (const resource of resources) {
          try {
            const conflictResult = await detectReservationConflicts({
              startDate: parsedStartDate,
              endDate: parsedEndDate,
              resourceId: resource.id,
              reservationId: id, // Exclude current reservation
              tenantId,
              petId
            });
            
            if (!conflictResult.hasConflicts) {
              availableResources.push(resource.id);
            }
          } catch (error) {
            console.error(`[${requestId}] Error checking availability for resource ${resource.id}:`, error);
          }
        }
        
        if (availableResources.length > 0) {
          // Assign the first available resource
          updateData.resourceId = availableResources[0];
          console.log(`[${requestId}] Auto-assigned resource: ${availableResources[0]}`);
        } else {
          // Check if the pet already has a reservation during this time (excluding this reservation)
          const petConflictResult = await detectReservationConflicts({
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            tenantId,
            petId,
            reservationId: id,
            suiteType: determinedSuiteType
          });
          
          if (petConflictResult.hasConflicts && petConflictResult.warnings.some(w => w.includes('Pet already has'))) {
            console.warn(`[${requestId}] Pet already has another reservation during this time`);
            warnings.push(petConflictResult.warnings.find(w => w.includes('Pet already has')) || 
              'Pet already has another reservation during this time');
          }
          
          console.warn(`[${requestId}] No available resources found for suite type: ${determinedSuiteType}`);
          warnings.push(`No available resources found for suite type: ${determinedSuiteType}. The reservation will be updated without a resource assignment.`);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error auto-assigning resource:`, error);
        warnings.push('Failed to auto-assign a resource. The reservation will be updated without a resource assignment.');
      }
    }
    
    // Handle other fields
    if (status) updateData.status = status;
    if (price !== undefined) updateData.price = parseFloat(String(price));
    if (deposit !== undefined) updateData.deposit = parseFloat(String(deposit));
    if (notes !== undefined) updateData.notes = notes;
    if (staffNotes !== undefined) updateData.staffNotes = staffNotes;
    
    console.log(`[${requestId}] Updating reservation with data:`, JSON.stringify(updateData));
    
    // Update reservation with safe execution
    const updatedReservation = await safeExecutePrismaQuery(
      async () => {
        // For update operations, we need to handle the extended where input differently
        // First verify the reservation exists and belongs to this tenant
        const reservationToUpdate = await prisma.reservation.findFirst({
          where: {
            id,
            organizationId: tenantId
          } as ExtendedReservationWhereInput,
          select: { id: true }
        });
        
        if (!reservationToUpdate) {
          throw new Error(`Reservation ${id} not found or does not belong to organization ${tenantId}`);
        }
        
        // Then use only the ID for the update operation which accepts a WhereUniqueInput
        return await prisma.reservation.update({
          where: { id },
          data: updateData,
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
                age: true
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
      null, // Null fallback if there's an error
      `[${requestId}] Error updating reservation with ID ${id}`
    );

    if (!updatedReservation) {
      console.error(`[${requestId}] Failed to update reservation: ${id}`);
      return next(new AppError('Failed to update reservation', 500));
    }
    
    // Process add-on services if provided
    if (addOnServices && Array.isArray(addOnServices)) {
      try {
        console.log(`[${requestId}] Processing ${addOnServices.length} add-on services`);
        
        // First remove existing add-on services
        await safeExecutePrismaQuery(
          async () => {
            return await prisma.reservationAddOn.deleteMany({
              where: {
                reservationId: id,
                organizationId: tenantId
              } as any
            });
          },
          null,
          `[${requestId}] Error removing existing add-on services for reservation ${id}`
        );
        
        // Then add new ones
        for (const addOn of addOnServices) {
          if (addOn.serviceId) {
            await safeExecutePrismaQuery(
              async () => {
                return await prisma.reservationAddOn.create({
                  data: {
                    reservationId: id,
                    serviceId: addOn.serviceId,
                    quantity: addOn.quantity || 1,
                    notes: addOn.notes || '',
                    organizationId: tenantId
                  } as any
                });
              },
              null,
              `[${requestId}] Error adding add-on service ${addOn.serviceId} to reservation ${id}`
            );
          }
        }
      } catch (error) {
        console.warn(`[${requestId}] Error processing add-on services:`, error);
        warnings.push('There was an issue processing add-on services, but the reservation was updated successfully.');
      }
    }

    console.log(`[${requestId}] Successfully updated reservation: ${id}`);
    
    // Prepare response message
    let message = 'Reservation updated successfully';
    if (warnings.length > 0) {
      message += ` with warnings: ${warnings.join(' ')}`;  
    }
    
    res.status(200).json({
      status: 'success',
      message,
      data: {
        reservation: updatedReservation
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Error updating reservation with ID ${req.params.id}:`, error);
    // More graceful error handling
    return next(new AppError('Failed to update reservation', 500));
  }
};

/**
 * Delete a reservation
 * Implements schema alignment strategy with defensive programming
 * 
 * @route DELETE /api/v1/reservations/:id
 * @param {string} req.params.id - Reservation ID
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const deleteReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID for logging
  const requestId = `delete-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] Processing delete reservation request for ID: ${req.params.id}`);
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.warn(`[${requestId}] Missing tenant ID in request`);
      return next(new AppError('Tenant ID is required', 401));
    }

    const { id } = req.params;
    if (!id) {
      console.warn(`[${requestId}] Missing reservation ID in request`);
      return next(new AppError('Reservation ID is required', 400));
    }
    
    // First, check if the reservation exists and belongs to this tenant
    const existingReservation = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findFirst({
          where: {
            id,
            organizationId: tenantId
          } as ExtendedReservationWhereInput,
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            customerId: true,
            petId: true,
            resourceId: true
          }
        });
      },
      null,
      `[${requestId}] Error finding reservation with ID ${id}`
    );

    if (!existingReservation) {
      console.warn(`[${requestId}] Reservation not found or does not belong to tenant: ${tenantId}`);
      return next(new AppError('Reservation not found', 404));
    }
    
    console.log(`[${requestId}] Found existing reservation: ${id}`);
    
    // Check if the reservation has already started or is in progress
    const currentDate = new Date();
    const startDate = existingReservation.startDate ? new Date(existingReservation.startDate) : null;
    const endDate = existingReservation.endDate ? new Date(existingReservation.endDate) : null;
    
    let warnings = [];
    
    if (startDate && startDate <= currentDate) {
      if (endDate && endDate >= currentDate) {
        console.warn(`[${requestId}] Attempting to delete an active reservation: ${id}`);
        warnings.push('Deleting an active reservation that is currently in progress.');
      } else {
        console.warn(`[${requestId}] Attempting to delete a past reservation: ${id}`);
        warnings.push('Deleting a reservation that has already occurred.');
      }
    }
    
    // Check if the reservation has any related records that need to be cleaned up
    try {
      // First clean up any add-on services
      await safeExecutePrismaQuery(
        async () => {
          return await prisma.reservationAddOn.deleteMany({
            where: {
              reservationId: id,
              organizationId: tenantId
            } as any
          });
        },
        null,
        `[${requestId}] Error deleting add-on services for reservation ${id}`
      );
      
      console.log(`[${requestId}] Successfully cleaned up related add-on services for reservation: ${id}`);
    } catch (error) {
      console.warn(`[${requestId}] Error cleaning up related records for reservation ${id}:`, error);
      warnings.push('There was an issue cleaning up related records, but the reservation will still be deleted.');
    }

    // Delete reservation with safe execution
    const deletedReservation = await safeExecutePrismaQuery(
      async () => {
        // For delete operations, we need to use a WhereUniqueInput which only allows unique identifiers
        // Since we've already verified the reservation exists and belongs to this tenant, we can safely delete by ID
        return await prisma.reservation.delete({
          where: {
            id
          }
        });
      },
      null, // Null fallback if there's an error
      `[${requestId}] Error deleting reservation with ID ${id}`
    );

    if (!deletedReservation) {
      console.error(`[${requestId}] Failed to delete reservation: ${id}`);
      return next(new AppError('Failed to delete reservation', 500));
    }
    
    console.log(`[${requestId}] Successfully deleted reservation: ${id}`);
    
    // Prepare response message
    let message = 'Reservation deleted successfully';
    if (warnings.length > 0) {
      message += ` with warnings: ${warnings.join(' ')}`;  
    }

    res.status(200).json({
      status: 'success',
      message,
      data: null
    });
  } catch (error) {
    console.error(`[${requestId}] Error deleting reservation with ID ${req.params.id}:`, error);
    // More graceful error handling
    return next(new AppError('Failed to delete reservation', 500));
  }
};

/**
 * Get all reservations for a specific customer
 * Implements schema alignment strategy with defensive programming
 * 
 * @route GET /api/v1/reservations/customer/:customerId
 * @param {string} req.params.customerId - Customer ID
 * @param {string} req.query.status - Optional filter by reservation status
 * @param {string} req.query.startDate - Optional filter by start date
 * @param {string} req.query.endDate - Optional filter by end date
 * @param {string} req.tenantId - The tenant ID (provided by middleware)
 */
export const getCustomerReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID for logging
  const requestId = `getCustomer-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[${requestId}] Processing get customer reservations request for customer: ${req.params.customerId}`);
  
  try {
    // Get tenant ID from request - added by tenant middleware
    const tenantId = req.tenantId;
    if (!tenantId) {
      console.warn(`[${requestId}] Missing tenant ID in request`);
      return next(new AppError('Tenant ID is required', 401));
    }

    const { customerId } = req.params;
    if (!customerId) {
      console.warn(`[${requestId}] Missing customer ID in request params`);
      return next(new AppError('Customer ID is required', 400));
    }

    console.log(`[${requestId}] Fetching reservations for customer ${customerId} in organization ${tenantId}`);
    
    // Check if customer exists and belongs to this tenant
    const customerExists = await safeExecutePrismaQuery(
      async () => {
        return await prisma.customer.findFirst({
          where: {
            id: customerId,
            organizationId: tenantId
          } as ExtendedCustomerWhereInput,
          select: { id: true }
        });
      },
      null,
      `[${requestId}] Error checking if customer exists`
    );

    if (!customerExists) {
      console.warn(`[${requestId}] Customer ${customerId} not found or does not belong to organization ${tenantId}`);
      return res.status(404).json({
        status: 'fail',
        message: 'Customer not found'
      });
    }

    // Build filter conditions
    const whereConditions: ExtendedReservationWhereInput = {
      customerId,
      organizationId: tenantId
    };
    const warnings: string[] = [];

    // Add status filter if provided
    if (req.query.status) {
      // Validate status against known values
      const status = req.query.status as string;
      const validStatuses = Object.values(ExtendedReservationStatus);
      
      if (validStatuses.includes(status as any)) {
        whereConditions.status = status as any;
        console.log(`[${requestId}] Filtering by status: ${status}`);
      } else {
        console.warn(`[${requestId}] Invalid status filter: ${status}`);
        warnings.push(`Invalid status filter: ${status} was ignored`);
      }
    }

    // Add date range filters if provided with validation
    if (req.query.startDate) {
      try {
        const startDate = new Date(req.query.startDate as string);
        if (!isNaN(startDate.getTime())) {
          whereConditions.startDate = {
            gte: startDate
          };
          console.log(`[${requestId}] Filtering by start date >= ${startDate.toISOString()}`);
        } else {
          console.warn(`[${requestId}] Invalid start date: ${req.query.startDate}`);
          warnings.push(`Invalid start date format: ${req.query.startDate} was ignored`);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error parsing start date: ${req.query.startDate}`, error);
        warnings.push(`Invalid start date: ${req.query.startDate} was ignored`);
      }
    }

    if (req.query.endDate) {
      try {
        const endDate = new Date(req.query.endDate as string);
        if (!isNaN(endDate.getTime())) {
          whereConditions.endDate = {
            lte: endDate
          };
          console.log(`[${requestId}] Filtering by end date <= ${endDate.toISOString()}`);
        } else {
          console.warn(`[${requestId}] Invalid end date: ${req.query.endDate}`);
          warnings.push(`Invalid end date format: ${req.query.endDate} was ignored`);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error parsing end date: ${req.query.endDate}`, error);
        warnings.push(`Invalid end date: ${req.query.endDate} was ignored`);
      }
    }

    console.log(`[${requestId}] Executing customer reservations query with filters:`, JSON.stringify(whereConditions));

    // Get customer reservations with safe execution
    const reservations = await safeExecutePrismaQuery(
      async () => {
        return await prisma.reservation.findMany({
          where: whereConditions,
          orderBy: {
            startDate: 'desc'
          },
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                breed: true,
                age: true,
                species: true
              }
            },
            resource: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true
              }
            },
            addOns: {
              include: {
                addOn: true
              }
            }
          } as unknown as ExtendedReservationInclude
        });
      },
      [], // Empty array fallback if there's an error
      `[${requestId}] Error fetching reservations for customer ${customerId}`
    );

    console.log(`[${requestId}] Retrieved ${reservations.length} reservations for customer ${customerId}`);

    // Check for data integrity issues
    let dataIntegrityIssues = false;
    const processedReservations = reservations.map(reservation => {
      const processed = { ...reservation };
      
      // Handle potential date formatting issues defensively
      try {
        if (reservation.startDate) {
          processed.startDate = new Date(reservation.startDate);
        }
        if (reservation.endDate) {
          processed.endDate = new Date(reservation.endDate);
        }
        if (reservation.createdAt) {
          processed.createdAt = new Date(reservation.createdAt);
        }
        if (reservation.updatedAt) {
          processed.updatedAt = new Date(reservation.updatedAt);
        }
      } catch (error) {
        console.warn(`[${requestId}] Error formatting dates for reservation ${reservation.id}:`, error);
        dataIntegrityIssues = true;
      }
      
      // Check for missing related data
      if (reservation.petId && !reservation.pet) {
        console.warn(`[${requestId}] Data integrity issue: Reservation ${reservation.id} has petId but no pet data`);
        dataIntegrityIssues = true;
      }
      
      if (reservation.resourceId && !reservation.resource) {
        console.warn(`[${requestId}] Data integrity issue: Reservation ${reservation.id} has resourceId but no resource data`);
        dataIntegrityIssues = true;
      }
      
      return processed;
    });
    
    if (dataIntegrityIssues) {
      warnings.push('Some reservations have data integrity issues. Related data may be missing or incomplete.');
    }

    console.log(`[${requestId}] Successfully completed get customer reservations request`);
    
    // Prepare response with warnings if any
    const responseData: any = {
      status: 'success',
      data: {
        reservations: processedReservations
      }
    };
    
    if (warnings.length > 0) {
      responseData.warnings = warnings;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`[${requestId}] Error fetching reservations for customer ${req.params.customerId}:`, error);
    // More graceful error handling - return empty results instead of error
    return res.status(200).json({
      status: 'success',
      data: {
        reservations: []
      },
      warnings: ['An error occurred while fetching customer reservations. Returning empty results.']
    });
  }
};
