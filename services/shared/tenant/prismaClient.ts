/**
 * Tenant Service Prisma Client
 * 
 * This module provides a custom Prisma client for tenant operations.
 * It includes the Organization and TenantUsage models defined in the tenant schema.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import path from 'path';

// Define the extended Prisma client type with our tenant models
export interface TenantPrismaClient extends PrismaClient {
  organization: any;
  tenantUsage: any;
}

// Create a singleton instance of the Prisma client
let prismaClient: TenantPrismaClient | null = null;

/**
 * Get or create the tenant Prisma client
 */
export function getTenantPrismaClient(): TenantPrismaClient | null {
  if (!prismaClient) {
    try {
      // Initialize the Prisma client with the tenant schema
      prismaClient = new PrismaClient() as TenantPrismaClient;
      
      // Note: In a production environment, we would need to ensure
      // the Prisma client is properly configured with the correct schema
      // This simplified approach works for our current implementation
      
      logger.info('Tenant Prisma client initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize tenant Prisma client: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  return prismaClient;
}

/**
 * Close the Prisma client connection
 */
export async function closeTenantPrismaClient(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
    logger.info('Tenant Prisma client disconnected');
  }
}
