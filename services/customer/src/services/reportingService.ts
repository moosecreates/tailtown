/**
 * Reporting Service
 * 
 * Transforms financial transaction data (source of truth) into optimized read models for reporting.
 * This service is responsible for aggregating, formatting, and enriching data
 * while maintaining data quality indicators and consistency.
 */

import { PrismaClient } from '@prisma/client';
import * as ReadModels from '../types/reportingModels';
import financialService from './financialService';
import { DateRange } from '../types/common';

const prisma = new PrismaClient();

// Source tracking for data quality indicators
const DATA_SOURCE = 'Financial Transaction Service';
const DATA_QUALITY = 'high';

/**
 * Creates base read model properties used across all report types
 */
const createBaseReadModel = (dateRange: DateRange, period: string): Omit<ReadModels.ReadModelBase, 'id'> => {
  return {
    reportGeneratedAt: new Date(),
    dateRange: {
      startDate: dateRange.gte,
      endDate: dateRange.lte,
      period
    },
    dataQuality: DATA_QUALITY as 'high' | 'medium' | 'low',
    dataSource: DATA_SOURCE
  };
};

/**
 * Generate a Service Revenue Summary read model
 */
const generateServiceRevenueSummary = async (
  period: string,
  startDate?: string,
  endDate?: string
): Promise<ReadModels.ServiceRevenueSummary> => {
  // Get date range filter
  const dateRange = financialService.getDateRangeFilter(period, startDate, endDate);
  
  // Get service revenue data
  const serviceRevenue = await financialService.getServiceRevenue(dateRange);
  
  // Get financial summary for additional metrics
  const financialSummary = await financialService.getFinancialSummary(dateRange);
  
  // Transform to optimized read model
  const serviceBreakdown = serviceRevenue.map(service => {
    return {
      id: service.id,
      name: service.name,
      category: 'service', // Default category if not available
      count: service.count,
      revenue: service.revenue,
      percentageOfTotal: service.percentageOfTotal,
      averageValue: service.count > 0 ? service.revenue / service.count : 0
    };
  });
  
  // Sort by revenue to get top performers
  const topPerformers = [...serviceBreakdown]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(({ id, name, revenue }) => ({ id, name, revenue }));
  
  // Calculate total revenue and counts
  const totalRevenue = serviceRevenue.reduce((sum, service) => sum + service.revenue, 0);
  const totalServiceCount = serviceRevenue.reduce((sum, service) => sum + service.count, 0);
  
  return {
    id: `service-revenue-${period}-${Date.now()}`,
    ...createBaseReadModel(dateRange, period),
    totalRevenue,
    totalServiceCount,
    averageServiceValue: totalServiceCount > 0 ? totalRevenue / totalServiceCount : 0,
    serviceBreakdown,
    topPerformers
  };
};

/**
 * Generate an AddOn Revenue Summary read model
 */
const generateAddOnRevenueSummary = async (
  period: string,
  startDate?: string,
  endDate?: string
): Promise<ReadModels.AddOnRevenueSummary> => {
  // Get date range filter
  const dateRange = financialService.getDateRangeFilter(period, startDate, endDate);
  
  // Get add-on revenue data
  const addOnRevenue = await financialService.getAddOnRevenue(dateRange);
  
  // Get reservation data to calculate attachment rate
  const reservations = await prisma.reservation.count({
    where: {
      createdAt: dateRange,
      status: {
        notIn: financialService.INVALID_RESERVATION_STATUSES
      }
    }
  });
  
  // Count reservations with add-ons
  const reservationsWithAddOns = await prisma.reservation.count({
    where: {
      createdAt: dateRange,
      status: {
        notIn: financialService.INVALID_RESERVATION_STATUSES
      },
      addOnServices: {
        some: {}
      }
    }
  });
  
  // Transform to optimized read model
  const addOnBreakdown = addOnRevenue.map(addOn => {
    return {
      id: addOn.id,
      name: addOn.name,
      category: 'add-on', // Default category if not available
      count: addOn.count,
      revenue: addOn.revenue,
      percentageOfTotal: addOn.percentageOfTotal,
      averageValue: addOn.count > 0 ? addOn.revenue / addOn.count : 0
    };
  });
  
  // Sort by revenue to get top performers
  const topPerformers = [...addOnBreakdown]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(({ id, name, revenue }) => ({ id, name, revenue }));
  
  // Calculate total revenue and counts
  const totalRevenue = addOnRevenue.reduce((sum, addOn) => sum + addOn.revenue, 0);
  const totalAddOnCount = addOnRevenue.reduce((sum, addOn) => sum + addOn.count, 0);
  
  // Calculate attachment rate (percentage of services that include add-ons)
  const attachmentRate = reservations > 0 ? (reservationsWithAddOns / reservations) * 100 : 0;
  
  return {
    id: `addon-revenue-${period}-${Date.now()}`,
    ...createBaseReadModel(dateRange, period),
    totalRevenue,
    totalAddOnCount,
    averageAddOnValue: totalAddOnCount > 0 ? totalRevenue / totalAddOnCount : 0,
    addOnBreakdown,
    topPerformers,
    attachmentRate
  };
};

