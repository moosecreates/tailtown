const { PrismaClient } = require('@prisma/client')

// We'll test multiple database URLs to find where the real pets are stored
async function testDatabases() {
  // List of potential database URLs to test
  const dbUrls = [
    'postgresql://postgres:postgres@localhost:5433/customer', // Original URL
    'postgresql://postgres:postgres@localhost:5434/reservation', // Reservation DB
    'postgresql://postgres:postgres@localhost:5435/customer', // Customer DB from Docker container
  ];
  
  console.log('Testing multiple database connections to find real pet data...');
  
  for (const url of dbUrls) {
    console.log(`\n\nTrying database URL: ${url}`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    });
    
    try {
      await testConnection(prisma, url);
    } catch (error) {
      console.error(`Error with database ${url}:`, error.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Test a single database connection
async function testConnection(prisma, url) {
  try {
    // Connect to database
    await prisma.$connect()
    console.log(`Successfully connected to database: ${url}`)
    
    // Query for all customers
    console.log('\nQuerying all customers...')
    const customers = await prisma.customer.findMany({
      include: {
        pets: true
      }
    })
    
    console.log(`Found ${customers.length} customers in the database`)
    if (customers.length > 0) {
      customers.forEach(customer => {
        console.log(`\nCustomer ID: ${customer.id}`)
        console.log(`Name: ${customer.firstName} ${customer.lastName}`)
        console.log(`Email: ${customer.email}`)
        console.log(`Pets (${customer.pets?.length || 0}):`)
        if (customer.pets && customer.pets.length > 0) {
          customer.pets.forEach(pet => {
            console.log(`  - ID: ${pet.id}, Name: ${pet.name}, Breed: ${pet.breed || 'N/A'}`)
            
            // Look for our target pet names
            if (['cheeto', 'moose', 'bunny'].includes(pet.name.toLowerCase())) {
              console.log('*** FOUND TARGET PET:', pet.name.toUpperCase(), '***')
            }
          })
        } else {
          console.log('  No pets')
        }
      })
    }
    
    // Query specifically for all pets
    console.log('\nQuerying all pets...')
    try {
      const pets = await prisma.pet.findMany({
        include: {
          customer: true  // Note: lowercase 'customer' as per Prisma schema
        }
      })
      
      console.log(`Found ${pets.length} pets in the database`)
      if (pets.length > 0) {
        pets.forEach(pet => {
          console.log(`\nPet ID: ${pet.id}`)
          console.log(`Name: ${pet.name}`)
          console.log(`Breed: ${pet.breed || 'N/A'}`)
          console.log(`Owner: ${pet.customer ? pet.customer.firstName + ' ' + pet.customer.lastName : 'No owner'}`)
          
          // Look for our target pet names
          if (['cheeto', 'moose', 'bunny'].includes(pet.name.toLowerCase())) {
            console.log('*** FOUND TARGET PET:', pet.name.toUpperCase(), '***')
          }
        })
      }
    } catch (error) {
      console.error('Error querying pets:', error.message)
    }
    
    // Direct database query as a last resort
    console.log('\nDirect query to Pet table:')
    try {
      const rawPets = await prisma.$queryRaw`SELECT * FROM "Pet" LIMIT 10`
      console.log('Raw pet records:', JSON.stringify(rawPets, null, 2))
      
      // Check for our target pets in the raw query
      for (const pet of rawPets) {
        if (pet.name && ['cheeto', 'moose', 'bunny'].includes(pet.name.toLowerCase())) {
          console.log('*** FOUND TARGET PET IN RAW QUERY:', pet.name.toUpperCase(), '***')
        }
      }
    } catch (error) {
      console.error('Error with raw query:', error.message)
    }
  } catch (error) {
    console.error('Error querying database:', error)
    throw error
  }
}

// Main function to start the database testing
testDatabases().catch(error => {
  console.error('Test database error:', error)
})
