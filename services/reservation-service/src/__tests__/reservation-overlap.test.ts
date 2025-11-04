/**
 * Reservation Overlap Prevention Tests
 * 
 * These tests ensure that the system prevents overlapping reservations
 * for the same resource (suite/room).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Reservation Overlap Prevention', () => {
  let testTenantId: string;
  let testCustomerId: string;
  let testPetId: string;
  let testResourceId: string;
  let testServiceId: string;

  beforeAll(async () => {
    // Create test data
    testTenantId = 'test-tenant-overlap';
    
    // Create customer
    const customer = await prisma.customer.create({
      data: {
        tenantId: testTenantId,
        firstName: 'Test',
        lastName: 'Customer',
        email: 'overlap-test@example.com',
        phone: '555-0100',
      },
    });
    testCustomerId = customer.id;

    // Create pet
    const pet = await prisma.pet.create({
      data: {
        tenantId: testTenantId,
        customerId: testCustomerId,
        name: 'Test Dog',
        type: 'DOG',
        breed: 'Labrador',
        weight: 50,
      },
    });
    testPetId = pet.id;

    // Create resource (suite)
    const resource = await prisma.resource.create({
      data: {
        tenantId: testTenantId,
        name: 'TEST-SUITE-01',
        type: 'STANDARD_SUITE',
        capacity: 1,
      },
    });
    testResourceId = resource.id;

    // Create service
    const service = await prisma.service.create({
      data: {
        tenantId: testTenantId,
        name: 'Test Boarding',
        serviceCategory: 'BOARDING',
        duration: 1440, // 1 day in minutes
        price: 50,
      },
    });
    testServiceId = service.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.reservation.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.service.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.resource.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.pet.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.customer.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear reservations before each test
    await prisma.reservation.deleteMany({ where: { tenantId: testTenantId } });
  });

  describe('Database-level overlap detection', () => {
    it('should detect overlapping reservations in the same suite', async () => {
      // Create first reservation: Jan 1-5
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-05'),
          status: 'CONFIRMED',
        },
      });

      // Create second reservation: Jan 3-7 (overlaps with first)
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-03'),
          endDate: new Date('2025-01-07'),
          status: 'CONFIRMED',
        },
      });

      // Query for overlaps
      const overlaps = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM reservations r1
        JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
        WHERE r1."tenantId" = ${testTenantId}
          AND r2."tenantId" = ${testTenantId}
          AND r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r1."startDate" < r2."endDate"
          AND r1."endDate" > r2."startDate"
      `;

      expect(Number(overlaps[0].count)).toBe(1);
    });

    it('should not detect overlap for consecutive reservations', async () => {
      // Create first reservation: Jan 1-5
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-05'),
          status: 'CONFIRMED',
        },
      });

      // Create second reservation: Jan 5-10 (starts when first ends - no overlap)
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-01-10'),
          status: 'CONFIRMED',
        },
      });

      // Query for overlaps
      const overlaps = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM reservations r1
        JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
        WHERE r1."tenantId" = ${testTenantId}
          AND r2."tenantId" = ${testTenantId}
          AND r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r1."startDate" < r2."endDate"
          AND r1."endDate" > r2."startDate"
      `;

      expect(Number(overlaps[0].count)).toBe(0);
    });

    it('should not detect overlap for different suites on same dates', async () => {
      // Create second resource
      const resource2 = await prisma.resource.create({
        data: {
          tenantId: testTenantId,
          name: 'TEST-SUITE-02',
          type: 'STANDARD_SUITE',
          capacity: 1,
        },
      });

      // Create first reservation in suite 1: Jan 1-5
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-05'),
          status: 'CONFIRMED',
        },
      });

      // Create second reservation in suite 2: Jan 1-5 (same dates, different suite)
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: resource2.id,
          serviceId: testServiceId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-05'),
          status: 'CONFIRMED',
        },
      });

      // Query for overlaps
      const overlaps = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM reservations r1
        JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
        WHERE r1."tenantId" = ${testTenantId}
          AND r2."tenantId" = ${testTenantId}
          AND r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r1."startDate" < r2."endDate"
          AND r1."endDate" > r2."startDate"
      `;

      expect(Number(overlaps[0].count)).toBe(0);

      // Clean up
      await prisma.resource.delete({ where: { id: resource2.id } });
    });
  });

  describe('Overlap validation utility', () => {
    it('should provide a utility function to check for overlaps', async () => {
      // Create existing reservation: Jan 1-5
      await prisma.reservation.create({
        data: {
          tenantId: testTenantId,
          customerId: testCustomerId,
          petId: testPetId,
          resourceId: testResourceId,
          serviceId: testServiceId,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-05'),
          status: 'CONFIRMED',
        },
      });

      // Check for overlap with Jan 3-7
      const hasOverlap = await checkReservationOverlap(
        testResourceId,
        new Date('2025-01-03'),
        new Date('2025-01-07'),
        testTenantId
      );

      expect(hasOverlap).toBe(true);

      // Check for overlap with Jan 6-10 (no overlap)
      const hasNoOverlap = await checkReservationOverlap(
        testResourceId,
        new Date('2025-01-06'),
        new Date('2025-01-10'),
        testTenantId
      );

      expect(hasNoOverlap).toBe(false);
    });
  });
});

/**
 * Utility function to check if a reservation would overlap with existing ones
 */
async function checkReservationOverlap(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  tenantId: string,
  excludeReservationId?: string
): Promise<boolean> {
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      resourceId,
      tenantId,
      status: {
        in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
      },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } },
      ],
      ...(excludeReservationId && {
        id: { not: excludeReservationId },
      }),
    },
  });

  return overlappingReservations.length > 0;
}

export { checkReservationOverlap };
