#!/usr/bin/env node

/**
 * Startup Test Script
 * 
 * This script tests the enhanced startup process for the reservation service.
 * It validates environment variables, database connection, schema, port availability,
 * and dependency services.
 * 
 * Usage:
 *   node test-startup.js [--auto-migrate] [--exit-on-failure]
 * 
 * Options:
 *   --auto-migrate       Automatically apply safe migrations if schema issues are found
 *   --exit-on-failure    Exit with error code if any startup check fails
 */

// Load environment variables from .env file
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Check if startupUtils.js exists in the dist directory
const startupUtilsPath = path.join(__dirname, 'dist', 'utils', 'startupUtils.js');
if (!fs.existsSync(startupUtilsPath)) {
  console.error(`Error: Could not find ${startupUtilsPath}`);
  console.error('Make sure you have built the TypeScript code with "npm run build"');
  process.exit(1);
}

// Import the startup utils directly from the compiled JS
const startupUtils = require('./dist/utils/startupUtils');

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const autoMigrate = args.includes('--auto-migrate');
    const exitOnFailure = args.includes('--exit-on-failure');
    
    console.log('Reservation Service Startup Test');
    console.log('===============================');
    console.log(`Auto-migrate: ${autoMigrate ? 'Enabled' : 'Disabled'}`);
    console.log(`Exit on failure: ${exitOnFailure ? 'Enabled' : 'Disabled'}`);
    console.log('');

    // Initialize Prisma client
    const prisma = new PrismaClient();
    
    console.log('Running startup checks...');
    
    // Define dependency services to check
    const dependencies = [
      {
        name: 'Customer Service',
        url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003/health',
        required: false,
        timeout: 3000
      }
    ];
    
    // Run startup process with options
    const startupResult = await startupUtils.performRobustStartup(prisma, {
      requiredEnvVars: ['DATABASE_URL'],
      port: parseInt(process.env.PORT || '4003', 10),
      autoMigrate,
      dependencies,
      exitOnFailure
    });
    
    // Display startup results
    console.log('\nStartup Results:');
    console.log('----------------');
    console.log(`Success: ${startupResult.success ? 'Yes' : 'No'}`);
    
    if (startupResult.recommendations.length > 0) {
      console.log('\nRecommendations:');
      startupResult.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    await prisma.$disconnect();
    
    // Exit with appropriate code
    process.exit(startupResult.success ? 0 : 1);
  } catch (error) {
    console.error('Error during startup test:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Startup test completed');
  })
  .catch((error) => {
    console.error('Unhandled error in startup test:', error);
    process.exit(1);
  });
