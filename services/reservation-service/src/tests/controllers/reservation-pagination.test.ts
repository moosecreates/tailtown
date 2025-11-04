/**
 * Reservation Pagination Tests
 * Tests for API pagination limits and filtering
 */

import { getReservations } from '../../controllers/reservation/get-reservation.controller';
import { getCustomerReservations } from '../../controllers/reservation/customer-reservation.controller';
import {
  createMockPrismaClient,
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestReservation,
} from '../utils/test-helpers';

describe('Reservation Pagination', () => {
  let mockPrisma: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('GET /api/reservations - Pagination Limits', () => {
    it('should default to limit of 10 when no limit specified', async () => {
      mockReq = createMockRequest({
        query: {},
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should accept limit up to 500', async () => {
      mockReq = createMockRequest({
        query: { limit: '500' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 500,
        })
      );
    });

    it('should cap limit at 500 even if higher value requested', async () => {
      mockReq = createMockRequest({
        query: { limit: '1000' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      // Should use default limit of 10 when invalid limit provided
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );

      // Should include warning in response
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warnings: expect.arrayContaining([
            expect.stringContaining('Invalid limit parameter'),
          ]),
        })
      );
    });

    it('should handle limit of 250 for dashboard use case', async () => {
      mockReq = createMockRequest({
        query: { limit: '250' },
      });

      // Create 250 test reservations
      const testReservations = Array.from({ length: 250 }, (_, i) =>
        createTestReservation({ id: `reservation-${i}` })
      );

      mockPrisma.reservation.findMany.mockResolvedValue(testReservations);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 250,
        })
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ id: 'reservation-0' }),
            expect.objectContaining({ id: 'reservation-249' }),
          ]),
          pagination: expect.objectContaining({
            total: 250,
          }),
        })
      );
    });

    it('should reject negative limit values', async () => {
      mockReq = createMockRequest({
        query: { limit: '-10' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      // Should use default limit
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should reject non-numeric limit values', async () => {
      mockReq = createMockRequest({
        query: { limit: 'abc' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      // Should use default limit
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe('GET /api/customers/:customerId/reservations - Pagination', () => {
    it('should accept limit up to 500 for customer reservations', async () => {
      mockReq = createMockRequest({
        params: { customerId: 'customer-123' },
        query: { limit: '500' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getCustomerReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 500,
          where: expect.objectContaining({
            customerId: 'customer-123',
          }),
        })
      );
    });

    it('should cap customer reservation limit at 500', async () => {
      mockReq = createMockRequest({
        params: { customerId: 'customer-123' },
        query: { limit: '1000' },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getCustomerReservations(mockReq, mockRes, mockNext, mockPrisma);

      // Should use default limit when invalid
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe('Pagination with Filtering', () => {
    it('should apply limit with date filtering', async () => {
      mockReq = createMockRequest({
        query: {
          limit: '100',
          startDate: '2025-10-21',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should apply limit with status filtering', async () => {
      mockReq = createMockRequest({
        query: {
          limit: '100',
          status: 'CONFIRMED,CHECKED_IN',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          where: expect.objectContaining({
            status: expect.objectContaining({
              in: ['CONFIRMED', 'CHECKED_IN'],
            }),
          }),
        })
      );
    });

    it('should handle pagination with sorting', async () => {
      mockReq = createMockRequest({
        query: {
          limit: '50',
          sortBy: 'startDate',
          sortOrder: 'desc',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          orderBy: {
            startDate: 'desc',
          },
        })
      );
    });
  });

  describe('Page-based Pagination', () => {
    it('should calculate correct skip value for page 1', async () => {
      mockReq = createMockRequest({
        query: {
          page: '1',
          limit: '50',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });

    it('should calculate correct skip value for page 2', async () => {
      mockReq = createMockRequest({
        query: {
          page: '2',
          limit: '50',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 50,
          take: 50,
        })
      );
    });

    it('should handle large page numbers correctly', async () => {
      mockReq = createMockRequest({
        query: {
          page: '10',
          limit: '100',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 900, // (10 - 1) * 100
          take: 100,
        })
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should return pagination metadata', async () => {
      mockReq = createMockRequest({
        query: {
          page: '1',
          limit: '50',
        },
      });

      const testReservations = Array.from({ length: 50 }, (_, i) =>
        createTestReservation({ id: `reservation-${i}` })
      );

      mockPrisma.reservation.findMany.mockResolvedValue(testReservations);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 1,
            limit: 50,
            total: expect.any(Number),
          }),
        })
      );
    });

    it('should handle empty result sets efficiently', async () => {
      mockReq = createMockRequest({
        query: {
          limit: '500',
        },
      });

      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await getReservations(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
          pagination: expect.objectContaining({
            total: 0,
          }),
        })
      );
    });
  });
});
