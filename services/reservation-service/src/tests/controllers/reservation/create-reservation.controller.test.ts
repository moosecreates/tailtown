import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as serviceUtils from '../../../utils/service';
import { logger } from '../../../utils/logger';
import * as reservationConflicts from '../../../utils/reservation-conflicts';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    customer: {
      findFirstOrThrow: jest.fn(),
    },
    pet: {
      findFirstOrThrow: jest.fn(),
    },
    resource: {
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
    reservationAddOn: {
      create: jest.fn(),
    }
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    debug: jest.fn(),
  }
}));

// Mock the reservation conflicts utility
jest.mock('../../../utils/reservation-conflicts', () => ({
  detectReservationConflicts: jest.fn(),
}));

// Mock the service utilities
jest.mock('../../../utils/service', () => {
  // Create a mock AppError class
  class MockAppError extends Error {
    statusCode: number;
    type: string;
    details?: any;
    isOperational: boolean;
    
    constructor(message: string, statusCode: number, details?: any, isOperational = true) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.details = details;
      
      // Map status code to error type
      if (statusCode === 400) this.type = 'VALIDATION_ERROR';
      else if (statusCode === 401) this.type = 'UNAUTHORIZED_ERROR';
      else if (statusCode === 403) this.type = 'FORBIDDEN_ERROR';
      else if (statusCode === 404) this.type = 'NOT_FOUND_ERROR';
      else if (statusCode === 409) this.type = 'CONFLICT_ERROR';
      else this.type = 'SERVER_ERROR';
    }
    
    static validationError(message: string, details?: any): MockAppError {
      return new MockAppError(message, 400, details, true);
    }
    
    static authorizationError(message: string, details?: any): MockAppError {
      return new MockAppError(message, 401, details, true);
    }
    
    static notFoundError(message: string, details?: any): MockAppError {
      return new MockAppError(message, 404, details, true);
    }
    
    static conflictError(message: string, details?: any): MockAppError {
      return new MockAppError(message, 409, details, true);
    }
  }
  
  return {
    AppError: MockAppError,
    safeExecutePrismaQuery: jest.fn().mockImplementation((fn, fallback, errorMessage, throwError) => {
      if (throwError) {
        return fn();
      } else {
        try {
          return fn();
        } catch (error) {
          return fallback;
        }
      }
    }),
  };
});

// Mock the prisma-helpers
jest.mock('../../../controllers/reservation/utils/prisma-helpers', () => {
  return {
    prisma: new (require('@prisma/client').PrismaClient)(),
    safeExecutePrismaQuery: require('../../../utils/service').safeExecutePrismaQuery,
  };
});

// Import the controller functions after mocking dependencies
import { createReservation } from '../../../controllers/reservation/create-reservation.controller';

