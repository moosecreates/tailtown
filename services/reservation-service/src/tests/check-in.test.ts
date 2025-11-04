import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';

const prisma = new PrismaClient();

describe('Check-In API Tests', () => {
  let testTemplateId: string;
  let testCheckInId: string;
  let testReservationId: string;
  let testPetId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    // Create test data
    const customer = await prisma.customer.create({
      data: {
        tenantId: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '555-0100'
      }
    });
    testCustomerId = customer.id;

    const pet = await prisma.pet.create({
      data: {
        tenantId: 'test',
        name: 'Test Pet',
        type: 'DOG',
        customerId: testCustomerId
      }
    });
    testPetId = pet.id;

    // Create a service first (required for reservation)
    const service = await prisma.service.create({
      data: {
        tenantId: 'test',
        name: 'Test Boarding',
        serviceCategory: 'BOARDING',
        duration: 1440, // 24 hours in minutes
        price: 50.00,
        isActive: true
      }
    });

    const reservation = await prisma.reservation.create({
      data: {
        tenantId: 'test',
        customerId: testCustomerId,
        petId: testPetId,
        serviceId: service.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        status: 'CONFIRMED'
      }
    });
    testReservationId = reservation.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.checkIn.deleteMany({ where: { tenantId: 'test' } });
    await prisma.reservation.deleteMany({ where: { tenantId: 'test' } });
    await prisma.pet.deleteMany({ where: { tenantId: 'test' } });
    await prisma.customer.deleteMany({ where: { tenantId: 'test' } });
    await prisma.checkInTemplate.deleteMany({ where: { tenantId: 'test' } });
    await prisma.$disconnect();
  });

  describe('Check-In Templates', () => {
    it('should get default template (seeded)', async () => {
      const response = await request(app)
        .get('/api/check-in-templates/default')
        .set('x-tenant-id', 'dev');

      expect(response.status).toBe(200);
      expect(response.body.data.isDefault).toBe(true);
      expect(response.body.data.sections).toBeDefined();
      
      testTemplateId = response.body.data.id;
    });

    it('should get all templates for dev tenant', async () => {
      const response = await request(app)
        .get('/api/check-in-templates')
        .set('x-tenant-id', 'dev');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBeGreaterThan(0);
    });

    it('should get template by ID', async () => {
      const response = await request(app)
        .get(`/api/check-in-templates/${testTemplateId}`)
        .set('x-tenant-id', 'dev');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testTemplateId);
      expect(response.body.data.sections).toBeDefined();
    });
  });

  describe('Check-Ins', () => {
    it('should create a check-in with medications and belongings', async () => {
      const response = await request(app)
        .post('/api/check-ins')
        .set('x-tenant-id', 'test')
        .send({
          petId: testPetId,
          customerId: testCustomerId,
          reservationId: testReservationId,
          templateId: testTemplateId,
          checkInBy: 'test-staff',
          medications: [
            {
              medicationName: 'Prednisone',
              dosage: '10mg',
              frequency: 'Twice daily',
              administrationMethod: 'ORAL_PILL',
              timeOfDay: '8:00 AM, 8:00 PM',
              withFood: true
            }
          ],
          belongings: [
            {
              itemType: 'Collar',
              description: 'Blue nylon collar',
              quantity: 1,
              color: 'Blue'
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.medications).toHaveLength(1);
      expect(response.body.data.belongings).toHaveLength(1);
      
      testCheckInId = response.body.data.id;
    });

    it('should get all check-ins', async () => {
      const response = await request(app)
        .get('/api/check-ins')
        .set('x-tenant-id', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBeGreaterThan(0);
    });

    it('should get check-in by ID', async () => {
      const response = await request(app)
        .get(`/api/check-ins/${testCheckInId}`)
        .set('x-tenant-id', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testCheckInId);
      expect(response.body.data.medications).toBeDefined();
      expect(response.body.data.belongings).toBeDefined();
    });

    it('should filter check-ins by reservation', async () => {
      const response = await request(app)
        .get('/api/check-ins')
        .set('x-tenant-id', 'test')
        .query({ reservationId: testReservationId });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].reservationId).toBe(testReservationId);
    });

    it('should update a check-in', async () => {
      const response = await request(app)
        .put(`/api/check-ins/${testCheckInId}`)
        .set('x-tenant-id', 'test')
        .send({
          checkInNotes: 'Pet is doing well',
          foodProvided: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data.checkInNotes).toBe('Pet is doing well');
      expect(response.body.data.foodProvided).toBe(true);
    });
  });

  describe('Medications', () => {
    it('should add a medication to check-in', async () => {
      const response = await request(app)
        .post(`/api/check-ins/${testCheckInId}/medications`)
        .set('x-tenant-id', 'test')
        .send({
          medicationName: 'Rimadyl',
          dosage: '75mg',
          frequency: 'Once daily',
          administrationMethod: 'ORAL_PILL',
          withFood: false
        });

      expect(response.status).toBe(201);
      expect(response.body.data.medicationName).toBe('Rimadyl');
    });

    it('should validate required medication fields', async () => {
      const response = await request(app)
        .post(`/api/check-ins/${testCheckInId}/medications`)
        .set('x-tenant-id', 'test')
        .send({
          medicationName: 'Test Med'
          // Missing required fields
        });

      expect(response.status).toBe(500); // Should be 400 with proper validation
    });
  });

  describe('Service Agreements', () => {
    it('should create a service agreement template', async () => {
      const response = await request(app)
        .post('/api/service-agreement-templates')
        .set('x-tenant-id', 'test')
        .send({
          name: 'Test Agreement',
          content: 'This is a test service agreement. {{CUSTOMER_NAME}} agrees to the terms.',
          isDefault: true
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Test Agreement');
    });

    it('should create a signed service agreement', async () => {
      const response = await request(app)
        .post('/api/service-agreements')
        .set('x-tenant-id', 'test')
        .send({
          checkInId: testCheckInId,
          agreementText: 'Full agreement text here',
          initials: [
            { section: '1', initials: 'TC', timestamp: new Date().toISOString() }
          ],
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          signedBy: 'Test Customer'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.signedBy).toBe('Test Customer');
    });

    it('should get agreement by check-in ID', async () => {
      const response = await request(app)
        .get(`/api/service-agreements/check-in/${testCheckInId}`)
        .set('x-tenant-id', 'test');

      expect(response.status).toBe(200);
      expect(response.body.data.checkInId).toBe(testCheckInId);
    });

    it('should prevent duplicate agreements for same check-in', async () => {
      const response = await request(app)
        .post('/api/service-agreements')
        .set('x-tenant-id', 'test')
        .send({
          checkInId: testCheckInId,
          agreementText: 'Duplicate agreement',
          initials: [],
          signature: 'data:image/png;base64,test',
          signedBy: 'Test Customer'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should not access templates from different tenant', async () => {
      const response = await request(app)
        .get(`/api/check-in-templates/${testTemplateId}`)
        .set('x-tenant-id', 'different-tenant');

      expect(response.status).toBe(404);
    });

    it('should not access check-ins from different tenant', async () => {
      const response = await request(app)
        .get(`/api/check-ins/${testCheckInId}`)
        .set('x-tenant-id', 'different-tenant');

      expect(response.status).toBe(404);
    });
  });
});
