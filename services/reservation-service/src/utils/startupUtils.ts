/**
 * Startup Utilities
 * 
 * This module provides utilities for a robust service startup process including:
 * - Database connection testing
 * - Schema validation
 * - Environment variable validation
 * - Port availability checking
 * - Dependency service health checks
 * - Graceful shutdown handling
 */

import { PrismaClient } from '@prisma/client';
import { validateSchema } from './schemaUtils';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as dotenv from 'dotenv';

// Define startup phases for better organization and reporting
enum StartupPhase {
  ENV_VALIDATION = 'Environment Validation',
  DB_CONNECTION = 'Database Connection',
  SCHEMA_VALIDATION = 'Schema Validation',
  PORT_CHECK = 'Port Availability Check',
  DEPENDENCY_CHECK = 'Dependency Service Check',
  SERVER_START = 'Server Start'
}

// Define startup options
interface StartupOptions {
  requiredEnvVars?: string[];
  port?: number;
  autoMigrate?: boolean;
  migrationPath?: string;
  dependencies?: DependencyService[];
  exitOnFailure?: boolean;
}

// Define dependency service structure
interface DependencyService {
  name: string;
  url: string;
  required: boolean;
  timeout?: number;
}

/**
 * Validates that all required environment variables are present
 * @param requiredVars List of required environment variable names
 * @returns Object with validation result and missing variables
 */
export async function validateEnvironment(requiredVars: string[] = []): Promise<{
  valid: boolean;
  missing: string[];
  recommendations: string[];
}> {
  logger.info(`[${StartupPhase.ENV_VALIDATION}] Validating environment variables...`);
  
  // Load environment variables from .env file if it exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    logger.info(`[${StartupPhase.ENV_VALIDATION}] Loading environment from ${envPath}`);
    dotenv.config({ path: envPath });
  }
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  const valid = missing.length === 0;
  
  const recommendations: string[] = [];
  
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
 * @param prisma PrismaClient instance
 * @returns Object with connection status and recommendations
 */
export async function testDatabaseConnection(prisma: PrismaClient): Promise<{
  connected: boolean;
  error?: string;
  recommendations: string[];
}> {
  logger.info(`[${StartupPhase.DB_CONNECTION}] Testing database connection...`);
  
  const recommendations: string[] = [];
  
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
      recommendations.push(`- Database: ${dbUrlObj.pathname.replace('/', '')}`);
      
      // Provide specific recommendations based on error message
      if (errorMessage.includes('connect ECONNREFUSED')) {
        recommendations.push('- Database server may not be running or is not accessible from this host');
        recommendations.push('- Check firewall settings and ensure database is running');
      } else if (errorMessage.includes('authentication failed')) {
        recommendations.push('- Username or password may be incorrect');
        recommendations.push('- Check credentials in your .env file');
      } else if (errorMessage.includes('does not exist')) {
        recommendations.push('- Database does not exist and needs to be created');
        recommendations.push(`- Run: createdb ${dbUrlObj.pathname.replace('/', '')}`);
      }
    } catch (parseError) {
      recommendations.push('DATABASE_URL format may be invalid');
      recommendations.push('Use format: postgresql://username:password@host:port/database');
    }
    
    return { connected: false, error: errorMessage, recommendations };
  }
}

/**
 * Checks if a port is available for use
 * @param port Port number to check
 * @returns Promise resolving to boolean indicating if port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  logger.info(`[${StartupPhase.PORT_CHECK}] Checking if port ${port} is available...`);
  
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`[${StartupPhase.PORT_CHECK}] Port ${port} is already in use`);
        resolve(false);
      } else {
        logger.error(`[${StartupPhase.PORT_CHECK}] Error checking port: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close(() => {
        logger.info(`[${StartupPhase.PORT_CHECK}] Port ${port} is available`);
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Checks health of dependency services
 * @param dependencies List of dependency services to check
 * @returns Object with check results and recommendations
 */
