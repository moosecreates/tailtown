/**
 * Reporting Read Models
 * 
 * These models are specifically optimized for reporting needs.
 * They serve as a layer between the database and the reporting UI,
 * transforming the transaction data (source of truth) into reporting-friendly structures.
 */

import { 
  TransactionType, 
  TransactionStatus,
  ReservationStatus,
  InvoiceStatus
} from '@prisma/client';

/**
 * Base read model interface for all financial reports
 */
export interface ReadModelBase {
  id: string;
  reportGeneratedAt: Date;
  dateRange: {
    startDate: Date;
    endDate: Date;
    period: string;
  };
  dataQuality: 'high' | 'medium' | 'low';
  dataSource: string;
}

/**
 * Service Revenue Summary - Optimized for service revenue reporting
 * Aggregates revenue data by service type
 */
export interface ServiceRevenueSummary extends ReadModelBase {
  totalRevenue: number;
  totalServiceCount: number;
  averageServiceValue: number;
  serviceBreakdown: {
    id: string;
    name: string;
    category: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
    averageValue: number;
    growth?: {
      fromPreviousPeriod: number;
      percentage: number;
    };
  }[];
  topPerformers: {
    id: string;
    name: string;
    revenue: number;
  }[];
}

/**
 * AddOn Revenue Summary - Optimized for add-on revenue reporting
 * Aggregates revenue data by add-on type
 */
export interface AddOnRevenueSummary extends ReadModelBase {
  totalRevenue: number;
  totalAddOnCount: number;
  averageAddOnValue: number;
  addOnBreakdown: {
    id: string;
    name: string;
    category: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
    averageValue: number;
    growth?: {
      fromPreviousPeriod: number;
      percentage: number;
    };
  }[];
  topPerformers: {
    id: string;
    name: string;
    revenue: number;
  }[];
  attachmentRate: number; // Percentage of services that include add-ons
}

/**
 * Customer Value Summary - Optimized for customer value reporting
 * Aggregates revenue data by customer
 */
export interface CustomerValueSummary extends ReadModelBase {
  totalCustomerCount: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
  customerSegments: {
    segment: 'high' | 'medium' | 'low';
    count: number;
    totalRevenue: number;
    percentageOfTotalRevenue: number;
  }[];
  topCustomers: {
    id: string;
    name: string;
    totalSpend: number;
    invoiceCount: number;
    firstPurchaseDate: Date;
    lastPurchaseDate: Date;
    preferredServices: string[];
  }[];
}

/**
 * Detailed Customer Report - Optimized for individual customer reporting
 * Provides detailed financial history for a specific customer
 */
export interface CustomerDetailedReport extends ReadModelBase {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalLifetimeValue: number;
    firstPurchaseDate: Date;
    lastPurchaseDate: Date;
    purchaseFrequency: number; // Average days between purchases
    status: 'active' | 'inactive' | 'new';
  };
  financialSummary: {
    totalSpend: number;
    invoiceCount: number;
    averageInvoiceValue: number;
    outstandingBalance: number;
    creditBalance: number;
  };
  serviceBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
    lastPurchased: Date;
  }[];
  addOnBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
    lastPurchased: Date;
  }[];
  transactionHistory: {
    id: string;
    date: Date;
    type: string;
    description: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  }[];
  trends: {
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    visitFrequencyTrend: 'increasing' | 'decreasing' | 'stable';
    averageSpendTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

/**
 * Time Series Revenue Report - Optimized for time-based revenue analysis
 * Breaks down revenue by time period (daily, weekly, monthly)
 */
export interface TimeSeriesRevenue extends ReadModelBase {
  granularity: 'daily' | 'weekly' | 'monthly';
  totalRevenue: number;
  timePoints: {
    periodStart: Date;
    periodEnd: Date;
    revenue: number;
    transactionCount: number;
    uniqueCustomerCount: number;
    growth?: {
      fromPreviousPeriod: number;
      percentage: number;
    };
  }[];
  peakPeriod: {
    periodStart: Date;
    periodEnd: Date;
    revenue: number;
  };
  lowPeriod: {
    periodStart: Date;
    periodEnd: Date;
    revenue: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
}

/**
 * Dashboard Summary Report - Optimized for executive dashboard
 * Provides high-level overview of financial performance
 */
export interface DashboardSummary extends ReadModelBase {
  revenue: {
    total: number;
    comparedToPrevious: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
  };
  transactions: {
    total: number;
    comparedToPrevious: number;
    percentageChange: number;
    averageValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    percentageReturning: number;
  };
  topServices: {
    id: string;
    name: string;
    revenue: number;
    count: number;
  }[];
  topAddOns: {
    id: string;
    name: string;
    revenue: number;
    count: number;
  }[];
  revenueBreakdown: {
    services: number;
    addOns: number;
    other: number;
  };
}

/**
 * Read model for financial reconciliation
 * Used to track and verify the consistency of financial data
 */
export interface FinancialReconciliationReport extends ReadModelBase {
  reconciliationId: string;
  reconciliationDate: Date;
  status: 'in_progress' | 'completed' | 'discrepancies_found' | 'verified';
  summary: {
    transactionsProcessed: number;
    invoicesVerified: number;
    paymentsVerified: number;
    totalAmountVerified: number;
  };
  discrepancies?: {
    type: 'missing_transaction' | 'amount_mismatch' | 'status_mismatch' | 'data_inconsistency';
    entityId: string;
    entityType: 'invoice' | 'payment' | 'transaction' | 'reservation';
    expectedValue: any;
    actualValue: any;
    impact: 'high' | 'medium' | 'low';
    notes: string;
  }[];
  verificationSteps: {
    name: string;
    status: 'passed' | 'failed' | 'warning';
    message?: string;
  }[];
}

// Add more specialized read models as needed for different reporting scenarios
