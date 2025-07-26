const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSimpleServices() {
  try {
    console.log('Creating simple services...');

    // Create services matching the actual database schema
    const services = [
      {
        id: 'service-1',
        name: 'Full Day Daycare',
        description: 'Full day care for your dog with supervised play and activities',
        price: 45.00,
        duration: 480,
        serviceCategory: 'DAYCARE',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 20,
        updatedAt: new Date()
      },
      {
        id: 'service-2', 
        name: 'Half Day Daycare',
        description: 'Half day care for your dog with supervised play',
        price: 25.00,
        duration: 240,
        serviceCategory: 'DAYCARE',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 20,
        updatedAt: new Date()
      },
      {
        id: 'service-3',
        name: 'Overnight Boarding',
        description: 'Overnight boarding with comfortable accommodations',
        price: 65.00,
        duration: 1440,
        serviceCategory: 'BOARDING',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 50,
        updatedAt: new Date()
      },
      {
        id: 'service-4',
        name: 'Basic Grooming',
        description: 'Basic grooming package including bath, brush, and nail trim',
        price: 55.00,
        duration: 120,
        serviceCategory: 'GROOMING',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 5,
        updatedAt: new Date()
      },
      {
        id: 'service-5',
        name: 'Full Grooming',
        description: 'Complete grooming package with bath, cut, style, and nail trim',
        price: 85.00,
        duration: 180,
        serviceCategory: 'GROOMING',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 3,
        updatedAt: new Date()
      },
      {
        id: 'service-6',
        name: 'Basic Training Session',
        description: 'One-on-one basic obedience training session',
        price: 75.00,
        duration: 60,
        serviceCategory: 'TRAINING',
        isActive: true,
        requiresStaff: true,
        capacityLimit: 1,
        updatedAt: new Date()
      }
    ];

    for (const service of services) {
      console.log(`Creating service: ${service.name}`);
      try {
        await prisma.service.create({
          data: service
        });
        console.log(`✓ Created: ${service.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`- Service ${service.name} already exists, skipping`);
        } else {
          console.error(`Error creating ${service.name}:`, error.message);
        }
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleServices();
