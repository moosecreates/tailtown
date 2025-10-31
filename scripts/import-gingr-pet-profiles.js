#!/usr/bin/env node

/**
 * Gingr Pet Profiles Import Tool - Phase 2 (HIGH VALUE)
 * 
 * Imports high-value operational data from Gingr:
 * - Grooming notes (special instructions, preferences)
 * - General pet notes (behavioral notes, special instructions)
 * - Evaluation notes (assessment information)
 * - Weight (current weight)
 * - Temperament (temperament classification)
 * - VIP status (VIP flag)
 * - Fixed status (spayed/neutered)
 * 
 * Time Savings: ~450 hours of manual data entry
 * 
 * Usage:
 *   node scripts/import-gingr-pet-profiles.js <subdomain> <api-key>
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.log('\nUsage:');
  console.log('  node scripts/import-gingr-pet-profiles.js <subdomain> <api-key>');
  console.log('\nExample:');
  console.log('  node scripts/import-gingr-pet-profiles.js tailtownpetresort abc123xyz456');
  process.exit(1);
}

const [subdomain, apiKey] = args;
const BASE_URL = `https://${subdomain}.gingrapp.com/api/v1`;

console.log('\n🐕 Gingr Pet Profiles Import Tool - Phase 2 (HIGH VALUE)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Subdomain: ${subdomain}`);
console.log('Importing: Grooming Notes, Pet Notes, Weight, Temperament, VIP Status');
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
 * Strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, '').trim() || null;
}

/**
 * Get animal data with profile fields
 */
async function getAnimalData(animalId) {
  try {
    const response = await makeGingrRequest('/animals', { id: animalId });
    if (!response.data || response.data.length === 0) {
      return null;
    }
    return response.data[0];
  } catch (error) {
    console.error(`⚠️  Error fetching animal ${animalId}:`, error.message);
    return null;
  }
}

/**
 * Import pet profile data
 */
async function importPetProfiles() {
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
        externalId: true
      }
    });
    
    console.log(`✅ Found ${localPets.length} active pets with Gingr IDs`);
    
    let petsUpdated = 0;
    let petsSkipped = 0;
    let petsWithGroomingNotes = 0;
    let petsWithGeneralNotes = 0;
    let petsWithEvaluationNotes = 0;
    let petsWithWeight = 0;
    let petsWithTemperament = 0;
    let vipPets = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Processing pet profile data...');
    console.log('This may take a while as we fetch data for each pet individually...\n');
    
    for (let i = 0; i < localPets.length; i++) {
      const pet = localPets[i];
      
      try {
        // Fetch animal data
        const animalData = await getAnimalData(pet.externalId);
        
        if (!animalData) {
          petsSkipped++;
          continue;
        }
        
        // Process the data
        const updateData = {};
        let hasUpdates = false;
        
        // Grooming notes
        const groomingNotes = stripHtml(animalData.grooming_notes);
        if (groomingNotes) {
          updateData.groomingNotes = groomingNotes;
          petsWithGroomingNotes++;
          hasUpdates = true;
        }
        
        // General notes
        const generalNotes = stripHtml(animalData.notes);
        if (generalNotes) {
          updateData.notes = generalNotes;
          petsWithGeneralNotes++;
          hasUpdates = true;
        }
        
        // Evaluation notes
        const evaluationNotes = stripHtml(animalData.evaluation_notes);
        if (evaluationNotes) {
          updateData.evaluationNotes = evaluationNotes;
          petsWithEvaluationNotes++;
          hasUpdates = true;
        }
        
        // Weight
        if (animalData.weight && animalData.weight !== '0') {
          updateData.weight = parseFloat(animalData.weight);
          petsWithWeight++;
          hasUpdates = true;
        }
        
        // Temperament
        if (animalData.temperment) {
          updateData.temperament = animalData.temperment;
          petsWithTemperament++;
          hasUpdates = true;
        }
        
        // VIP status
        if (animalData.vip === '1' || animalData.vip === 1) {
          updateData.isVip = true;
          vipPets++;
          hasUpdates = true;
        }
        
        // Fixed status (spayed/neutered)
        if (animalData.fixed !== undefined && animalData.fixed !== null) {
          updateData.isFixed = animalData.fixed === '1' || animalData.fixed === 1;
          hasUpdates = true;
        }
        
        // Update pet if we have any data
        if (hasUpdates) {
          await prisma.pet.update({
            where: { id: pet.id },
            data: {
              ...updateData,
              updatedAt: new Date()
            }
          });
          
          petsUpdated++;
        } else {
          petsSkipped++;
        }
        
        if (petsUpdated % 100 === 0 && petsUpdated > 0) {
          console.log(`  📝 Updated ${petsUpdated} pets... (${Math.round((i + 1) / localPets.length * 100)}% complete)`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing pet ${pet.name}:`, error.message);
        errorCount++;
      }
    }
    
    // Final statistics
    console.log('\n📈 Import Results:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Pets updated: ${petsUpdated}`);
    console.log(`   ✂️  With grooming notes: ${petsWithGroomingNotes}`);
    console.log(`   📝 With general notes: ${petsWithGeneralNotes}`);
    console.log(`   📋 With evaluation notes: ${petsWithEvaluationNotes}`);
    console.log(`   ⚖️  With weight: ${petsWithWeight}`);
    console.log(`   🎭 With temperament: ${petsWithTemperament}`);
    console.log(`   ⭐ VIP pets: ${vipPets}`);
    console.log(`⚠️  Pets skipped (no data): ${petsSkipped}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total pets processed: ${localPets.length}`);
    
    // Show some examples
    const examples = await prisma.pet.findMany({
      where: {
        OR: [
          { groomingNotes: { not: null } },
          { notes: { not: null } },
          { weight: { not: null } },
          { temperament: { not: null } }
        ],
        isActive: true
      },
      select: {
        name: true,
        groomingNotes: true,
        notes: true,
        weight: true,
        temperament: true,
        isVip: true
      },
      take: 3
    });
    
    console.log('\n🐕 Examples of Imported Profile Data:');
    examples.forEach(pet => {
      console.log(`\n🐕 ${pet.name}${pet.isVip ? ' ⭐ VIP' : ''}:`);
      if (pet.groomingNotes) console.log(`  ✂️  Grooming: ${pet.groomingNotes}`);
      if (pet.notes) console.log(`  📝 Notes: ${pet.notes}`);
      if (pet.weight) console.log(`  ⚖️  Weight: ${pet.weight} lbs`);
      if (pet.temperament) console.log(`  🎭 Temperament: ${pet.temperament}`);
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
    await importPetProfiles();
    
    console.log('\n🎉 Phase 2 Pet Profiles Import Complete!');
    console.log('💡 High-Value Operational Data Imported:');
    console.log('✅ Grooming Notes - Staff instructions and preferences');
    console.log('✅ General Pet Notes - Behavioral context and special instructions');
    console.log('✅ Evaluation Notes - Assessment information for training');
    console.log('✅ Weight - Current weight for medical records');
    console.log('✅ Temperament - Behavioral classification');
    console.log('✅ VIP Status - Premium service identification');
    console.log('✅ Fixed Status - Spayed/neutered information');
    console.log('\n⏱️  Estimated Time Saved: ~450 hours of manual data entry');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
main();
