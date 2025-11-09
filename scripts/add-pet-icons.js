#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Icon sets by pet type
const DOG_ICONS = [
  ['🐕', '❤️', '🎾'],
  ['🐶', '🏃', '🦴'],
  ['🐕‍🦺', '😊', '🎯'],
  ['🦮', '🍖', '💊'],
  ['🐩', '🎨', '✨']
];

const CAT_ICONS = [
  ['🐱', '😺', '🐟'],
  ['😸', '🎀', '💤'],
  ['😻', '🧶', '🐭'],
  ['😼', '🌙', '🎵'],
  ['😽', '🦋', '💕']
];

async function addPetIcons(tenantSubdomain) {
  try {
    console.log(`\n🎨 Adding pet icons to ${tenantSubdomain} tenant...\n`);

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain }
    });

    if (!tenant) {
      console.error(`❌ Tenant '${tenantSubdomain}' not found`);
      process.exit(1);
    }

    // Get all pets for this tenant
    const pets = await prisma.pet.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${pets.length} pets\n`);

    let dogIndex = 0;
    let catIndex = 0;
    let updated = 0;

    for (const pet of pets) {
      let icons;
      
      if (pet.type === 'DOG') {
        icons = DOG_ICONS[dogIndex % DOG_ICONS.length];
        dogIndex++;
      } else if (pet.type === 'CAT') {
        icons = CAT_ICONS[catIndex % CAT_ICONS.length];
        catIndex++;
      } else {
        // Other pet types get generic icons
        icons = ['🐾', '❤️', '😊'];
      }

      await prisma.pet.update({
        where: { id: pet.id },
        data: { petIcons: icons }
      });

      console.log(`✓ ${pet.name} (${pet.type}): ${icons.join(' ')}`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} pets with icons!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: node add-pet-icons.js <tenant-subdomain>');
  console.log('Example: node add-pet-icons.js rainy');
  process.exit(1);
}

const tenantSubdomain = args[0];
addPetIcons(tenantSubdomain);
