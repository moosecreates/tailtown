/**
 * Simple script to check for real pet data in the primary customer database (port 5433)
 */
const { PrismaClient } = require('@prisma/client');

// Create a Prisma client pointing to the main customer database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5433/customer"
    }
  }
});

async function checkRealData() {
  console.log('Checking primary customer database for real pet data...');

  try {
    // Get all customers
    const customers = await prisma.customer.findMany({
      include: { 
        Pet: true 
      }
    });

    console.log(`Found ${customers.length} customers in the database.`);

    if (customers.length === 0) {
      console.log('No customers found in the database.');
    } else {
      // Display customer and pet data
      customers.forEach(customer => {
        console.log(`\nCustomer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
        
        if (customer.Pet && customer.Pet.length > 0) {
          console.log(`  Pets (${customer.Pet.length}):`);
          customer.Pet.forEach(pet => {
            console.log(`  - ${pet.name} (${pet.breed || 'Unknown breed'})`);
          });
        } else {
          console.log('  No pets for this customer.');
        }
      });
    }
  } catch (error) {
    console.error('Error accessing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkRealData()
  .then(() => console.log('\nDatabase check complete.'))
  .catch(e => {
    console.error('Script execution error:', e);
    process.exit(1);
  });
