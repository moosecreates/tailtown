/**
 * Tenant Types
 *
 * Type definitions for the tenant middleware and service.
 * These extend Express types and define interfaces for tenant configuration.
 */
/**
 * Tenant configuration including feature flags, quotas, and preferences
 */
export interface TenantConfig {
    featureFlags: {
        advancedReporting: boolean;
        bulkOperations: boolean;
        customBranding: boolean;
        apiAccess: boolean;
        webhooks: boolean;
        [key: string]: boolean;
    };
    quotas: {
        requestsPerMinute?: number;
        requestsPerDay?: number;
        storageGB?: number;
        maxUsers?: number;
        [key: string]: number | undefined;
    };
    preferences: {
        defaultCurrency: string;
        dateFormat: string;
        timezone: string;
        [key: string]: string | number | boolean;
    };
}
/**
 * Tenant details returned from validation
 */
export interface TenantDetails {
    id: string;
    name: string;
    active: boolean;
    tier: string;
    config: TenantConfig;
}
/**
 * Resource usage tracking data
 */
export interface ResourceUsage {
    endpoint: string;
    method: string;
    duration: number;
    statusCode: number;
    timestamp: Date;
}
/**
 * Result of quota check
 */
export interface QuotaCheckResult {
    allowed: boolean;
    reason?: string;
}
/**
 * Extended Express Request with tenant information
 */
declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
            tenantConfig?: TenantConfig;
            tenantTier?: string;
            tenantRequestStart?: number;
        }
    }
}
