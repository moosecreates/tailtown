/**
 * Gingr API Routes
 * Routes for testing Gingr API connection and data migration
 */

import express from 'express';
import { testGingrConnection } from '../controllers/gingr-test.controller';

const router = express.Router();

// Test Gingr API connection
router.post('/test', testGingrConnection);

export default router;
