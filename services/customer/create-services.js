const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createServices() {
  try {
    console.log('Creating basic services...');

    const services = [
      {
        id: 'service-1',
        name: 'Full Day Daycare',
        description: 'Full day care for your dog with supervised play and activities',
        duration: 480, // 8 hours in minutes
        price: 45.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      },
      {
        id: 'service-2',
        name: 'Half Day Daycare',
        description: 'Half day care for your dog with supervised play',
        duration: 240, // 4 hours in minutes
        price: 25.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      },
      {
        id: 'service-3',
        name: 'Overnight Boarding',
        description: 'Overnight boarding with comfortable accommodations',
        duration: 1440, // 24 hours in minutes
        price: 65.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      },
      {
        id: 'service-4',
        name: 'Basic Grooming',
        description: 'Basic grooming package including bath, brush, and nail trim',
        duration: 120, // 2 hours in minutes
        price: 55.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      },
      {
        id: 'service-5',
        name: 'Full Grooming',
        description: 'Complete grooming package with bath, cut, style, and nail trim',
        duration: 180, // 3 hours in minutes
        price: 85.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      },
      {
        id: 'service-6',
        name: 'Basic Training Session',
        description: 'One-on-one basic obedience training session',
        duration: 60, // 1 hour in minutes
        price: 75.00,
        isActive: true,
        updatedAt: new Date(),
        organizationId: 'default-org'
      }
    ];

    for (const service of services) {
      console.log(`Creating service: ${service.name}`);
      await prisma.service.upsert({
        where: { id: service.id },
        update: service,
        create: service
      });
    }

    console.log('Services created successfully!');
  } catch (error) {
    console.error('Error creating services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createServices();
