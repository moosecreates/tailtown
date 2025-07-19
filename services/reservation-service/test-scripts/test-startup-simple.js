#!/usr/bin/env node

/**
 * Simple Startup Test Script
 * 
 * This script tests the core functionality of the robust startup process
 * without requiring TypeScript compilation.
 * 
 * Usage:
 *   node test-startup-simple.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

// Initialize logger
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${msg}`)
};

// Define startup phases
const StartupPhase = {
  ENV_VALIDATION: 'Environment Validation',
  DB_CONNECTION: 'Database Connection',
  PORT_CHECK: 'Port Availability Check',
  DEPENDENCY_CHECK: 'Dependency Service Check'
};

/**
 * Validates that all required environment variables are present
 */
async function validateEnvironment(requiredVars = []) {
  logger.info(`[${StartupPhase.ENV_VALIDATION}] Validating environment variables...`);
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  const valid = missing.length === 0;
  
  const recommendations = [];
  
  if (!valid) {
    logger.error(`[${StartupPhase.ENV_VALIDATION}] Missing required environment variables: ${missing.join(', ')}`);
    recommendations.push(`Create or update your .env file with the following variables: ${missing.join(', ')}`);
    
    // Check if DATABASE_URL is missing and provide specific guidance
    if (missing.includes('DATABASE_URL')) {
      recommendations.push('For DATABASE_URL, use format: postgresql://username:password@host:port/database');
    }
  } else {
    logger.info(`[${StartupPhase.ENV_VALIDATION}] All required environment variables are present`);
  }
  
  return { valid, missing, recommendations };
}

/**
 * Tests database connection and provides detailed error information
 */
async function testDatabaseConnection(prisma) {
  logger.info(`[${StartupPhase.DB_CONNECTION}] Testing database connection...`);
  
  const recommendations = [];
  
  try {
    // Attempt a simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info(`[${StartupPhase.DB_CONNECTION}] Successfully connected to database`);
    return { connected: true, recommendations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[${StartupPhase.DB_CONNECTION}] Database connection failed: ${errorMessage}`);
    
    // Parse DATABASE_URL to provide better guidance (without exposing credentials)
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      const dbUrlObj = new URL(dbUrl);
      
      recommendations.push('Check database connection parameters:');
      recommendations.push(`- Host: ${dbUrlObj.hostname}`);
      recommendations.push(`- Port: ${dbUrlObj.port}`);
      recommendations.push(`- Database: ${dbUrlObj.pathname.substring(1)}`);
      recommendations.push('Ensure PostgreSQL is running and accessible');
    } catch (urlError) {
      recommendations.push('Invalid DATABASE_URL format. Use: postgresql://username:password@host:port/database');
    }
    
    return { connected: false, error: errorMessage, recommendations };
  }
}

/**
 * Checks if a port is available for use
 */
async function isPortAvailable(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    
    server.once('error', err => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`[${StartupPhase.PORT_CHECK}] Port ${port} is already in use`);
        resolve(false);
      } else {
        logger.error(`[${StartupPhase.PORT_CHECK}] Error checking port: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      logger.info(`[${StartupPhase.PORT_CHECK}] Port ${port} is available`);
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

/**
 * Checks health of dependency services
 */
async function checkDependencyServices(dependencies) {
  logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] Checking ${dependencies.length} dependency services...`);
  
  const results = {};
  const recommendations = [];
  let allRequired = true;
  
  for (const dep of dependencies) {
    const { name, url, required = false, timeout = 5000 } = dep;
    
    try {
      logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] Checking ${name} at ${url}...`);
      
      // Parse the URL to get components
      const urlObj = new URL(url);
      
      // Create a promise that will resolve with the health check result
      const healthCheckPromise = new Promise((resolve, reject) => {
        // Set up timeout
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request timed out after ${timeout}ms`));
        }, timeout);
        
        // Make HTTP request
        const req = http.request({
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }, (res) => {
          clearTimeout(timeoutId);
          
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data
            });
          });
        });
        
        req.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
        
        req.end();
      });
      
      // Wait for the health check to complete
      const response = await healthCheckPromise;
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] ${name} is healthy`);
        results[name] = true;
      } else {
        logger.warn(`[${StartupPhase.DEPENDENCY_CHECK}] ${name} returned status ${response.statusCode}`);
        results[name] = false;
        
        if (required) {
          allRequired = false;
          recommendations.push(`Required dependency ${name} is not healthy. Status: ${response.statusCode}`);
        } else {
          recommendations.push(`Optional dependency ${name} is not healthy. Status: ${response.statusCode}`);
        }
      }
    } catch (error) {
      logger.error(`[${StartupPhase.DEPENDENCY_CHECK}] Error checking ${name}: ${error.message}`);
      results[name] = false;
      
      if (required) {
        allRequired = false;
        recommendations.push(`Required dependency ${name} is not accessible: ${error.message}`);
      } else {
        recommendations.push(`Optional dependency ${name} is not accessible: ${error.message}`);
      }
    }
  }
  
  return { allRequired, results, recommendations };
}

