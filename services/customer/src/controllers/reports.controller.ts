/**
 * Reports Controller
 * Handles all reporting endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import {
  getDailySalesReport,
  getWeeklySalesReport,
  getMonthlySalesReport,
  getYTDSalesReport,
  getTopCustomers
} from '../services/salesReportService';
import {
  getMonthlyTaxReport,
  getQuarterlyTaxReport,
  getAnnualTaxReport,
  getTaxBreakdown
} from '../services/taxReportService';
import {
  getRevenueReport,
  getProfitLossReport,
  getOutstandingBalances,
  getRefundsReport
} from '../services/financialReportService';
import {
  getCustomerAcquisitionReport,
  getCustomerRetentionReport,
  getCustomerLifetimeValueReport,
  getCustomerDemographicsReport,
  getInactiveCustomersReport
} from '../services/customerReportService';
import {
  getStaffPerformanceReport,
  getResourceUtilizationReport,
  getBookingPatternsReport,
  getCapacityAnalysisReport
} from '../services/operationalReportService';

// ============================================================================
// Sales Reports
// ============================================================================

/**
 * GET /api/reports/sales/daily
 */
export const getDailySales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { date } = req.query;
    
    if (!date) {
      return next(new AppError('Date parameter is required', 400));
    }
    
    const report = await getDailySalesReport(tenantId, date as string);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'sales_daily',
        title: `Daily Sales Report - ${date}`,
        generatedAt: new Date(),
        filters: { date },
        summary: {
          totalRevenue: report.totalSales,
          totalTransactions: report.transactionCount,
          averageTransaction: report.averageTransaction
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating daily sales report:', error);
    return next(new AppError('Failed to generate daily sales report', 500));
  }
};

/**
 * GET /api/reports/sales/weekly
 */
export const getWeeklySales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getWeeklySalesReport(tenantId, startDate as string, endDate as string);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'sales_weekly',
        title: `Weekly Sales Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalRevenue: report.totalSales,
          totalTransactions: report.transactionCount,
          averageTransaction: report.averageTransaction
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating weekly sales report:', error);
    return next(new AppError('Failed to generate weekly sales report', 500));
  }
};

/**
 * GET /api/reports/sales/monthly
 */
export const getMonthlySales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { year, month } = req.query;
    
    if (!year || !month) {
      return next(new AppError('year and month parameters are required', 400));
    }
    
    const report = await getMonthlySalesReport(
      tenantId,
      parseInt(year as string),
      parseInt(month as string)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'sales_monthly',
        title: `Monthly Sales Report - ${report.monthName}`,
        generatedAt: new Date(),
        filters: { year, month },
        summary: {
          totalRevenue: report.totalSales,
          totalTransactions: report.transactionCount,
          averageTransaction: report.averageTransaction
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating monthly sales report:', error);
    return next(new AppError('Failed to generate monthly sales report', 500));
  }
};

/**
 * GET /api/reports/sales/ytd
 */
export const getYTDSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { year } = req.query;
    
    if (!year) {
      return next(new AppError('year parameter is required', 400));
    }
    
    const report = await getYTDSalesReport(tenantId, parseInt(year as string));
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'sales_ytd',
        title: `Year-to-Date Sales Report - ${year}`,
        generatedAt: new Date(),
        filters: { year },
        summary: {
          totalRevenue: report.totalSales,
          totalTransactions: report.transactionCount,
          averageTransaction: report.averageTransaction
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating YTD sales report:', error);
    return next(new AppError('Failed to generate YTD sales report', 500));
  }
};

/**
 * GET /api/reports/sales/top-customers
 */
export const getTopCustomersReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate, limit = '10' } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getTopCustomers(
      tenantId,
      startDate as string,
      endDate as string,
      parseInt(limit as string)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'sales_top_customers',
        title: `Top Customers Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate, limit },
        summary: {
          totalCustomers: report.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating top customers report:', error);
    return next(new AppError('Failed to generate top customers report', 500));
  }
};

// ============================================================================
// Tax Reports
// ============================================================================

/**
 * GET /api/reports/tax/monthly
 */
export const getMonthlyTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { year, month } = req.query;
    
    if (!year || !month) {
      return next(new AppError('year and month parameters are required', 400));
    }
    
    const report = await getMonthlyTaxReport(
      tenantId,
      parseInt(year as string),
      parseInt(month as string)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'tax_monthly',
        title: `Monthly Tax Report - ${report.monthName}`,
        generatedAt: new Date(),
        filters: { year, month },
        summary: {
          taxableRevenue: report.taxableRevenue,
          taxCollected: report.taxCollected,
          taxRate: report.taxRate
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating monthly tax report:', error);
    return next(new AppError('Failed to generate monthly tax report', 500));
  }
};

