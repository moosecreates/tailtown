import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as serviceUtils from '../../../utils/service';
import { logger } from '../../../utils/logger';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    reservation: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
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
import { getCustomerReservations } from '../../../controllers/reservation/customer-reservation.controller';

describe('Customer Reservation Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let prisma: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up mock request and response
    mockRequest = {
      params: { customerId: 'customer-1' },
      query: {},
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
    
    // Mock customer exists
    (prisma.customer.findFirst as jest.Mock).mockResolvedValue({
      id: 'customer-1',
      organizationId: 'tenant-1'
    });
    
    // Mock reservation count
    (prisma.reservation.count as jest.Mock).mockResolvedValue(15);
    
    // Mock reservations
    (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'reservation-1',
        customerId: 'customer-1',
        petId: 'pet-1',
        resourceId: 'resource-1',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-15'),
        serviceType: 'BOARDING',
        suiteType: 'KENNEL',
        status: 'CONFIRMED',
        price: 150,
        deposit: 50,
        notes: 'Customer notes',
        staffNotes: 'Staff notes',
        organizationId: 'tenant-1',
        pet: {
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3
        },
        resource: {
          name: 'VIP Suite 1',
          type: 'KENNEL',
          location: 'Building A'
        },
        addOnServices: [
          {
            id: 'addon-1',
            serviceId: 'service-1',
            quantity: 2,
            notes: 'Extra treats',
            service: {
              name: 'Extra Treats',
              price: 10,
              description: 'Additional treats for your pet'
            }
          }
        ]
      },
      {
        id: 'reservation-2',
        customerId: 'customer-1',
        petId: 'pet-2',
        resourceId: 'resource-2',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-05'),
        serviceType: 'DAYCARE',
        suiteType: 'PLAY_AREA',
        status: 'COMPLETED',
        price: 100,
        deposit: 25,
        notes: 'Past reservation',
        staffNotes: 'Staff notes',
        organizationId: 'tenant-1',
        pet: {
          name: 'Max',
          breed: 'Labrador',
          age: 2
        },
        resource: {
          name: 'Play Area 2',
          type: 'PLAY_AREA',
          location: 'Building B'
        },
        addOnServices: []
      }
    ]);
  });
  
  describe('getCustomerReservations', () => {
    it('should get reservations for a customer with default pagination', async () => {
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify customer was verified
      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'customer-1',
          organizationId: 'tenant-1'
        },
        select: { id: true }
      });
      
      // Verify count query
      expect(prisma.reservation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          customerId: 'customer-1'
        }
      });
      
      // Verify reservations query with default pagination
      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          customerId: 'customer-1'
        },
        skip: 0, // Default page 1
        take: 10, // Default limit
        orderBy: {
          startDate: 'desc'
        },
        include: expect.any(Object)
      });
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        pagination: {
          totalCount: 15,
          totalPages: 2,
          currentPage: 1,
          limit: 10,
          hasNextPage: true,
          hasPrevPage: false
        },
        data: {
          reservations: expect.any(Array)
        }
      });
      
      // Verify logger info
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Found 2 reservations for customer customer-1'),
        expect.any(Object)
      );
    });
    
    it('should apply custom pagination parameters', async () => {
      // Set custom pagination
      mockRequest.query = {
        page: '2',
        limit: '5'
      };
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify reservations query with custom pagination
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // Page 2 with limit 5
          take: 5 // Custom limit
        })
      );
      
      // Verify pagination in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            currentPage: 2,
            limit: 5,
            hasNextPage: true,
            hasPrevPage: true
          })
        })
      );
    });
    
    it('should handle invalid pagination parameters with warnings', async () => {
      // Set invalid pagination
      mockRequest.query = {
        page: 'invalid',
        limit: '1000'
      };
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify reservations query with default pagination (since invalid params)
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // Default page 1
          take: 10 // Default limit
        })
      );
      
      // Verify warnings in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: [
            'Invalid page parameter: invalid, using default: 1',
            'Invalid limit parameter: 1000, using default: 10'
          ]
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
    
    it('should apply status filter', async () => {
      // Set status filter
      mockRequest.query = {
        status: 'CONFIRMED'
      };
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify filter in queries
      expect(prisma.reservation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          customerId: 'customer-1',
          status: 'CONFIRMED'
        }
      });
      
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'tenant-1',
            customerId: 'customer-1',
            status: 'CONFIRMED'
          }
        })
      );
    });
    
    it('should apply date filters', async () => {
      // Set date filters
      mockRequest.query = {
        startDate: '2025-06-01',
        endDate: '2025-06-30'
      };
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify date filters in queries
      expect(prisma.reservation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          customerId: 'customer-1',
          startDate: {
            gte: new Date('2025-06-01')
          },
          endDate: {
            lte: new Date('2025-06-30')
          }
        }
      });
      
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'tenant-1',
            customerId: 'customer-1',
            startDate: {
              gte: new Date('2025-06-01')
            },
            endDate: {
              lte: new Date('2025-06-30')
            }
          }
        })
      );
    });
    
    it('should handle invalid date filters with warnings', async () => {
      // Set invalid date filters
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: 'also-invalid'
      };
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify no date filters in queries
      expect(prisma.reservation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'tenant-1',
          customerId: 'customer-1'
        }
      });
      
      // Verify warnings in response
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: [
            'Invalid startDate filter: invalid-date, ignoring this filter',
            'Invalid endDate filter: also-invalid, ignoring this filter'
          ]
        })
      );
      
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
      (mockRequest as any).tenantId = undefined;
      
      // Create a spy on AppError.authorizationError
      const authErrorSpy = jest.spyOn(serviceUtils.AppError, 'authorizationError');
      
      await getCustomerReservations(
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
    
    it('should throw an error when customer ID is missing', async () => {
      // Remove customer ID
      mockRequest.params = {};
      
      // Create a spy on AppError.validationError
      const validationErrorSpy = jest.spyOn(serviceUtils.AppError, 'validationError');
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(validationErrorSpy).toHaveBeenCalledWith('Customer ID is required');
      
      // Verify logger warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing customer ID in request'),
        expect.any(Object)
      );
    });
    
    it('should throw an error when customer does not exist', async () => {
      // Mock customer not found
      (prisma.customer.findFirst as jest.Mock).mockResolvedValue(null);
      
      await getCustomerReservations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as unknown as NextFunction
      );
      
      // Verify the error was passed to next
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
      // The error comes from safeExecutePrismaQuery which would be passed to next when customer is not found
      
      // Verify customer verification was attempted
      expect(prisma.customer.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'customer-1',
          organizationId: 'tenant-1'
        },
        select: { id: true }
      });
    });
  });
});
