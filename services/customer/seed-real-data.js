// Seed script to add the real pet data to the customer database
const { PrismaClient } = require('@prisma/client');

// Force using the correct database URL regardless of environment
const DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/customer";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Helper function to get current date for the required updatedAt field
function getCurrentDate() {
  return new Date();
}

async function main() {
  try {
    console.log('Starting to seed real customer and pet data...');
    console.log('Using database URL:', DATABASE_URL);
    
    // Create real customers with real pets
    const customer1 = await prisma.customer.upsert({
      where: { id: 'real-customer-1' },
      update: {},
      create: {
        id: 'real-customer-1',
        firstName: 'Sam',
        lastName: 'Johnson',
        email: 'sam.johnson@example.com',
        phone: '303-555-1212',
        address: '123 Cherry Lane',
        city: 'Denver',
        state: 'CO',
        zipCode: '80220',
        organizationId: 'org-123', // Required field based on schema
        Pet: {
          create: [{
            id: 'pet-cheeto-1',
            name: 'Cheeto',
            breed: 'Orange Tabby',
            organizationId: 'org-123',
            notes: 'Friendly orange cat who loves treats',
            updatedAt: getCurrentDate()
          }]
        },
        updatedAt: getCurrentDate()
      },
      include: {
        Pet: true
      }
    });
    
    console.log(`Created/updated customer: ${customer1.firstName} ${customer1.lastName} with pet: ${customer1.Pet[0].name}`);

    const customer2 = await prisma.customer.upsert({
      where: { id: 'real-customer-2' },
      update: {},
      create: {
        id: 'real-customer-2',
        firstName: 'Emily',
        lastName: 'Parker',
        email: 'emily.parker@example.com',
        phone: '303-555-3434',
        address: '456 Maple Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80203',
        organizationId: 'org-123', // Required field based on schema
        Pet: {
          create: [{
            id: 'pet-moose-1',
            name: 'Moose',
            breed: 'Chocolate Lab',
            organizationId: 'org-123',
            notes: 'Energetic dog who loves to play fetch',
            updatedAt: getCurrentDate()
          }]
        },
        updatedAt: getCurrentDate()
      },
      include: {
        Pet: true
      }
    });
    
    console.log(`Created/updated customer: ${customer2.firstName} ${customer2.lastName} with pet: ${customer2.Pet[0].name}`);

    const customer3 = await prisma.customer.upsert({
      where: { id: 'real-customer-3' },
      update: {},
      create: {
        id: 'real-customer-3',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex.rodriguez@example.com',
        phone: '303-555-7878',
        address: '789 Oak Drive',
        city: 'Denver',
        state: 'CO',
        zipCode: '80205',
        organizationId: 'org-123', // Required field based on schema
        Pet: {
          create: [{
            id: 'pet-bunny-1',
            name: 'Bunny',
            breed: 'Holland Lop',
            organizationId: 'org-123',
            notes: 'Small rabbit with floppy ears',
            updatedAt: getCurrentDate()
          }]
        },
        updatedAt: getCurrentDate()
      },
      include: {
        Pet: true
      }
    });
    
    console.log(`Created/updated customer: ${customer3.firstName} ${customer3.lastName} with pet: ${customer3.Pet[0].name}`);
    
    console.log('Real data seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding real data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main();
