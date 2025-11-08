/**
 * System Routes
 * 
 * Routes for system-level operations like health checks and monitoring.
 * These endpoints are typically used by super admins and monitoring tools.
 */

import { Router } from 'express';
import { getSystemHealth, getSimpleHealth } from '../controllers/system/health.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/system/health
 * Get comprehensive system health metrics
 * Requires authentication (super admin only in production)
 */
router.get('/health', authenticate, getSystemHealth);

/**
 * GET /api/system/health/simple
 * Simple health check for load balancers
 * No authentication required
 */
router.get('/health/simple', getSimpleHealth);

export { router as systemRoutes };
