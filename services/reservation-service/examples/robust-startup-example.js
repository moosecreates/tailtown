/**
 * Robust Startup Example
 * 
 * This script demonstrates how to use the robust startup utilities
 * in a real-world service scenario.
 * 
 * Usage:
 *   node robust-startup-example.js
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Import startup utilities
// Note: In a real implementation, you would import from the compiled TypeScript
const startupUtils = require('../dist/utils/startupUtils');

async function main() {
  console.log('Starting Reservation Service with Robust Startup...');
  
  // Initialize Express app
  const app = express();
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  // Define startup options
  const options = {
    requiredEnvVars: ['DATABASE_URL'],
    port: parseInt(process.env.PORT || '4003', 10),
    autoMigrate: process.env.AUTO_MIGRATE === 'true',
    dependencies: [
      {
        name: 'Customer Service',
        url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003/health',
        required: false,
        timeout: 3000
      }
    ],
    exitOnFailure: process.env.EXIT_ON_STARTUP_FAILURE === 'true'
  };
  
  // Perform robust startup process
  const startupResult = await startupUtils.performRobustStartup(prisma, options);
  
  // Check startup result
  if (!startupResult.success) {
    console.log('Startup issues detected:');
    startupResult.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    
    if (options.exitOnFailure) {
      console.error('Exiting due to startup failures...');
      process.exit(1);
    } else {
      console.warn('Continuing with limited functionality...');
    }
  }
  
  // Set up basic routes
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Reservation service is healthy' });
  });
  
  app.get('/api/v1/status', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        service: 'Reservation Service',
        version: '1.0.0',
        startupSuccess: startupResult.success,
        dependencies: {
          database: true, // We know this is true because we got this far
          customerService: false // This would be dynamically determined in a real implementation
        }
      }
    });
  });
  
  // Start the server
  const server = app.listen(options.port, () => {
    console.log(`Reservation service listening on port ${options.port}`);
  });
  
  // Set up graceful shutdown
  startupUtils.setupGracefulShutdown(server, prisma);
}

// Run the main function
main()
  .then(() => {
    console.log('Service startup completed');
  })
  .catch((error) => {
    console.error('Unhandled error during service startup:', error);
    process.exit(1);
  });
