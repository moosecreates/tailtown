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
import { logger } from '../logger';
import { AppError } from '../errors/AppError';
import { TenantService } from './tenantService';
import { TenantConfig } from './types';

/**
 * Enhanced tenant middleware with validation and resource tracking
 */
export const tenantMiddleware = (options: {
  validateTenant?: boolean;
  enforceQuotas?: boolean;
  trackUsage?: boolean;
} = {}) => {
  // Default options
  const config = {
    validateTenant: true,
    enforceQuotas: true,
    trackUsage: true,
    ...options
  };

  const tenantService = new TenantService();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract tenant ID from headers
      const tenantId = req.headers['x-tenant-id'] as string;
      
      if (!tenantId) {
        logger.error('Request missing required x-tenant-id header');
        return next(new AppError('Tenant ID is required', 400));
      }

      // Validate tenant if enabled
      if (config.validateTenant) {
        try {
          const tenantDetails = await tenantService.validateTenant(tenantId);
          
          if (!tenantDetails.active) {
            logger.warn(`Inactive tenant attempted access: ${tenantId}`);
            return next(new AppError('Tenant account is inactive', 403));
          }

          // Attach tenant details to request
          req.tenantId = tenantId;
          req.tenantConfig = tenantDetails.config;
          req.tenantTier = tenantDetails.tier;
        } catch (error) {
          logger.error(`Tenant validation failed: ${error instanceof Error ? error.message : String(error)}`);
          return next(new AppError('Invalid tenant ID', 401));
        }
      } else {
        // Simple mode - just attach the ID without validation
        req.tenantId = tenantId;
      }

      // Track request start time for usage metrics
      if (config.trackUsage) {
        req.tenantRequestStart = Date.now();
        
        // Track resource usage on response finish
        res.on('finish', () => {
          const duration = Date.now() - (req.tenantRequestStart || 0);
          const path = req.path;
          const method = req.method;
          const statusCode = res.statusCode;
          
          // Async tracking to not block response
          tenantService.trackResourceUsage(tenantId, {
            endpoint: path,
            method,
            duration,
            statusCode,
            timestamp: new Date()
          }).catch(error => {
            logger.error(`Failed to track tenant resource usage: ${error instanceof Error ? error.message : String(error)}`);
          });
        });
      }

      // Enforce tenant quotas if enabled
      if (config.enforceQuotas) {
        try {
          const quotaCheck = await tenantService.checkQuotas(tenantId, req.path, req.method);
          
          if (!quotaCheck.allowed) {
            logger.warn(`Quota exceeded for tenant ${tenantId}: ${quotaCheck.reason}`);
            return next(new AppError(`Resource limit exceeded: ${quotaCheck.reason}`, 429));
          }
        } catch (error) {
          // Log but continue if quota check fails
          logger.error(`Quota check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      next();
    } catch (error) {
      logger.error(`Tenant middleware error: ${error instanceof Error ? error.message : String(error)}`);
      next(new AppError('Tenant processing error', 500));
    }
  };
};
