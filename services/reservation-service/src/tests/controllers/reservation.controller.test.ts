import { Request, Response, NextFunction } from 'express';

// Using the globally extended Express.Request type from src/types/express.d.ts
// which already includes tenantId: string
import { 
  createReservation, 
  updateReservation, 
  deleteReservation, 
  getReservationById 
} from '../../controllers/reservation/reservation.controller';
import { detectReservationConflicts } from '../../utils/reservation-conflicts';
import { PrismaClient } from '@prisma/client';
import { ExtendedReservationStatus } from '../../types/prisma-extensions';
import { AppError } from '../../utils/service';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    reservationAddOn: {
      deleteMany: jest.fn(),
    },
    resource: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
    },
    pet: {
      findFirst: jest.fn(),
    },
    invoice: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('../../utils/reservation-conflicts', () => ({
  detectReservationConflicts: jest.fn(),
}));

jest.mock('../../utils/service', () => ({
  AppError: jest.fn().mockImplementation((message, statusCode) => ({
    message,
    statusCode,
  })),
  safeExecutePrismaQuery: jest.fn().mockImplementation((fn, fallback) => fn()),
}));

// Get the mocked instances
const prisma = new PrismaClient();
const mockDetectReservationConflicts = detectReservationConflicts as jest.MockedFunction<typeof detectReservationConflicts>;

