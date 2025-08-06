/**
 * Schema Alignment Utilities
 * 
 * This module provides utility functions for implementing our schema alignment strategy.
 * It includes helpers for safely executing Prisma queries with proper error handling
 * and fallback values to ensure API stability even when schemas differ between environments.
 * 
 * It also provides a comprehensive schema validation system that:
 * - Validates all critical tables and columns exist
 * - Generates detailed reports of missing schema elements
 * - Provides clear guidance on how to fix schema issues
 * - Can automatically apply safe migrations when configured
 */

import { PrismaClient } from '@prisma/client';
import { logger as appLogger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

// Simple logger implementation for schema utilities
const schemaLogger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => process.env.NODE_ENV !== 'production' ? console.debug(`[DEBUG] ${message}`) : null,
  success: (message: string) => console.log(`[SUCCESS] ${message}`)
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
    schemaLogger.error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    schemaLogger.debug('This error might be due to schema mismatches between environments');
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
    schemaLogger.error(`Error checking if table ${tableName} exists: ${error instanceof Error ? error.message : String(error)}`);
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
    schemaLogger.error(`Error checking if column ${columnName} in table ${tableName} exists: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Schema definition for tables and columns
 */
interface SchemaDefinition {
  tables: TableDefinition[];
}

interface TableDefinition {
  name: string;
  critical: boolean;
  description: string;
  columns: ColumnDefinition[];
  relationships?: RelationshipDefinition[];
  indexes?: IndexDefinition[];
}

interface ColumnDefinition {
  name: string;
  critical: boolean;
  type: string;
  description: string;
  defaultValue?: string;
  constraints?: string[];
}

interface RelationshipDefinition {
  name: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete: string;
  onUpdate: string;
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
}

/**
 * Complete schema definition for the reservation service
 */
const schemaDefinition: SchemaDefinition = {
  tables: [
    {
      name: 'Reservation',
      critical: true,
      description: 'Stores reservation information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'customerId', critical: true, type: 'TEXT', description: 'Reference to customer' },
        { name: 'petId', critical: true, type: 'TEXT', description: 'Reference to pet' },
        { name: 'startDate', critical: true, type: 'TIMESTAMP', description: 'Start date of reservation' },
        { name: 'endDate', critical: true, type: 'TIMESTAMP', description: 'End date of reservation' },
        { name: 'status', critical: true, type: 'TEXT', description: 'Reservation status', defaultValue: "'CONFIRMED'" },
        { name: 'orderNumber', critical: false, type: 'TEXT', description: 'Unique order reference number' },
        { name: 'resourceId', critical: false, type: 'TEXT', description: 'Reference to assigned resource/kennel' },
        { name: 'suiteType', critical: false, type: 'TEXT', description: 'Type of suite/accommodation' },
        { name: 'price', critical: false, type: 'DOUBLE PRECISION', description: 'Total price' },
        { name: 'deposit', critical: false, type: 'DOUBLE PRECISION', description: 'Deposit amount' },
        { name: 'balance', critical: false, type: 'DOUBLE PRECISION', description: 'Remaining balance' },
        { name: 'notes', critical: false, type: 'TEXT', description: 'Customer-visible notes' },
        { name: 'staffNotes', critical: false, type: 'TEXT', description: 'Staff-only notes' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      relationships: [
        { name: 'Reservation_customerId_fkey', sourceColumn: 'customerId', targetTable: 'Customer', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
        { name: 'Reservation_petId_fkey', sourceColumn: 'petId', targetTable: 'Pet', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
        { name: 'Reservation_resourceId_fkey', sourceColumn: 'resourceId', targetTable: 'Resource', targetColumn: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }
      ],
      indexes: [
        { name: 'Reservation_customerId_idx', columns: ['customerId'], unique: false },
        { name: 'Reservation_petId_idx', columns: ['petId'], unique: false },
        { name: 'Reservation_resourceId_idx', columns: ['resourceId'], unique: false },
        { name: 'Reservation_orderNumber_idx', columns: ['orderNumber'], unique: false },
        { name: 'Reservation_orderNumber_key', columns: ['orderNumber'], unique: true }
      ]
    },
    {
      name: 'Customer',
      critical: true,
      description: 'Stores customer information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'firstName', critical: true, type: 'TEXT', description: 'First name' },
        { name: 'lastName', critical: true, type: 'TEXT', description: 'Last name' },
        { name: 'email', critical: true, type: 'TEXT', description: 'Email address' },
        { name: 'phone', critical: false, type: 'TEXT', description: 'Phone number' },
        { name: 'address', critical: false, type: 'TEXT', description: 'Street address' },
        { name: 'city', critical: false, type: 'TEXT', description: 'City' },
        { name: 'state', critical: false, type: 'TEXT', description: 'State/province' },
        { name: 'zipCode', critical: false, type: 'TEXT', description: 'Postal/zip code' },
        { name: 'notes', critical: false, type: 'TEXT', description: 'Additional notes' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      indexes: [
        { name: 'Customer_email_idx', columns: ['email'], unique: false },
        { name: 'Customer_lastName_firstName_idx', columns: ['lastName', 'firstName'], unique: false }
      ]
    },
    {
      name: 'Pet',
      critical: true,
      description: 'Stores pet information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', critical: true, type: 'TEXT', description: 'Pet name' },
        { name: 'customerId', critical: true, type: 'TEXT', description: 'Reference to owner' },
        { name: 'breed', critical: false, type: 'TEXT', description: 'Breed' },
        { name: 'size', critical: false, type: 'TEXT', description: 'Size category' },
        { name: 'weight', critical: false, type: 'DOUBLE PRECISION', description: 'Weight' },
        { name: 'birthDate', critical: false, type: 'TIMESTAMP', description: 'Birth date' },
        { name: 'notes', critical: false, type: 'TEXT', description: 'Additional notes' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      relationships: [
        { name: 'Pet_customerId_fkey', sourceColumn: 'customerId', targetTable: 'Customer', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
      ],
      indexes: [
        { name: 'Pet_customerId_idx', columns: ['customerId'], unique: false }
      ]
    },
    {
      name: 'Resource',
      critical: true,
      description: 'Stores resource/kennel information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', critical: true, type: 'TEXT', description: 'Resource name' },
        { name: 'type', critical: true, type: 'TEXT', description: 'Resource type' },
        { name: 'description', critical: false, type: 'TEXT', description: 'Description' },
        { name: 'capacity', critical: false, type: 'INTEGER', description: 'Capacity', defaultValue: '1' },
        { name: 'isActive', critical: false, type: 'BOOLEAN', description: 'Active status', defaultValue: 'true' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      indexes: [
        { name: 'Resource_type_idx', columns: ['type'], unique: false },
        { name: 'Resource_isActive_idx', columns: ['isActive'], unique: false }
      ]
    },
    {
      name: 'Service',
      critical: false,
      description: 'Stores service information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', critical: true, type: 'TEXT', description: 'Service name' },
        { name: 'description', critical: false, type: 'TEXT', description: 'Description' },
        { name: 'price', critical: true, type: 'DOUBLE PRECISION', description: 'Price' },
        { name: 'duration', critical: false, type: 'INTEGER', description: 'Duration in minutes' },
        { name: 'isActive', critical: false, type: 'BOOLEAN', description: 'Active status', defaultValue: 'true' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      indexes: [
        { name: 'Service_isActive_idx', columns: ['isActive'], unique: false }
      ]
    },
    {
      name: 'AddOnService',
      critical: false,
      description: 'Stores add-on service information',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', critical: true, type: 'TEXT', description: 'Add-on name' },
        { name: 'description', critical: false, type: 'TEXT', description: 'Description' },
        { name: 'price', critical: true, type: 'DOUBLE PRECISION', description: 'Price' },
        { name: 'duration', critical: false, type: 'INTEGER', description: 'Duration in minutes' },
        { name: 'serviceId', critical: true, type: 'TEXT', description: 'Reference to parent service' },
        { name: 'isActive', critical: false, type: 'BOOLEAN', description: 'Active status', defaultValue: 'true' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      relationships: [
        { name: 'AddOnService_serviceId_fkey', sourceColumn: 'serviceId', targetTable: 'Service', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
      ],
      indexes: [
        { name: 'AddOnService_serviceId_idx', columns: ['serviceId'], unique: false }
      ]
    },
    {
      name: 'ReservationAddOn',
      critical: false,
      description: 'Stores reservation add-on relationships',
      columns: [
        { name: 'id', critical: true, type: 'TEXT', description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'reservationId', critical: true, type: 'TEXT', description: 'Reference to reservation' },
        { name: 'addOnId', critical: true, type: 'TEXT', description: 'Reference to add-on service' },
        { name: 'price', critical: true, type: 'DOUBLE PRECISION', description: 'Price at time of booking' },
        { name: 'notes', critical: false, type: 'TEXT', description: 'Additional notes' },
        { name: 'createdAt', critical: false, type: 'TIMESTAMP', description: 'Creation timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', critical: false, type: 'TIMESTAMP', description: 'Last update timestamp' }
      ],
      relationships: [
        { name: 'ReservationAddOn_reservationId_fkey', sourceColumn: 'reservationId', targetTable: 'Reservation', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
        { name: 'ReservationAddOn_addOnId_fkey', sourceColumn: 'addOnId', targetTable: 'AddOnService', targetColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
      ],
      indexes: [
        { name: 'ReservationAddOn_reservationId_idx', columns: ['reservationId'], unique: false },
        { name: 'ReservationAddOn_addOnId_idx', columns: ['addOnId'], unique: false }
      ]
    }
  ]
};
    schemaLogger.error(`Error checking if index exists: ${error instanceof Error ? error.message : String(error)}`);
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
  const table = schemaDefinition.tables.find(t => t.name === tableName);
  if (!table) return [];
  
  return table.columns
    .filter(column => column.critical)
    .map(column => column.name);
}

/**
 * Get optional columns that may exist for a specific table
 * 
 * @param tableName - The name of the table
 * @returns Array of optional column names
 */
function getOptionalColumnsForTable(tableName: string): string[] {
  const table = schemaDefinition.tables.find(t => t.name === tableName);
  if (!table) return [];
  
  return table.columns
    .filter(column => !column.critical)
    .map(column => column.name);
}

/**
 * Get all critical tables in the schema
 * 
 * @returns Array of critical table names
 */
function getCriticalTables(): string[] {
  return schemaDefinition.tables
    .filter(table => table.critical)
    .map(table => table.name);
}

/**
 * Get all optional tables in the schema
 * 
 * @returns Array of optional table names
 */
function getOptionalTables(): string[] {
  return schemaDefinition.tables
    .filter(table => !table.critical)
    .map(table => table.name);
}

/**
 * Schema validation result interface
 */
interface SchemaValidationResult {
  isValid: boolean;
  missingTables: string[];
  missingColumns: Record<string, string[]>;
  missingIndexes: Record<string, string[]>;
  missingRelationships: Record<string, string[]>;
  validationMap: Map<string, boolean>;
  report: SchemaValidationReport;
}

/**
 * Schema validation report interface
 */
interface SchemaValidationReport {
  summary: string;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  migrationRequired: boolean;
  migrationSafe: boolean;
  migrationScript?: string;
}

/**
 * Generate SQL to create a table based on schema definition
 * 
 * @param tableName - The name of the table to generate SQL for
 * @returns SQL statement to create the table
 */
function generateTableCreationSQL(tableName: string): string {
  const table = schemaDefinition.tables.find(t => t.name === tableName);
  if (!table) return '';
  
  let sql = `-- Create ${table.name} table
CREATE TABLE IF NOT EXISTS "${table.name}" (
`;
  
  // Add columns
  const columnDefinitions = table.columns.map(column => {
    // Build column definition
    let columnDef = `${column.name} ${column.type}`;
    
    // Add constraints if any
    if (column.constraints && column.constraints.length > 0) {
      columnDef += ` ${column.constraints.join(' ')}`;
    }
    
    // Add default value if specified
    if (column.defaultValue) {
      columnDef += ` DEFAULT ${column.defaultValue}`;
    }
    
    return columnDef;
  }).join(',\n');
  
  sql += columnDefinitions;
  
  // Add primary key constraint
  const primaryKeyColumn = table.columns.find(column => 
    column.constraints && column.constraints.includes('PRIMARY KEY')
  );
  
  if (primaryKeyColumn) {
    sql += `,

  CONSTRAINT "${table.name}_pkey" PRIMARY KEY ("${primaryKeyColumn.name}")`;
  }
  
  sql += '
);
';
  
  return sql;
}

/**
 * Generate SQL to create indexes for a table
 * 
 * @param tableName - The name of the table to generate index SQL for
 * @returns SQL statements to create indexes
 */
function generateIndexCreationSQL(tableName: string): string {
  const table = schemaDefinition.tables.find(t => t.name === tableName);
  if (!table || !table.indexes || table.indexes.length === 0) return '';
  
  let sql = `
-- Create indexes for ${table.name}
`;
  
  table.indexes.forEach(index => {
    const columns = index.columns.map(col => `"${col}"`).join(', ');
    const uniqueStr = index.unique ? 'UNIQUE ' : '';
    
    sql += `CREATE ${uniqueStr}INDEX IF NOT EXISTS "${index.name}" ON "${table.name}"(${columns});
`;
  });
  
  return sql;
}

/**
 * Generate SQL to create foreign key constraints for a table
 * 
 * @param tableName - The name of the table to generate constraint SQL for
 * @returns SQL statements to create foreign key constraints
 */
function generateRelationshipSQL(tableName: string): string {
  const table = schemaDefinition.tables.find(t => t.name === tableName);
  if (!table || !table.relationships || table.relationships.length === 0) return '';
  
  let sql = `
-- Add foreign key constraints for ${table.name}
`;
  
  table.relationships.forEach(rel => {
    sql += `ALTER TABLE "${table.name}" ADD CONSTRAINT "${rel.name}" ` +
           `FOREIGN KEY ("${rel.sourceColumn}") REFERENCES "${rel.targetTable}"("${rel.targetColumn}") ` +
           `ON DELETE ${rel.onDelete} ON UPDATE ${rel.onUpdate};
`;
  });
  
  return sql;
}

/**
 * Generate complete SQL migration script for missing schema elements
 * 
 * @param missingTables - Array of missing table names
 * @param missingColumns - Record of missing columns by table
 * @param missingIndexes - Record of missing indexes by table
 * @param missingRelationships - Record of missing relationships by table
 * @returns Complete SQL migration script
 */
function generateMigrationScript(
  missingTables: string[],
  missingColumns: Record<string, string[]>,
  missingIndexes: Record<string, string[]>,
  missingRelationships: Record<string, string[]>
): string {
  let sql = `-- Migration script generated on ${new Date().toISOString()}

`;
  
  // Create missing tables
  if (missingTables.length > 0) {
    sql += '-- Creating missing tables
';
    missingTables.forEach(tableName => {
      sql += generateTableCreationSQL(tableName) + '
';
    });
  }
  
  // Add missing columns
  const existingTables = Object.keys(missingColumns);
  if (existingTables.length > 0) {
    sql += '-- Adding missing columns to existing tables
';
    existingTables.forEach(tableName => {
      const table = schemaDefinition.tables.find(t => t.name === tableName);
      if (!table) return;
      
      missingColumns[tableName].forEach(columnName => {
        const column = table.columns.find(c => c.name === columnName);
        if (!column) return;
        
        let columnDef = column.type;
        if (column.defaultValue) {
          columnDef += ` DEFAULT ${column.defaultValue}`;
        }
        
        sql += `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnDef};
`;
      });
      sql += '
';
    });
  }
  
  // Create missing indexes
  if (Object.keys(missingIndexes).length > 0) {
    sql += '-- Creating missing indexes
';
    Object.keys(missingIndexes).forEach(tableName => {
      sql += generateIndexCreationSQL(tableName);
    });
    sql += '
';
  }
  
  // Create missing relationships
  if (Object.keys(missingRelationships).length > 0) {
    sql += '-- Creating missing relationships
';
    Object.keys(missingRelationships).forEach(tableName => {
      sql += generateRelationshipSQL(tableName);
    });
    sql += '
';
  }
  
  return sql;
}

/**
 * Check if an index exists in the database
 * 
 * @param prisma - The Prisma client instance
 * @param tableName - The name of the table
 * @param indexName - The name of the index
 * @returns True if the index exists, false otherwise
 */
async function indexExists(prisma: PrismaClient, tableName: string, indexName: string): Promise<boolean> {
  try {
    // This query works for PostgreSQL
    const result = await prisma.$queryRaw<[{exists: boolean}]>`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = ${tableName}
        AND indexname = ${indexName}
      );
    `;
    
    return result[0].exists;
  } catch (error) {
}

/**
 * Check if a foreign key constraint exists in the database
 * 
 * @param prisma - The Prisma client instance
 * @param tableName - The name of the table
 * @param constraintName - The name of the constraint
 * @returns True if the constraint exists, false otherwise
 */
async function relationshipExists(prisma: PrismaClient, tableName: string, constraintName: string): Promise<boolean> {
  try {
    // This query works for PostgreSQL
    const result = await prisma.$queryRaw<[{exists: boolean}]>`
      SELECT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = ${tableName})
        AND conname = ${constraintName}
      );
    `;
    
    return result[0].exists;
  } catch (error) {
    schemaLogger.error(`Error checking if constraint ${constraintName} on table ${tableName} exists: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Initialize schema validation on service startup
 * 
 * This function checks for critical schema elements on service startup,
 * logs warnings for missing elements, generates detailed reports with
 * guidance on how to fix issues, and can automatically apply safe migrations.
 * 
 * @param prisma - The Prisma client instance
 * @param options - Options for schema validation
 * @returns Validation results with missing tables and columns
 */
