/**
 * Sync All Gingr Data
 * 
 * This script syncs all data from Gingr to our database:
 * 1. Customers (owners)
 * 2. Pets (animals)
 * 3. Reservations (with smart suite assignment)
 * 
 * Run this regularly to keep databases in sync.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runScript(scriptPath, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 ${description}`);
  console.log('='.repeat(60));
  
  try {
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message);
    return false;
  }
}

async function syncAll() {
  console.log('🚀 Starting full Gingr data sync...\n');
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  const results = {
    customers: false,
    pets: false,
    reservations: false
  };

  // Step 1: Sync customers
  results.customers = await runScript(
    'scripts/import-gingr-customer-data.js',
    'Syncing Customers (Owners)'
  );

  // Step 2: Sync pets
  results.pets = await runScript(
    'scripts/import-gingr-pet-profiles.js',
    'Syncing Pets (Animals)'
  );

  // Step 3: Sync reservations (with overlap prevention)
  results.reservations = await runScript(
    'scripts/sync-gingr-reservations.mjs',
    'Syncing Reservations (with overlap prevention)'
  );

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(60));
  console.log(`Customers: ${results.customers ? '✅ Success' : '❌ Failed'}`);
  console.log(`Pets: ${results.pets ? '✅ Success' : '❌ Failed'}`);
  console.log(`Reservations: ${results.reservations ? '✅ Success' : '❌ Failed'}`);
  console.log(`\nCompleted at: ${new Date().toLocaleString()}`);

  const allSuccess = Object.values(results).every(r => r);
  
  if (allSuccess) {
    console.log('\n✅ All data synced successfully!');
    
    // Run overlap validation
    console.log('\n🔍 Running final overlap validation...');
    try {
      await execAsync(
        'docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/validate-no-overlaps.sql'
      );
    } catch (error) {
      console.log('Validation output:', error.stdout);
    }
  } else {
    console.log('\n⚠️  Some sync operations failed. Check logs above.');
    process.exit(1);
  }
}

syncAll();