/**
 * GET /api/reports/tax/quarterly
 */
export const getQuarterlyTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { year, quarter } = req.query;
    
    if (!year || !quarter) {
      return next(new AppError('year and quarter parameters are required', 400));
    }
    
    const report = await getQuarterlyTaxReport(
      tenantId,
      parseInt(year as string),
      parseInt(quarter as string)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'tax_quarterly',
        title: `Quarterly Tax Report - ${report.quarterName}`,
        generatedAt: new Date(),
        filters: { year, quarter },
        summary: {
          taxableRevenue: report.taxableRevenue,
          taxCollected: report.taxCollected,
          averageTaxRate: report.averageTaxRate
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating quarterly tax report:', error);
    return next(new AppError('Failed to generate quarterly tax report', 500));
  }
};

/**
 * GET /api/reports/tax/annual
 */
export const getAnnualTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { year } = req.query;
    
    if (!year) {
      return next(new AppError('year parameter is required', 400));
    }
    
    const report = await getAnnualTaxReport(tenantId, parseInt(year as string));
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'tax_annual',
        title: `Annual Tax Report - ${year}`,
        generatedAt: new Date(),
        filters: { year },
        summary: {
          taxableRevenue: report.taxableRevenue,
          taxCollected: report.taxCollected,
          averageTaxRate: report.averageTaxRate
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating annual tax report:', error);
    return next(new AppError('Failed to generate annual tax report', 500));
  }
};

/**
 * GET /api/reports/tax/breakdown
 */
export const getTaxBreakdownReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getTaxBreakdown(tenantId, startDate as string, endDate as string);
    
    const totalTaxable = report.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalTax = report.reduce((sum, item) => sum + item.taxAmount, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'tax_breakdown',
        title: `Tax Breakdown - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          taxableRevenue: totalTaxable,
          taxCollected: totalTax
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating tax breakdown report:', error);
    return next(new AppError('Failed to generate tax breakdown report', 500));
  }
};

// ============================================================================
// Financial Reports
// ============================================================================

/**
 * GET /api/reports/financial/revenue
 */
export const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getRevenueReport(tenantId, startDate as string, endDate as string);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'financial_revenue',
        title: `Revenue Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalRevenue: report.totalRevenue
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return next(new AppError('Failed to generate revenue report', 500));
  }
};

/**
 * GET /api/reports/financial/profit-loss
 */
export const getProfitLoss = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getProfitLossReport(tenantId, startDate as string, endDate as string);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'financial_profit_loss',
        title: `Profit & Loss Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          revenue: report.revenue,
          netProfit: report.netProfit
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating P&L report:', error);
    return next(new AppError('Failed to generate P&L report', 500));
  }
};

/**
 * GET /api/reports/financial/outstanding
 */
export const getOutstanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    const report = await getOutstandingBalances(tenantId);
    
    const totalOutstanding = report.reduce((sum, item) => sum + item.amountDue, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'financial_outstanding',
        title: 'Outstanding Balances Report',
        generatedAt: new Date(),
        filters: {},
        summary: {
          totalOutstanding,
          totalAccounts: report.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating outstanding balances report:', error);
    return next(new AppError('Failed to generate outstanding balances report', 500));
  }
};

/**
 * GET /api/reports/financial/refunds
 */
export const getRefunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getRefundsReport(tenantId, startDate as string, endDate as string);
    
    const totalRefunds = report.reduce((sum, item) => sum + item.refundAmount, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'financial_refunds',
        title: `Refunds Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalRefunds,
          refundCount: report.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating refunds report:', error);
    return next(new AppError('Failed to generate refunds report', 500));
  }
};

// ============================================================================
// Customer Reports
// ============================================================================

/**
 * GET /api/reports/customers/acquisition
 */
export const getCustomerAcquisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getCustomerAcquisitionReport(tenantId, startDate as string, endDate as string);
    
    const totalNew = report.reduce((sum, item) => sum + item.newCustomers, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'customer_acquisition',
        title: `Customer Acquisition Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalNewCustomers: totalNew,
          periodCount: report.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating customer acquisition report:', error);
    return next(new AppError('Failed to generate customer acquisition report', 500));
  }
};

/**
 * GET /api/reports/customers/retention
 */
export const getCustomerRetention = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getCustomerRetentionReport(tenantId, startDate as string, endDate as string);
    const retentionData = report[0] || { retentionRate: 0, returningCustomers: 0, totalCustomers: 0 };
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'customer_retention',
        title: `Customer Retention Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          retentionRate: retentionData.retentionRate,
          returningCustomers: retentionData.returningCustomers,
          totalCustomers: retentionData.totalCustomers
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating customer retention report:', error);
    return next(new AppError('Failed to generate customer retention report', 500));
  }
};

