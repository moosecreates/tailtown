#!/usr/bin/env node

/**
 * Clone Tenant Data Script
 * 
 * Copies all data (customers, pets, staff, services) from one tenant to another.
 * Usage: node clone-tenant-data.js <source-subdomain> <target-subdomain>
 * Example: node clone-tenant-data.js demo-template rainy
 */

require('dotenv').config({ path: './services/customer/.env' });

const { PrismaClient } = require('../services/customer/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function cloneTenantData(sourceSubdomain, targetSubdomain) {
  console.log(`\n📋 Cloning data from "${sourceSubdomain}" to "${targetSubdomain}"...\n`);

  try {
    // Get source and target tenants
    const sourceTenant = await prisma.tenant.findUnique({ 
      where: { subdomain: sourceSubdomain },
      select: { id: true, subdomain: true, businessName: true }
    });

    if (!sourceTenant) {
      console.error(`❌ Source tenant "${sourceSubdomain}" not found`);
      process.exit(1);
    }

    const targetTenant = await prisma.tenant.findUnique({ 
      where: { subdomain: targetSubdomain },
      select: { id: true, subdomain: true, businessName: true }
    });

    if (!targetTenant) {
      console.error(`❌ Target tenant "${targetSubdomain}" not found`);
      console.log(`\n💡 Create the tenant first, then run this script again.`);
      process.exit(1);
    }

    console.log(`📤 Source: ${sourceTenant.businessName} (${sourceTenant.subdomain})`);
    console.log(`📥 Target: ${targetTenant.businessName} (${targetTenant.subdomain})\n`);

    // Clear existing data in target tenant
    console.log('🧹 Clearing existing data in target tenant...');
    await prisma.pet.deleteMany({ where: { tenantId: targetTenant.id } });
    await prisma.customer.deleteMany({ where: { tenantId: targetTenant.id } });
    await prisma.staff.deleteMany({ where: { tenantId: targetTenant.id } });
    await prisma.service.deleteMany({ where: { tenantId: targetTenant.id } });
    await prisma.resource.deleteMany({ where: { tenantId: targetTenant.id } });
    await prisma.product.deleteMany({ where: { tenantId: targetTenant.id } });
    console.log('   ✓ Cleared\n');

    // Copy customers
    console.log('1️⃣  Copying customers...');
    // Try both UUID and subdomain as tenantId (for backward compatibility)
    let customers = await prisma.customer.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (customers.length === 0) {
      customers = await prisma.customer.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    const customerMap = new Map();
    for (const customer of customers) {
      const { id, tenantId, createdAt, updatedAt, ...data } = customer;
      // Convert null values to undefined for Prisma
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      );
      const newCustomer = await prisma.customer.create({ 
        data: { ...cleanData, tenantId: targetTenant.id } 
      });
      customerMap.set(id, newCustomer.id);
    }
    console.log(`   ✓ Copied ${customers.length} customers\n`);

    // Copy pets
    console.log('2️⃣  Copying pets...');
    let pets = await prisma.pet.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (pets.length === 0) {
      pets = await prisma.pet.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    for (const pet of pets) {
      const { id, tenantId, customerId, createdAt, updatedAt, ...data } = pet;
      const newCustomerId = customerMap.get(customerId);
      if (newCustomerId) {
        const cleanData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
        );
        await prisma.pet.create({ 
          data: { ...cleanData, tenantId: targetTenant.id, customerId: newCustomerId } 
        });
      }
    }
    console.log(`   ✓ Copied ${pets.length} pets\n`);

    // Copy staff
    console.log('3️⃣  Copying staff...');
    let staff = await prisma.staff.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (staff.length === 0) {
      staff = await prisma.staff.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    for (const member of staff) {
      const { id, tenantId, createdAt, updatedAt, ...data } = member;
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      );
      await prisma.staff.create({ 
        data: { ...cleanData, tenantId: targetTenant.id } 
      });
    }
    console.log(`   ✓ Copied ${staff.length} staff members\n`);

    // Copy services
    console.log('4️⃣  Copying services...');
    let services = await prisma.service.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (services.length === 0) {
      services = await prisma.service.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    for (const service of services) {
      const { id, tenantId, createdAt, updatedAt, ...data } = service;
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      );
      await prisma.service.create({ 
        data: { ...cleanData, tenantId: targetTenant.id } 
      });
    }
    console.log(`   ✓ Copied ${services.length} services\n`);

    // Copy resources (kennels/suites)
    console.log('5️⃣  Copying resources (kennels)...');
    let resources = await prisma.resource.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (resources.length === 0) {
      resources = await prisma.resource.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    for (const resource of resources) {
      const { id, tenantId, createdAt, updatedAt, ...data } = resource;
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      );
      await prisma.resource.create({ 
        data: { ...cleanData, tenantId: targetTenant.id } 
      });
    }
    console.log(`   ✓ Copied ${resources.length} resources\n`);

    // Copy products
    console.log('6️⃣  Copying products...');
    let products = await prisma.product.findMany({ 
      where: { tenantId: sourceTenant.id } 
    });
    if (products.length === 0) {
      products = await prisma.product.findMany({ 
        where: { tenantId: sourceTenant.subdomain } 
      });
    }
    
    for (const product of products) {
      const { id, tenantId, createdAt, updatedAt, ...data } = product;
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
      );
      await prisma.product.create({ 
        data: { ...cleanData, tenantId: targetTenant.id } 
      });
    }
    console.log(`   ✓ Copied ${products.length} products\n`);

    console.log('✅ Successfully cloned tenant data!');
    console.log(`\n📊 Summary:`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Pets: ${pets.length}`);
    console.log(`   Staff: ${staff.length}`);
    console.log(`   Services: ${services.length}`);
    console.log(`   Resources: ${resources.length}`);
    console.log(`   Products: ${products.length}\n`);

  } catch (error) {
    console.error('❌ Error cloning tenant data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node clone-tenant-data.js <source-subdomain> <target-subdomain>');
  console.log('Example: node clone-tenant-data.js demo-template rainy');
  process.exit(1);
}

const [sourceSubdomain, targetSubdomain] = args;
cloneTenantData(sourceSubdomain, targetSubdomain);