export async function validateSchema(
  prisma: PrismaClient,
  options: {
    autoMigrate?: boolean;
    migrationPath?: string;
  } = {}
): Promise<SchemaValidationResult> {
  const { autoMigrate = false, migrationPath = './prisma/migrations' } = options;
  let isValid = true;
  const missingTables: string[] = [];
  const missingColumns: Record<string, string[]> = {};
  const missingIndexes: Record<string, string[]> = {};
  const missingRelationships: Record<string, string[]> = {};
  const validationMap = new Map<string, boolean>();
  
  const report: SchemaValidationReport = {
    summary: '',
    criticalIssues: [],
    warnings: [],
    recommendations: [],
    migrationRequired: false,
    migrationSafe: true
  };
  
  try {
    schemaLogger.info('Starting comprehensive schema validation...');
    
    // Check for critical tables
    const criticalTables = getCriticalTables();
    for (const table of criticalTables) {
      const exists = await tableExists(prisma, table);
      validationMap.set(table, exists);
      
      if (!exists) {
        const message = `Critical table '${table}' does not exist in the database schema`;
        schemaLogger.warn(message);
        report.criticalIssues.push(message);
        missingTables.push(table);
        isValid = false;
        report.migrationRequired = true;
      } else {
        // Check critical columns for existing tables
        const columnsToCheck = getCriticalColumnsForTable(table);
        const missingColumnsForTable: string[] = [];
        
        for (const column of columnsToCheck) {
          const exists = await columnExists(prisma, table, column);
          validationMap.set(`${table}.${column}`, exists);
          
          if (!exists) {
            const message = `Critical column '${column}' does not exist in table '${table}'`;
            schemaLogger.warn(message);
            report.criticalIssues.push(message);
            missingColumnsForTable.push(column);
            isValid = false;
            report.migrationRequired = true;
          }
        }
        
        // Check optional columns for existing tables
        const optionalColumns = getOptionalColumnsForTable(table);
        for (const column of optionalColumns) {
          const exists = await columnExists(prisma, table, column);
          validationMap.set(`${table}.${column}`, exists);
          
          if (!exists) {
            const message = `Optional column '${column}' does not exist in table '${table}'`;
            schemaLogger.info(message);
            report.warnings.push(message);
            if (!missingColumnsForTable.includes(column)) {
              missingColumnsForTable.push(column);
            }
          }
        }
        
        if (missingColumnsForTable.length > 0) {
          missingColumns[table] = missingColumnsForTable;
        }
        
        // Check indexes for existing tables
        const tableDefinition = schemaDefinition.tables.find(t => t.name === table);
        if (tableDefinition && tableDefinition.indexes) {
          const missingIndexesForTable: string[] = [];
          
          for (const index of tableDefinition.indexes) {
            const exists = await indexExists(prisma, table, index.name);
            validationMap.set(`${table}.index.${index.name}`, exists);
            
            if (!exists) {
              const message = `Index '${index.name}' does not exist on table '${table}'`;
              schemaLogger.info(message);
              report.warnings.push(message);
              missingIndexesForTable.push(index.name);
            }
          }
          
          if (missingIndexesForTable.length > 0) {
            missingIndexes[table] = missingIndexesForTable;
          }
        }
        
        // Check relationships for existing tables
        if (tableDefinition && tableDefinition.relationships) {
          const missingRelationshipsForTable: string[] = [];
          
          for (const relationship of tableDefinition.relationships) {
            const exists = await relationshipExists(prisma, table, relationship.name);
            validationMap.set(`${table}.relationship.${relationship.name}`, exists);
            
            if (!exists) {
              const message = `Relationship '${relationship.name}' does not exist on table '${table}'`;
              schemaLogger.info(message);
              report.warnings.push(message);
              missingRelationshipsForTable.push(relationship.name);
            }
          }
          
          if (missingRelationshipsForTable.length > 0) {
            missingRelationships[table] = missingRelationshipsForTable;
          }
        }
      }
    }
    
    // Check for optional tables
    const optionalTables = getOptionalTables();
    for (const table of optionalTables) {
      const exists = await tableExists(prisma, table);
      validationMap.set(table, exists);
      
      if (!exists) {
        const message = `Optional table '${table}' does not exist in the database schema`;
        schemaLogger.warn(message);
        report.warnings.push(message);
        missingTables.push(table);
      } else {
        // Check critical columns for existing optional tables
        const columnsToCheck = getCriticalColumnsForTable(table);
        const missingColumnsForTable: string[] = [];
        
        for (const column of columnsToCheck) {
          const exists = await columnExists(prisma, table, column);
          validationMap.set(`${table}.${column}`, exists);
          
          if (!exists) {
            const message = `Critical column '${column}' does not exist in optional table '${table}'`;
            schemaLogger.warn(message);
            report.warnings.push(message);
            missingColumnsForTable.push(column);
          }
        }
        
        if (missingColumnsForTable.length > 0) {
          missingColumns[table] = missingColumnsForTable;
        }
      }
    }
    
    // Generate migration script if needed
    if (report.migrationRequired || Object.keys(missingColumns).length > 0 || 
        Object.keys(missingIndexes).length > 0 || Object.keys(missingRelationships).length > 0) {
      
      const migrationScript = generateMigrationScript(
        missingTables, 
        missingColumns, 
        missingIndexes, 
        missingRelationships
      );
      
      report.migrationScript = migrationScript;
      
      // Add recommendations
      if (missingTables.length > 0) {
        report.recommendations.push(
          `Run the migration script to create the missing tables: ${missingTables.join(', ')}`
        );
      }
      
      if (Object.keys(missingColumns).length > 0) {
        const tableColumnList = Object.entries(missingColumns)
          .map(([table, columns]) => `${table} (${columns.join(', ')})`)
          .join(', ');
          
        report.recommendations.push(
          `Add the missing columns to these tables: ${tableColumnList}`
        );
      }
      
      // Save migration script to file if requested
      if (migrationPath && migrationScript) {
        const timestamp = new Date().toISOString().replace(/[:\.-]/g, '');
        const migrationFilePath = path.join(migrationPath, `schema_fix_${timestamp}.sql`);
        
        try {
          // Ensure the directory exists
          if (!fs.existsSync(migrationPath)) {
            fs.mkdirSync(migrationPath, { recursive: true });
          }
          
          fs.writeFileSync(migrationFilePath, migrationScript);
          schemaLogger.info(`Migration script saved to ${migrationFilePath}`);
          report.recommendations.push(`Migration script saved to ${migrationFilePath}`);
          
          // Auto-apply migration if requested
          if (autoMigrate) {
            schemaLogger.info('Attempting to automatically apply migration...');
            
            try {
              // Split the SQL into individual statements (split by semicolon)
              const statements = migrationScript
                .split(';')
                .map(statement => statement.trim())
                .filter(statement => statement.length > 0 && !statement.startsWith('--'));
              
              schemaLogger.info(`Found ${statements.length} SQL statements to execute`);
              
              // Execute each statement
              for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                try {
                  await prisma.$executeRawUnsafe(`${statement};`);
                  schemaLogger.info(`Executed statement ${i + 1}/${statements.length}`);
                } catch (error) {
                  schemaLogger.error(`Error executing statement ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
                  report.recommendations.push(`Manual intervention required for statement: ${statement}`);
                  // Continue with next statement even if this one fails
                }
              }
              
              schemaLogger.success('Migration completed successfully');
              report.recommendations.push('Migration was automatically applied. Please restart the service to ensure all schema changes are recognized.');
            } catch (error) {
              schemaLogger.error(`Error during auto-migration: ${error instanceof Error ? error.message : String(error)}`);
              report.recommendations.push('Automatic migration failed. Please apply the migration script manually.');
            }
          } else {
            report.recommendations.push(
              `To apply this migration, run: node prisma/migrations/apply_migrations.js --file=${path.basename(migrationFilePath)}`
            );
          }
        } catch (error) {
          schemaLogger.error(`Error saving migration script: ${error instanceof Error ? error.message : String(error)}`);
          report.recommendations.push('Could not save migration script. Please check logs for details.');
        }
      }
    }
    
    // Generate summary
    if (isValid) {
      report.summary = 'Schema validation passed. All critical tables and columns exist.';
      if (report.warnings.length > 0) {
        report.summary += ` There are ${report.warnings.length} non-critical issues that should be addressed.`;
      }
    } else {
      report.summary = `Schema validation failed. Found ${report.criticalIssues.length} critical issues that must be fixed.`;
      if (report.warnings.length > 0) {
        report.summary += ` Also found ${report.warnings.length} non-critical issues.`;
      }
      report.summary += ' See detailed report for more information.';
    }
    
    schemaLogger.info('Schema validation completed');
    schemaLogger.info(report.summary);
    
    return { 
      isValid, 
      missingTables, 
      missingColumns, 
      missingIndexes,
      missingRelationships,
      validationMap,
      report 
    };
  } catch (error) {
    const errorMessage = `Error during schema validation: ${error instanceof Error ? error.message : String(error)}`;
    schemaLogger.error(errorMessage);
    
    report.summary = 'Schema validation failed due to an unexpected error.';
    report.criticalIssues.push(errorMessage);
    report.recommendations.push('Check the database connection and permissions.');
    report.recommendations.push('Review the error logs for more details.');
    
    return { 
      isValid: false, 
      missingTables, 
      missingColumns, 
      missingIndexes,
      missingRelationships,
      validationMap,
      report 
    };
  }
}
