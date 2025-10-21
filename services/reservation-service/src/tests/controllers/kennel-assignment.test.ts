/**
 * Kennel Assignment Validation Tests
 * Tests for mandatory kennel assignment for boarding/daycare services
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

describe('Kennel Assignment Validation', () => {
  let mockPrisma: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('POST /api/reservations - Kennel Assignment', () => {
    it('should require resourceId for boarding service', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
          // Missing resourceId
        },
      });

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      // Should return error for missing resourceId
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/resource.*required|kennel.*required/i),
        })
      );
    });

    it('should require resourceId for daycare service', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-daycare',
          serviceCategory: 'DAYCARE',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
          // Missing resourceId
        },
      });

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/resource.*required|kennel.*required/i),
        })
      );
    });

    it('should NOT require resourceId for grooming service', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-grooming',
          serviceCategory: 'GROOMING',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
          // No resourceId - should be OK for grooming
        },
      });

      const testReservation = createTestReservation({
        serviceCategory: 'GROOMING',
        resourceId: null,
      });

      mockPrisma.reservation.create.mockResolvedValue(testReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      // Should succeed without resourceId for grooming
      expect(mockRes.status).not.toHaveBeenCalledWith(400);
      expect(mockPrisma.reservation.create).toHaveBeenCalled();
    });

    it('should accept valid resourceId for boarding service', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      const testResource = createTestResource({ id: 'resource-A01' });
      const testReservation = createTestReservation({
        resourceId: 'resource-A01',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(testResource);
      mockPrisma.reservation.create.mockResolvedValue(testReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resourceId: 'resource-A01',
          }),
        })
      );
    });

    it('should validate that resourceId exists', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'non-existent-resource',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      mockPrisma.resource.findUnique.mockResolvedValue(null);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/resource.*not found/i),
        })
      );
    });

    it('should accept empty string as auto-assign for boarding', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: '', // Empty string means auto-assign
          suiteType: 'STANDARD_SUITE',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      const testReservation = createTestReservation({
        resourceId: null, // Will be assigned by backend
        suiteType: 'STANDARD_SUITE',
      });

      mockPrisma.reservation.create.mockResolvedValue(testReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      // Should succeed with auto-assign
      expect(mockPrisma.reservation.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/reservations/:id - Update Kennel Assignment', () => {
    it('should allow updating resourceId for boarding reservation', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          resourceId: 'resource-A02',
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        serviceCategory: 'BOARDING',
        resourceId: 'resource-A01',
      });

      const updatedReservation = createTestReservation({
        id: 'reservation-123',
        resourceId: 'resource-A02',
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);
      mockPrisma.resource.findUnique.mockResolvedValue(
        createTestResource({ id: 'resource-A02' })
      );
      mockPrisma.reservation.update.mockResolvedValue(updatedReservation);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'reservation-123' },
          data: expect.objectContaining({
            resourceId: 'resource-A02',
          }),
        })
      );
    });

    it('should NOT allow removing resourceId from boarding reservation', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          resourceId: null, // Trying to remove kennel assignment
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        serviceCategory: 'BOARDING',
        resourceId: 'resource-A01',
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/resource.*required|kennel.*required/i),
        })
      );
    });

    it('should validate new resourceId exists when updating', async () => {
      mockReq = createMockRequest({
        params: { id: 'reservation-123' },
        body: {
          resourceId: 'non-existent-resource',
        },
      });

      const existingReservation = createTestReservation({
        id: 'reservation-123',
        resourceId: 'resource-A01',
      });

      mockPrisma.reservation.findUnique.mockResolvedValue(existingReservation);
      mockPrisma.resource.findUnique.mockResolvedValue(null);

      await updateReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/resource.*not found/i),
        })
      );
    });
  });

  describe('Suite Type Validation', () => {
    it('should require suiteType when resourceId is not provided for boarding', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: '', // Auto-assign
          // Missing suiteType
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/suiteType.*required/i),
        })
      );
    });

    it('should accept valid suiteType for auto-assignment', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: '',
          suiteType: 'STANDARD_SUITE',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      const testReservation = createTestReservation({
        suiteType: 'STANDARD_SUITE',
      });

      mockPrisma.reservation.create.mockResolvedValue(testReservation);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockPrisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            suiteType: 'STANDARD_SUITE',
          }),
        })
      );
    });

    it('should validate suiteType is valid enum value', async () => {
      mockReq = createMockRequest({
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: '',
          suiteType: 'INVALID_TYPE',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid.*suiteType/i),
        })
      );
    });
  });

  describe('Multi-Tenant Validation', () => {
    it('should validate resource belongs to same organization', async () => {
      mockReq = createMockRequest({
        tenantId: 'tenant-A',
        body: {
          customerId: 'customer-123',
          petId: 'pet-123',
          serviceId: 'service-boarding',
          serviceCategory: 'BOARDING',
          resourceId: 'resource-A01',
          startDate: '2025-10-21',
          endDate: '2025-10-22',
        },
      });

      // Resource belongs to different organization
      const testResource = createTestResource({
        id: 'resource-A01',
        organizationId: 'tenant-B',
      });

      mockPrisma.resource.findUnique.mockResolvedValue(testResource);

      await createReservation(mockReq, mockRes, mockNext, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/not authorized|different organization/i),
        })
      );
    });
  });
});
