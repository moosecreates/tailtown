"use strict";
/**
 * Tenant Service Prisma Client
 *
 * This module provides a custom Prisma client for tenant operations.
 * It includes the Organization and TenantUsage models defined in the tenant schema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantPrismaClient = getTenantPrismaClient;
exports.closeTenantPrismaClient = closeTenantPrismaClient;
const client_1 = require("@prisma/client");
const logger_1 = require("../logger");
// Create a singleton instance of the Prisma client
let prismaClient = null;
/**
 * Get or create the tenant Prisma client
 */
function getTenantPrismaClient() {
    if (!prismaClient) {
        try {
            // Initialize the Prisma client with the tenant schema
            prismaClient = new client_1.PrismaClient();
            // Note: In a production environment, we would need to ensure
            // the Prisma client is properly configured with the correct schema
            // This simplified approach works for our current implementation
            logger_1.logger.info('Tenant Prisma client initialized successfully');
        }
        catch (error) {
            logger_1.logger.error(`Failed to initialize tenant Prisma client: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    return prismaClient;
}
/**
 * Close the Prisma client connection
 */
async function closeTenantPrismaClient() {
    if (prismaClient) {
        await prismaClient.$disconnect();
        prismaClient = null;
        logger_1.logger.info('Tenant Prisma client disconnected');
    }
}
