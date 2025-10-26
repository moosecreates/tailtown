/**
 * Reports Routes
 * API endpoints for all reports
 */

import express from 'express';
import {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getYTDSales,
  getTopCustomersReport,
  getMonthlyTax,
  getQuarterlyTax,
  getAnnualTax,
  getTaxBreakdownReport,
  getRevenue,
  getProfitLoss,
  getOutstanding,
  getRefunds
} from '../controllers/reports.controller';

const router = express.Router();

// ============================================================================
// Sales Reports
// ============================================================================

/**
 * @route   GET /api/reports/sales/daily
 * @desc    Get daily sales report
 * @query   date (YYYY-MM-DD)
 * @access  Private
 */
router.get('/sales/daily', getDailySales);

/**
 * @route   GET /api/reports/sales/weekly
 * @desc    Get weekly sales report
 * @query   startDate, endDate (YYYY-MM-DD)
 * @access  Private
 */
router.get('/sales/weekly', getWeeklySales);

/**
 * @route   GET /api/reports/sales/monthly
 * @desc    Get monthly sales report
 * @query   year, month
 * @access  Private
 */
router.get('/sales/monthly', getMonthlySales);

/**
 * @route   GET /api/reports/sales/ytd
 * @desc    Get year-to-date sales report
 * @query   year
 * @access  Private
 */
router.get('/sales/ytd', getYTDSales);

/**
 * @route   GET /api/reports/sales/top-customers
 * @desc    Get top customers by revenue
 * @query   startDate, endDate, limit (optional, default 10)
 * @access  Private
 */
router.get('/sales/top-customers', getTopCustomersReport);

// ============================================================================
// Tax Reports
// ============================================================================

/**
 * @route   GET /api/reports/tax/monthly
 * @desc    Get monthly tax report
 * @query   year, month
 * @access  Private
 */
router.get('/tax/monthly', getMonthlyTax);

/**
 * @route   GET /api/reports/tax/quarterly
 * @desc    Get quarterly tax report
 * @query   year, quarter (1-4)
 * @access  Private
 */
router.get('/tax/quarterly', getQuarterlyTax);

/**
 * @route   GET /api/reports/tax/annual
 * @desc    Get annual tax report
 * @query   year
 * @access  Private
 */
router.get('/tax/annual', getAnnualTax);

/**
 * @route   GET /api/reports/tax/breakdown
 * @desc    Get tax breakdown by category
 * @query   startDate, endDate
 * @access  Private
 */
router.get('/tax/breakdown', getTaxBreakdownReport);

// ============================================================================
// Financial Reports
// ============================================================================

/**
 * @route   GET /api/reports/financial/revenue
 * @desc    Get revenue report
 * @query   startDate, endDate
 * @access  Private
 */
router.get('/financial/revenue', getRevenue);

/**
 * @route   GET /api/reports/financial/profit-loss
 * @desc    Get profit & loss report
 * @query   startDate, endDate
 * @access  Private
 */
router.get('/financial/profit-loss', getProfitLoss);

/**
 * @route   GET /api/reports/financial/outstanding
 * @desc    Get outstanding balances report
 * @access  Private
 */
router.get('/financial/outstanding', getOutstanding);

/**
 * @route   GET /api/reports/financial/refunds
 * @desc    Get refunds report
 * @query   startDate, endDate
 * @access  Private
 */
router.get('/financial/refunds', getRefunds);

export default router;
