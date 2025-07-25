/**
 * Enhanced Tenant Middleware - DEVELOPMENT FRIENDLY
 * 
 * This middleware uses the shared tenant middleware but configures it
 * to be development-friendly by disabling validation in development mode.
 */

import { tenantMiddleware } from '../../../shared/tenant/tenantMiddleware';
import { logger } from '../utils/logger';

// Configure the tenant middleware based on environment
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  logger.warn('🔓 DEVELOPMENT MODE: Tenant validation disabled');
}

// Configure the tenant middleware with appropriate options for this service
export const reservationTenantMiddleware = tenantMiddleware({
  // Disable tenant validation in development mode
  validateTenant: !isDevelopment,
  // Disable quota enforcement in development mode
  enforceQuotas: !isDevelopment,
  // Disable usage tracking in development mode
  trackUsage: !isDevelopment
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
