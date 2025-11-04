#!/usr/bin/env node

/**
 * Check Gingr API for Vaccination Data
 * 
 * Analyzes Gingr API response to identify vaccination-related fields
 * and creates import script if vaccination data is available
 */

const fetch = require('node-fetch');

const GINGR_CONFIG = {
  subdomain: 'tailtownpetresort',
  apiKey: 'c84c09ecfacdf23a495505d2ae1df533'
};

const BASE_URL = `https://${GINGR_CONFIG.subdomain}.gingrapp.com/api/v1`;

/**
 * Make request to Gingr API
 */
async function makeGingrRequest(endpoint, data = {}) {
  const params = new URLSearchParams();
  params.append('key', GINGR_CONFIG.apiKey);
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Gingr API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Analyze pet data structure for vaccination fields
 */
async function analyzePetData() {
  console.log('\n🔍 Analyzing Gingr Pet Data for Vaccination Information');
  console.log('═════════════════════════════════════════════════════════════');

  try {
    // Get a sample of pet data
    const response = await makeGingrRequest('/animals', {});
    
    if (!response.data || response.data.length === 0) {
      console.log('❌ No pet data found');
      return;
    }

    console.log(`📊 Analyzing ${response.data.length} pet records...`);
    
    // Get first pet to analyze structure
    const samplePet = response.data[0];
    console.log('\n🔍 Sample Pet Structure:');
    console.log('Keys found:', Object.keys(samplePet));
    
    // Look for vaccination-related fields
    const vaccinationFields = Object.keys(samplePet).filter(key => 
      key.toLowerCase().includes('vaccin') || 
      key.toLowerCase().includes('immun') ||
      key.toLowerCase().includes('shot') ||
      key.toLowerCase().includes('rabies')
    );
    
    console.log('\n💉 Vaccination-Related Fields Found:');
    if (vaccinationFields.length > 0) {
      vaccinationFields.forEach(field => {
        console.log(`  - ${field}:`, JSON.stringify(samplePet[field], null, 2));
      });
    } else {
      console.log('  ❌ No vaccination fields found in sample');
    }
    
    // Check more pets for vaccination data
    console.log('\n🔍 Checking 10 random pets for vaccination data...');
    let petsWithVaccinationData = 0;
    const vaccinationExamples = [];
    
    for (let i = 0; i < Math.min(10, response.data.length); i++) {
      const pet = response.data[i];
      const hasVaccinationData = vaccinationFields.some(field => 
        pet[field] && pet[field] !== '' && pet[field] !== '0' && pet[field] !== null
      );
      
      if (hasVaccinationData) {
        petsWithVaccinationData++;
        const vaccinationData = {};
        vaccinationFields.forEach(field => {
          if (pet[field] && pet[field] !== '' && pet[field] !== '0' && pet[field] !== null) {
            vaccinationData[field] = pet[field];
          }
        });
        
        vaccinationExamples.push({
          petName: pet.first_name,
          vaccinationData
        });
      }
    }
    
    console.log(`\n📈 Vaccination Data Analysis:`);
    console.log(`  - Pets with vaccination data: ${petsWithVaccinationData} / 10`);
    console.log(`  - Percentage: ${(petsWithVaccinationData / 10 * 100).toFixed(1)}%`);
    
    if (vaccinationExamples.length > 0) {
      console.log('\n💉 Examples of Vaccination Data:');
      vaccinationExamples.forEach(example => {
        console.log(`\n  🐕 ${example.petName}:`);
        Object.entries(example.vaccinationData).forEach(([field, value]) => {
          console.log(`    ${field}: ${JSON.stringify(value)}`);
        });
      });
    }
    
    // Check if we should create import script
    if (petsWithVaccinationData > 0) {
      console.log('\n✅ VACCINATION DATA FOUND!');
      console.log('💡 Recommendation: Create vaccination import script');
      console.log('📝 Next steps:');
      console.log('   1. Map Gingr vaccination fields to Tailtown schema');
      console.log('   2. Create import script for vaccination data');
      console.log('   3. Update pet management UI to display vaccination records');
      
      return {
        hasVaccinationData: true,
        vaccinationFields,
        coverage: petsWithVaccinationData / 10,
        examples: vaccinationExamples
      };
    } else {
      console.log('\n❌ NO VACCINATION DATA FOUND');
      console.log('💡 Recommendation: Vaccination data may not be available in Gingr API');
      console.log('📝 Alternative options:');
      console.log('   1. Check if vaccination data is in a different Gingr endpoint');
      console.log('   2. Plan manual vaccination data entry system');
      console.log('   3. Create vaccination tracking from scratch');
      
      return {
        hasVaccinationData: false,
        vaccinationFields: [],
        coverage: 0,
        examples: []
      };
    }
    
  } catch (error) {
    console.error('❌ Error analyzing pet data:', error.message);
    return null;
  }
}

/**
 * Check other potential endpoints for vaccination data
 */
async function checkOtherEndpoints() {
  console.log('\n🔍 Checking Other Gingr Endpoints for Vaccination Data');
  console.log('═════════════════════════════════════════════════════════════');

  const endpoints = [
    '/medical_records',
    '/animals_medical',
    '/vaccinations',
    '/immunizations'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Checking ${endpoint}...`);
      const response = await makeGingrRequest(endpoint, {});
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} records in ${endpoint}`);
        console.log('Sample keys:', Object.keys(response.data[0]));
        
        // Check if these contain vaccination data
        const sample = response.data[0];
        const hasVaccination = Object.keys(sample).some(key => 
          key.toLowerCase().includes('vaccin') || 
          key.toLowerCase().includes('immun')
        );
        
        if (hasVaccination) {
          console.log('💉 This endpoint contains vaccination data!');
          return { endpoint, hasData: true, sample };
        }
      } else {
        console.log(`❌ No data found in ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ Error accessing ${endpoint}: ${error.message}`);
    }
  }
  
  return null;
}

