// Quick script to seed test data for reservation testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Organization model is not in Prisma schema, but we can still use the organizationId
    const tenantId = 'test-org-123';

    // Create a test customer
    const customer = await prisma.customer.upsert({
      where: { id: 'test-customer-123' },
      update: {},
      create: {
        id: 'test-customer-123',
        organizationId: tenantId,
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '555-1234'
      },
    });
    
    console.log(`Created/Updated customer: ${customer.firstName} ${customer.lastName}`);

    // Create a test pet
    const pet = await prisma.pet.upsert({
      where: { id: 'test-pet-123' },
      update: {},
      create: {
        id: 'test-pet-123',
        organizationId: tenantId,
        customerId: 'test-customer-123',
        name: 'Fluffy',
        breed: 'Mixed',
      },
    });
    
    console.log(`Created/Updated pet: ${pet.name}`);

    // Check if Service model exists in the schema
    if (prisma.service) {
      try {
        // Create a test service - using try/catch as we're not sure about the schema
        const service = await prisma.service.upsert({
          where: { id: 'test-service-123' },
          update: {},
          create: {
            id: 'test-service-123',
            organizationId: tenantId,
            name: 'Test Boarding',
            type: 'BOARDING',
            price: 50.00,
          },
        });
        console.log(`Created/Updated service: ${service.name}`);
      } catch (serviceError) {
        console.log('Skipping service creation due to schema mismatch:', serviceError.message);
      }
    } else {
      console.log('Service model not available in schema, skipping');
    }

    // Create a test resource (kennel)
    const resource = await prisma.resource.upsert({
      where: { id: 'test-resource-123' },
      update: {},
      create: {
        id: 'test-resource-123',
        organizationId: tenantId,
        name: 'Test Kennel',
        type: 'KENNEL',
        isActive: true,
        capacity: 1
      },
    });
    
    console.log(`Created/Updated resource: ${resource.name}`);

    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
