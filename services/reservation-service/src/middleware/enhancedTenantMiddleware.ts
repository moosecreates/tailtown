/**
 * Enhanced Tenant Middleware Integration
 * 
 * This file demonstrates how to integrate the shared tenant middleware
 * into the reservation service, replacing the existing implementation
 * with the enhanced SaaS-ready version.
 */

import { Request, Response, NextFunction } from 'express';
import { tenantMiddleware } from '../../../shared/tenant/tenantMiddleware';
import { logger } from '../utils/logger';

// Configure the tenant middleware with appropriate options for this service
export const reservationTenantMiddleware = tenantMiddleware({
  // Enable tenant validation to ensure only valid tenants can access the service
  validateTenant: true,
  
  // Enable quota enforcement to prevent abuse and ensure fair resource allocation
  enforceQuotas: true,
  
  // Enable usage tracking for billing and monitoring
  trackUsage: true
});

/**
 * Apply the tenant middleware to all routes that require tenant isolation
 * This is a helper function to make it easy to apply the middleware to routes
 */
export function applyTenantMiddleware(app: any) {
  logger.info('Applying enhanced tenant middleware to reservation service');
  
  // Apply to all reservation endpoints
  app.use('/api/reservations', reservationTenantMiddleware);
  
  // Apply to all resource endpoints
  app.use('/api/resources', reservationTenantMiddleware);
  
  // Apply to all availability endpoints
  app.use('/api/availability', reservationTenantMiddleware);
  
  // Skip tenant middleware for health check and public endpoints
  // These routes will not require tenant authentication
  
  logger.info('Enhanced tenant middleware applied successfully');
}

/**
 * Migration Guide:
 * 
 * To migrate from the old tenant middleware to the enhanced version:
 * 
 * 1. In your main app.ts or index.ts file, replace:
 *    app.use(tenantMiddleware);
 *    
 *    With:
 *    import { applyTenantMiddleware } from './middleware/enhancedTenantMiddleware';
 *    applyTenantMiddleware(app);
 * 
 * 2. Update your controllers to use the enhanced tenant context:
 *    - req.tenantId: The tenant identifier (same as before)
 *    - req.tenantConfig: Access tenant-specific configuration
 *    - req.tenantTier: Access the tenant's subscription tier
 * 
 * 3. Use tenant configuration for feature flags:
 *    if (req.tenantConfig?.featureFlags.advancedReporting) {
 *      // Enable advanced reporting features
 *    }
 * 
 * 4. Check tenant quotas before expensive operations:
 *    if (req.tenantConfig?.quotas.maxUsers && users.length >= req.tenantConfig.quotas.maxUsers) {
 *      return res.status(403).json({ error: 'User limit reached for your subscription tier' });
 *    }
 */
