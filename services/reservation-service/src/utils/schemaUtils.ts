/**
 * Schema Alignment Utilities
 * 
 * This module provides utility functions for implementing our schema alignment strategy.
 * It includes helpers for safely executing Prisma queries with proper error handling
 * and fallback values to ensure API stability even when schemas differ between environments.
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from './service';

// Simple logger implementation
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => process.env.NODE_ENV !== 'production' ? console.debug(`[DEBUG] ${message}`) : null
};

/**
 * Safely execute a Prisma query with error handling and fallback value
 * 
 * This function wraps Prisma queries with try/catch blocks and provides
 * a fallback value if the query fails due to schema mismatches or other errors.
 * 
 * @param queryFn - The Prisma query function to execute
 * @param fallbackValue - The value to return if the query fails
 * @param errorMessage - A custom error message for logging
 * @returns The query result or fallback value
 */
export async function safeExecutePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T | null = null,
  errorMessage = 'Error executing database query'
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    logger.error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    logger.debug('This error might be due to schema mismatches between environments');
    return fallbackValue;
  }
}

/**
 * Check if a table exists in the database
 * 
 * This function uses raw SQL to check if a table exists in the database.
 * It's useful for conditional feature enabling based on schema availability.
 * 
 * @param prisma - The Prisma client instance
 * @param tableName - The name of the table to check
 * @returns True if the table exists, false otherwise
 */
export async function tableExists(prisma: PrismaClient, tableName: string): Promise<boolean> {
  try {
    // This query works for PostgreSQL
    const result = await prisma.$queryRaw<[{exists: boolean}]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `;
    
    // The result is an array with a single object containing the EXISTS result
    return result[0].exists;
  } catch (error) {
    logger.error(`Error checking if table ${tableName} exists: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Check if a column exists in a table
 * 
 * This function uses raw SQL to check if a column exists in a table.
 * It's useful for conditional feature enabling based on schema availability.
 * 
 * @param prisma - The Prisma client instance
 * @param tableName - The name of the table to check
 * @param columnName - The name of the column to check
 * @returns True if the column exists, false otherwise
 */
export async function columnExists(
  prisma: PrismaClient, 
  tableName: string, 
  columnName: string
): Promise<boolean> {
  try {
    // This query works for PostgreSQL
    const result = await prisma.$queryRaw<[{exists: boolean}]>`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
      );
    `;
    
    // The result is an array with a single object containing the EXISTS result
    return result[0].exists;
  } catch (error) {
    logger.error(`Error checking if column ${columnName} in table ${tableName} exists: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Initialize schema validation on service startup
 * 
 * This function checks for critical schema elements on service startup
 * and logs warnings for missing elements. It's useful for early detection
 * of schema mismatches.
 * 
 * @param prisma - The Prisma client instance
 * @returns A map of schema validation results
 */
export async function validateSchema(prisma: PrismaClient): Promise<Map<string, boolean>> {
  const validationResults = new Map<string, boolean>();
  
  try {
    // Check critical tables
    const criticalTables = [
      'Reservation', 
      'Customer', 
      'Pet', 
      'Resource'
    ];
    
    for (const table of criticalTables) {
      const exists = await tableExists(prisma, table);
      validationResults.set(table, exists);
      
      if (!exists) {
        logger.warn(`Critical table ${table} is missing from the database schema!`);
      }
    }
    
    // Check optional tables
    const optionalTables = [
      'AddOnService', 
      'ReservationAddOn', 
      'Service'
    ];
    
    for (const table of optionalTables) {
      const exists = await tableExists(prisma, table);
      validationResults.set(table, exists);
      
      if (!exists) {
        logger.info(`Optional table ${table} is not present in the database schema.`);
      }
    }
    
    // Check critical columns in Reservation table
    if (validationResults.get('Reservation')) {
      const criticalColumns = [
        'id', 
        'customerId', 
        'startDate', 
        'endDate', 
        'status'
      ];
      
      for (const column of criticalColumns) {
        const exists = await columnExists(prisma, 'Reservation', column);
        validationResults.set(`Reservation.${column}`, exists);
        
        if (!exists) {
          logger.warn(`Critical column ${column} is missing from the Reservation table!`);
        }
      }
      
      // Check optional columns in Reservation table
      const optionalColumns = [
        'suiteType', 
        'price', 
        'deposit', 
        'notes', 
        'staffNotes'
      ];
      
      for (const column of optionalColumns) {
        const exists = await columnExists(prisma, 'Reservation', column);
        validationResults.set(`Reservation.${column}`, exists);
        
        if (!exists) {
          logger.info(`Optional column ${column} is not present in the Reservation table.`);
        }
      }
    }
    
    logger.info('Schema validation completed');
    return validationResults;
  } catch (error) {
    logger.error(`Error during schema validation: ${error instanceof Error ? error.message : String(error)}`);
    return validationResults;
  }
}
