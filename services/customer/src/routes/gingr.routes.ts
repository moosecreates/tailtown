/**
 * Gingr API Routes
 * Routes for testing Gingr API connection and data migration
 */

import express from 'express';
import { testGingrConnection } from '../controllers/gingr-test.controller';
import { startMigration, testConnection } from '../controllers/gingr-migration.controller';

const router = express.Router();

// Test Gingr API connection (quick test)
router.post('/test', testGingrConnection);

// Test connection only (no data fetch)
router.post('/test-connection', testConnection);

// Start full migration
router.post('/migrate', startMigration);

export default router;
