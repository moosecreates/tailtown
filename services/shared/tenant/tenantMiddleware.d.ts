/**
 * Tenant Middleware
 *
 * Enhanced multi-tenant middleware for SaaS platform scaling.
 * This middleware:
 * 1. Validates tenant IDs against the tenant service
 * 2. Attaches tenant context to requests
 * 3. Enforces tenant-specific rate limits and quotas
 * 4. Tracks resource usage for billing and monitoring
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Enhanced tenant middleware with validation and resource tracking
 */
export declare const tenantMiddleware: (options?: {
    validateTenant?: boolean;
    enforceQuotas?: boolean;
    trackUsage?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
