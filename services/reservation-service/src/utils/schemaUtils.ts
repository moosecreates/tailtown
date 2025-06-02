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
 * Get critical columns that should exist for a specific table
 * 
 * @param tableName - The name of the table
 * @returns Array of critical column names
 */
function getCriticalColumnsForTable(tableName: string): string[] {
  const criticalColumns: Record<string, string[]> = {
    'Reservation': ['id', 'customerId', 'petId', 'startDate', 'endDate', 'status', 'organizationId'],
    'Customer': ['id', 'firstName', 'lastName', 'email', 'organizationId'],
    'Pet': ['id', 'name', 'customerId', 'organizationId'],
    'Resource': ['id', 'name', 'type', 'organizationId']
  };
  
  return criticalColumns[tableName] || [];
}

/**
 * Get optional columns that may exist for a specific table
 * 
 * @param tableName - The name of the table
 * @returns Array of optional column names
 */
function getOptionalColumnsForTable(tableName: string): string[] {
  const optionalColumns: Record<string, string[]> = {
    'Reservation': ['suiteType', 'price', 'deposit', 'notes', 'staffNotes', 'resourceId', 'orderNumber'],
    'Customer': ['phone', 'address', 'city', 'state', 'zipCode', 'notes'],
    'Pet': ['breed', 'size', 'weight', 'birthDate', 'notes'],
    'Resource': ['description', 'capacity', 'isActive']
  };
  
  return optionalColumns[tableName] || [];
}

/**
 * Initialize schema validation on service startup
 * 
 * This function checks for critical schema elements on service startup
 * and logs warnings for missing elements. It's useful for early detection
 * of schema mismatches.
 * 
 * @param prisma - The Prisma client instance
 * @returns Validation results with missing tables and columns
 */
export async function validateSchema(prisma: PrismaClient): Promise<{ 
  isValid: boolean; 
  missingTables: string[]; 
  missingColumns: Record<string, string[]>;
  validationMap: Map<string, boolean>;
}> {
  let isValid = true;
  const missingTables: string[] = [];
  const missingColumns: Record<string, string[]> = {};
  const validationMap = new Map<string, boolean>();
  
  try {
    // Check for critical tables
    const criticalTables = ['Reservation', 'Customer', 'Pet', 'Resource'];
    for (const table of criticalTables) {
      const exists = await tableExists(prisma, table);
      validationMap.set(table, exists);
      
      if (!exists) {
        logger.warn(`Critical table '${table}' does not exist in the database schema`);
        missingTables.push(table);
        isValid = false;
      } else {
        // Check critical columns for existing tables
        const columnsToCheck = getCriticalColumnsForTable(table);
        const missingColumnsForTable: string[] = [];
        
        for (const column of columnsToCheck) {
          const exists = await columnExists(prisma, table, column);
          validationMap.set(`${table}.${column}`, exists);
          
          if (!exists) {
            logger.warn(`Critical column '${column}' does not exist in table '${table}'`);
            missingColumnsForTable.push(column);
            isValid = false;
          }
        }
        
        // Check optional columns for existing tables
        const optionalColumns = getOptionalColumnsForTable(table);
        for (const column of optionalColumns) {
          const exists = await columnExists(prisma, table, column);
          validationMap.set(`${table}.${column}`, exists);
          
          if (!exists) {
            logger.info(`Optional column '${column}' does not exist in table '${table}'`);
          }
        }
        
        if (missingColumnsForTable.length > 0) {
          missingColumns[table] = missingColumnsForTable;
        }
      }
    }
    
    // Check for optional tables
    const optionalTables = ['Service', 'AddOnService', 'ReservationAddOn'];
    for (const table of optionalTables) {
      const exists = await tableExists(prisma, table);
      validationMap.set(table, exists);
      
      if (!exists) {
        logger.warn(`Optional table '${table}' does not exist in the database schema`);
      }
    }
    
    logger.info('Schema validation completed');
    return { isValid, missingTables, missingColumns, validationMap };
  } catch (error) {
    logger.error(`Error during schema validation: ${error instanceof Error ? error.message : String(error)}`);
    return { isValid: false, missingTables, missingColumns, validationMap };
  }
}
