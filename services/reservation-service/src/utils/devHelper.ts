/**
 * Development Helper Utility
 *
 * Utility functions to help with development-specific needs
 */

import { Request } from 'express';
import { logger } from './logger';

/**
 * Gets tenant ID from request or returns a default in development mode
 * This helps bypass tenant middleware requirements in development
 * 
 * @param req Express request object
 * @param requestId Optional request ID for logging
 * @returns Tenant ID (either from request or default)
 */
export const getTenantId = (req: Request, requestId?: string): string => {
  // If tenant ID exists on request, use it
  if (req.tenantId) {
    return req.tenantId;
  }
  
  // In development, provide a default tenant ID
  if (process.env.NODE_ENV === 'development') {
    const defaultTenantId = 'default-dev-tenant';
    logger.warn(`🔓 DEVELOPMENT MODE: Using default tenant ID`, { requestId, defaultTenantId });
    return defaultTenantId;
  }
  
  // In production, return undefined (which will trigger appropriate errors)
  return '';
};
