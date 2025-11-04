import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Timezone Handling Tests', () => {
  let testCustomerId: string;
  let testPetId: string;
  let testServiceId: string;

  beforeAll(async () => {
    // Create test data
    const customer = await prisma.customer.create({
      data: {
        tenantId: 'timezone-test',
        email: 'timezone@test.com',
        firstName: 'Timezone',
        lastName: 'Test',
        phone: '555-0100'
      }
    });
    testCustomerId = customer.id;

    const pet = await prisma.pet.create({
      data: {
        tenantId: 'timezone-test',
        name: 'Timezone Pet',
        type: 'DOG',
        customerId: testCustomerId
      }
    });
    testPetId = pet.id;

    const service = await prisma.service.create({
      data: {
        tenantId: 'timezone-test',
        name: 'Timezone Boarding',
        serviceCategory: 'BOARDING',
        duration: 1440,
        price: 50.00,
        isActive: true
      }
    });
    testServiceId = service.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.reservation.deleteMany({ where: { tenantId: 'timezone-test' } });
    await prisma.pet.deleteMany({ where: { tenantId: 'timezone-test' } });
    await prisma.customer.deleteMany({ where: { tenantId: 'timezone-test' } });
    await prisma.service.deleteMany({ where: { tenantId: 'timezone-test' } });
    await prisma.$disconnect();
  });

  describe('Date Storage and Retrieval', () => {
    it('should store dates in UTC and retrieve them correctly', async () => {
      // Create a date at midnight UTC
      const midnightUTC = new Date(Date.UTC(2025, 9, 23, 0, 0, 0)); // Oct 23, 2025 00:00:00 UTC
      const nextDayUTC = new Date(Date.UTC(2025, 9, 24, 0, 0, 0)); // Oct 24, 2025 00:00:00 UTC

      const reservation = await prisma.reservation.create({
        data: {
          tenantId: 'timezone-test',
          customerId: testCustomerId,
          petId: testPetId,
          serviceId: testServiceId,
          startDate: midnightUTC,
          endDate: nextDayUTC,
          status: 'CONFIRMED'
        }
      });

      // Retrieve and verify
      const retrieved = await prisma.reservation.findUnique({
        where: { id: reservation.id }
      });

      expect(retrieved).toBeTruthy();
      expect(retrieved!.startDate.toISOString()).toBe(midnightUTC.toISOString());
      expect(retrieved!.endDate.toISOString()).toBe(nextDayUTC.toISOString());
    });

    it('should handle date-only strings correctly (YYYY-MM-DD)', async () => {
      // When frontend sends date-only strings, they should be interpreted as UTC midnight
      const dateString = '2025-10-23';
      const expectedUTC = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));

      const reservation = await prisma.reservation.create({
        data: {
          tenantId: 'timezone-test',
          customerId: testCustomerId,
          petId: testPetId,
          serviceId: testServiceId,
          startDate: new Date(dateString),
          endDate: new Date('2025-10-24'),
          status: 'CONFIRMED'
        }
      });

      const retrieved = await prisma.reservation.findUnique({
        where: { id: reservation.id }
      });

      // Verify the date is stored as UTC midnight
      const retrievedDate = new Date(retrieved!.startDate);
      expect(retrievedDate.getUTCFullYear()).toBe(2025);
      expect(retrievedDate.getUTCMonth()).toBe(9); // October (0-indexed)
      expect(retrievedDate.getUTCDate()).toBe(23);
    });

    it('should handle timezone edge cases: end of day', async () => {
      // 23:59:59 UTC should still be the same day
      const endOfDayUTC = new Date(Date.UTC(2025, 9, 23, 23, 59, 59));
      const nextDayUTC = new Date(Date.UTC(2025, 9, 24, 23, 59, 59));

      const reservation = await prisma.reservation.create({
        data: {
          tenantId: 'timezone-test',
          customerId: testCustomerId,
          petId: testPetId,
          serviceId: testServiceId,
          startDate: endOfDayUTC,
          endDate: nextDayUTC,
          status: 'CONFIRMED'
        }
      });

      const retrieved = await prisma.reservation.findUnique({
        where: { id: reservation.id }
      });

      // Extract just the date part in UTC
      const startDate = new Date(retrieved!.startDate);
      const startDateOnly = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
      
      expect(startDateOnly).toBe('2025-10-23');
    });
  });

  describe('Date Filtering Queries', () => {
    beforeEach(async () => {
      // Clean up any existing test reservations
      await prisma.reservation.deleteMany({ where: { tenantId: 'timezone-test' } });
    });

    it('should filter reservations by start date correctly', async () => {
      const targetDate = new Date(Date.UTC(2025, 9, 23, 12, 0, 0));
      const dayBefore = new Date(Date.UTC(2025, 9, 22, 12, 0, 0));
      const dayAfter = new Date(Date.UTC(2025, 9, 24, 12, 0, 0));

      // Create reservations on different days
      await prisma.reservation.createMany({
        data: [
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: dayBefore,
            endDate: targetDate,
            status: 'CONFIRMED'
          },
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: targetDate,
            endDate: dayAfter,
            status: 'CONFIRMED'
          },
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: dayAfter,
            endDate: new Date(Date.UTC(2025, 9, 25, 12, 0, 0)),
            status: 'CONFIRMED'
          }
        ]
      });

      // Query for reservations starting on Oct 23
      const startOfDay = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(2025, 9, 23, 23, 59, 59, 999));

      const reservations = await prisma.reservation.findMany({
        where: {
          tenantId: 'timezone-test',
          startDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      // Should only find the one starting on Oct 23
      expect(reservations).toHaveLength(1);
      expect(reservations[0].startDate.toISOString()).toContain('2025-10-23');
    });

    it('should find overlapping reservations correctly', async () => {
      const targetDate = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
      
      await prisma.reservation.createMany({
        data: [
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: new Date(Date.UTC(2025, 9, 22, 0, 0, 0)),
            endDate: new Date(Date.UTC(2025, 9, 24, 0, 0, 0)),
            status: 'CONFIRMED'
          },
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: new Date(Date.UTC(2025, 9, 23, 0, 0, 0)),
            endDate: new Date(Date.UTC(2025, 9, 25, 0, 0, 0)),
            status: 'CONFIRMED'
          },
          {
            tenantId: 'timezone-test',
            customerId: testCustomerId,
            petId: testPetId,
            serviceId: testServiceId,
            startDate: new Date(Date.UTC(2025, 9, 24, 0, 0, 0)),
            endDate: new Date(Date.UTC(2025, 9, 26, 0, 0, 0)),
            status: 'CONFIRMED'
          }
        ]
      });

      // Find reservations that overlap with Oct 23
      const startOfDay = new Date(Date.UTC(2025, 9, 23, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(2025, 9, 23, 23, 59, 59, 999));

      const overlapping = await prisma.reservation.findMany({
        where: {
          tenantId: 'timezone-test',
          AND: [
            { startDate: { lte: endOfDay } },
            { endDate: { gte: startOfDay } }
          ]
        }
      });

      // Should find first two reservations (they overlap with Oct 23)
      expect(overlapping).toHaveLength(2);
    });
  });

  describe('Cross-Timezone Consistency', () => {
    it('should produce same results regardless of server timezone', async () => {
      // This test verifies that date comparisons work consistently
      // even if the server is in a different timezone

      const oct23UTC = new Date(Date.UTC(2025, 9, 23, 12, 0, 0));
      
      const reservation = await prisma.reservation.create({
        data: {
          tenantId: 'timezone-test',
          customerId: testCustomerId,
          petId: testPetId,
          serviceId: testServiceId,
          startDate: oct23UTC,
          endDate: new Date(Date.UTC(2025, 9, 24, 12, 0, 0)),
          status: 'CONFIRMED'
        }
      });

      // Retrieve using UTC date
      const retrieved = await prisma.reservation.findFirst({
        where: {
          id: reservation.id,
          startDate: oct23UTC
        }
      });

      expect(retrieved).toBeTruthy();
      expect(retrieved!.id).toBe(reservation.id);
    });
  });

  describe('Date Formatting for API Responses', () => {
    it('should return ISO 8601 formatted dates', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          tenantId: 'timezone-test',
          customerId: testCustomerId,
          petId: testPetId,
          serviceId: testServiceId,
          startDate: new Date(Date.UTC(2025, 9, 23, 14, 30, 0)),
          endDate: new Date(Date.UTC(2025, 9, 24, 14, 30, 0)),
          status: 'CONFIRMED'
        }
      });

      // Verify ISO format includes timezone (Z for UTC)
      expect(reservation.startDate.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(reservation.startDate.toISOString()).toContain('2025-10-23');
      expect(reservation.startDate.toISOString()).toContain('T14:30:00');
    });
  });
});
