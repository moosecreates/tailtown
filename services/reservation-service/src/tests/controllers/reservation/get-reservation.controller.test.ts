import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as serviceUtils from '../../../utils/service';
import { logger } from '../../../utils/logger';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
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
      try {
        return fn();
      } catch (error) {
        if (throwError) {
          throw error;
        }
        return fallback;
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

// Mock the catchAsync middleware to pass errors to next function
jest.mock('../../../middleware/catchAsync', () => ({
  catchAsync: (fn: Function) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}));

// Import the controller functions after mocking dependencies
import { 
  getAllReservations, 
  getReservationById 
} from '../../../controllers/reservation/get-reservation.controller';

describe('Get Reservation Controller', () => {
  let mockRequest: Partial<Request> & { tenantId?: string };
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let prisma: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up mock request and response
    mockRequest = {
      params: {},
      query: {},
      tenantId: 'tenant-1',
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Mock next function
    mockNext = jest.fn();
    
    // Get the mocked Prisma client
    prisma = new PrismaClient();
    
    // Set up default mock responses for Prisma queries
    (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.reservation.count as jest.Mock).mockResolvedValue(0);
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
  });
  
  describe('getAllReservations', () => {
    it('should return all reservations with pagination', async () => {
      // Mock reservations
      const mockReservations = [
        {
          id: 'reservation-1',
          customerId: 'customer-1',
          petId: 'pet-1',
          resourceId: 'resource-1',
          startDate: new Date('2025-06-10'),
          endDate: new Date('2025-06-15'),
          status: 'CONFIRMED',
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
            type: 'VIP_SUITE',
            location: 'Building A'
          },
        },
        {
          id: 'reservation-2',
          customerId: 'customer-2',
          petId: 'pet-2',
          resourceId: 'resource-2',
          startDate: new Date('2025-06-20'),
          endDate: new Date('2025-06-25'),
          status: 'PENDING',
          organizationId: 'tenant-1',
          customer: { 
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '987-654-3210'
          },
          pet: { 
            name: 'Max',
            breed: 'Labrador',
            age: 2
          },
          resource: { 
            name: 'Standard Suite 3',
            type: 'STANDARD_SUITE',
            location: 'Building B'
          },
        }
      ];
      
      // Mock reservations and count
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      (prisma.reservation.count as jest.Mock).mockResolvedValue(2);
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          results: 2,
          pagination: expect.objectContaining({
            totalCount: 2,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false
          }),
          data: {
            reservations: expect.arrayContaining([
              expect.objectContaining({
                id: 'reservation-1'
              }),
              expect.objectContaining({
                id: 'reservation-2'
              })
            ])
          }
        })
      );
      
      // Verify logger was called
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Processing get all reservations request'),
        expect.any(Object)
      );
    });
    
    it('should handle pagination parameters correctly', async () => {
      // Set pagination parameters
      mockRequest.query = {
        page: '2',
        limit: '5'
      };
      
      // Mock reservations
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'reservation-6',
          customerId: 'customer-3',
          status: 'CONFIRMED',
          organizationId: 'tenant-1'
        }
      ]);
      
      // Mock count for pagination
      (prisma.reservation.count as jest.Mock).mockResolvedValue(11);
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify correct pagination was used in query
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page 2 - 1) * limit 5
          take: 5
        })
      );
      
      // Verify pagination info in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalCount: 11,
            totalPages: 3,
            currentPage: 2,
            limit: 5,
            hasNextPage: true,
            hasPrevPage: true
          })
        })
      );
    });
    
    it('should handle invalid pagination parameters with warnings', async () => {
      // Set invalid pagination parameters
      mockRequest.query = {
        page: 'invalid',
        limit: 'also-invalid'
      };
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify default pagination was used
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // Default page 1
          take: 10 // Default limit
        })
      );
      
      // Verify warnings in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: expect.arrayContaining([
            expect.stringContaining('Invalid page parameter'),
            expect.stringContaining('Invalid limit parameter')
          ])
        })
      );
      
      // Verify logger warnings
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid page parameter'),
        expect.any(Object)
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid limit parameter'),
        expect.any(Object)
      );
    });
    
    it('should filter by status when provided', async () => {
      // Set status filter
      mockRequest.query = {
        status: 'CONFIRMED'
      };
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify status filter was applied
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CONFIRMED'
          })
        })
      );
      
      // Verify count query also used the same filter
      expect(prisma.reservation.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'CONFIRMED'
        })
      });
    });
    
    it('should filter by date range when provided', async () => {
      // Set date filters
      mockRequest.query = {
        startDate: '2025-06-01',
        endDate: '2025-06-30'
      };
      
      // Clear previous mock calls
      (prisma.reservation.findMany as jest.Mock).mockClear();
      (prisma.reservation.count as jest.Mock).mockClear();
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify prisma calls were made (without checking exact parameters)
      expect(prisma.reservation.findMany).toHaveBeenCalled();
      expect(prisma.reservation.count).toHaveBeenCalled();
      
      // Get the actual calls
      const findManyCall = (prisma.reservation.findMany as jest.Mock).mock.calls[0][0];
      const countCall = (prisma.reservation.count as jest.Mock).mock.calls[0][0];
      
      // Verify the where clause contains date filters
      expect(findManyCall.where.startDate.gte instanceof Date).toBe(true);
      expect(findManyCall.where.endDate.lte instanceof Date).toBe(true);
      expect(findManyCall.where.startDate.gte.toISOString().substring(0, 10)).toBe('2025-06-01');
      expect(findManyCall.where.endDate.lte.toISOString().substring(0, 10)).toBe('2025-06-30');
      
      // Verify count query also used date filters
      expect(countCall.where.startDate.gte instanceof Date).toBe(true);
      expect(countCall.where.endDate.lte instanceof Date).toBe(true);
    });
    
    it('should handle invalid date filters with warnings', async () => {
      // Set invalid date filters
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: 'also-invalid'
      };
      
      // Clear previous mock calls
      (prisma.reservation.findMany as jest.Mock).mockClear();
      (prisma.reservation.count as jest.Mock).mockClear();
      (mockResponse.json as jest.Mock).mockClear();
      (logger.warn as jest.Mock).mockClear();
      
      await getAllReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify prisma calls were made
      expect(prisma.reservation.findMany).toHaveBeenCalled();
      
      // Get the actual call
      const findManyCall = (prisma.reservation.findMany as jest.Mock).mock.calls[0][0];
      
      // Verify no date filters in query
      expect(findManyCall.where?.startDate).toBeUndefined();
      expect(findManyCall.where?.endDate).toBeUndefined();
      
      // Verify response contains warnings
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.warnings).toBeDefined();
      expect(jsonCall.warnings.length).toBeGreaterThanOrEqual(2);
      expect(jsonCall.warnings.some((w: string) => w.includes('Invalid startDate filter'))).toBe(true);
      expect(jsonCall.warnings.some((w: string) => w.includes('Invalid endDate filter'))).toBe(true);
      
      // Verify logger warnings
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid startDate filter'),
        expect.any(Object)
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid endDate filter'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when tenant ID is missing', async () => {
      // Remove tenant ID
      mockRequest.tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      await getAllReservations(
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
  });
  
  describe('getReservationById', () => {
    const mockReservation = {
      id: 'reservation-1',
      customerId: 'customer-1',
      petId: 'pet-1',
      resourceId: 'resource-1',
      startDate: new Date('2025-06-10'),
      endDate: new Date('2025-06-15'),
      status: 'CONFIRMED',
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
        type: 'VIP_SUITE',
        location: 'Building A'
      },
      addOnServices: [
        {
          id: 'addon-1',
          serviceId: 'service-1',
          quantity: 1,
          notes: 'Special instructions',
          service: {
            name: 'Grooming',
            price: 50,
            description: 'Full grooming service'
          }
        }
      ]
    };
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Set up mock request and response
      mockRequest = {
        params: { id: 'reservation-1' },
        query: {},
        tenantId: 'tenant-1',
      };
      
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      // Mock next function
      mockNext = jest.fn();
      
      // Set up default mock responses for Prisma queries
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(mockReservation);
    });
    
    it('should return a reservation by ID', async () => {
      // Clear previous mock calls
      (mockResponse.status as jest.Mock).mockClear();
      (mockResponse.json as jest.Mock).mockClear();
      (logger.info as jest.Mock).mockClear();
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      
      // Get the actual response
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.status).toBe('success');
      expect(jsonCall.data.reservation.id).toBe('reservation-1');
      expect(jsonCall.data.reservation.customer.firstName).toBe('John');
      expect(jsonCall.data.reservation.pet.name).toBe('Buddy');
      expect(jsonCall.data.reservation.resource.name).toBe('VIP Suite 1');
      expect(jsonCall.data.reservation.addOnServices[0].id).toBe('addon-1');
      
      // Verify logger info
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Found reservation: reservation-1'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when reservation does not exist', async () => {
      // Mock reservation not found
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Create a spy on AppError.notFoundError
      const notFoundErrorSpy = jest.spyOn(serviceUtils.AppError, 'notFoundError');
      
      // Clear previous mock calls
      mockNext.mockClear();
      (logger.warn as jest.Mock).mockClear();
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(notFoundErrorSpy).toHaveBeenCalledWith('Reservation not found');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Reservation not found or does not belong to tenant'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when tenant ID is missing', async () => {
      // Remove tenant ID
      (mockRequest as any).tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      // Clear previous mock calls
      mockNext.mockClear();
      (logger.warn as jest.Mock).mockClear();
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(401);
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
      
      // Clear previous mock calls
      mockNext.mockClear();
      (logger.warn as jest.Mock).mockClear();
      
      await getReservationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(400);
      expect(validationErrorSpy).toHaveBeenCalledWith('Reservation ID is required');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing reservation ID in request'),
        expect.any(Object)
      );
    });
  });
});
