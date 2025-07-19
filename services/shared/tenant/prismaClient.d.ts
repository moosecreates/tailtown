/**
 * Tenant Service Prisma Client
 *
 * This module provides a custom Prisma client for tenant operations.
 * It includes the Organization and TenantUsage models defined in the tenant schema.
 */
import { PrismaClient } from '@prisma/client';
export interface TenantPrismaClient extends PrismaClient {
    organization: any;
    tenantUsage: any;
}
/**
 * Get or create the tenant Prisma client
 */
export declare function getTenantPrismaClient(): TenantPrismaClient | null;
/**
 * Close the Prisma client connection
 */
export declare function closeTenantPrismaClient(): Promise<void>;
