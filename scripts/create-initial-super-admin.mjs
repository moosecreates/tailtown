/**
 * Create Initial Super Admin Account
 * 
 * Creates the first super admin account for Rob Weinstein.
 * Run this script once after deploying the super admin system.
 * 
 * Usage:
 *   node create-initial-super-admin.mjs --email rob@example.com --password YourSecurePassword
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Get email and password from command line arguments
    const args = process.argv.slice(2);
    const emailArg = args.find(arg => arg.startsWith('--email='));
    const passwordArg = args.find(arg => arg.startsWith('--password='));

    if (!emailArg || !passwordArg) {
      console.error('Usage: node create-initial-super-admin.mjs --email=your@email.com --password=YourPassword');
      process.exit(1);
    }

    const email = emailArg.split('=')[1];
    const password = passwordArg.split('=')[1];

    if (!email || !password) {
      console.error('Email and password are required');
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 12) {
      console.error('Password must be at least 12 characters long');
      process.exit(1);
    }

    console.log('Creating super admin account...\n');
    console.log(`Email: ${email}`);
    console.log(`Name: Rob Weinstein`);
    console.log(`Role: SUPER_ADMIN\n`);

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      console.error(`Super admin with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName: 'Rob',
        lastName: 'Weinstein',
        role: 'SUPER_ADMIN',
        isActive: true,
        require2fa: false
      }
    });

    console.log('✅ Super admin account created successfully!\n');
    console.log('Account Details:');
    console.log(`  ID: ${superAdmin.id}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Name: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`  Role: ${superAdmin.role}`);
    console.log(`  Active: ${superAdmin.isActive}`);
    console.log(`  Created: ${superAdmin.createdAt}\n`);

    console.log('You can now login at: http://localhost:3000/super-admin/login');
    console.log('\n⚠️  IMPORTANT: Store your password securely!');

  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
