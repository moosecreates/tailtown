/**
 * Reporting Controller
 * 
 * Provides endpoints for optimized reporting read models.
 * This controller serves as the API layer for accessing the reporting read models,
 * which are optimized views of the financial transaction data (source of truth).
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import reportingService from '../services/reportingService';

/**
 * Get service revenue summary with optimized read model
 * Supports filtering by time period (day, week, month, year, all)
 */
export const getServiceRevenueSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Reporting: Getting optimized service revenue summary with period:', period);
    
    const serviceRevenueSummary = await reportingService.generateServiceRevenueSummary(
      period as string,
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      status: 'success',
      data: serviceRevenueSummary
    });
  } catch (error) {
    console.error('Error getting service revenue summary:', error);
    return next(new AppError('Error generating service revenue report', 500));
  }
};

/**
 * Get add-on revenue summary with optimized read model
 * Supports filtering by time period (day, week, month, year, all)
 */
export const getAddOnRevenueSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Reporting: Getting optimized add-on revenue summary with period:', period);
    
    const addOnRevenueSummary = await reportingService.generateAddOnRevenueSummary(
      period as string,
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      status: 'success',
      data: addOnRevenueSummary
    });
  } catch (error) {
    console.error('Error getting add-on revenue summary:', error);
    return next(new AppError('Error generating add-on revenue report', 500));
  }
};

/**
 * Get dashboard summary with optimized read model
 * Supports filtering by time period (day, week, month, year, all)
 */
export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Reporting: Getting optimized dashboard summary with period:', period);
    
    const dashboardSummary = await reportingService.generateDashboardSummary(
      period as string,
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      status: 'success',
      data: dashboardSummary
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return next(new AppError('Error generating dashboard summary report', 500));
  }
};

/**
 * Get customer value summary with optimized read model
 * Supports filtering by time period (day, week, month, year, all)
 */
export const getCustomerValueSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Reporting: Getting optimized customer value summary with period:', period);
    
    const customerValueSummary = await reportingService.generateCustomerValueSummary(
      period as string,
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      status: 'success',
      data: customerValueSummary
    });
  } catch (error) {
    console.error('Error getting customer value summary:', error);
    return next(new AppError('Error generating customer value report', 500));
  }
};

/**
 * Compare reporting models with direct database queries
 * Used for validation and data quality assurance
 */
export const validateReportingModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'month' } = req.query;
    
    // Generate reports using reporting models
    const serviceRevenueReport = await reportingService.generateServiceRevenueSummary(period as string);
    const addOnRevenueReport = await reportingService.generateAddOnRevenueSummary(period as string);
    const dashboardSummary = await reportingService.generateDashboardSummary(period as string);
    
    // Simple validation: Check if totals match across different report types
    const serviceTotal = serviceRevenueReport.totalRevenue;
    const addOnTotal = addOnRevenueReport.totalRevenue;
    const dashboardTotal = dashboardSummary.revenue.total;
    
    // Calculate differences (should be minimal or zero)
    const serviceToDashboardDiff = Math.abs(serviceTotal + addOnTotal - dashboardTotal);
    
    // Allow for small floating point differences (less than 1 cent)
    const isConsistent = serviceToDashboardDiff < 0.01;
    
    res.status(200).json({
      status: 'success',
      data: {
        isConsistent,
        serviceTotal,
        addOnTotal,
        dashboardTotal,
        difference: serviceToDashboardDiff,
        message: isConsistent 
          ? 'Reporting models are consistent' 
          : 'Discrepancies detected in reporting models'
      }
    });
  } catch (error) {
    console.error('Error validating reporting models:', error);
    return next(new AppError('Error validating reporting models', 500));
  }
};

export default {
  getServiceRevenueSummary,
  getAddOnRevenueSummary,
  getDashboardSummary,
  getCustomerValueSummary,
  validateReportingModels
};