/**
 * GET /api/reports/customers/lifetime-value
 */
export const getCustomerLifetimeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const report = await getCustomerLifetimeValueReport(tenantId, limit);
    
    const totalLTV = report.reduce((sum, item) => sum + item.lifetimeValue, 0);
    const avgLTV = report.length > 0 ? totalLTV / report.length : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'customer_lifetime_value',
        title: 'Customer Lifetime Value Report',
        generatedAt: new Date(),
        filters: { limit },
        summary: {
          totalCustomers: report.length,
          totalLifetimeValue: totalLTV,
          averageLifetimeValue: avgLTV
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating customer lifetime value report:', error);
    return next(new AppError('Failed to generate customer lifetime value report', 500));
  }
};

/**
 * GET /api/reports/customers/demographics
 */
export const getCustomerDemographics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    const report = await getCustomerDemographicsReport(tenantId);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'customer_demographics',
        title: 'Customer Demographics Report',
        generatedAt: new Date(),
        filters: {},
        summary: {
          totalCustomers: report.totalCustomers,
          locationCount: report.byLocation.length,
          petTypeCount: report.byPetType.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating customer demographics report:', error);
    return next(new AppError('Failed to generate customer demographics report', 500));
  }
};

/**
 * GET /api/reports/customers/inactive
 */
export const getInactiveCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const days = parseInt(req.query.days as string) || 90;
    
    const report = await getInactiveCustomersReport(tenantId, days);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'customer_inactive',
        title: `Inactive Customers Report - ${days} days`,
        generatedAt: new Date(),
        filters: { days },
        summary: {
          inactiveCount: report.length,
          daysThreshold: days
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating inactive customers report:', error);
    return next(new AppError('Failed to generate inactive customers report', 500));
  }
};

// ============================================================================
// Operational Reports
// ============================================================================

/**
 * GET /api/reports/operations/staff
 */
export const getStaffPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getStaffPerformanceReport(tenantId, startDate as string, endDate as string);
    
    const totalRevenue = report.reduce((sum, item) => sum + item.revenue, 0);
    const totalServices = report.reduce((sum, item) => sum + item.servicesCompleted, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'operations_staff',
        title: `Staff Performance Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalStaff: report.length,
          totalRevenue,
          totalServices
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating staff performance report:', error);
    return next(new AppError('Failed to generate staff performance report', 500));
  }
};

/**
 * GET /api/reports/operations/resources
 */
export const getResourceUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getResourceUtilizationReport(tenantId, startDate as string, endDate as string);
    
    const avgUtilization = report.length > 0
      ? report.reduce((sum, item) => sum + item.utilizationRate, 0) / report.length
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'operations_resources',
        title: `Resource Utilization Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalResources: report.length,
          averageUtilization: avgUtilization
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating resource utilization report:', error);
    return next(new AppError('Failed to generate resource utilization report', 500));
  }
};

/**
 * GET /api/reports/operations/bookings
 */
export const getBookingPatterns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getBookingPatternsReport(tenantId, startDate as string, endDate as string);
    
    const totalBookings = report.reduce((sum, item) => sum + item.bookingCount, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'operations_bookings',
        title: `Booking Patterns Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          totalBookings,
          patternsAnalyzed: report.length
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating booking patterns report:', error);
    return next(new AppError('Failed to generate booking patterns report', 500));
  }
};

/**
 * GET /api/reports/operations/capacity
 */
export const getCapacityAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('startDate and endDate parameters are required', 400));
    }
    
    const report = await getCapacityAnalysisReport(tenantId, startDate as string, endDate as string);
    
    const avgCapacity = report.length > 0
      ? report.reduce((sum, item) => sum + item.utilizationRate, 0) / report.length
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        reportType: 'operations_capacity',
        title: `Capacity Analysis Report - ${startDate} to ${endDate}`,
        generatedAt: new Date(),
        filters: { startDate, endDate },
        summary: {
          periodsAnalyzed: report.length,
          averageCapacity: avgCapacity
        },
        data: report
      }
    });
  } catch (error) {
    console.error('Error generating capacity analysis report:', error);
    return next(new AppError('Failed to generate capacity analysis report', 500));
  }
};
