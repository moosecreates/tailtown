/**
 * Tenant Service
 *
 * Core service for tenant management in a SaaS platform.
 * Handles:
 * - Tenant validation and authentication
 * - Tenant configuration management
 * - Resource usage tracking and quota enforcement
 * - Tenant-specific feature flags
 */
import { TenantConfig, TenantDetails, ResourceUsage, QuotaCheckResult } from './types';
export declare class TenantService {
    private prisma;
    private configCache;
    private cacheTTL;
    private lastCacheRefresh;
    constructor();
    /**
     * Validates a tenant ID and returns tenant details
     * Falls back to API validation if database is unavailable
     */
    validateTenant(tenantId: string): Promise<TenantDetails>;
    /**
     * Get tenant configuration with caching
     */
    getTenantConfig(tenantId: string): Promise<TenantConfig>;
    /**
     * Track resource usage for a tenant
     */
    trackResourceUsage(tenantId: string, usage: ResourceUsage): Promise<void>;
    /**
     * Check if a tenant has exceeded their quotas
     */
    checkQuotas(tenantId: string, endpoint: string, method: string): Promise<QuotaCheckResult>;
    /**
     * Fallback method to validate tenants via API when database is unavailable
     * This provides a backup validation mechanism for high availability
     */
    private validateTenantViaAPI;
    /**
     * Parse tenant configuration from stored settings
     */
    private parseTenantConfig;
    /**
     * Get default configuration based on subscription tier
     */
    private getDefaultConfig;
}