describe('Create Reservation Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let prisma: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up mock request and response
    mockRequest = {
      body: {
        customerId: 'customer-1',
        petId: 'pet-1',
        startDate: '2025-06-10',
        endDate: '2025-06-15',
        serviceType: 'BOARDING',
        resourceId: 'resource-1',
        status: 'PENDING',
        price: 100,
        deposit: 25,
        notes: 'Customer notes',
        staffNotes: 'Staff notes',
        addOnServices: [
          { serviceId: 'service-1', quantity: 1, notes: 'Special instructions' }
        ]
      },
      tenantId: 'tenant-1',
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Get the mocked Prisma client
    prisma = new PrismaClient();
    
    // Mock detectReservationConflicts to return no conflicts by default
    (reservationConflicts.detectReservationConflicts as jest.Mock).mockResolvedValue({
      hasConflicts: false,
      warnings: []
    });
  });
  
  describe('createReservation', () => {
    it('should create a reservation successfully with all fields', async () => {
      // Mock customer, pet, and resource verification
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'pet-1',
        name: 'Buddy',
        organizationId: 'tenant-1'
      });
      
      (prisma.resource.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'resource-1',
        name: 'VIP Suite 1',
        type: 'KENNEL',
        organizationId: 'tenant-1'
      });
      
      // Mock reservation creation
      const mockNewReservation = {
        id: 'reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        serviceType: 'BOARDING',
        suiteType: 'KENNEL',
        status: 'PENDING',
        price: 100,
        deposit: 25,
        notes: 'Customer notes',
        staffNotes: 'Staff notes',
        organizationId: 'tenant-1',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890'
        },
        pet: {
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3
        },
        resource: {
          name: 'VIP Suite 1',
          type: 'KENNEL',
          location: 'Building A'
        }
      };
      
      (prisma.reservation.create as jest.Mock).mockResolvedValue(mockNewReservation);
      
      // Mock add-on service creation
      (prisma.reservationAddOn.create as jest.Mock).mockResolvedValue({
        id: 'addon-1',
        reservationId: 'reservation-1',
        serviceId: 'service-1',
        quantity: 1,
        notes: 'Special instructions',
        organizationId: 'tenant-1'
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // Verify customer was verified
      expect(prisma.customer.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: 'customer-1',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify pet was verified
      expect(prisma.pet.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: 'pet-1',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify resource was verified
      expect(prisma.resource.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: 'resource-1',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify conflicts were checked
      expect(reservationConflicts.detectReservationConflicts).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        resourceId: 'resource-1',
        tenantId: 'tenant-1'
      });
      
      // Verify reservation was created with correct data
      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: 'customer-1',
          petId: 'pet-1',
          resourceId: 'resource-1',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          serviceType: 'BOARDING',
          suiteType: 'KENNEL',
          status: 'PENDING',
          price: 100,
          deposit: 25,
          notes: 'Customer notes',
          staffNotes: 'Staff notes',
          organizationId: 'tenant-1'
        }),
        include: expect.any(Object)
      });
      
      // Verify add-on service was created
      expect(prisma.reservationAddOn.create).toHaveBeenCalledWith({
        data: {
          reservationId: 'reservation-1',
          serviceId: 'service-1',
          quantity: 1,
          notes: 'Special instructions',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 'success',
          data: {
            reservation: mockNewReservation
          }
        })
      );
      
      // Verify logger success
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Reservation created successfully'),
        expect.any(Object)
      );
    });
    
    it('should auto-determine suite type if not provided', async () => {
      // Remove suite type from request
      mockRequest.body.suiteType = undefined;
      
      // Mock dependencies
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'pet-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.resource.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'resource-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        suiteType: 'KENNEL'
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // Verify suite type was determined correctly
      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            suiteType: 'KENNEL'
          })
        })
      );
    });
    
    it('should auto-assign a resource if none provided', async () => {
      // Remove resource ID from request
      mockRequest.body.resourceId = undefined;
      
      // Mock dependencies
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'pet-1',
        organizationId: 'tenant-1'
      });
      
      // Mock available resources
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'resource-1', type: 'KENNEL', organizationId: 'tenant-1' },
        { id: 'resource-2', type: 'KENNEL', organizationId: 'tenant-1' }
      ]);
      
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: 'resource-1'
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // Verify resources were fetched
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          type: 'KENNEL'
        }
      });
      
      // Verify conflicts were checked for each resource
      expect(reservationConflicts.detectReservationConflicts).toHaveBeenCalledTimes(2);
      
      // Verify reservation was created with auto-assigned resource
      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resourceId: 'resource-1'
          })
        })
      );
    });
    
    it('should create a reservation without a resource if none available', async () => {
      // Remove resource ID from request
      mockRequest.body.resourceId = undefined;
      
      // Mock dependencies
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'pet-1',
        organizationId: 'tenant-1'
      });
      
      // Mock available resources but with conflicts
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'resource-1', type: 'KENNEL', organizationId: 'tenant-1' }
      ]);
      
      // Make all resources have conflicts
      (reservationConflicts.detectReservationConflicts as jest.Mock)
        .mockResolvedValueOnce({
          hasConflicts: true,
          warnings: ['Resource is already booked']
        })
        .mockResolvedValueOnce({
          hasConflicts: false,
          warnings: []
        });
      
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        resourceId: null
      });
      
      await createReservation(
        mockRequest as Request,
        mockResponse as Response
      );
      
      // Verify reservation was created without a resource
      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            resourceId: expect.anything()
          })
        })
      );
      
      // Verify response includes warning
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: expect.arrayContaining([
            expect.stringContaining('No available resources found')
          ])
        })
      );
    });
    
    it('should throw an error when tenant ID is missing', async () => {
      // Remove tenant ID
      mockRequest.tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the correct error was thrown
        expect(authErrorSpy).toHaveBeenCalledWith('Tenant ID is required');
        expect(error.statusCode).toBe(401);
      }
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing tenant ID in request'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when required fields are missing', async () => {
      // Remove required fields
      mockRequest.body = {
        petId: 'pet-1',
        startDate: '2025-06-10',
        endDate: '2025-06-15',
        serviceType: 'BOARDING'
      };
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the correct error was thrown
        expect(validationErrorSpy).toHaveBeenCalledWith('Customer ID is required');
        expect(error.statusCode).toBe(400);
      }
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing required field: customerId'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when dates are invalid', async () => {
      // Set invalid dates
      mockRequest.body.startDate = 'invalid-date';
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the correct error was thrown
        expect(validationErrorSpy).toHaveBeenCalledWith('Invalid start date format. Use YYYY-MM-DD');
        expect(error.statusCode).toBe(400);
      }
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid start date format'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when start date is after end date', async () => {
      // Set start date after end date
      mockRequest.body.startDate = '2025-06-20';
      mockRequest.body.endDate = '2025-06-15';
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the correct error was thrown
        expect(validationErrorSpy).toHaveBeenCalledWith('Start date must be before end date');
        expect(error.statusCode).toBe(400);
      }
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Start date must be before end date'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when customer does not exist', async () => {
      // Mock customer not found
      (prisma.customer.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('Customer not found')
      );
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify error was thrown
        expect(error.message).toContain('Error verifying customer');
      }
    });
    
    it('should throw an error when pet does not exist', async () => {
      // Mock customer found but pet not found
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('Pet not found')
      );
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify error was thrown
        expect(error.message).toContain('Error verifying pet');
      }
    });
    
    it('should throw an error when resource has conflicts', async () => {
      // Mock dependencies
      (prisma.customer.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'customer-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.pet.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'pet-1',
        organizationId: 'tenant-1'
      });
      
      (prisma.resource.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: 'resource-1',
        organizationId: 'tenant-1'
      });
      
      // Mock resource conflicts
      (reservationConflicts.detectReservationConflicts as jest.Mock).mockResolvedValue({
        hasConflicts: true,
        warnings: ['Resource is already booked for 2025-06-12 to 2025-06-14']
      });
      
      // Create a spy on AppError.conflictError
      const conflictErrorSpy = jest.spyOn(serviceUtils.AppError, 'conflictError');
      
      try {
        await createReservation(
          mockRequest as Request,
          mockResponse as Response
        );
        fail('Expected an error to be thrown');
      } catch (error) {
        // Verify the correct error was thrown
        expect(conflictErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Resource is not available for the requested dates')
        );
        expect(error.statusCode).toBe(409);
      }
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Resource resource-1 has conflicts for the requested dates'),
        expect.any(Object)
      );
    });
  });
});
