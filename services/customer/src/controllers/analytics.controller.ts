/**
 * Analytics Controller
 * 
 * Provides endpoints for analytics and reporting.
 * All financial calculations are now centralized through the financialService
 * to ensure consistent results across all parts of the application.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware';
import financialService from '../services/financialService';

/**
 * Get sales data by service type
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getSalesByService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting sales by service with period:', period);
    
    // Get date range filter using the shared method
    const dateRange = financialService.getDateRangeFilter(
      period as string, 
      startDate as string, 
      endDate as string
    );
    
    // Get the financial summary first to ensure consistency with the dashboard
    const financialSummary = await financialService.getFinancialSummary(dateRange);
    
    // Get service revenue data from the financial service
    const serviceRevenue = await financialService.getServiceRevenue(dateRange);
    
    // IMPORTANT: To ensure consistency with the dashboard,
    // use the revenue totals from the financial summary
    console.log('Using consistent revenue totals from financial summary');
    
    // Calculate total from service revenue, but ensure it matches financial summary
    const calculatedTotalRevenue = serviceRevenue.reduce((sum, service) => sum + service.revenue, 0);
    
    // Important: If there is a discrepancy, use the financial summary total
    const totalRevenue = financialSummary.totalRevenue;
    
    console.log(`Service revenue: ${calculatedTotalRevenue}, Financial summary: ${totalRevenue}`);
    if (Math.abs(calculatedTotalRevenue - totalRevenue) > 0.01) {
      console.log(`⚠️ Revenue discrepancy detected: ${Math.abs(calculatedTotalRevenue - totalRevenue)}`);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        period: period as string,
        totalRevenue: totalRevenue, // Always use the financial summary total
        services: serviceRevenue,
        totalBookings: financialSummary.reservationCount // Use reservation count from financial summary
      }
    });
  } catch (error) {
    console.error('Error getting sales by service:', error);
    return next(new AppError('Error getting sales by service', 500));
  }
};

/**
 * Get sales data by add-on type
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getSalesByAddOn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting sales by add-on with period:', period);
    
    // Get date range filter using the shared method
    const dateRange = financialService.getDateRangeFilter(
      period as string, 
      startDate as string, 
      endDate as string
    );
    
    // Get the financial summary first to ensure consistency with the dashboard
    const financialSummary = await financialService.getFinancialSummary(dateRange);
    
    // Get add-on revenue data from the financial service
    const addOnRevenue = await financialService.getAddOnRevenue(dateRange);
    
    // Calculate add-on revenue, but ensure consistency with financial summary
    const calculatedAddOnRevenue = addOnRevenue.reduce((sum, addOn) => sum + addOn.revenue, 0);
    
    // For consistency, the total of services + add-ons should equal the financial summary total
    // Get the service revenue to calculate what portion should be attributed to add-ons
    const serviceRevenue = await financialService.getServiceRevenue(dateRange);
    const calculatedServiceRevenue = serviceRevenue.reduce((sum, service) => sum + service.revenue, 0);
    
    // Calculate add-on portion to match financial summary total
    const addOnPortion = financialSummary.totalRevenue - calculatedServiceRevenue;
    
    console.log(`Add-on revenue: ${calculatedAddOnRevenue}, Calculated add-on portion: ${addOnPortion}`);
    if (Math.abs(calculatedAddOnRevenue - addOnPortion) > 0.01) {
      console.log(`⚠️ Add-on revenue discrepancy detected: ${Math.abs(calculatedAddOnRevenue - addOnPortion)}`);
    }
    
    // Total add-on count
    const totalAddOns = addOnRevenue.reduce((sum, addOn) => sum + addOn.count, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        period: period as string,
        totalRevenue: addOnPortion, // Use the calculated add-on portion for consistency
        addOns: addOnRevenue,
        totalAddOns
      }
    });
  } catch (error) {
    console.error('Error getting sales by add-on:', error);
    return next(new AppError('Error getting sales by add-on', 500));
  }
};

/**
 * Get customer value data (total spend, breakdown by service type)
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getCustomerValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting customer value with period:', period);
    
    // Get date range filter using the shared method
    const dateRange = financialService.getDateRangeFilter(
      period as string, 
      startDate as string, 
      endDate as string
    );
    
    // Get customer revenue data from the financial service
    const customerRevenue = await financialService.getCustomerRevenue(dateRange);
    
    res.status(200).json({
      status: 'success',
      results: customerRevenue.length,
      data: customerRevenue
    });
  } catch (error) {
    console.error('Error getting customer value data:', error);
    return next(new AppError('Error getting customer value data', 500));
  }
};

/**
 * Get summary analytics data for dashboard
 * Includes total revenue, service counts, customer counts
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting dashboard summary with period:', period);
    
    // Get date range filter using the shared method
    const dateRange = financialService.getDateRangeFilter(
      period as string, 
      startDate as string, 
      endDate as string
    );
    
    // Get financial summary from the financial service
    const financialSummary = await financialService.getFinancialSummary(dateRange);
    
    // Get service revenue data (includes service counts)
    const serviceRevenue = await financialService.getServiceRevenue(dateRange);
    
    // Convert service revenue to the format expected by the frontend
    const serviceData = serviceRevenue.map(service => ({
      id: service.id,
      name: service.name,
      count: service.count
    }));
    
    // Get add-on revenue data
    const addOnData = await financialService.getAddOnRevenue(dateRange);
    
    // Calculate total add-on revenue
    const addOnRevenue = addOnData.reduce((sum, addOn) => sum + addOn.revenue, 0);
    
    // Get customer revenue data to get unique customer count 
    const customerRevenue = await financialService.getCustomerRevenue(dateRange);
    
    // Add comprehensive payment data to the response
    res.status(200).json({
      status: 'success',
      data: {
        period: period as string,
        totalRevenue: financialSummary.totalRevenue,
        customerCount: customerRevenue.length,
        serviceData,
        addOnData,
        addOnRevenue,
        // Payment and transaction data
        invoiceCount: financialSummary.invoiceCount,
        paidInvoiceCount: financialSummary.paidInvoiceCount,
        partiallyPaidInvoiceCount: financialSummary.partiallyPaidInvoiceCount || 0,
        partiallyPaidAmount: financialSummary.partiallyPaidAmount || 0,
        directPaymentsTotal: financialSummary.directPaymentsTotal,
        directPaymentsCount: financialSummary.directPaymentsCount,
        reservationValueTotal: financialSummary.reservationValueTotal,
        reservationCount: financialSummary.reservationCount,
        totalTransactionCount: financialSummary.totalTransactionCount,
        totalPaid: financialSummary.totalPaid,
        totalOutstanding: financialSummary.totalOutstanding
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return next(new AppError('Error getting dashboard summary', 500));
  }
};

/**
 * Get detailed customer report for a specific customer
 * Includes transaction history, service breakdowns, etc.
 */
