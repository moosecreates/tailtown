#!/usr/bin/env node

/**
 * Gingr Immunization Records Import Tool
 * 
 * Imports actual immunization records from Gingr API using get_animal_immunizations endpoint
 * This replaces the synthetic vaccination data with real records from Gingr
 * 
 * Usage:
 *   node scripts/import-gingr-immunizations.js <subdomain> <api-key>
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.log('\nUsage:');
  console.log('  node scripts/import-gingr-immunizations.js <subdomain> <api-key>');
  console.log('\nExample:');
  console.log('  node scripts/import-gingr-immunizations.js tailtownpetresort abc123xyz456');
  process.exit(1);
}

const [subdomain, apiKey] = args;
const BASE_URL = `https://${subdomain}.gingrapp.com/api/v1`;

console.log('\n💉 Gingr Immunization Records Import Tool');
console.log('═══════════════════════════════════════════════════');
console.log(`Subdomain: ${subdomain}`);
console.log('');

/**
 * Make request to Gingr API
 */
async function makeGingrRequest(endpoint, params = {}) {
  const urlParams = new URLSearchParams();
  urlParams.append('key', apiKey);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });
  
  const response = await fetch(`${BASE_URL}${endpoint}?${urlParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Gingr API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convert Unix timestamp to ISO date string
 */
function convertUnixTimestampToDate(timestamp) {
  if (!timestamp || timestamp === '0' || timestamp === '') {
    return null;
  }
  
  const date = new Date(parseInt(timestamp) * 1000);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString();
}

/**
 * Map Gingr immunization type to our vaccine ID
 */
function mapImmunizationType(gingrType) {
  const typeMap = {
    'Rabies': 'rabies',
    'DHPP': 'dhpp',
    'Bordetella': 'bordetella',
    'FVRCP': 'fvrcp',
    'Canine Influenza': 'canine_influenza',
    'Feline Leukemia': 'feline_leukemia',
    'Lepto': 'lepto',
    'Leptospirosis': 'lepto'
  };
  
  return typeMap[gingrType] || gingrType.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Get immunization records for a specific animal
 */
async function getAnimalImmunizations(animalId) {
  try {
    const response = await makeGingrRequest('/get_animal_immunizations', {
      animal_id: animalId
    });
    
    if (!response.success || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`⚠️  Error fetching immunizations for animal ${animalId}:`, error.message);
    return [];
  }
}

/**
 * Convert Gingr immunization records to our format
 */
function convertImmunizationRecords(gingrRecords) {
  const vaccinationStatus = {};
  const vaccineExpirations = {};
  
  const now = new Date();
  
  gingrRecords.forEach(record => {
    const vaccineId = mapImmunizationType(record.type);
    const expirationDate = convertUnixTimestampToDate(record.expiration_date);
    
    if (!expirationDate) {
      return;
    }
    
    const expiration = new Date(expirationDate);
    const status = expiration > now ? 'CURRENT' : 'EXPIRED';
    
    vaccinationStatus[vaccineId] = {
      status: status,
      expiration: expirationDate,
      lastChecked: new Date().toISOString(),
      notes: record.note || undefined
    };
    
    vaccineExpirations[vaccineId] = expirationDate;
  });
  
  return { vaccinationStatus, vaccineExpirations };
}

/**
 * Import immunization data from Gingr
 */
async function importImmunizationData() {
  console.log('📋 Fetching pets from local database...');
  
  try {
    // Get all active pets with their external IDs
    const localPets = await prisma.pet.findMany({
      where: { 
        isActive: true,
        externalId: { not: null }
      },
      select: { 
        id: true, 
        name: true, 
        externalId: true,
        type: true
      }
    });
    
    console.log(`✅ Found ${localPets.length} active pets with Gingr IDs`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let noRecordsCount = 0;
    
    console.log('\n🔄 Processing immunization records...');
    console.log('This may take a while as we fetch data for each pet individually...\n');
    
    for (let i = 0; i < localPets.length; i++) {
      const pet = localPets[i];
      
      try {
        // Fetch immunization records from Gingr
        const gingrRecords = await getAnimalImmunizations(pet.externalId);
        
        if (gingrRecords.length === 0) {
          noRecordsCount++;
          continue;
        }
        
        // Convert to our format
        const { vaccinationStatus, vaccineExpirations } = convertImmunizationRecords(gingrRecords);
        
        if (Object.keys(vaccinationStatus).length === 0) {
          skippedCount++;
          continue;
        }
        
        // Update pet with real immunization data
        await prisma.pet.update({
          where: { id: pet.id },
          data: {
            vaccinationStatus: vaccinationStatus,
            vaccineExpirations: vaccineExpirations,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`  📝 Updated ${updatedCount} pets... (${Math.round((i + 1) / localPets.length * 100)}% complete)`);
        }
        
        // Rate limiting - small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing pet ${pet.name}:`, error.message);
        errorCount++;
      }
    }
    
    // Final statistics
    const finalStats = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN "vaccinationStatus" IS NOT NULL THEN 1 END) as pets_with_vaccination_status,
        COUNT(CASE WHEN "vaccineExpirations" IS NOT NULL THEN 1 END) as pets_with_expirations,
        COUNT(*) as total_pets
      FROM pets 
      WHERE "isActive" = true
    `;
    
    console.log('\n📈 Import Results:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Pets updated with real data: ${updatedCount}`);
    console.log(`📭 Pets with no immunization records: ${noRecordsCount}`);
    console.log(`⚠️  Pets skipped (invalid data): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total pets processed: ${localPets.length}`);
    
    console.log('\n📊 Final Database Statistics:');
    console.log(`🐕 Pets with vaccination status: ${finalStats[0].pets_with_vaccination_status} / ${finalStats[0].total_pets}`);
    console.log(`💉 Pets with expiration dates: ${finalStats[0].pets_with_expirations} / ${finalStats[0].total_pets}`);
    console.log(`📈 Vaccination coverage: ${((finalStats[0].pets_with_vaccination_status / finalStats[0].total_pets) * 100).toFixed(1)}%`);
    
    // Show some examples
    const examples = await prisma.pet.findMany({
      where: {
        vaccinationStatus: { not: null },
        isActive: true
      },
      select: {
        name: true,
        type: true,
        vaccinationStatus: true,
        vaccineExpirations: true
      },
      take: 5
    });
    
    console.log('\n💉 Examples of Imported Real Immunization Data:');
    examples.forEach(pet => {
      console.log(`\n🐕 ${pet.name} (${pet.type}):`);
      console.log(`  Status: ${JSON.stringify(pet.vaccinationStatus, null, 2)}`);
      console.log(`  Expirations: ${JSON.stringify(pet.vaccineExpirations, null, 2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    await importImmunizationData();
    
    console.log('\n🎉 Real Immunization Import Complete!');
    console.log('💡 Benefits:');
    console.log('✅ Real vaccination data from Gingr (not synthetic)');
    console.log('✅ Accurate expiration dates matching Gingr records');
    console.log('✅ Individual vaccine types with proper status');
    console.log('✅ Notes from Gingr staff preserved');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
main();
