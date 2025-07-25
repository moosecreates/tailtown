// This file has been emptied to remove test data seeding
// Per requirements: Mock data should only be used for tests, not for dev or prod environments
// This script previously contained test data seeding logic that has been removed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Test data seeding has been disabled.');
    console.log('Please connect to real production data instead.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Commented out to prevent execution
// main();
