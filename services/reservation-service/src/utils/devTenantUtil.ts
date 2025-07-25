/**
 * Development Tenant Utility
 * 
 * This utility provides a development-only bypass for tenant ID requirements
 * to make local development and testing easier.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Add a default tenant ID to the request in development mode
 * This should only be used in development environments
 */
export const devTenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only apply in development mode
  if (process.env.NODE_ENV === 'development') {
    // Always inject a default tenant ID
    req.tenantId = 'default-dev-tenant';
    
    // Add other required tenant properties with proper TenantConfig structure
    req.tenantConfig = {
      featureFlags: {
        advancedReporting: true,
        bulkOperations: true,
        customBranding: true,
        apiAccess: true,
        webhooks: true
      },
      quotas: {
        requestsPerMinute: 1000,
        requestsPerDay: 10000,
        storageGB: 100,
        maxUsers: 100
      },
      preferences: {
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'America/Denver'
      }
    };
    
    req.tenantTier = 'development';
    
    // Log that we're using the development tenant
    logger.warn('🔓 DEVELOPMENT MODE: Using default tenant ID');
  }
  
  next();
};
