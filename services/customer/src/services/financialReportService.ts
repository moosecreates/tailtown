/**
 * Financial Report Service
 * Generates financial reports for business analysis
 */

import { PrismaClient } from '@prisma/client';
import {
  RevenueData,
  ProfitLossData,
  OutstandingBalance,
  RefundData
} from '../types/reports.types';

const prisma = new PrismaClient();

/**
 * Get revenue report for date range
 */
export const getRevenueReport = async (
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<RevenueData> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Get all paid invoices in date range
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      issueDate: {
        gte: start,
        lte: end
      },
      status: 'PAID'
    },
    include: {
      lineItems: true
    }
  });
  
  let totalRevenue = 0;
  let serviceRevenue = 0;
  let productRevenue = 0;
  let addOnRevenue = 0;
  
  const categoryMap = new Map<string, { amount: number; percentage: number }>();
  
  for (const invoice of invoices) {
    totalRevenue += invoice.total;
    
    for (const lineItem of invoice.lineItems) {
      const type = (lineItem as any).type || 'SERVICE';
      const category = lineItem.description;
      
      // Aggregate by type
      if (type === 'SERVICE') {
        serviceRevenue += lineItem.amount;
      } else if (type === 'PRODUCT') {
        productRevenue += lineItem.amount;
      } else if (type === 'ADD_ON') {
        addOnRevenue += lineItem.amount;
      }
      
      // Aggregate by category
      const existing = categoryMap.get(category);
      if (existing) {
        existing.amount += lineItem.amount;
      } else {
        categoryMap.set(category, {
          amount: lineItem.amount,
          percentage: 0
        });
      }
    }
  }
  
  // Calculate percentages
  const revenueByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0
  }));
  
  return {
    period: `${startDate} to ${endDate}`,
    totalRevenue,
    serviceRevenue,
    productRevenue,
    addOnRevenue,
    revenueByCategory
  };
};

/**
 * Get profit & loss report
 */
export const getProfitLossReport = async (
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<ProfitLossData> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Get all paid invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      issueDate: {
        gte: start,
        lte: end
      },
      status: 'PAID'
    },
    include: {
      lineItems: true
    }
  });
  
  let revenue = 0;
  let costOfGoodsSold = 0;
  
  for (const invoice of invoices) {
    revenue += invoice.total;
    
    // Calculate COGS for products (assuming 40% cost)
    for (const lineItem of invoice.lineItems) {
      const type = (lineItem as any).type || 'SERVICE';
      if (type === 'PRODUCT') {
        costOfGoodsSold += lineItem.amount * 0.4; // 40% cost assumption
      }
    }
  }
  
  const grossProfit = revenue - costOfGoodsSold;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  
  // Operating expenses (would come from expense tracking - placeholder for now)
  const operatingExpenses = 0;
  const netProfit = grossProfit - operatingExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return {
    period: `${startDate} to ${endDate}`,
    revenue,
    costOfGoodsSold,
    grossProfit,
    grossMargin,
    operatingExpenses,
    netProfit,
    netMargin
  };
};

/**
 * Get outstanding balances report
 */
export const getOutstandingBalances = async (
  tenantId: string
): Promise<OutstandingBalance[]> => {
  // Get all invoices that are not fully paid
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: {
        in: ['SENT', 'OVERDUE']
      }
    },
    include: {
      customer: true,
      payments: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  });
  
  const outstandingBalances: OutstandingBalance[] = [];
  
  for (const invoice of invoices) {
    const amountPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const amountDue = invoice.total - amountPaid;
    
    if (amountDue > 0) {
      const daysOverdue = invoice.dueDate < new Date() 
        ? Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      outstandingBalances.push({
        customerId: invoice.customerId,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.issueDate.toISOString().split('T')[0],
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        amount: invoice.total,
        amountPaid,
        amountDue,
        daysOverdue,
        status: invoice.status
      });
    }
  }
  
  return outstandingBalances;
};

/**
 * Get refunds report
 */
export const getRefundsReport = async (
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<RefundData[]> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Get all refunded invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: 'REFUNDED',
      updatedAt: {
        gte: start,
        lte: end
      }
    },
    include: {
      customer: true,
      payments: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  const refunds: RefundData[] = [];
  
  for (const invoice of invoices) {
    // Find refund payments (negative amounts)
    const refundPayments = invoice.payments.filter(p => p.amount < 0);
    
    for (const refundPayment of refundPayments) {
      refunds.push({
        date: refundPayment.paymentDate.toISOString().split('T')[0],
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        originalAmount: invoice.total,
        refundAmount: Math.abs(refundPayment.amount),
        refundReason: refundPayment.notes || 'No reason provided',
        refundMethod: refundPayment.method
      });
    }
  }
  
  return refunds;
};
