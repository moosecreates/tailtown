/**
 * Payment Routes
 */

import { Router } from 'express';
import {
  authorizePayment,
  capturePayment,
  refundPayment,
  voidPayment,
  inquireTransaction,
  getTestCards,
} from '../controllers/payment.controller';

const router = Router();

/**
 * @route   POST /api/payments/authorize
 * @desc    Authorize a payment
 * @access  Private
 */
router.post('/authorize', authorizePayment);

/**
 * @route   POST /api/payments/capture
 * @desc    Capture a previously authorized payment
 * @access  Private
 */
router.post('/capture', capturePayment);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund a payment
 * @access  Private
 */
router.post('/refund', refundPayment);

/**
 * @route   POST /api/payments/void
 * @desc    Void a payment
 * @access  Private
 */
router.post('/void', voidPayment);

/**
 * @route   GET /api/payments/inquire/:retref
 * @desc    Inquire about a transaction
 * @access  Private
 */
router.get('/inquire/:retref', inquireTransaction);

/**
 * @route   GET /api/payments/test-cards
 * @desc    Get test card numbers (development only)
 * @access  Public
 */
router.get('/test-cards', getTestCards);

export default router;
