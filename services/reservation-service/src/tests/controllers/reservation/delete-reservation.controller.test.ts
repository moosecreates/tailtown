import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as serviceUtils from '../../../utils/service';
import { logger } from '../../../utils/logger';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    reservationAddOn: {
      deleteMany: jest.fn(),
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
import { deleteReservation } from '../../../controllers/reservation/delete-reservation.controller';

describe('Delete Reservation Controller', () => {
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
      tenantId: 'tenant-1',
    } as Partial<Request> & { tenantId: string };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Mock next function
    mockNext = jest.fn();
    
    // Get the mocked Prisma client
    prisma = new PrismaClient();
    
    // Mock existing reservation with future dates by default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days in the future
    
    const futureEndDate = new Date(futureDate);
    futureEndDate.setDate(futureEndDate.getDate() + 5); // 15 days in the future
    
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
      id: 'reservation-1',
      status: 'CONFIRMED',
      startDate: futureDate,
      endDate: futureEndDate,
      customerId: 'customer-1',
      petId: 'pet-1',
      resourceId: 'resource-1',
      organizationId: 'tenant-1'
    });
  });
  
  describe('deleteReservation', () => {
    it('should delete a reservation successfully', async () => {
      // Mock successful deletion
      (prisma.reservationAddOn.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.reservation.delete as jest.Mock).mockResolvedValue({
        id: 'reservation-1'
      });
      
      await deleteReservation(
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
        select: expect.objectContaining({
          id: true,
          status: true
        })
      });
      
      // Verify add-ons were deleted
      expect(prisma.reservationAddOn.deleteMany).toHaveBeenCalledWith({
        where: {
          reservationId: 'reservation-1',
          organizationId: 'tenant-1'
        }
      });
      
      // Verify reservation was deleted
      expect(prisma.reservation.delete).toHaveBeenCalledWith({
        where: {
          id: 'reservation-1'
        }
      });
      
      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reservation deleted successfully',
        data: null
      });
      
      // Verify logger success
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully deleted reservation: reservation-1'),
        expect.any(Object)
      );
    });
    
    it('should warn when deleting an active reservation', async () => {
      // Mock an active reservation (started but not ended)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2); // 2 days ago
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3); // 3 days in the future
      
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        status: 'CONFIRMED',
        startDate: pastDate,
        endDate: futureDate,
        organizationId: 'tenant-1'
      });
      
      await deleteReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify warning in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('with warnings: Deleting an active reservation that is currently in progress')
        })
      );
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to delete an active reservation'),
        expect.any(Object)
      );
    });
    
    it('should warn when deleting a past reservation', async () => {
      // Mock a past reservation (both start and end dates in the past)
      const pastStartDate = new Date();
      pastStartDate.setDate(pastStartDate.getDate() - 10); // 10 days ago
      
      const pastEndDate = new Date();
      pastEndDate.setDate(pastEndDate.getDate() - 5); // 5 days ago
      
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 'reservation-1',
        status: 'COMPLETED',
        startDate: pastStartDate,
        endDate: pastEndDate,
        organizationId: 'tenant-1'
      });
      
      await deleteReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify warning in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('with warnings: Deleting a reservation that has already occurred')
        })
      );
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to delete a past reservation'),
        expect.any(Object)
      );
    });
    
    it('should handle errors when cleaning up related records', async () => {
      // Mock error when deleting add-ons
      (prisma.reservationAddOn.deleteMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      
      // Mock successful reservation deletion
      (prisma.reservation.delete as jest.Mock).mockResolvedValue({
        id: 'reservation-1'
      });
      
      await deleteReservation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify warning in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('with warnings: There was an issue cleaning up related records')
        })
      );
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error cleaning up related records'),
        expect.any(Object)
      );
      
      // Verify reservation was still deleted
      expect(prisma.reservation.delete).toHaveBeenCalledWith({
        where: {
          id: 'reservation-1'
        }
      });
    });
    
    it('should throw an error when tenant ID is missing', async () => {
      // Remove tenant ID
      (mockRequest as any).tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      await deleteReservation(
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
      
      await deleteReservation(
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
      
      await deleteReservation(
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
  });
});
