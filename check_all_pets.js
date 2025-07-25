/**
 * Script to search all databases for pet names
 * 
 * This script connects to all three PostgreSQL databases used in Tailtown
 * and searches for pet records, returning their names and locations.
 */
const { PrismaClient } = require('@prisma/client');

// Function to check a specific database
async function checkDatabase(databaseUrl, dbName) {
  console.log(`\n----- Checking ${dbName} (${databaseUrl}) -----`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    // First try to use Prisma's Pet model if available
    try {
      const pets = await prisma.pet.findMany({
        include: {
          customer: true
        }
      });
      
      console.log(`Found ${pets.length} pets in ${dbName} using Prisma Pet model`);
      
      if (pets.length > 0) {
        console.log('\nPet names:');
        pets.forEach(pet => {
          const customerName = pet.customer ? `${pet.customer.firstName} ${pet.customer.lastName}` : 'Unknown';
          console.log(`- ${pet.name} (Owner: ${customerName})`);
        });
      } else {
        console.log('No pets found in this database using Prisma Pet model');
      }
    } catch (modelError) {
      console.log(`Prisma Pet model not available in ${dbName}: ${modelError.message}`);
      
      // Try raw SQL query if Prisma model doesn't work
      try {
        // First check if the pets table exists
        const tableCheck = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pets'
          )`;
        
        const petsTableExists = tableCheck[0].exists;
        
        if (petsTableExists) {
          const petsRaw = await prisma.$queryRaw`SELECT * FROM pets LIMIT 100`;
          
          console.log(`\nFound ${petsRaw.length} pets in ${dbName} using raw SQL query on 'pets' table`);
          
          if (petsRaw.length > 0) {
            console.log('\nPet names:');
            petsRaw.forEach(pet => {
              console.log(`- ${pet.name || '[No Name]'} (ID: ${pet.id})`);
            });
          } else {
            console.log('No pets found in this database in the pets table');
          }
        } else {
          console.log('No pets table found in this database');
        }
        
        // Check for Pet table (uppercase P)
        const upperTableCheck = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Pet'
          )`;
        
        const petTableExists = upperTableCheck[0].exists;
        
        if (petTableExists) {
          const petsRaw = await prisma.$queryRaw`SELECT * FROM "Pet" LIMIT 100`;
          
          console.log(`\nFound ${petsRaw.length} pets in ${dbName} using raw SQL query on 'Pet' table`);
          
          if (petsRaw.length > 0) {
            console.log('\nPet names:');
            petsRaw.forEach(pet => {
              console.log(`- ${pet.name || '[No Name]'} (ID: ${pet.id})`);
            });
          } else {
            console.log('No pets found in this database in the Pet table');
          }
        } else {
          console.log('No Pet table found in this database');
        }
      } catch (sqlError) {
        console.log(`SQL query failed in ${dbName}: ${sqlError.message}`);
      }
    }
    
    // Check for other tables that might contain pet data
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'`;
    
    console.log('\nAll tables in this database:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Look for any other tables that might contain 'pet' in their name
    const petRelatedTables = tables
      .map(t => t.table_name)
      .filter(name => 
        name.toLowerCase().includes('pet') && 
        name !== 'pets' && 
        name !== 'Pet'
      );
    
    if (petRelatedTables.length > 0) {
      console.log('\nOther tables that might contain pet data:');
      petRelatedTables.forEach(tableName => {
        console.log(`- ${tableName}`);
      });
    }
  } catch (error) {
    console.error(`Error checking ${dbName}:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Main function to check all databases
async function checkAllDatabases() {
  console.log('===== CHECKING ALL DATABASES FOR PET DATA =====\n');
  
  // Define the databases to check
  const databases = [
    {
      url: 'postgresql://postgres:postgres@localhost:5433/customer',
      name: 'Customer Database (Port 5433)'
    },
    {
      url: 'postgresql://postgres:postgres@localhost:5434/reservation',
      name: 'Reservation Database (Port 5434)'
    },
    {
      url: 'postgresql://postgres:postgres@localhost:5435/customer',
      name: 'Customer Database 2 (Port 5435)'
    }
  ];
  
  // Check each database
  for (const db of databases) {
    await checkDatabase(db.url, db.name);
  }
  
  console.log('\n===== DATABASE CHECK COMPLETE =====');
}

// Run the main function
checkAllDatabases().catch(e => {
  console.error('Error in main execution:', e);
  process.exit(1);
});
