import { Router } from 'express';
import { tenantController } from '../controllers/tenant.controller';

const router = Router();

// Get all tenants (with optional filtering)
router.get('/', (req, res) => tenantController.getAllTenants(req, res));

// Get tenant by ID
router.get('/:id', (req, res) => tenantController.getTenantById(req, res));

// Get tenant by subdomain
router.get('/subdomain/:subdomain', (req, res) => tenantController.getTenantBySubdomain(req, res));

// Get tenant usage statistics
router.get('/:id/usage', (req, res) => tenantController.getTenantUsage(req, res));

// Create new tenant
router.post('/', (req, res) => tenantController.createTenant(req, res));

// Update tenant
router.put('/:id', (req, res) => tenantController.updateTenant(req, res));

// Pause tenant
router.post('/:id/pause', (req, res) => tenantController.pauseTenant(req, res));

// Reactivate tenant
router.post('/:id/reactivate', (req, res) => tenantController.reactivateTenant(req, res));

// Delete tenant (soft delete)
router.delete('/:id', (req, res) => tenantController.deleteTenant(req, res));

export default router;