/**
 * Generate a Dashboard Summary read model
 */
const generateDashboardSummary = async (
  period: string,
  startDate?: string,
  endDate?: string
): Promise<ReadModels.DashboardSummary> => {
  // Get date range filter for current period
  const dateRange = financialService.getDateRangeFilter(period, startDate, endDate);
  
  // Get financial summary
  const financialSummary = await financialService.getFinancialSummary(dateRange);
  
  // Get service revenue data
  const serviceRevenue = await financialService.getServiceRevenue(dateRange);
  
  // Get add-on revenue data
  const addOnRevenue = await financialService.getAddOnRevenue(dateRange);
  
  // Calculate metrics for previous period
  const previousDateRange = getPreviousPeriodRange(period, dateRange);
  const previousFinancialSummary = await financialService.getFinancialSummary(previousDateRange);
  
  // Get customer data
  const customers = await prisma.customer.findMany({
    where: {
      invoices: {
        some: {
          issueDate: dateRange,
          status: {
            notIn: financialService.INVALID_INVOICE_STATUSES
          }
        }
      }
    }
  });
  
  // Count new customers (created in this period)
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: dateRange
    }
  });
  
  // Top 5 services by revenue
  const topServices = serviceRevenue
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(service => ({
      id: service.id,
      name: service.name,
      revenue: service.revenue,
      count: service.count
    }));
  
  // Top 5 add-ons by revenue
  const topAddOns = addOnRevenue
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(addOn => ({
      id: addOn.id,
      name: addOn.name,
      revenue: addOn.revenue,
      count: addOn.count
    }));
  
  // Calculate revenue breakdown
  const servicesRevenue = serviceRevenue.reduce((sum, service) => sum + service.revenue, 0);
  const addOnsRevenue = addOnRevenue.reduce((sum, addOn) => sum + addOn.revenue, 0);
  const otherRevenue = financialSummary.totalRevenue - servicesRevenue - addOnsRevenue;
  
  // Calculate comparative metrics
  const revenueDifference = financialSummary.totalRevenue - previousFinancialSummary.totalRevenue;
  const percentageChange = previousFinancialSummary.totalRevenue > 0 
    ? (revenueDifference / previousFinancialSummary.totalRevenue) * 100 
    : 0;
  
  return {
    id: `dashboard-summary-${period}-${Date.now()}`,
    ...createBaseReadModel(dateRange, period),
    revenue: {
      total: financialSummary.totalRevenue,
      comparedToPrevious: revenueDifference,
      percentageChange,
      trend: revenueDifference > 0 ? 'up' : revenueDifference < 0 ? 'down' : 'stable'
    },
    transactions: {
      total: financialSummary.invoiceCount,
      comparedToPrevious: financialSummary.invoiceCount - previousFinancialSummary.invoiceCount,
      percentageChange: previousFinancialSummary.invoiceCount > 0 
        ? ((financialSummary.invoiceCount - previousFinancialSummary.invoiceCount) / previousFinancialSummary.invoiceCount) * 100 
        : 0,
      averageValue: financialSummary.invoiceCount > 0 
        ? financialSummary.totalRevenue / financialSummary.invoiceCount 
        : 0
    },
    customers: {
      total: customers.length,
      new: newCustomers,
      returning: customers.length - newCustomers,
      percentageReturning: customers.length > 0 ? ((customers.length - newCustomers) / customers.length) * 100 : 0
    },
    topServices,
    topAddOns,
    revenueBreakdown: {
      services: servicesRevenue,
      addOns: addOnsRevenue,
      other: otherRevenue
    }
  };
};

/**
 * Generate a Customer Value Summary read model
 */
