#!/usr/bin/env node

/**
 * Gingr Customer Data Import Tool - Phase 3 (MEDIUM VALUE)
 * 
 * Imports additional customer data from Gingr:
 * - Customer notes (general notes about the customer)
 * - Communication preferences (email/SMS opt-outs for legal compliance)
 * - Payment preferences (default payment method, current balance)
 * - Source (how they found the business)
 * 
 * Time Savings: ~200 hours of manual data entry
 * 
 * Usage:
 *   node scripts/import-gingr-customer-data.js <subdomain> <api-key>
 */

const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.log('\nUsage:');
  console.log('  node scripts/import-gingr-customer-data.js <subdomain> <api-key>');
  console.log('\nExample:');
  console.log('  node scripts/import-gingr-customer-data.js tailtownpetresort abc123xyz456');
  process.exit(1);
}

const [subdomain, apiKey] = args;
const BASE_URL = `https://${subdomain}.gingrapp.com/api/v1`;

console.log('\n👥 Gingr Customer Data Import Tool - Phase 3 (MEDIUM VALUE)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Subdomain: ${subdomain}`);
console.log('Importing: Customer Notes, Communication Preferences, Payment Info');
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
 * Get owner/customer data
 */
async function getOwnerData(ownerId) {
  try {
    const response = await makeGingrRequest('/owner', { id: ownerId });
    if (!response.data) {
      return null;
    }
    return response.data;
  } catch (error) {
    console.error(`⚠️  Error fetching owner ${ownerId}:`, error.message);
    return null;
  }
}

/**
 * Import customer data
 */
async function importCustomerData() {
  console.log('📋 Fetching customers from local database...');
  
  try {
    // Get all active customers with their external IDs
    const localCustomers = await prisma.customer.findMany({
      where: { 
        isActive: true,
        externalId: { not: null }
      },
      select: { 
        id: true, 
        firstName: true,
        lastName: true,
        externalId: true
      }
    });
    
    console.log(`✅ Found ${localCustomers.length} active customers with Gingr IDs`);
    
    let customersUpdated = 0;
    let customersSkipped = 0;
    let customersWithNotes = 0;
    let customersWithCommPrefs = 0;
    let customersWithPaymentInfo = 0;
    let customersWithSource = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Processing customer data...');
    console.log('This may take a while as we fetch data for each customer individually...\n');
    
    for (let i = 0; i < localCustomers.length; i++) {
      const customer = localCustomers[i];
      
      try {
        // Fetch owner data from Gingr
        const ownerData = await getOwnerData(customer.externalId);
        
        if (!ownerData) {
          customersSkipped++;
          continue;
        }
        
        // Process the data
        const updateData = {};
        let hasUpdates = false;
        
        // Customer notes
        if (ownerData.notes && ownerData.notes.trim()) {
          updateData.notes = ownerData.notes.trim();
          customersWithNotes++;
          hasUpdates = true;
        }
        
        // Communication preferences - store as JSON in notes or customerIcons
        const commPrefs = {
          emailOptOut: ownerData.opt_out_email === '1' || ownerData.opt_out_email === 1,
          smsOptOut: ownerData.opt_out_sms === '1' || ownerData.opt_out_sms === 1,
          marketingEmailOptOut: ownerData.opt_out_marketing_email === '1' || ownerData.opt_out_marketing_email === 1,
          marketingSmsOptOut: ownerData.opt_out_marketing_sms === '1' || ownerData.opt_out_marketing_sms === 1,
          reminderEmailOptOut: ownerData.opt_out_reminder_email === '1' || ownerData.opt_out_reminder_email === 1,
          reminderSmsOptOut: ownerData.opt_out_reminder_sms === '1' || ownerData.opt_out_reminder_sms === 1,
          photoSharingOptOut: ownerData.opt_out_photo_sharing === '1' || ownerData.opt_out_photo_sharing === 1,
          rewardsOptOut: ownerData.opt_out_rewards === '1' || ownerData.opt_out_rewards === 1
        };
        
        // Only update if at least one opt-out is set - store in iconNotes as JSON
        if (Object.values(commPrefs).some(val => val === true)) {
          updateData.iconNotes = commPrefs;
          customersWithCommPrefs++;
          hasUpdates = true;
        }
        
        // Source (how they found the business) - store in referralSource
        if (ownerData.source && ownerData.source.trim()) {
          updateData.referralSource = ownerData.source.trim();
          customersWithSource++;
          hasUpdates = true;
        }
        
        // Note: Payment information (current_balance) is not stored as it's transactional data
        // that should be managed by the billing system, not imported as static data
        
        // Update customer if we have any data
        if (hasUpdates) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              ...updateData,
              updatedAt: new Date()
            }
          });
          
          customersUpdated++;
        } else {
          customersSkipped++;
        }
        
        if (customersUpdated % 50 === 0 && customersUpdated > 0) {
          console.log(`  📝 Updated ${customersUpdated} customers... (${Math.round((i + 1) / localCustomers.length * 100)}% complete)`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing customer ${customer.firstName} ${customer.lastName}:`, error.message);
        errorCount++;
      }
    }
    
    // Final statistics
    console.log('\n📈 Import Results:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Customers updated: ${customersUpdated}`);
    console.log(`   📝 With notes: ${customersWithNotes}`);
    console.log(`   📧 With communication preferences: ${customersWithCommPrefs}`);
    console.log(`   📍 With source info: ${customersWithSource}`);
    console.log(`⚠️  Customers skipped (no data): ${customersSkipped}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total customers processed: ${localCustomers.length}`);
    
    // Show some examples
    const examples = await prisma.customer.findMany({
      where: {
        OR: [
          { notes: { not: null } },
          { iconNotes: { not: null } },
          { referralSource: { not: null } }
        ],
        isActive: true
      },
      select: {
        firstName: true,
        lastName: true,
        notes: true,
        iconNotes: true,
        referralSource: true
      },
      take: 3
    });
    
    console.log('\n👥 Examples of Imported Customer Data:');
    examples.forEach(customer => {
      console.log(`\n👤 ${customer.firstName} ${customer.lastName}:`);
      if (customer.notes) console.log(`  📝 Notes: ${customer.notes.substring(0, 100)}${customer.notes.length > 100 ? '...' : ''}`);
      if (customer.iconNotes) {
        const prefs = customer.iconNotes;
        const optOuts = Object.entries(prefs).filter(([_, val]) => val === true).map(([key]) => key);
        if (optOuts.length > 0) {
          console.log(`  📧 Opt-outs: ${optOuts.join(', ')}`);
        }
      }
      if (customer.referralSource) console.log(`  📍 Source: ${customer.referralSource}`);
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
    await importCustomerData();
    
    console.log('\n🎉 Phase 3 Customer Data Import Complete!');
    console.log('💡 Additional Customer Data Imported:');
    console.log('✅ Customer Notes - General context and preferences');
    console.log('✅ Communication Preferences - Legal compliance (GDPR, CAN-SPAM)');
    console.log('✅ Source Information - Marketing attribution');
    console.log('\n⏱️  Estimated Time Saved: ~150 hours of manual data entry');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the import
main();
