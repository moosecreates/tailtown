import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

// Extended Request type to include tenant info
export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: {
    id: string;
    subdomain: string;
    businessName: string;
    status: string;
    isActive: boolean;
  };
}

/**
 * Middleware to extract tenant from subdomain and attach to request
 * 
 * Subdomain patterns:
 * - Production: {subdomain}.tailtown.com
 * - Development: localhost with X-Tenant-Subdomain header
 * 
 * For development, you can:
 * 1. Use X-Tenant-Subdomain header
 * 2. Use ?subdomain=xxx query parameter
 * 3. Default to 'dev' tenant
 */
export const extractTenantContext = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let subdomain: string | null = null;

    // Method 1: Extract from subdomain (production)
    // Check X-Forwarded-Host first (from reverse proxy), then fall back to hostname
    const forwardedHost = req.headers['x-forwarded-host'] as string;
    const hostname = forwardedHost || req.hostname;
    
    console.log('[Tenant Middleware] Hostname:', hostname, 'Forwarded:', forwardedHost, 'Original:', req.hostname);
    
    // Check if it's a subdomain (not localhost, not main domain, not IP)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168') && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      const parts = hostname.split('.');
      
      // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
      if (parts.length >= 3) {
        subdomain = parts[0];
        console.log('[Tenant Middleware] Extracted subdomain from hostname:', subdomain);
      }
    }

    // Method 2: Development - Check X-Tenant-Subdomain header
    if (!subdomain && req.headers['x-tenant-subdomain']) {
      subdomain = req.headers['x-tenant-subdomain'] as string;
      console.log('[Tenant Middleware] Using X-Tenant-Subdomain header:', subdomain);
    }

    // Method 2b: Check X-Tenant-ID header (for impersonation)
    if (!subdomain && req.headers['x-tenant-id']) {
      subdomain = req.headers['x-tenant-id'] as string;
      console.log('[Tenant Middleware] Using X-Tenant-ID header:', subdomain);
    }

    // Method 3: Development - Check query parameter
    if (!subdomain && req.query.subdomain) {
      subdomain = req.query.subdomain as string;
      console.log('[Tenant Middleware] Using query parameter:', subdomain);
    }

    // Method 4: Fail if no tenant context found
    if (!subdomain) {
      console.error('[Tenant Middleware] No tenant context found. Hostname:', hostname, 'Headers:', JSON.stringify(req.headers));
      return res.status(400).json({
        success: false,
        error: 'Tenant required',
        message: 'No tenant context found. Please access via subdomain or provide tenant ID.',
      });
    }

    // Look up tenant by subdomain
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        businessName: true,
        status: true,
        isActive: true,
        isPaused: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        message: `No tenant found for subdomain: ${subdomain}`,
      });
    }

    // Check if tenant is active
    if (!tenant.isActive || tenant.isPaused) {
      return res.status(403).json({
        success: false,
        error: 'Tenant inactive',
        message: 'This tenant account is currently inactive or paused',
      });
    }

    // Attach tenant info to request
    // Use UUID as tenantId (proper tenant isolation)
    req.tenantId = tenant.id;
    req.tenant = {
      id: tenant.id,
      subdomain: tenant.subdomain,
      businessName: tenant.businessName,
      status: tenant.status,
      isActive: tenant.isActive,
    };

    console.log(`[Tenant Middleware] Tenant context set: ${tenant.businessName} (${tenant.subdomain})`);
    
    next();
  } catch (error) {
    console.error('[Tenant Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to resolve tenant context',
    });
  }
};

/**
 * Middleware to require tenant context
 * Use this on routes that must have a tenant
 */
export const requireTenant = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (!req.tenantId || !req.tenant) {
    return res.status(400).json({
      success: false,
      error: 'Tenant required',
      message: 'This endpoint requires tenant context',
    });
  }
  next();
};

/**
 * Helper function to add tenantId to Prisma queries
 * Use this in your controllers to automatically filter by tenant
 */
export const withTenantId = (req: TenantRequest, additionalWhere: any = {}) => {
  return {
    ...additionalWhere,
    tenantId: req.tenantId,
  };
};

/**
 * Middleware to bypass tenant context (for super admin routes)
 * Use this on routes that should work across all tenants
 */
export const bypassTenantContext = (req: TenantRequest, res: Response, next: NextFunction) => {
  // Just continue without tenant context
  next();
};
