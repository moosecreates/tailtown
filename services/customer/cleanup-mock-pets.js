const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupMockPets() {
  try {
    console.log('Starting cleanup of mock pet data...');
    
    // First, let's see what pets exist
    const allPets = await prisma.$queryRaw`SELECT id, name, "customerId" FROM pets`;
    console.log('Current pets in database:', allPets);
    
    // The mock pets from the test had these IDs and fake customer IDs:
    const mockPetIds = [
      '32c9d0e7-90a5-406a-85d9-9c886545ef05', // Cheeto
      '64e83c5a-a7e2-4a13-8e71-a85c5a419186', // Moose  
      'c7edcb59-c988-468e-822a-123b3b2ec4d6'  // Bunny
    ];
    
    // Also delete pets with fake customer IDs that don't exist
    const fakeCustomerIds = [
      'real-customer-1',
      'real-customer-2', 
      'real-customer-3'
    ];
    
    console.log('Deleting mock pets by ID...');
    for (const petId of mockPetIds) {
      try {
        const result = await prisma.$executeRaw`DELETE FROM pets WHERE id = ${petId}`;
        console.log(`Deleted pet ${petId}: ${result} rows affected`);
      } catch (error) {
        console.log(`Pet ${petId} not found or already deleted`);
      }
    }
    
    console.log('Deleting pets with fake customer IDs...');
    for (const customerId of fakeCustomerIds) {
      try {
        const result = await prisma.$executeRaw`DELETE FROM pets WHERE "customerId" = ${customerId}`;
        console.log(`Deleted pets for fake customer ${customerId}: ${result} rows affected`);
      } catch (error) {
        console.log(`No pets found for fake customer ${customerId}`);
      }
    }
    
    // Show remaining pets
    const remainingPets = await prisma.$queryRaw`SELECT id, name, "customerId" FROM pets`;
    console.log('Remaining pets after cleanup:', remainingPets);
    console.log(`Total pets remaining: ${remainingPets.length}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMockPets();
