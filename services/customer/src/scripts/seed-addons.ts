import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This file has been emptied to remove mock data seeding.
 * Per requirements: Mock data should only be used for tests, not for dev or prod environments.
 * This script previously contained mock add-on service data that has been removed.
 */

async function main() {
  try {
    console.log('Add-on services seeding has been disabled.');
    console.log('Please connect to real production data instead.');
    
    // The script previously created mock add-on services like:
    // - Extra Playtime, Special Treat, Cuddle Time for boarding
    // - Hair Blow Out, Nail Polish, Teeth Brushing for grooming
    // These have been removed to prevent mock data in production environments.
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