/**
 * Performs a comprehensive startup process with all checks
 */
async function performRobustStartup(prisma, options = {}) {
  const {
    requiredEnvVars = ['DATABASE_URL'],
    port = 4003,
    dependencies = [],
    exitOnFailure = false
  } = options;
  
  const startTime = Date.now();
  logger.info('Starting robust service startup process...');
  
  const recommendations = [];
  let success = true;
  
  // Step 1: Validate environment variables
  const envResult = await validateEnvironment(requiredEnvVars);
  recommendations.push(...envResult.recommendations);
  
  if (!envResult.valid) {
    success = false;
    if (exitOnFailure) {
      logger.error('Environment validation failed, exiting...');
      process.exit(1);
    }
  }
  
  // Step 2: Test database connection
  const dbResult = await testDatabaseConnection(prisma);
  recommendations.push(...dbResult.recommendations);
  
  if (!dbResult.connected) {
    success = false;
    if (exitOnFailure) {
      logger.error('Database connection failed, exiting...');
      process.exit(1);
    }
  }
  
  // Step 3: Check port availability
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    success = false;
    recommendations.push(`Port ${port} is already in use. Try a different port or stop the process using this port.`);
    
    if (exitOnFailure) {
      logger.error('Port availability check failed, exiting...');
      process.exit(1);
    }
  }
  
  // Step 4: Check dependency services if any are specified
  if (dependencies.length > 0) {
    const dependencyResult = await checkDependencyServices(dependencies);
    recommendations.push(...dependencyResult.recommendations);
    
    if (!dependencyResult.allRequired) {
      success = false;
      if (exitOnFailure) {
        logger.error('Required dependency services check failed, exiting...');
        process.exit(1);
      }
    }
  }
  
  // Log startup summary
  const duration = Date.now() - startTime;
  if (success) {
    logger.info(`Startup process completed successfully in ${duration}ms`);
  } else {
    logger.warn(`Startup process completed with issues in ${duration}ms`);
    logger.warn('Service may have limited functionality due to startup issues');
    
    if (recommendations.length > 0) {
      logger.info('Recommendations to resolve startup issues:');
      recommendations.forEach((rec, i) => {
        logger.info(`  ${i + 1}. ${rec}`);
      });
    }
  }
  
  return { success, recommendations };
}

// Main function
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
    const startupResult = await performRobustStartup(prisma, {
      requiredEnvVars: ['DATABASE_URL'],
      port: parseInt(process.env.PORT || '4003', 10),
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

// Run the main function
main()
  .then(() => {
    console.log('Startup test completed');
  })
  .catch((error) => {
    console.error('Unhandled error in startup test:', error);
    process.exit(1);
  });
