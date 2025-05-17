/**
 * Reporting Routes
 * 
 * Routes for the optimized reporting read models.
 * These endpoints provide access to data structures specifically designed for reporting,
 * maintained in sync with the transaction data source of truth.
 */

import express from 'express';
import reportingController from '../controllers/reporting.controller';

const router = express.Router();

/**
 * @route   GET /api/reporting/services
 * @desc    Get service revenue summary with optimized read model
 * @access  Private
 */
router.get('/services', reportingController.getServiceRevenueSummary);

/**
 * @route   GET /api/reporting/addons
 * @desc    Get add-on revenue summary with optimized read model
 * @access  Private
 */
router.get('/addons', reportingController.getAddOnRevenueSummary);

/**
 * @route   GET /api/reporting/dashboard
 * @desc    Get dashboard summary with optimized read model
 * @access  Private
 */
router.get('/dashboard', reportingController.getDashboardSummary);

/**
 * @route   GET /api/reporting/customers
 * @desc    Get customer value summary with optimized read model
 * @access  Private
 */
router.get('/customers', reportingController.getCustomerValueSummary);

/**
 * @route   GET /api/reporting/validate
 * @desc    Validate reporting models against source data
 * @access  Private
 */
router.get('/validate', reportingController.validateReportingModels);

export default router;