describe('Reservation Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    // Use type assertion to handle tenantId which is added by middleware
    mockRequest = {
      body: {
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: '2025-06-10',
        endDate: '2025-06-15',
        suiteType: 'STANDARD_SUITE',
        status: 'CONFIRMED',
      },
      params: {},
    } as Request;
    
    // Add tenantId property using our schema alignment strategy
    // This follows our defensive programming approach for middleware-added properties
    Object.defineProperty(mockRequest, 'tenantId', {
      value: 'tenant-1',
      configurable: true
    });
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
    
    // Mock successful customer and pet lookups by default
    (prisma.customer.findFirst as jest.Mock).mockResolvedValue({ id: 'customer-1' });
    (prisma.pet.findFirst as jest.Mock).mockResolvedValue({ id: 'pet-1' });
  });

  describe('createReservation', () => {
    it('should create a reservation when there are no conflicts', async () => {
      // Mock no conflicts
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: false,
        conflictingReservations: [],
        warnings: [],
      });
      
      // Mock successful reservation creation
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'new-reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        status: 'CONFIRMED',
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify conflict detection was called
      expect(mockDetectReservationConflicts).toHaveBeenCalled();
      
      // Verify reservation was created
      expect(prisma.reservation.create).toHaveBeenCalled();
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.any(Object)
        })
      );
      
      // Verify next was not called (no error)
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should return error when customer does not exist', async () => {
      // Mock customer not found - IMPORTANT: Reset this mock to return null
      (prisma.customer.findFirst as jest.Mock).mockReset().mockResolvedValue(null);
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Customer not found')
        })
      );
      
      // Verify reservation was not created
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });
    
    it('should return error when pet does not exist', async () => {
      // Mock customer exists but pet not found - IMPORTANT: Reset the pet mock to return null
      (prisma.pet.findFirst as jest.Mock).mockReset().mockResolvedValue(null);
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Pet not found')
        })
      );
      
      // Verify reservation was not created
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });
    
    it('should return error when dates are invalid', async () => {
      // Setup request with invalid dates
      mockRequest.body = {
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: '2025-06-15', // Start date after end date
        endDate: '2025-06-10',
        suiteType: 'STANDARD_SUITE',
      };
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error - Updated to match actual error message
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Start date must be before end date')
        })
      );
      
      // Verify reservation was not created
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });
    
    it('should auto-assign resource when none is provided', async () => {
      // Setup request with no resourceId
      mockRequest.body = {
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: '2025-06-10',
        endDate: '2025-06-15',
        suiteType: 'STANDARD_SUITE',
      };
      
      // Mock no conflicts
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: false,
        conflictingReservations: [],
        warnings: [],
      });
      
      // Mock available resources
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'resource-1', type: 'STANDARD_SUITE' },
        { id: 'resource-2', type: 'STANDARD_SUITE' }
      ]);
      
      // Mock successful reservation creation
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'new-reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: 'resource-1', // Auto-assigned resource
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        status: 'CONFIRMED',
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify resource was auto-assigned
      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resourceId: 'resource-1'
          })
        })
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.any(Object)
        })
      );
    });

    it('should return conflict error when resource has conflicts', async () => {
      // Mock resource conflicts
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: true,
        conflictingReservations: [{ id: 'conflict-1' }],
        warnings: ['Resource is not available for the requested dates. There are 1 overlapping reservations.'],
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify conflict detection was called
      expect(mockDetectReservationConflicts).toHaveBeenCalled();
      
      // Verify next was called with conflict error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Resource is not available for the requested dates. There are 1 overlapping reservations.',
        })
      );
      
      // Verify reservation was not created
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should return conflict error when pet has conflicts', async () => {
      // Setup request with pet ID and dates but no resourceId
      mockRequest.body = {
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: '2025-06-10',
        endDate: '2025-06-15',
        suiteType: 'STANDARD_SUITE',
      };
      
      // Mock no available resources to force pet conflict check
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock pet conflicts
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: true,
        conflictingReservations: [{ id: 'conflict-1' }],
        warnings: ['Pet already has 1 overlapping reservation(s) during the requested dates.'],
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify conflict detection was called
      expect(mockDetectReservationConflicts).toHaveBeenCalled();
      
      // Verify next was called with conflict error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Pet already has 1 overlapping reservation(s) during the requested dates.',
        })
      );
      
      // Verify reservation was not created
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateReservation', () => {
    it('should update a reservation when there are no conflicts', async () => {
      // Setup request with reservation ID in params and updated data in body
      mockRequest.params = { id: 'reservation-1' };
      mockRequest.body = {
        startDate: '2025-06-12',
        endDate: '2025-06-17',
      };
      
      // Mock existing reservation
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED'
      }).mockResolvedValueOnce({
        id: 'reservation-1'
      });
      
      // Mock no conflicts
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: false,
        conflictingReservations: [],
        warnings: [],
      });
      
      // Mock successful update
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        startDate: new Date('2025-06-12'),
        endDate: new Date('2025-06-17'),
        status: 'CONFIRMED'
      });
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify conflict detection was called
      expect(mockDetectReservationConflicts).toHaveBeenCalled();
      
      // Verify reservation was updated
      expect(prisma.reservation.update).toHaveBeenCalled();
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.any(Object)
        })
      );
    });
    
    it('should include conflict warnings when updating with resource conflicts', async () => {
      // Mock resource conflicts with the exact warning message
      mockDetectReservationConflicts.mockResolvedValue({
        hasConflicts: true,
        conflictingReservations: [{ id: 'conflict-1' }],
        warnings: ['Pet already has 1 overlapping reservation(s) during the requested dates.'],
      });
      
      // Setup request with reservation ID in params and new resource in body
      mockRequest.params = { id: 'reservation-1' };
      mockRequest.body = {
        resourceId: 'resource-2',
      };
      
      // Mock existing reservation
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED'
      }).mockResolvedValueOnce({
        id: 'reservation-1'
      });
      
      // Mock resource exists
      (prisma.resource.findFirst as jest.Mock).mockResolvedValue({ id: 'resource-2' });
      
      // Mock successful update
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-2',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        status: 'CONFIRMED'
      });
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify conflict detection was called
      expect(mockDetectReservationConflicts).toHaveBeenCalled();
      
      // Verify reservation was updated despite conflicts (which are added as warnings)
      expect(prisma.reservation.update).toHaveBeenCalled();
      
      // Verify response includes success status and warning message
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('Pet already has 1 overlapping reservation')
        })
      );
    });
    
    it('should return error when reservation does not exist', async () => {
      // Setup request with non-existent reservation ID
      mockRequest.params = { id: 'non-existent-reservation' };
      mockRequest.body = {
        startDate: '2025-06-12',
        endDate: '2025-06-17',
      };
      
      // Mock reservation not found
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Reservation not found')
        })
      );
      
      // Verify reservation was not updated
      expect(prisma.reservation.update).not.toHaveBeenCalled();
    });
    
    it('should return error when dates are invalid', async () => {
      // Setup request with invalid dates
      mockRequest.params = { id: 'reservation-1' };
      mockRequest.body = {
        startDate: '2025-06-17', // Start date after end date
        endDate: '2025-06-12',
      };
      
      // Mock existing reservation
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED'
      });
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error - Updated to match actual error message
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Start date must be before end date')
        })
      );
      
      // Verify reservation was not updated
      expect(prisma.reservation.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteReservation', () => {
    it('should delete a reservation successfully', async () => {
      // Setup request with reservation ID
      mockRequest.params = { id: 'reservation-1' };
      
      // Mock existing reservation
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED'
      });
      
      // Mock successful deletion of add-ons
      (prisma.reservationAddOn.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      
      // Mock successful deletion
      (prisma.reservation.delete as jest.Mock).mockResolvedValue({
        id: 'reservation-1'
      });
      
      await deleteReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify add-ons were deleted
      expect(prisma.reservationAddOn.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reservationId: 'reservation-1',
            organizationId: 'tenant-1'
          })
        })
      );
      
      // Verify reservation was deleted
      expect(prisma.reservation.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'reservation-1'
          })
        })
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('Reservation deleted successfully')
        })
      );
    });
    
    it('should return error when reservation does not exist', async () => {
      // Setup request with non-existent reservation ID
      mockRequest.params = { id: 'non-existent-reservation' };
      
      // Mock reservation not found
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      
      await deleteReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Reservation not found')
        })
      );
      
      // Verify reservation was not deleted
      expect(prisma.reservation.delete).not.toHaveBeenCalled();
      expect(prisma.reservationAddOn.deleteMany).not.toHaveBeenCalled();
    });
  });
  
  describe('getReservationById', () => {
    it('should get a reservation by ID successfully', async () => {
      // Setup request with reservation ID
      mockRequest.params = { id: 'reservation-1' };
      
      // Mock existing reservation with related data
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED',
        pet: {
          id: 'pet-1',
          name: 'Fluffy',
          breed: 'Golden Retriever'
        },
        customer: {
          id: 'customer-1',
          firstName: 'John',
          lastName: 'Doe'
        },
        resource: {
          id: 'resource-1',
          name: 'Suite 101',
          type: 'STANDARD_SUITE'
        },
        addOns: [
          {
            id: 'addon-1',
            addOn: {
              id: 'addon-type-1',
              name: 'Bath',
              price: 25.00
            }
          }
        ]
      });
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            reservation: expect.objectContaining({
              id: 'reservation-1',
              pet: expect.objectContaining({
                name: 'Fluffy'
              }),
              customer: expect.objectContaining({
                firstName: 'John'
              })
            })
          })
        })
      );
    });
    
    it('should return error when reservation does not exist', async () => {
      // Setup request with non-existent reservation ID
      mockRequest.params = { id: 'non-existent-reservation' };
      
      // Mock reservation not found
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Reservation not found')
        })
      );
    });
    
    it('should handle schema misalignment gracefully', async () => {
      // Setup request with reservation ID
      mockRequest.params = { id: 'reservation-1' };
      
      // Mock existing reservation but with missing related data (schema misalignment)
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        petId: 'pet-1',
        customerId: 'customer-1',
        status: 'CONFIRMED'
        // Missing pet, customer, resource data
      });
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // Verify response still succeeds but with warnings
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            reservation: expect.objectContaining({
              id: 'reservation-1'
            })
          }),
          warnings: expect.arrayContaining([
            expect.stringContaining('Customer data missing'),
            expect.stringContaining('Pet data missing'),
            expect.stringContaining('Resource data missing')
          ])
        })
      );
    });
  });
});
