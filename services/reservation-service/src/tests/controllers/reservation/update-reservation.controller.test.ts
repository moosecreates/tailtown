import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as serviceUtils from '../../../utils/service';
import { logger } from '../../../utils/logger';
import * as reservationConflicts from '../../../utils/reservation-conflicts';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
    },
    pet: {
      findFirst: jest.fn(),
    },
    resource: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    reservationAddOn: {
      deleteMany: jest.fn(),
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
import { updateReservation } from '../../../controllers/reservation/update-reservation.controller';

describe('Update Reservation Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let prisma: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up mock request and response
    mockRequest = {
      params: { id: 'reservation-1' },
      body: {
        status: 'CONFIRMED',
        price: 150,
        notes: 'Updated notes',
        addOnServices: [
          { serviceId: 'service-1', quantity: 2, notes: 'Updated service notes' }
        ]
      },
      tenantId: 'tenant-1',
    } as Partial<Request>;
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Mock next function
    mockNext = jest.fn();
    
    // Get the mocked Prisma client
    prisma = new PrismaClient();
    
    // Mock existing reservation
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
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
      notes: 'Original notes',
      staffNotes: 'Original staff notes',
      organizationId: 'tenant-1',
      customer: {
        id: 'customer-1',
        firstName: 'John',
        lastName: 'Doe'
      },
      pet: {
        id: 'pet-1',
        name: 'Buddy'
      },
      resource: {
        id: 'resource-1',
        name: 'VIP Suite 1',
        type: 'KENNEL'
      }
    });
    
    // Mock detectReservationConflicts to return no conflicts by default
    (reservationConflicts.detectReservationConflicts as jest.Mock).mockResolvedValue({
      hasConflicts: false,
      warnings: []
    });
  });
  
  describe('updateReservation', () => {
    it('should update a reservation successfully with partial data', async () => {
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        serviceType: 'BOARDING',
        suiteType: 'KENNEL',
        status: 'CONFIRMED', // Updated
        price: 150, // Updated
        deposit: 25,
        notes: 'Updated notes', // Updated
        staffNotes: 'Original staff notes',
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
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify reservation was found first
      expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'reservation-1',
          organizationId: 'tenant-1'
        },
        include: expect.any(Object)
      });
      
      // Verify reservation was updated with correct data
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          status: 'CONFIRMED',
          price: 150,
          notes: 'Updated notes'
        },
        include: expect.any(Object)
      });
      
      // Verify existing add-ons were deleted
      expect(prisma.reservationAddOn.deleteMany).toHaveBeenCalledWith({
        where: {
          reservationId: 'reservation-1',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify new add-ons were created
      expect(prisma.reservationAddOn.create).toHaveBeenCalledWith({
        data: {
          reservationId: 'reservation-1',
          serviceId: 'service-1',
          quantity: 2,
          notes: 'Updated service notes',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reservation updated successfully',
        data: {
          reservation: mockUpdatedReservation
        }
      });
      
      // Verify logger success
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated reservation: reservation-1'),
        expect.any(Object)
      );
    });
    
    it('should update dates and check for conflicts', async () => {
      // Update request with new dates
      mockRequest.body = {
        startDate: '2025-07-01',
        endDate: '2025-07-05'
      };
      
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        // Other fields remain the same
      };
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify conflicts were checked
      expect(reservationConflicts.detectReservationConflicts).toHaveBeenCalledWith({
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        resourceId: 'resource-1',
        reservationId: 'reservation-1',
        tenantId: 'tenant-1',
        petId: undefined
      });
      
      // Verify reservation was updated with new dates
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-05')
        },
        include: expect.any(Object)
      });
    });
    
    it('should update resource and check for conflicts', async () => {
      // Update request with new resource
      mockRequest.body = {
        resourceId: 'resource-2'
      };
      
      // Mock resource verification
      (prisma.resource.findFirst as jest.Mock).mockResolvedValue({
        id: 'resource-2',
        name: 'Standard Suite 3',
        type: 'KENNEL',
        organizationId: 'tenant-1'
      });
      
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        resourceId: 'resource-2',
        // Other fields remain the same
      };
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify resource was verified
      expect(prisma.resource.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'resource-2',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify conflicts were checked
      expect(reservationConflicts.detectReservationConflicts).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        resourceId: 'resource-2',
        reservationId: 'reservation-1',
        tenantId: 'tenant-1',
        petId: undefined
      });
      
      // Verify reservation was updated with new resource
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          resourceId: 'resource-2'
        },
        include: expect.any(Object)
      });
    });
    
    it('should handle conflicts with warnings', async () => {
      // Update request with conflicting resource
      mockRequest.body = {
        resourceId: 'resource-2'
      };
      
      // Mock resource verification
      (prisma.resource.findFirst as jest.Mock).mockResolvedValue({
        id: 'resource-2',
        name: 'Standard Suite 3',
        type: 'KENNEL',
        organizationId: 'tenant-1'
      });
      
      // Mock conflicts
      (reservationConflicts.detectReservationConflicts as jest.Mock).mockResolvedValue({
        hasConflicts: true,
        warnings: ['Resource is partially booked during the requested period']
      });
      
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        resourceId: 'resource-2',
        // Other fields remain the same
      };
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify warnings were included in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('with warnings: Resource is partially booked during the requested period')
        })
      );
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Resource resource-2 has conflicts for the requested dates'),
        expect.any(Object)
      );
    });
    
    it('should auto-assign a resource if none exists and suite type is provided', async () => {
      // Existing reservation has no resource
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: null, // No resource assigned
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        serviceType: 'BOARDING',
        suiteType: 'KENNEL',
        organizationId: 'tenant-1'
      });
      
      // Update request with suite type
      mockRequest.body = {
        suiteType: 'KENNEL'
      };
      
      // Mock available resources
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'resource-1', type: 'KENNEL', organizationId: 'tenant-1' },
        { id: 'resource-2', type: 'KENNEL', organizationId: 'tenant-1' }
      ]);
      
      // First resource has conflicts, second is available
      (reservationConflicts.detectReservationConflicts as jest.Mock)
        .mockResolvedValueOnce({
          hasConflicts: true,
          warnings: ['Resource is already booked']
        })
        .mockResolvedValueOnce({
          hasConflicts: false,
          warnings: []
        });
      
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        resourceId: 'resource-2', // Auto-assigned
        suiteType: 'KENNEL'
      };
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify resources were fetched
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          type: 'KENNEL'
        }
      });
      
      // Verify reservation was updated with auto-assigned resource
      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resourceId: 'resource-2',
            suiteType: 'KENNEL'
          })
        })
      );
      
      // Verify logger info
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Auto-assigned resource: resource-2'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when tenant ID is missing', async () => {
      // Remove tenant ID
      mockRequest.tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
      expect(authErrorSpy).toHaveBeenCalledWith('Tenant ID is required');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing tenant ID in request'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when reservation ID is missing', async () => {
      // Remove reservation ID
      mockRequest.params = {};
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(validationErrorSpy).toHaveBeenCalledWith('Reservation ID is required');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing reservation ID in request'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when reservation does not exist', async () => {
      // Mock reservation not found
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Create a spy on AppError.notFoundError
      const notFoundErrorSpy = jest.spyOn(serviceUtils.AppError, 'notFoundError');
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
      expect(notFoundErrorSpy).toHaveBeenCalledWith('Reservation not found');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Reservation not found or does not belong to tenant'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when dates are invalid', async () => {
      // Set invalid dates
      mockRequest.body.startDate = 'invalid-date';
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(validationErrorSpy).toHaveBeenCalledWith('Invalid start date format. Use YYYY-MM-DD');
      
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
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(validationErrorSpy).toHaveBeenCalledWith('Start date must be before end date');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Start date must be before end date'),
        expect.any(Object)
      );
    });
    
    it('should auto-assign a resource when resourceId is not provided', async () => {
      // Remove resourceId from request
      delete mockRequest.body.resourceId;
      
      // Mock available resources
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([
        { id: 'resource-1', type: 'KENNEL', status: 'OCCUPIED' },
        { id: 'resource-2', type: 'KENNEL', status: 'AVAILABLE' }
      ]);
      
      // Mock conflict detection to return no conflicts first for resource check
      // then no conflicts for the final update
      (reservationConflicts.detectReservationConflicts as jest.Mock)
        .mockResolvedValueOnce({
          hasConflicts: false,
          warnings: []
        })
        .mockResolvedValueOnce({
          hasConflicts: false,
          warnings: []
        });
      
      // Mock updated reservation
      const mockUpdatedReservation = {
        id: 'reservation-1',
        resourceId: 'resource-2', // Auto-assigned
        suiteType: 'KENNEL'
      };
      
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdatedReservation);
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify resources were fetched
    expect(prisma.resource.findMany).toHaveBeenCalledWith({
      where: {
        organizationId: 'tenant-1',
        type: 'KENNEL'
      }
    });
    
    // Verify reservation was updated with auto-assigned resource
    expect(prisma.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resourceId: 'resource-2',
          suiteType: 'KENNEL'
        })
      })
    );
    
    it('should warn when start date is in the past', async () => {
      // Set start date in the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      mockRequest.body.startDate = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Mock updated reservation
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        startDate: pastDate
      });
      
      await updateReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify warning in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('with warnings: Start date is in the past')
        })
      );
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Start date is in the past'),
        expect.any(Object)
      );
    });
  });
});
