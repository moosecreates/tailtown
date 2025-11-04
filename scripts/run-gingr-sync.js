#!/usr/bin/env node

/**
 * Gingr Sync Runner
 * 
 * Runs Gingr sync for all enabled tenants.
 * Can be run manually or via cron (every 8 hours).
 * 
 * Usage:
 *   node scripts/run-gingr-sync.js
 *   
 * Cron: See scripts/setup-gingr-cron.sh for installation
 */

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../services/customer/.env') });

const { gingrSyncService } = require(path.join(__dirname, '../services/customer/dist/services/gingr-sync.service'));

async function main() {
  console.log('🔄 Gingr Sync Started');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('');

  try {
    const results = await gingrSyncService.syncAllEnabledTenants();
    
    console.log('\n📊 Sync Summary:');
    console.log('================');
    
    for (const result of results) {
      console.log(`\n${result.success ? '✅' : '❌'} ${result.tenantId}`);
      console.log(`   Customers: ${result.customersSync}`);
      console.log(`   Pets: ${result.petsSync}`);
      console.log(`   Reservations: ${result.reservationsSync}`);
      console.log(`   Invoices: ${result.invoicesSync}`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Sync complete: ${successCount}/${results.length} tenants successful`);
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
