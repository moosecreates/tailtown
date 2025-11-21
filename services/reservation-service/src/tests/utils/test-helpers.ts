/**
 * Test helpers for reservation service tests
 * Implements schema alignment strategy with defensive programming
 */

// @ts-nocheck - Mock helpers for unit tests
import { PrismaClient } from '@prisma/client';

/**
 * Creates a mock Prisma client with defensive programming
 * This follows our schema alignment strategy to handle potential schema mismatches
 */
export function createMockPrismaClient() {
  return {
    reservation: {
      findMany: jest.fn().mockImplementation(async () => []),
      findUnique: jest.fn().mockImplementation(async () => null),
      create: jest.fn().mockImplementation(async () => ({})),
      update: jest.fn().mockImplementation(async () => ({})),
      delete: jest.fn().mockImplementation(async () => ({})),
    },
    resource: {
      findMany: jest.fn().mockImplementation(async () => []),
      findFirst: jest.fn().mockImplementation(async () => null),
      findUnique: jest.fn().mockImplementation(async () => null),
    },
    customer: {
      findFirst: jest.fn().mockImplementation(async () => null),
      findUnique: jest.fn().mockImplementation(async () => null),
    },
    pet: {
      findFirst: jest.fn().mockImplementation(async () => null),
      findUnique: jest.fn().mockImplementation(async () => null),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(createMockPrismaClient());
    }),
  };
}

/**
 * Creates a mock Express request object
 */
export function createMockRequest(overrides = {}) {
  return {
    tenantId: 'test-tenant-id',
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

/**
 * Creates a mock Express response object
 */
export function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Creates a mock Express next function
 */
export function createMockNext() {
  return jest.fn();
}

/**
 * Creates test reservation data
 */
export function createTestReservation(overrides = {}) {
  return {
    id: 'test-reservation-id',
    customerId: 'test-customer-id',
    petId: 'test-pet-id',
    resourceId: 'test-resource-id',
    startDate: new Date('2025-06-10'),
    endDate: new Date('2025-06-15'),
    status: 'CONFIRMED',
    suiteType: 'STANDARD_SUITE',
    organizationId: 'test-tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates test resource data
 */
export function createTestResource(overrides = {}) {
  return {
    id: 'test-resource-id',
    name: 'Test Resource',
    type: 'STANDARD_SUITE',
    organizationId: 'test-tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates test customer data
 */
export function createTestCustomer(overrides = {}) {
  return {
    id: 'test-customer-id',
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test@example.com',
    phone: '123-456-7890',
    organizationId: 'test-tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates test pet data
 */
export function createTestPet(overrides = {}) {
  return {
    id: 'test-pet-id',
    name: 'Test Pet',
    breed: 'Mixed',
    size: 'MEDIUM',
    customerId: 'test-customer-id',
    organizationId: 'test-tenant-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
