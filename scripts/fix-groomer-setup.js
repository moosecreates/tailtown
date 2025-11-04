#!/usr/bin/env node

/**
 * Fix Groomer Setup
 * 
 * This script:
 * 1. Adds GROOMING specialty to grooming staff
 * 2. Creates default availability schedules for groomers
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGroomerSetup() {
  console.log('\n🔧 Fixing Groomer Setup...\n');
  
  try {
    // 1. Find grooming staff (by department)
    const groomingStaff = await prisma.staff.findMany({
      where: {
        department: 'Grooming',
        isActive: true
      }
    });
    
    console.log(`Found ${groomingStaff.length} grooming staff members:`);
    groomingStaff.forEach(staff => {
      console.log(`  - ${staff.firstName} ${staff.lastName} (${staff.position})`);
    });
    
    // 2. Update their specialties to include GROOMING
    console.log('\n📝 Adding GROOMING specialty...');
    for (const staff of groomingStaff) {
      const currentSpecialties = staff.specialties || [];
      if (!currentSpecialties.includes('GROOMING')) {
        await prisma.staff.update({
          where: { id: staff.id },
          data: {
            specialties: [...currentSpecialties, 'GROOMING']
          }
        });
        console.log(`  ✅ Added GROOMING to ${staff.firstName} ${staff.lastName}`);
      } else {
        console.log(`  ℹ️  ${staff.firstName} ${staff.lastName} already has GROOMING`);
      }
    }
    
    // 3. Create default availability schedules (Monday-Friday, 8am-5pm)
    console.log('\n📅 Creating default availability schedules...');
    for (const staff of groomingStaff) {
      // Check if they already have availability
      const existingAvailability = await prisma.staffAvailability.findMany({
        where: { staffId: staff.id }
      });
      
      if (existingAvailability.length > 0) {
        console.log(`  ℹ️  ${staff.firstName} ${staff.lastName} already has ${existingAvailability.length} availability records`);
        continue;
      }
      
      // Create Monday-Friday availability (8am-5pm)
      const daysOfWeek = [1, 2, 3, 4, 5]; // Monday-Friday
      for (const dayOfWeek of daysOfWeek) {
        await prisma.staffAvailability.create({
          data: {
            staffId: staff.id,
            tenantId: staff.tenantId,
            dayOfWeek,
            startTime: '08:00',
            endTime: '17:00',
            isAvailable: true,
            isRecurring: true
          }
        });
      }
      
      console.log(`  ✅ Created Mon-Fri 8am-5pm availability for ${staff.firstName} ${staff.lastName}`);
    }
    
    // 4. Verify the setup
    console.log('\n✅ Verification:');
    for (const staff of groomingStaff) {
      const updated = await prisma.staff.findUnique({
        where: { id: staff.id },
        include: {
          availability: true
        }
      });
      
      console.log(`\n  ${updated.firstName} ${updated.lastName}:`);
      console.log(`    Specialties: ${updated.specialties.join(', ')}`);
      console.log(`    Availability records: ${updated.availability.length}`);
      if (updated.availability.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        updated.availability.forEach(avail => {
          console.log(`      ${days[avail.dayOfWeek]}: ${avail.startTime}-${avail.endTime}`);
        });
      }
    }
    
    console.log('\n🎉 Groomer setup complete!');
    console.log('\n💡 Groomers should now be available for appointments Monday-Friday 8am-5pm');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixGroomerSetup();
