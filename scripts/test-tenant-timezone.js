/**
 * Test script to verify tenant timezone functionality
 * 
 * This script:
 * 1. Fetches the tailtown tenant
 * 2. Displays current timezone
 * 3. Optionally updates timezone to test different values
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTenantTimezone() {
  try {
    console.log('🔍 Fetching tailtown tenant...\n');
    
    // Find the tailtown tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        subdomain: 'tailtown'
      },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        timezone: true,
        createdAt: true
      }
    });

    if (!tenant) {
      console.log('❌ Tailtown tenant not found!');
      return;
    }

    console.log('✅ Found tenant:');
    console.log(`   Business Name: ${tenant.businessName}`);
    console.log(`   Subdomain: ${tenant.subdomain}`);
    console.log(`   Current Timezone: ${tenant.timezone}`);
    console.log(`   Created: ${tenant.createdAt.toISOString()}\n`);

    // Show some example timezones
    console.log('📍 Common US Timezones:');
    console.log('   - America/New_York (Eastern Time)');
    console.log('   - America/Chicago (Central Time)');
    console.log('   - America/Denver (Mountain Time) ⭐ Current default');
    console.log('   - America/Los_Angeles (Pacific Time)');
    console.log('   - America/Phoenix (Arizona - no DST)');
    console.log('   - America/Anchorage (Alaska Time)');
    console.log('   - Pacific/Honolulu (Hawaii Time)\n');

    // Test timezone conversion
    console.log('🕐 Testing timezone conversion:');
    const testDate = new Date('2025-11-07T12:30:00'); // Noon local time
    console.log(`   Test date (local): ${testDate.toLocaleString()}`);
    console.log(`   Test date (UTC): ${testDate.toISOString()}`);
    console.log(`   Test date (${tenant.timezone}): ${testDate.toLocaleString('en-US', { timeZone: tenant.timezone })}\n`);

    console.log('✅ Tenant timezone test complete!');
    console.log('\n💡 To update timezone, run:');
    console.log(`   npx prisma studio`);
    console.log('   Then edit the Tenant record\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTenantTimezone();
