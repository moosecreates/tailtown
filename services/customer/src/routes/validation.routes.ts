/**
 * Validation Routes
 * 
 * Routes for data validation endpoints
 */

import { Router } from 'express';
import * as validationController from '../controllers/validation.controller';

const router = Router();

// Validate financial data consistency
router.get('/financial', validationController.validateFinancialData);

export default router;
