/**
 * Validation Controller
 * 
 * Provides endpoints for validating data consistency
 * across the application, with a focus on financial data.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import financialTests from '../tests/financialService.test';

/**
 * Validate financial data consistency
 * This endpoint runs validation tests to ensure financial calculations
 * are consistent across different methods
 */
export const validateFinancialData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Running financial data validation...');
    
    // Run the consistency test from our test suite
    const consistencyResult = await financialTests.testRevenueConsistency();
    
    // Log the results
    if (consistencyResult.success) {
      console.log('✅ Financial data validation passed - All calculations are consistent');
    } else {
      console.error('❌ Financial data validation failed - Calculations are inconsistent');
      console.log('Summary:');
      console.log(`- Financial summary total: ${consistencyResult.summary}`);
      console.log(`- Service revenue total: ${consistencyResult.serviceTotal}`);
      console.log(`- Add-on revenue total: ${consistencyResult.addOnTotal}`);
      console.log(`- Combined total: ${consistencyResult.combinedTotal}`);
      console.log(`- Customer revenue total: ${consistencyResult.customerTotal}`);
      console.log(`- Daily revenue total: ${consistencyResult.dailyTotal}`);
    }
    
    // Format response
    const discrepancies = [];
    
    if (consistencyResult.success) {
      // All good
    } else {
      // Check service + add-on total
      if (consistencyResult.summary !== undefined && consistencyResult.combinedTotal !== undefined && 
          Math.abs(consistencyResult.summary - consistencyResult.combinedTotal) > 0.01) {
        discrepancies.push(`Service + add-on total (${consistencyResult.combinedTotal}) doesn't match financial summary (${consistencyResult.summary})`);
      }
      
      // Check customer total
      if (consistencyResult.summary !== undefined && consistencyResult.customerTotal !== undefined && 
          Math.abs(consistencyResult.summary - consistencyResult.customerTotal) > 0.01) {
        discrepancies.push(`Customer revenue total (${consistencyResult.customerTotal}) doesn't match financial summary (${consistencyResult.summary})`);
      }
      
      // Check daily total
      if (consistencyResult.summary !== undefined && consistencyResult.dailyTotal !== undefined && 
          Math.abs(consistencyResult.summary - consistencyResult.dailyTotal) > 0.01) {
        discrepancies.push(`Daily revenue total (${consistencyResult.dailyTotal}) doesn't match financial summary (${consistencyResult.summary})`);
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        isConsistent: consistencyResult.success,
        summary: consistencyResult.summary,
        serviceTotal: consistencyResult.serviceTotal,
        addOnTotal: consistencyResult.addOnTotal,
        combinedTotal: consistencyResult.combinedTotal,
        customerTotal: consistencyResult.customerTotal,
        dailyTotal: consistencyResult.dailyTotal,
        discrepancies
      }
    });
  } catch (error) {
    console.error('Error running financial validation:', error);
    return next(new AppError('Error validating financial data', 500));
  }
};
