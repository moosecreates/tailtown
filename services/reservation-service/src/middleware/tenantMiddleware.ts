/**
 * Tenant Middleware
 * 
 * This middleware ensures proper multi-tenant isolation by requiring a tenantId
 * header in all requests. It implements our schema alignment strategy by
 * enforcing tenant isolation at the API level.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    logger.error('Request missing required x-tenant-id header');
    return next(new AppError('Tenant ID is required', 400));
  }
  
  // Attach tenantId to request object for use in controllers
  req.tenantId = tenantId;
  
  next();
};
