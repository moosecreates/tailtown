// Simple script to check for pets in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPets() {
  try {
    console.log('Checking Pet model (uppercase)...');
    const upperPets = await prisma.pet.findMany({
      take: 20,
      orderBy: { name: 'asc' },
    });
    console.log(`Found ${upperPets.length} pets in Pet model:`);
    upperPets.forEach(pet => console.log(`- ${pet.name} (${pet.id})`));
    
    console.log('\nChecking for specific pets by name...');
    const specificPets = await prisma.pet.findMany({
      where: {
        name: {
          in: ['Moose', 'Bunny', 'Cheeto']
        }
      }
    });
    console.log(`Found ${specificPets.length} specific pets:`);
    specificPets.forEach(pet => console.log(`- ${pet.name} (${pet.id})`));
    
    console.log('\nChecking pets table with raw query...');
    try {
      const lowerPets = await prisma.$queryRaw`SELECT * FROM pets LIMIT 20`;
      console.log(`Found ${lowerPets.length} pets in pets table:`);
      lowerPets.forEach(pet => console.log(`- ${pet.name} (${pet.id || pet.pet_id})`));
      
      console.log('\nChecking for specific pets in pets table...');
      const specificLowerPets = await prisma.$queryRaw`SELECT * FROM pets WHERE name IN ('Moose', 'Bunny', 'Cheeto')`;
      console.log(`Found ${specificLowerPets.length} specific pets in pets table:`);
      specificLowerPets.forEach(pet => console.log(`- ${pet.name} (${pet.id || pet.pet_id})`));
    } catch (e) {
      console.log('Error querying pets table:', e.message);
    }
  } catch (error) {
    console.error('Error checking pets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPets();