const generateCustomerValueSummary = async (
  period: string,
  startDate?: string,
  endDate?: string
): Promise<ReadModels.CustomerValueSummary> => {
  // Get date range filter
  const dateRange = financialService.getDateRangeFilter(period, startDate, endDate);
  
  // Get customer revenue data
  const customerRevenue = await financialService.getCustomerRevenue(dateRange);
  
  // Calculate total revenue
  const totalRevenue = customerRevenue.reduce((sum, customer) => sum + customer.totalSpend, 0);
  
  // Sort customers by revenue for segmentation
  const sortedCustomers = [...customerRevenue].sort((a, b) => b.totalSpend - a.totalSpend);
  
  // Segment customers into high, medium, and low value
  // High: top 20%, Medium: middle 30%, Low: bottom 50%
  const highValueThreshold = Math.floor(sortedCustomers.length * 0.2);
  const mediumValueThreshold = Math.floor(sortedCustomers.length * 0.5);
  
  const highValueCustomers = sortedCustomers.slice(0, highValueThreshold);
  const mediumValueCustomers = sortedCustomers.slice(highValueThreshold, mediumValueThreshold);
  const lowValueCustomers = sortedCustomers.slice(mediumValueThreshold);
  
  // Calculate segment metrics
  const highValueRevenue = highValueCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
  const mediumValueRevenue = mediumValueCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
  const lowValueRevenue = lowValueCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0);
  
  // Top 10 customers with additional data
  const topCustomers = await Promise.all(
    sortedCustomers.slice(0, 10).map(async customer => {
      // Get first and last purchase dates
      const invoices = await prisma.invoice.findMany({
        where: {
          customerId: customer.id,
          status: {
            notIn: financialService.INVALID_INVOICE_STATUSES
          }
        },
        orderBy: {
          issueDate: 'asc'
        },
        include: {
          reservation: {
            include: {
              service: true
            }
          }
        }
      });
      
      // Extract preferred services
      const serviceMap = new Map<string, number>();
      invoices.forEach(invoice => {
        if (invoice.reservation?.service) {
          const serviceName = invoice.reservation.service.name;
          serviceMap.set(serviceName, (serviceMap.get(serviceName) || 0) + 1);
        }
      });
      
      // Get top 3 preferred services
      const preferredServices = Array.from(serviceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
      
      return {
        id: customer.id,
        name: customer.name,
        totalSpend: customer.totalSpend,
        invoiceCount: customer.invoiceCount,
        firstPurchaseDate: invoices.length > 0 ? invoices[0].issueDate : new Date(),
        lastPurchaseDate: invoices.length > 0 ? invoices[invoices.length - 1].issueDate : new Date(),
        preferredServices
      };
    })
  );
  
  return {
    id: `customer-value-${period}-${Date.now()}`,
    ...createBaseReadModel(dateRange, period),
    totalCustomerCount: customerRevenue.length,
    totalRevenue,
    averageRevenuePerCustomer: customerRevenue.length > 0 ? totalRevenue / customerRevenue.length : 0,
    customerSegments: [
      {
        segment: 'high',
        count: highValueCustomers.length,
        totalRevenue: highValueRevenue,
        percentageOfTotalRevenue: totalRevenue > 0 ? (highValueRevenue / totalRevenue) * 100 : 0
      },
      {
        segment: 'medium',
        count: mediumValueCustomers.length,
        totalRevenue: mediumValueRevenue,
        percentageOfTotalRevenue: totalRevenue > 0 ? (mediumValueRevenue / totalRevenue) * 100 : 0
      },
      {
        segment: 'low',
        count: lowValueCustomers.length,
        totalRevenue: lowValueRevenue,
        percentageOfTotalRevenue: totalRevenue > 0 ? (lowValueRevenue / totalRevenue) * 100 : 0
      }
    ],
    topCustomers
  };
};

/**
 * Helper function to determine previous period date range
 */
const getPreviousPeriodRange = (period: string, currentRange: DateRange): DateRange => {
  const start = new Date(currentRange.gte);
  const end = new Date(currentRange.lte);
  const duration = end.getTime() - start.getTime();
  
  const previousStart = new Date(start.getTime() - duration);
  const previousEnd = new Date(start.getTime() - 1);
  
  return { gte: previousStart, lte: previousEnd };
};

export default {
  generateServiceRevenueSummary,
  generateAddOnRevenueSummary,
  generateDashboardSummary,
  generateCustomerValueSummary
};
