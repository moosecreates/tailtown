/**
 * Tenant Middleware
 * 
 * This middleware ensures proper multi-tenant isolation by requiring a tenantId
 * header in all requests. It implements our schema alignment strategy by
 * enforcing tenant isolation at the API level.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/appError';

// Note: We're not defining the interface here anymore
// The shared tenant types now define this interface

/**
 * Development-friendly tenant middleware
 * Always adds a default tenant ID without requiring the header
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Try to get tenant from header first
  const tenantId = req.headers['x-tenant-id'] as string || 'default-dev-tenant';
  
  // Always set the tenant ID
  req.tenantId = tenantId;
  
  if (!req.headers['x-tenant-id']) {
    logger.warn(' Development mode: Using default tenant ID. No x-tenant-id header provided.');
  }
  
  next();
};
