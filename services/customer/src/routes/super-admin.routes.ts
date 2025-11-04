/**
 * Super Admin Routes
 * 
 * Routes for super admin authentication and management.
 * All routes except login require authentication.
 */

import express from 'express';
import {
  login,
  logout,
  getCurrentUser,
  refreshToken
} from '../controllers/super-admin/auth.controller';
import {
  suspendTenant,
  activateTenant,
  deleteTenant,
  restoreTenant,
  getTenantStats
} from '../controllers/super-admin/tenant-management.controller';
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  cloneTenant
} from '../controllers/super-admin/tenant-crud.controller';
import {
  startImpersonation,
  endImpersonation,
  getActiveSessions,
  getImpersonationHistory
} from '../controllers/super-admin/impersonation.controller';
import { requireSuperAdmin } from '../middleware/require-super-admin.middleware';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.post('/logout', requireSuperAdmin, logout);
router.get('/me', requireSuperAdmin, getCurrentUser);

// Tenant Management routes (Phase 2)
router.get('/tenants', requireSuperAdmin, listTenants);  // List all tenants
router.get('/tenants/:id', requireSuperAdmin, getTenant);  // Get single tenant
router.post('/tenants', requireSuperAdmin, createTenant);  // Create new tenant
router.patch('/tenants/:id', requireSuperAdmin, updateTenant);  // Update tenant
router.post('/tenants/:id/clone', requireSuperAdmin, cloneTenant);  // Clone tenant
router.post('/tenants/:id/suspend', requireSuperAdmin, suspendTenant);
router.post('/tenants/:id/activate', requireSuperAdmin, activateTenant);
router.delete('/tenants/:id', requireSuperAdmin, deleteTenant);
router.post('/tenants/:id/restore', requireSuperAdmin, restoreTenant);
router.get('/tenants/:id/stats', requireSuperAdmin, getTenantStats);

// Impersonation routes (Phase 3)
router.post('/impersonate/:tenantId', requireSuperAdmin, startImpersonation);
router.post('/impersonate/end/:sessionId', requireSuperAdmin, endImpersonation);
router.get('/impersonate/active', requireSuperAdmin, getActiveSessions);
router.get('/impersonate/history', requireSuperAdmin, getImpersonationHistory);

export default router;
