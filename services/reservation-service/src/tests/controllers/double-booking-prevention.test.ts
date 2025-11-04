/**
 * Double-Booking Prevention Tests
 * Tests for preventing kennel overbooking and conflicts
 */

import { createReservation } from '../../controllers/reservation/create-reservation.controller';
import { updateReservation } from '../../controllers/reservation/update-reservation.controller';
import {
  createMockPrismaClient,
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestReservation,
  createTestResource,
} from '../utils/test-helpers';

describe('Double-Booking Prevention', () => {
  let mockPrisma: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('POST /api/reservations - Conflict Detection', () => {
    it('should prevent booking same kennel for overlapping dates', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      // Existing reservation for same kennel and overlapping dates
      const conflictingReservation = createTestReservation({
        id: 'existing-reservation',
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-22'),
        endDate: new Date('2025-10-24'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/already booked|conflict|not available/i),
          conflictingReservations: expect.arrayContaining([
            expect.objectContaining({
              id: 'existing-reservation',
            }),
          ]),
        })
      );
    });

    it('should allow booking same kennel for non-overlapping dates', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-25',
          endDate: '2025-10-27',
        },
      });

      // Existing reservation ends before new one starts
      const existingReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-24'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([existingReservation]);

      const newReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-10-27'),
      });

      mockPrisma.reservation.create.mockResolvedValue(newReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.create).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(409);
    });

    it('should detect exact date overlap', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      // Exact same dates
      const conflictingReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should detect partial overlap - new starts during existing', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-22', // Starts during existing reservation
          endDate: '2025-10-25',
        },
      });

      const conflictingReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should detect partial overlap - new ends during existing', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-20',
          endDate: '2025-10-22', // Ends during existing reservation
        },
      });

      const conflictingReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should detect when new reservation completely contains existing', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-20',
          endDate: '2025-10-25', // Completely contains existing reservation
        },
      });

      const conflictingReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CONFIRMED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should ignore cancelled reservations when checking conflicts', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      // Cancelled reservation should not block
      const cancelledReservation = createTestReservation({
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CANCELLED',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([cancelledReservation]);

      const newReservation = createTestReservation();
      mockPrisma.reservation.create.mockResolvedValue(newReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.create).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(409);
    });

    it('should check conflicts only for active statuses', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );

      // Should query only active statuses
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.objectContaining({
              in: expect.arrayContaining(['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']),
            }),
          }),
        })
      );
    });
  });

  describe('PUT /api/reservations/:id - Update Conflict Detection', () => {
    it('should allow updating own reservation without conflict', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);
      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      // When checking conflicts, should exclude own reservation
      mockPrisma.reservation.findMany.mockResolvedValue([existingReservation]);

      const updatedReservation = createTestReservation({
        id: 'reservation-123',
      });
      mockPrisma.reservation.update.mockResolvedValue(updatedReservation);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.update).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(409);
    });

    it('should detect conflicts when changing kennel to occupied one', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          resourceId: 'resource-A02', // Changing to different kennel
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
      });

      // Another reservation already on A02
      const conflictingReservation = createTestReservation({
        id: 'other-reservation',
        resourceId: 'resource-A02',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
        status: 'CONFIRMED',
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);
      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A02' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([conflictingReservation]);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/already booked|conflict/i),
        })
      );
    });

    it('should detect conflicts when extending dates', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          endDate: '2025-10-25', // Extending end date
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-21'),
        endDate: new Date('2025-10-23'),
      });

      // Another reservation starts on 10/24
      const conflictingReservation = createTestReservation({
        id: 'other-reservation',
        resourceId: 'resource-A01',
        startDate: new Date('2025-10-24'),
        endDate: new Date('2025-10-26'),
        status: 'CONFIRMED',
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);
      mockPrisma.reservation.findMany.mockResolvedValue([
        existingReservation,
        conflictingReservation,
      ]);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });
  });

  describe('Conflict Query Optimization', () => {
    it('should query conflicts only for the specific resource', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            resourceId: 'resource-A01',
          }),
        })
      );
    });

    it('should query conflicts only for the date range', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                startDate: expect.any(Object),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('Multi-Tenant Conflict Isolation', () => {
    it('should only check conflicts within same organization', async () => {
      mockReq = createMockRequest({
        tenantId: 'tenant-A',
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-23',
        },
      });

      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A01', organizationId: 'tenant-A' })
      );
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'tenant-A',
          }),
        })
      );
    });
  });
});