export const getCustomerReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const { period = 'all', startDate, endDate } = req.query;
    
    // Get date range filter using the shared method
    const dateRange = financialService.getDateRangeFilter(
      period as string, 
      startDate as string, 
      endDate as string
    );
    
    // Get customer revenue data from the financial service
    const customersRevenue = await financialService.getCustomerRevenue(dateRange);
    
    // Find the specific customer
    const customerData = customersRevenue.find(customer => customer.id === customerId);
    
    if (!customerData) {
      return next(new AppError('Customer not found or has no transactions in this period', 404));
    }
    
    // Get all invoices for this customer to extract transaction data
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        issueDate: dateRange,
        status: {
          notIn: financialService.INVALID_INVOICE_STATUSES
        }
      },
      include: {
        lineItems: true,
        reservation: {
          include: {
            service: true,
            addOnServices: {
              include: {
                addOn: true
              }
            }
          }
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    });
    
    // Format transactions
    const transactions = invoices.map(invoice => {
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.issueDate.toISOString().split('T')[0],
        total: invoice.total,
        status: invoice.status,
        serviceName: invoice.reservation?.service?.name || 'N/A',
        addOns: invoice.reservation?.addOnServices?.map(addon => ({
          name: addon.addOn.name,
          price: addon.price
        })) || []
      };
    });
    
    // Format customer basic info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        customer: {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone || 'N/A'
        },
        period: period as string,
        totalSpend: customerData.totalSpend,
        invoiceCount: customerData.invoiceCount,
        serviceBreakdown: customerData.serviceBreakdown,
        addOnBreakdown: customerData.addOnBreakdown,
        addOnTotal: customerData.addOnTotal,
        transactions
      }
    });
  } catch (error) {
    console.error('Error getting customer report:', error);
    return next(new AppError('Error getting customer report', 500));
  }
};

/**
 * Helper function for date filters
 */
const getDateFilter = (period: string, startDate?: string, endDate?: string) => {
  // This is now provided by the financial service
  return financialService.getDateRangeFilter(period, startDate, endDate);
};

// Missing import for prisma client in this controller
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
