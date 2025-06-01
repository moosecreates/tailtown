import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../interfaces/ApiResponse';
import { createErrorResponse } from '../responses/errorResponse';

/**
 * Extended Express Request with tenant information
 */
export interface TenantRequest extends Request {
  tenantId?: string;
  organizationId?: string;
}

/**
 * Configuration options for tenant middleware
 */
export interface TenantMiddlewareOptions {
  // Whether to require a tenant ID for the request to proceed
  required?: boolean;
  
  // Custom extraction function to get tenant ID from request
  extractTenantId?: (req: Request) => string | undefined;
  
  // Optional tenant validation function
  validateTenant?: (tenantId: string) => Promise<boolean>;
}

/**
 * Default options for tenant middleware
 */
const defaultOptions: TenantMiddlewareOptions = {
  required: true,
  extractTenantId: (req: Request): string | undefined => {
    // Default extraction strategy:
    // 1. Check header X-Tenant-ID
    // 2. Check JWT token claim (if available)
    // 3. Check query parameter tenantId
    return (
      req.headers['x-tenant-id'] as string ||
      (req.user as any)?.tenantId ||
      req.query.tenantId as string
    );
  },
  validateTenant: async (tenantId: string): Promise<boolean> => {
    // Default implementation just checks if tenantId exists
    return !!tenantId;
  },
};

/**
 * Middleware to extract tenant ID from request and validate it
 * This ensures proper multi-tenancy isolation across all API endpoints
 */
export function tenantMiddleware(options: TenantMiddlewareOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };

  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = mergedOptions.extractTenantId?.(req);
      
      if (!tenantId && mergedOptions.required) {
        const errorResponse: ApiErrorResponse = createErrorResponse({
          code: 'TENANT_REQUIRED',
          message: 'Tenant identification is required for this operation',
          status: 403
        });
        
        return res.status(403).json(errorResponse);
      }
      
      if (tenantId) {
        // Validate tenant if needed
        if (mergedOptions.validateTenant) {
          const isValid = await mergedOptions.validateTenant(tenantId);
          
          if (!isValid) {
            const errorResponse: ApiErrorResponse = createErrorResponse({
              code: 'INVALID_TENANT',
              message: 'The specified tenant is invalid or not accessible',
              status: 403
            });
            
            return res.status(403).json(errorResponse);
          }
        }
        
        // Attach tenant ID to request
        req.tenantId = tenantId;
        
        // If user object exists, also attach tenant to it
        if ((req as any).user) {
          (req as any).user.tenantId = tenantId;
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