export async function checkDependencyServices(dependencies: DependencyService[]): Promise<{
  allRequired: boolean;
  results: Record<string, boolean>;
  recommendations: string[];
}> {
  logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] Checking ${dependencies.length} dependency services...`);
  
  const results: Record<string, boolean> = {};
  const recommendations: string[] = [];
  let allRequired = true;
  
  for (const dependency of dependencies) {
    const { name, url, required, timeout = 5000 } = dependency;
    
    try {
      logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] Checking ${name} at ${url}...`);
      
      // Parse the URL to get components
      const urlObj = new URL(url);
      
      // Create a promise that will resolve with the health check result
      const healthCheckPromise = new Promise<{statusCode: number, data: string}>((resolve, reject) => {
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
              statusCode: res.statusCode || 0,
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
        logger.info(`[${StartupPhase.DEPENDENCY_CHECK}] ${name} is available`);
        results[name] = true;
      } else {
        logger.warn(`[${StartupPhase.DEPENDENCY_CHECK}] ${name} returned status ${response.statusCode}`);
        results[name] = false;
        
        if (required) {
          allRequired = false;
          recommendations.push(`Required service ${name} is not healthy (status ${response.statusCode})`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[${StartupPhase.DEPENDENCY_CHECK}] Error checking ${name}: ${errorMessage}`);
      results[name] = false;
      
      if (required) {
        allRequired = false;
        recommendations.push(`Required service ${name} is not available: ${errorMessage}`);
        recommendations.push(`Ensure ${name} is running at ${url}`);
      }
    }
  }
  
  return { allRequired, results, recommendations };
}

/**
 * Sets up graceful shutdown handlers
 * @param server HTTP server instance
 * @param prisma PrismaClient instance
 */
export function setupGracefulShutdown(server: http.Server, prisma: PrismaClient): void {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Close server first to stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    try {
      // Disconnect from database
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error(`Error disconnecting from database: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Performs a comprehensive startup process with all checks
 * @param prisma PrismaClient instance
 * @param options Startup options
 * @returns Object with startup status and recommendations
 */
export async function performRobustStartup(
  prisma: PrismaClient,
  options: StartupOptions = {}
): Promise<{
  success: boolean;
  recommendations: string[];
}> {
  const {
    requiredEnvVars = ['DATABASE_URL'],
    port = parseInt(process.env.PORT || '4003', 10), // Always use PORT from env or 4003 as default
    autoMigrate = false,
    migrationPath = path.join(process.cwd(), 'prisma/migrations'),
    dependencies = [],
    exitOnFailure = false
  } = options;
  
  const startTime = Date.now();
  logger.info('Starting robust service startup process...');
  
  const recommendations: string[] = [];
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
  
  // Step 3: Validate schema if database connection succeeded
  if (dbResult.connected) {
    try {
      logger.info(`[${StartupPhase.SCHEMA_VALIDATION}] Validating database schema...`);
      const schemaResult = await validateSchema(prisma, {
        autoMigrate,
        migrationPath
      });
      
      if (!schemaResult.isValid) {
        logger.warn(`[${StartupPhase.SCHEMA_VALIDATION}] Schema validation detected issues`);
        success = false;
        
        // Add schema-specific recommendations
        if (schemaResult.report && schemaResult.report.recommendations) {
          recommendations.push(...schemaResult.report.recommendations);
        }
      } else {
        logger.info(`[${StartupPhase.SCHEMA_VALIDATION}] Schema validation successful`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[${StartupPhase.SCHEMA_VALIDATION}] Schema validation error: ${errorMessage}`);
      success = false;
      recommendations.push('Schema validation failed, check logs for details');
    }
  }
  
  // Step 4: Check port availability
  // Use the port parameter which now correctly comes from environment variable
  const portAvailable = await isPortAvailable(port);
  if (!portAvailable) {
    success = false;
    recommendations.push(`Port ${port} is already in use. Try a different port or stop the process using this port.`);
    
    if (exitOnFailure) {
      logger.error('Port availability check failed, exiting...');
      process.exit(1);
    }
  }
  
  // Step 5: Check dependency services if any are specified
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
