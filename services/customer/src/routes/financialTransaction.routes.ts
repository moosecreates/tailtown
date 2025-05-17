import { Router } from 'express';
import { 
  createFinancialTransaction,
  getFinancialTransactions,
  getFinancialTransaction,
  updateTransactionStatus,
  processPayment,
  getCustomerFinancialData,
  processRefund,
  reconcileFinancialData
} from '../controllers/financialTransaction.controller';

const router = Router();

/**
 * Financial Transaction Routes
 * These routes provide access to the single source of truth for all financial data
 */

// Get all financial transactions with filtering
router.get('/', getFinancialTransactions);

// Get specific transaction by ID
router.get('/:id', getFinancialTransaction);

// Create a new financial transaction
router.post('/', createFinancialTransaction);

// Update transaction status
router.patch('/:id/status', updateTransactionStatus);

// Process a payment with full financial tracking
router.post('/payment', processPayment);

// Process a refund with full financial tracking
router.post('/refund', processRefund);

// Get customer's financial account and history
router.get('/customer/:customerId', getCustomerFinancialData);

// Perform financial data reconciliation
router.post('/reconcile', reconcileFinancialData);

export default router;
