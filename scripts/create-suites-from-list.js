/**
 * Create Suites from List Script
 * 
 * This script creates resources in Tailtown based on a list of suite names.
 * Use this when you know your suite names but they're not in Gingr reservation data.
 * 
 * Usage:
 *   node scripts/create-suites-from-list.js
 * 
 * Then edit the SUITES array below with your actual suite names.
 */

const fetch = require('node-fetch');

// ============================================================================
// EDIT THIS SECTION WITH YOUR SUITE NAMES
// ============================================================================

const SUITES = [
  // Actual suites from facility diagram
  // Last updated: November 1, 2025
  // Leading digit removed: 1xxx -> A, 2xxx -> B, 3xxx -> C, 4xxx -> D
  
  // A Area (previously 1xxx) - 16 suites
  'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08',
  'A09R', 'A10R', 'A11R', 'A12R', 'A13R', 'A14R', 'A15R', 'A16R',
  
  // B Area (previously 2xxx) - 32 suites
  'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08',
  'B09', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16',
  'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24',
  'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32',
  
  // C Area (previously 3xxx) - 24 suites
  'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08',
  'C09', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16',
  'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24',
  
  // D Area (previously 4xxx) - 32 suites
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08',
  'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16',
  'D17', 'D18', 'D19', 'D20', 'D21', 'D22', 'D23', 'D24',
  'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32',
];

// ============================================================================
// Configuration
// ============================================================================

const RESERVATION_SERVICE_URL = 'http://localhost:4003';
const TENANT_ID = 'dev';

/**
 * Determine resource type from suite name
 */
function determineResourceType(suiteName) {
  const name = suiteName.toUpperCase();
  
  // Check for VIP indicators
  if (name.includes('VIP') || name.startsWith('V') || name.includes('PREMIUM')) {
    return 'VIP_SUITE';
  }
  
  // Check for Plus/Deluxe indicators
  if (name.includes('PLUS') || name.includes('+') || name.includes('DELUXE')) {
    return 'STANDARD_PLUS_SUITE';
  }
  
  // Default to standard
  return 'STANDARD_SUITE';
}

/**
 * Check if resource already exists
 */
async function resourceExists(name) {
  try {
    const response = await fetch(
      `${RESERVATION_SERVICE_URL}/api/resources?limit=1000`,
      { headers: { 'x-tenant-id': TENANT_ID } }
    );
    
    const data = await response.json();
    const resources = data.data?.resources || [];
    
    return resources.some(r => r.name === name);
  } catch (error) {
    console.error(`Error checking if resource exists:`, error.message);
    return false;
  }
}

/**
 * Create a single resource
 */
async function createResource(name) {
  try {
    const type = determineResourceType(name);
    
    const response = await fetch(
      `${RESERVATION_SERVICE_URL}/api/resources`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID
        },
        body: JSON.stringify({
          name: name,
          type: type,
          capacity: 1,
          isActive: true,
          tenantId: TENANT_ID,
          description: `Suite ${name}`
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const newResource = await response.json();
    return newResource;
    
  } catch (error) {
    throw new Error(`Failed to create resource: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🏨 Create Suites from List');
  console.log('═══════════════════════════════');
  console.log(`Total suites to create: ${SUITES.length}`);
  console.log(`Reservation Service: ${RESERVATION_SERVICE_URL}`);
  console.log(`Tenant ID: ${TENANT_ID}\n`);
  
  if (SUITES.length === 0) {
    console.log('❌ No suites defined!');
    console.log('\nPlease edit this script and add your suite names to the SUITES array.');
    console.log('Example:');
    console.log('  const SUITES = [');
    console.log('    \'A01\', \'A02\', \'A03\', ... \'A27\',');
    console.log('    \'B01\', \'B02\', \'B03\', ... \'B15\',');
    console.log('  ];');
    return;
  }
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  
  console.log('📋 Processing suites...\n');
  
  for (const suiteName of SUITES) {
    process.stdout.write(`  ${suiteName.padEnd(10)} ... `);
    
    try {
      // Check if already exists
      const exists = await resourceExists(suiteName);
      
      if (exists) {
        console.log('⏭️  Already exists');
        skipped++;
        continue;
      }
      
      // Create the resource
      await createResource(suiteName);
      console.log('✅ Created');
      created++;
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failed++;
      errors.push({ suite: suiteName, error: error.message });
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════');
  console.log(`Total suites: ${SUITES.length}`);
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ suite, error }) => {
      console.log(`  ${suite}: ${error}`);
    });
  }
  
  if (created > 0) {
    console.log('\n✅ Success! Suites have been created in Tailtown.');
    console.log('You can view them in Admin → Resources');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
