/**
 * Reconciliation Controller
 * 
 * This controller manages financial data reconciliation functions:
 * - Running manual and scheduled reconciliations
 * - Viewing reconciliation history and results
 * - Managing reconciliation schedules
 * - Resolving discrepancies
 */

import { Request, Response, NextFunction } from 'express';
import reconciliationService from '../services/reconciliationService';
import { ReconciliationFrequency, ReconciliationType } from '../types/financialTypes';
import AppError from '../utils/appError';

/**
 * Run a manual reconciliation for a specified date range
 */
export const runReconciliation = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const {
      startDate,
      endDate,
      reconciliationType = 'MANUAL',
    } = req.body;

    // Validate date range
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    // Ensure start date is before end date
    if (start > end) {
      return next(new AppError('Start date must be before end date', 400));
    }

    // Run the reconciliation
    const result = await reconciliationService.performReconciliation(
      start,
      end,
      reconciliationType,
      req.body.userId // Current user ID from auth middleware
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Error running reconciliation:', error);
    return next(new AppError(error.message || 'Error running reconciliation', 500));
  }
};

/**
 * Get a list of reconciliations with optional filtering
 */
export const getReconciliations = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const {
      startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last month
      endDate = new Date(),
      status
    } = req.query;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const reconciliations = await reconciliationService.getReconciliations(
      start, 
      end, 
      status as string
    );

    res.status(200).json({
      status: 'success',
      results: reconciliations.length,
      data: reconciliations
    });
  } catch (error: any) {
    console.error('Error fetching reconciliations:', error);
    return next(new AppError(error.message || 'Error fetching reconciliations', 500));
  }
};

/**
 * Get a specific reconciliation by ID
 */
export const getReconciliation = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const reconciliation = await reconciliationService.getReconciliationById(id);
    
    if (!reconciliation) {
      return next(new AppError('Reconciliation not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: reconciliation
    });
  } catch (error: any) {
    console.error('Error fetching reconciliation:', error);
    return next(new AppError(error.message || 'Error fetching reconciliation', 500));
  }
};

/**
 * Schedule a new reconciliation job
 */
export const scheduleReconciliation = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { frequency, type = 'SYSTEM' } = req.body;
    
    if (!frequency || !Object.values(ReconciliationFrequency).includes(frequency)) {
      return next(new AppError(`Invalid frequency: ${frequency}`, 400));
    }

    await reconciliationService.scheduleReconciliation(
      frequency as ReconciliationFrequency,
      type
    );

    res.status(201).json({
      status: 'success',
      message: `${frequency} reconciliation scheduled successfully`
    });
  } catch (error: any) {
    console.error('Error scheduling reconciliation:', error);
    return next(new AppError(error.message || 'Error scheduling reconciliation', 500));
  }
};

/**
 * Resolve a specific discrepancy in a reconciliation
 */
export const resolveDiscrepancy = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { reconciliationId } = req.params;
    const { discrepancyIndex, resolution } = req.body;
    
    if (discrepancyIndex === undefined || !resolution) {
      return next(new AppError('Discrepancy index and resolution are required', 400));
    }

    await reconciliationService.resolveDiscrepancy(
      reconciliationId,
      parseInt(discrepancyIndex as string),
      resolution,
      req.body.userId // Current user ID from auth middleware
    );

    res.status(200).json({
      status: 'success',
      message: 'Discrepancy resolved successfully'
    });
  } catch (error: any) {
    console.error('Error resolving discrepancy:', error);
    return next(new AppError(error.message || 'Error resolving discrepancy', 500));
  }
};

/**
 * Run all scheduled reconciliations that are due
 * This endpoint is intended to be called by a scheduler or cron job
 */
export const runScheduledReconciliations = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    await reconciliationService.executeScheduledReconciliations();

    res.status(200).json({
      status: 'success',
      message: 'Scheduled reconciliations executed successfully'
    });
  } catch (error: any) {
    console.error('Error running scheduled reconciliations:', error);
    return next(new AppError(error.message || 'Error running scheduled reconciliations', 500));
  }
};

export default {
  runReconciliation,
  getReconciliations,
  getReconciliation,
  scheduleReconciliation,
  resolveDiscrepancy,
  runScheduledReconciliations
};
