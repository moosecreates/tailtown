import { PrismaClient, ServiceCategory } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function createBoardingService() {
  try {
    // Check if a boarding service already exists
    const existingService = await prisma.service.findFirst({
      where: {
        serviceCategory: 'BOARDING',
        isActive: true
      }
    });

    if (existingService) {
      console.log('A boarding service already exists:', existingService);
      return;
    }

    // Create a new boarding service
    const newService = await prisma.service.create({
      data: {
        name: 'Standard Boarding',
        description: 'Overnight boarding service with comfortable accommodations for your pet',
        duration: 1440, // 24 hours in minutes
        price: 45.00,
        serviceCategory: 'BOARDING',
        isActive: true,
        requiresStaff: true,
        notes: 'Includes morning and evening walks, feeding, and basic care'
      }
    });

    console.log('Successfully created boarding service:', newService);

    // Create a VIP boarding service as well
    const vipService = await prisma.service.create({
      data: {
        name: 'VIP Boarding',
        description: 'Premium overnight boarding with extra attention and luxury accommodations',
        duration: 1440, // 24 hours in minutes
        price: 65.00,
        serviceCategory: 'BOARDING',
        isActive: true,
        requiresStaff: true,
        notes: 'Includes premium bedding, extra playtime, and special treats'
      }
    });

    console.log('Successfully created VIP boarding service:', vipService);

  } catch (error) {
    console.error('Error creating boarding service:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createBoardingService()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
