/**
 * Reconciliation Routes
 * 
 * API routes for financial data reconciliation functions:
 * - Running manual reconciliations
 * - Managing reconciliation schedules
 * - Viewing reconciliation history and results
 * - Resolving discrepancies
 */

import express from 'express';
import reconciliationController from '../controllers/reconciliation.controller';
// Use CommonJS require with type assertion as a workaround for the import issue
// @ts-ignore
const authMiddleware = require('../middleware/authMiddleware');
const { protect, restrictTo } = authMiddleware;

const router = express.Router();

// System-triggered reconciliation (protected by API key, not JWT)
// This route is intended to be called by a scheduler/cron job
// Add this BEFORE any JWT middleware to ensure it's not blocked
router.post(
  '/scheduled/execute',
  (req, res, next) => {
    // Simple API key validation middleware
    const apiKey = req.headers['x-api-key'];
    // Allow 'test-api-key' in development mode
    const validKey = process.env.NODE_ENV === 'production' 
      ? process.env.RECONCILIATION_API_KEY 
      : (process.env.RECONCILIATION_API_KEY || 'test-api-key');
      
    if (!apiKey || apiKey !== validKey) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid API key'
      });
    }
    next();
  },
  reconciliationController.runScheduledReconciliations
);

// Create a separate router for JWT protected routes
const protectedRouter = express.Router();

// Apply auth middleware only to protected routes
protectedRouter.use(protect);
protectedRouter.use(restrictTo('admin', 'manager', 'finance'));

// Add protected routes
protectedRouter.get('/', reconciliationController.getReconciliations);
protectedRouter.get('/:id', reconciliationController.getReconciliation);
protectedRouter.post('/run', reconciliationController.runReconciliation);
protectedRouter.post('/schedule', reconciliationController.scheduleReconciliation);
protectedRouter.post('/:reconciliationId/resolve', reconciliationController.resolveDiscrepancy);

// Mount the protected router
router.use('/', protectedRouter);

export default router;