/**
 * Main execution
 */
async function main() {
  console.log('🐕 Gingr Vaccination Data Analysis Tool');
  console.log('═════════════════════════════════════════════════════════════');
  
  // Analyze main pet data
  const petAnalysis = await analyzePetData();
  
  // Check other endpoints
  const otherEndpointData = await checkOtherEndpoints();
  
  // Summary
  console.log('\n📋 SUMMARY');
  console.log('═════════════════════════════════════════════════════════════');
  
  if (petAnalysis?.hasVaccinationData) {
    console.log('✅ VACCINATION DATA IS AVAILABLE in Gingr API');
    console.log(`📊 Coverage estimate: ${(petAnalysis.coverage * 100).toFixed(1)}%`);
    console.log(`🔧 Fields available: ${petAnalysis.vaccinationFields.join(', ')}`);
    console.log('\n💡 RECOMMENDED ACTIONS:');
    console.log('1. Create vaccination import script');
    console.log('2. Map Gingr fields to Tailtown vaccination schema');
    console.log('3. Update pet management UI to show vaccination records');
  } else if (otherEndpointData?.hasData) {
    console.log(`✅ VACCINATION DATA FOUND in ${otherEndpointData.endpoint}`);
    console.log('💡 RECOMMENDED ACTIONS:');
    console.log('1. Analyze this endpoint for vaccination data structure');
    console.log('2. Create import script for this specific endpoint');
    console.log('3. Integrate with pet vaccination management');
  } else {
    console.log('❌ NO VACCINATION DATA FOUND in Gingr API');
    console.log('\n💡 ALTERNATIVE APPROACHES:');
    console.log('1. Build vaccination tracking system from scratch');
    console.log('2. Create manual vaccination data entry UI');
    console.log('3. Plan future integration with veterinary management systems');
  }
}

// Run the analysis
main().catch(console.error);
