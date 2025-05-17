/**
 * Financial Service
 * 
 * Single source of truth for all financial data in the application.
 * This service centralizes all financial calculations and queries to ensure
 * consistent reporting across all parts of the application.
 */

import { PrismaClient, InvoiceStatus, ReservationStatus, PaymentStatus } from '@prisma/client';
import { DateRange } from '../types/common';

const prisma = new PrismaClient();

// Standardized filter constants
const VALID_INVOICE_STATUSES = ['SENT', 'PAID', 'OVERDUE'] as InvoiceStatus[];
const INVALID_INVOICE_STATUSES = ['DRAFT', 'CANCELLED', 'REFUNDED'] as InvoiceStatus[];
const VALID_RESERVATION_STATUSES = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] as ReservationStatus[];
const INVALID_RESERVATION_STATUSES = ['CANCELLED', 'NO_SHOW', 'PENDING'] as ReservationStatus[];
const VALID_PAYMENT_STATUSES = ['PAID'] as PaymentStatus[];
const INVALID_PAYMENT_STATUSES = ['PENDING', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'] as PaymentStatus[];

export interface FinancialSummary {
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  outstandingInvoiceCount: number;
  avgInvoiceValue: number;
  taxCollected: number;
  // Additional fields for direct payments and reservations
  directPaymentsTotal: number;
  directPaymentsCount: number;
  reservationValueTotal: number;
  reservationCount: number;
  totalTransactionCount: number;
}

export interface ServiceRevenue {
  id: string;
  name: string;
  count: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface AddOnRevenue {
  id: string;
  name: string;
  count: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface CustomerRevenue {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  invoiceCount: number;
  serviceBreakdown: ServiceRevenue[];
  addOnBreakdown: AddOnRevenue[];
  addOnTotal: number;
}

/**
 * Get date filter for queries based on period string
 */
export function getDateRangeFilter(period: string, startDate?: string, endDate?: string): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  switch (period) {
    case 'day':
      start = today;
      break;
      
    case 'week':
      // Start of current week (Sunday)
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      break;
      
    case 'month':
      // Start of current month
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
      
    case 'year':
      // Start of current year
      start = new Date(today.getFullYear(), 0, 1);
      break;
      
    case 'custom':
      // Custom date range
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        // Default to all-time if custom dates not provided
        start = new Date(0); // Unix epoch
      }
      break;
      
    case 'all':
    default:
      // All time
      start = new Date(0); // Unix epoch
      break;
  }
  
  return { gte: start, lte: end };
}

/**
 * Gets invoice data, consistently filtered by status and date range
 */
export async function getInvoicesInRange(dateRange: DateRange) {
  return prisma.invoice.findMany({
    where: {
      issueDate: dateRange,
      status: {
        notIn: INVALID_INVOICE_STATUSES
      }
    },
    include: {
      lineItems: true,
      payments: true,
      reservation: {
        include: {
          addOnServices: {
            include: {
              addOn: true
            }
          },
          service: true
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
}

/**
 * Gets financial summary data for a date range, including both invoice data and direct payments
 */
export async function getFinancialSummary(dateRange: DateRange): Promise<FinancialSummary> {
  // Get traditional invoice data
  const invoices = await getInvoicesInRange(dateRange);
  
  // Get all direct payments (including cash payments) that may not be linked to invoices
  const directPayments = await prisma.payment.findMany({
    where: {
      paymentDate: dateRange,
      status: {
        in: VALID_PAYMENT_STATUSES
      }
    },
    include: {
      invoice: true,
      customer: true
    }
  });
  
  // Find payments that don't have associated invoices
  const paymentsWithoutInvoices = directPayments.filter(payment => !payment.invoiceId);
  
  // Get reservations that match the date range but don't have invoices
  const reservationsInRange = await prisma.reservation.findMany({
    where: {
      startDate: dateRange,
      status: {
        in: VALID_RESERVATION_STATUSES,
        notIn: ['CANCELLED', 'NO_SHOW']
      },
      invoice: null // Reservations without invoices
    },
    include: {
      service: true,
      addOnServices: true,
      financialTransactions: {
        include: {
          payment: true
        }
      }
    }
  });
  
  // Calculate total from invoices
  const totalInvoiceRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
  const outstandingInvoices = invoices.filter(inv => inv.status !== 'PAID');
  
  const totalPaidFromInvoices = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const taxCollected = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  
  // Calculate revenue from direct payments without invoices
  const totalDirectPayments = paymentsWithoutInvoices.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate revenue from reservations without invoices but with financial transactions
  const reservationDirectRevenue = reservationsInRange.reduce((sum, res) => {
    // If the reservation has financial transactions, use those
    if (res.financialTransactions && res.financialTransactions.length > 0) {
      return sum + res.financialTransactions.reduce((txSum, tx) => txSum + tx.amount, 0);
    }
    // Otherwise, use the service price + addon prices as an estimate
    return sum + (res.service?.price || 0) + 
      res.addOnServices.reduce((addonSum, addon) => addonSum + addon.price, 0);
  }, 0);
  
  // Grand total including all revenue sources - use exact values to avoid rounding issues
  // IMPORTANT: Always round to exactly 2 decimal places to avoid floating point issues
  // This ensures consistent values across all reports
  const totalRevenue = Math.round((totalInvoiceRevenue + totalDirectPayments + reservationDirectRevenue) * 100) / 100;
  const totalPaid = Math.round((totalPaidFromInvoices + totalDirectPayments) * 100) / 100; // Direct payments are considered paid
  
  // Count all transactions - invoices + direct payments
  const transactionCount = invoices.length + paymentsWithoutInvoices.length + 
    reservationsInRange.filter(res => res.financialTransactions.length > 0).length;
  
  return {
    totalRevenue,
    totalPaid,
    totalOutstanding,
    invoiceCount: invoices.length,
    paidInvoiceCount: paidInvoices.length,
    outstandingInvoiceCount: outstandingInvoices.length,
    avgInvoiceValue: invoices.length > 0 ? totalInvoiceRevenue / invoices.length : 0,
    taxCollected,
    // Additional metrics for comprehensive reporting
    directPaymentsTotal: totalDirectPayments,
    directPaymentsCount: paymentsWithoutInvoices.length,
    reservationValueTotal: reservationDirectRevenue,
    reservationCount: reservationsInRange.length,
    totalTransactionCount: transactionCount
  };
}

/**
 * Gets revenue breakdown by service
 */
export async function getServiceRevenue(dateRange: DateRange): Promise<ServiceRevenue[]> {
  // Get all valid invoices in the date range
  const invoices = await getInvoicesInRange(dateRange);
  
  // Create a map to store service revenue data
  const serviceMap = new Map<string, ServiceRevenue>();
  
  // Process each invoice
  for (const invoice of invoices) {
    if (invoice.reservation?.service) {
      const service = invoice.reservation.service;
      
      if (!serviceMap.has(service.id)) {
        serviceMap.set(service.id, {
          id: service.id,
          name: service.name,
          count: 0,
          revenue: 0,
          percentageOfTotal: 0
        });
      }
      
      // Calculate the base service revenue (excluding add-ons)
      const addOnTotal = invoice.reservation.addOnServices?.reduce(
        (sum, addOn) => sum + addOn.price, 0
      ) || 0;
      
      const serviceRevenue = invoice.total - addOnTotal;
      
      const data = serviceMap.get(service.id)!;
      data.count += 1;
      data.revenue += serviceRevenue;
      serviceMap.set(service.id, data);
    }
  }
  
  // Get reservations that match the date range but don't have invoices yet
  // This ensures we include revenue from scheduled services that haven't been invoiced
  const reservationsWithoutInvoices = await prisma.reservation.findMany({
    where: {
      startDate: dateRange,
      status: {
        in: VALID_RESERVATION_STATUSES,
        notIn: ['CANCELLED', 'NO_SHOW']
      },
      invoice: null // Reservations without invoices
    },
    include: {
      service: true,
      addOnServices: true
    }
  });
  
  // Process reservations without invoices
  for (const reservation of reservationsWithoutInvoices) {
    if (reservation.service) {
      const service = reservation.service;
      
      if (!serviceMap.has(service.id)) {
        serviceMap.set(service.id, {
          id: service.id,
          name: service.name,
          count: 0,
          revenue: 0,
          percentageOfTotal: 0
        });
      }
      
      // Calculate the service revenue (base price of the service)
      const serviceRevenue = service.price;
      
      const data = serviceMap.get(service.id)!;
      data.count += 1;
      data.revenue += serviceRevenue;
      serviceMap.set(service.id, data);
    }
  }
  
  // Convert map to array and calculate percentages
  const serviceRevenues = Array.from(serviceMap.values());
  const totalRevenue = serviceRevenues.reduce((sum, service) => sum + service.revenue, 0);
  
  if (totalRevenue > 0) {
    for (const service of serviceRevenues) {
      service.percentageOfTotal = (service.revenue / totalRevenue) * 100;
    }
  }
  
  // Sort by revenue (highest first)
  return serviceRevenues.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Gets revenue breakdown by add-on
 */
export async function getAddOnRevenue(dateRange: DateRange): Promise<AddOnRevenue[]> {
  // Get all valid invoices in the date range
  const invoices = await getInvoicesInRange(dateRange);
  
  // Create a map to store add-on revenue data
  const addOnMap = new Map<string, AddOnRevenue>();
  
  // Process all invoices
  for (const invoice of invoices) {
    if (invoice.reservation?.addOnServices) {
      for (const addOnService of invoice.reservation.addOnServices) {
        const addOn = addOnService.addOn;
        
        if (!addOnMap.has(addOn.id)) {
          addOnMap.set(addOn.id, {
            id: addOn.id,
            name: addOn.name,
            count: 0,
            revenue: 0,
            percentageOfTotal: 0
          });
        }
        
        const data = addOnMap.get(addOn.id)!;
        data.count += 1;
        data.revenue += addOnService.price;
        addOnMap.set(addOn.id, data);
      }
    }
  }
  
  // Get reservations that match the date range but don't have invoices yet
  // This ensures we include revenue from add-ons in scheduled services that haven't been invoiced
  const reservationsWithoutInvoices = await prisma.reservation.findMany({
    where: {
      startDate: dateRange,
      status: {
        in: VALID_RESERVATION_STATUSES,
        notIn: ['CANCELLED', 'NO_SHOW']
      },
      invoice: null // Reservations without invoices
    },
    include: {
      addOnServices: {
        include: {
          addOn: true
        }
      }
    }
  });
  
  // Process add-ons from reservations without invoices
  for (const reservation of reservationsWithoutInvoices) {
    if (reservation.addOnServices && reservation.addOnServices.length > 0) {
      for (const addOnService of reservation.addOnServices) {
        const addOn = addOnService.addOn;
        
        if (!addOnMap.has(addOn.id)) {
          addOnMap.set(addOn.id, {
            id: addOn.id,
            name: addOn.name,
            count: 0,
            revenue: 0,
            percentageOfTotal: 0
          });
        }
        
        const data = addOnMap.get(addOn.id)!;
        data.count += 1;
        data.revenue += addOnService.price;
        addOnMap.set(addOn.id, data);
      }
    }
  }
  
  // Convert map to array and calculate percentages
  const addOnRevenueData = Array.from(addOnMap.values());
  
  // Calculate total revenue to determine percentages
  const totalRevenue = addOnRevenueData.reduce((sum, addOn) => sum + addOn.revenue, 0);
  
  // Calculate percentages
  if (totalRevenue > 0) {
    for (const addOn of addOnRevenueData) {
      addOn.percentageOfTotal = (addOn.revenue / totalRevenue) * 100;
    }
  }
  
  // Sort by revenue (highest first)
  return addOnRevenueData.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Gets revenue breakdown by customer
 */
export async function getCustomerRevenue(dateRange: DateRange): Promise<CustomerRevenue[]> {
  const invoices = await getInvoicesInRange(dateRange);
  
  // Group invoices by customer
  const customerMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    invoices: typeof invoices;
  }>();
  
  for (const invoice of invoices) {
    if (invoice.customer) {
      const customerId = invoice.customer.id;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
          email: invoice.customer.email,
          invoices: []
        });
      }
      
      const customerData = customerMap.get(customerId)!;
      customerData.invoices.push(invoice);
      customerMap.set(customerId, customerData);
    }
  }
  
  // Process customer data to calculate revenue
  const customerRevenueData: CustomerRevenue[] = [];
  
  for (const [_, customerData] of customerMap.entries()) {
    // Process services
    const serviceMap = new Map<string, ServiceRevenue>();
    
    // Process add-ons
    const addOnMap = new Map<string, AddOnRevenue>();
    
    let totalSpend = 0;
    
    for (const invoice of customerData.invoices) {
      totalSpend += invoice.total;
      
      // Process service
      if (invoice.reservation?.service) {
        const service = invoice.reservation.service;
        
        if (!serviceMap.has(service.id)) {
          serviceMap.set(service.id, {
            id: service.id,
            name: service.name,
            count: 0,
            revenue: 0,
            percentageOfTotal: 0
          });
        }
        
        // Calculate the base service revenue (excluding add-ons)
        const addOnTotal = invoice.reservation.addOnServices?.reduce(
          (sum, addOn) => sum + addOn.price, 0
        ) || 0;
        
        const serviceRevenue = invoice.total - addOnTotal;
        
        const data = serviceMap.get(service.id)!;
        data.count += 1;
        data.revenue += serviceRevenue;
        serviceMap.set(service.id, data);
      }
      
      // Process add-ons
      if (invoice.reservation?.addOnServices) {
        for (const addOnService of invoice.reservation.addOnServices) {
          const addOn = addOnService.addOn;
          
          if (!addOnMap.has(addOn.id)) {
            addOnMap.set(addOn.id, {
              id: addOn.id,
              name: addOn.name,
              count: 0,
              revenue: 0,
              percentageOfTotal: 0
            });
          }
          
          const data = addOnMap.get(addOn.id)!;
          data.count += 1;
          data.revenue += addOnService.price;
          addOnMap.set(addOn.id, data);
        }
      }
    }
    
    // Calculate service percentages
    const serviceRevenues = Array.from(serviceMap.values());
    const serviceTotal = serviceRevenues.reduce((sum, service) => sum + service.revenue, 0);
    
    if (serviceTotal > 0) {
      for (const service of serviceRevenues) {
        service.percentageOfTotal = (service.revenue / serviceTotal) * 100;
      }
    }
    
    // Calculate add-on percentages
    const addOnRevenues = Array.from(addOnMap.values());
    const addOnTotal = addOnRevenues.reduce((sum, addOn) => sum + addOn.revenue, 0);
    
    if (addOnTotal > 0) {
      for (const addOn of addOnRevenues) {
        addOn.percentageOfTotal = (addOn.revenue / addOnTotal) * 100;
      }
    }
    
    // Add customer data
    customerRevenueData.push({
      id: customerData.id,
      name: customerData.name,
      email: customerData.email,
      totalSpend,
      invoiceCount: customerData.invoices.length,
      serviceBreakdown: serviceRevenues.sort((a, b) => b.revenue - a.revenue),
      addOnBreakdown: addOnRevenues.sort((a, b) => b.revenue - a.revenue),
      addOnTotal
    });
  }
  
  // Sort by total spend (highest first)
  return customerRevenueData.sort((a, b) => b.totalSpend - a.totalSpend);
}

/**
 * Gets daily revenue for a date range
 */
export async function getDailyRevenue(dateRange: DateRange): Promise<{date: string; revenue: number}[]> {
  const invoices = await getInvoicesInRange(dateRange);
  
  // Group invoices by date
  const dailyRevenueMap = new Map<string, number>();
  
  for (const invoice of invoices) {
    const dateStr = invoice.issueDate.toISOString().split('T')[0];
    const currentTotal = dailyRevenueMap.get(dateStr) || 0;
    dailyRevenueMap.set(dateStr, currentTotal + invoice.total);
  }
  
  // Convert map to array
  const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
  
  // Sort by date (ascending)
  return dailyRevenue.sort((a, b) => a.date.localeCompare(b.date));
}

export default {
  getDateRangeFilter,
  getFinancialSummary,
  getServiceRevenue,
  getAddOnRevenue,
  getCustomerRevenue,
  getDailyRevenue,
  // Export constants
  VALID_INVOICE_STATUSES,
  INVALID_INVOICE_STATUSES,
  VALID_RESERVATION_STATUSES,
  INVALID_RESERVATION_STATUSES,
  VALID_PAYMENT_STATUSES,
  INVALID_PAYMENT_STATUSES
};
