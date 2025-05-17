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
export const VALID_INVOICE_STATUSES = ['PAID', 'PARTIALLY_PAID', 'SENT', 'OVERDUE'] as InvoiceStatus[];
export const INVALID_INVOICE_STATUSES = ['DRAFT', 'CANCELLED', 'REFUNDED'] as InvoiceStatus[];
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
  // Partial payment tracking fields
  partiallyPaidInvoiceCount: number;
  partiallyPaidAmount: number;
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
 * Retrieves all invoices within a specified date range.
 * Used by the financial summary and revenue calculation functions.
 *
 * @param dateRange - The date range to get invoices for
 * @returns An array of Invoice objects
 */
export async function getInvoicesInRange(dateRange: DateRange): Promise<any[]> {
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
 * Gets comprehensive financial summary data for a specified date range.
 * This is the primary function for retrieving financial metrics and should be used
 * as the single source of truth for financial reporting.
 *
 * Revenue calculation formula: Invoice Revenue + Direct Payments + Reservation Value
 * - Invoice Revenue: Sum of all invoice totals in the date range
 * - Direct Payments: Sum of all direct payments in the date range
 * - Reservation Value: Sum of all reservation service prices + add-on prices for reservations without invoices
 *
 * @param dateRange - The date range to get financial data for (includes start and end dates)
 * @returns A FinancialSummary object containing all financial metrics
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
  
  // Get total amount by summing line item totals
  const totalInvoiceRevenue = invoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0);
  
  // Handle fully paid invoices
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
  const paidInvoiceRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
  
  // Handle partially paid invoices (deposits)
  const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'PARTIALLY_PAID');
  
  // Calculate the paid amount from payments for partially paid invoices
  let partiallyPaidAmount = 0;
  let outstandingPartialAmount = 0;
  
  if (partiallyPaidInvoices.length > 0) {
    for (const invoice of partiallyPaidInvoices) {
      const invoiceTotal = invoice.total || 0;
      const paidAmount = invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
      partiallyPaidAmount += paidAmount;
      outstandingPartialAmount += (invoiceTotal - paidAmount);
    }
  }
  
  // Handle other outstanding invoices (not paid at all)
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'PARTIALLY_PAID');
  const unpaidInvoiceRevenue = unpaidInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
  
  // Total outstanding is from both unpaid invoices and remaining balance on partially paid invoices
  const outstandingInvoiceRevenue = unpaidInvoiceRevenue + outstandingPartialAmount;
  
  // All invoices that aren't fully paid
  const outstandingInvoices = [...unpaidInvoices, ...partiallyPaidInvoices];
  
  // Get direct payments (cash payments without invoices)
  const directPaymentsData = await getDirectPaymentsInRange(dateRange);
  const directPaymentsTotal = directPaymentsData.reduce((sum: number, payment: any) => sum + payment.amount, 0);
  
  // Get reservations without invoices
  const reservationsWithoutInvoices = await getReservationsWithoutInvoices(dateRange);
  const reservationValueTotal = reservationsWithoutInvoices.reduce((sum: number, res: any) => {
    // Base service price
    let value = res.service?.price || 0;
    
    // Add add-on services
    if (res.addOnServices && res.addOnServices.length > 0) {
      value += res.addOnServices.reduce((addOnSum: number, addOn: any) => addOnSum + addOn.price, 0);
    }
    
    return sum + value;
  }, 0);
  
  // Grand total including all revenue sources - use exact values to avoid rounding issues
  // IMPORTANT: Always round to exactly 2 decimal places to avoid floating point issues
  // This ensures consistent values across all reports
  const totalRevenue = Math.round((totalInvoiceRevenue + directPaymentsTotal + reservationValueTotal) * 100) / 100;
  const totalPaid = Math.round((paidInvoiceRevenue + directPaymentsTotal) * 100) / 100; // Direct payments are considered paid
  
  // Count all transactions - invoices + direct payments
  const transactionCount = invoices.length + paymentsWithoutInvoices.length + 
    reservationsInRange.filter(res => res.financialTransactions.length > 0).length;
  
  return {
    totalRevenue,
    totalPaid,
    totalOutstanding: outstandingInvoiceRevenue,
    invoiceCount: invoices.length,
    paidInvoiceCount: paidInvoices.length,
    outstandingInvoiceCount: outstandingInvoices.length,
    // Add partial payment tracking
    partiallyPaidInvoiceCount: partiallyPaidInvoices.length,
    partiallyPaidAmount: partiallyPaidAmount,
    avgInvoiceValue: invoices.length > 0 ? totalInvoiceRevenue / invoices.length : 0,
    taxCollected: 0, // Not implemented
    // Additional metrics for comprehensive reporting
    directPaymentsTotal: directPaymentsTotal,
    directPaymentsCount: paymentsWithoutInvoices.length,
    reservationValueTotal: reservationValueTotal,
    reservationCount: reservationsInRange.length,
    totalTransactionCount: transactionCount
  };
}

/**
 * Calculates service revenue broken down by service type for a specified date range.
 * Includes revenue from both invoiced services and scheduled services without invoices.
 *
 * IMPORTANT: This function includes revenue from reservations that don't have invoices yet,
 * which is critical for accurate revenue forecasting and reporting.
 *
 * @param dateRange - The date range to calculate service revenue for
 * @returns An array of ServiceRevenue objects containing revenue data per service
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
      const addOnTotal = invoice.reservation.addOnServices?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0;
      
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
  const totalRevenue = serviceRevenues.reduce((sum: number, service: ServiceRevenue) => sum + service.revenue, 0);
  
  if (totalRevenue > 0) {
    for (const service of serviceRevenues) {
      service.percentageOfTotal = (service.revenue / totalRevenue) * 100;
    }
  }
  
  // Sort by revenue (highest first)
  return serviceRevenues.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculates add-on service revenue broken down by add-on type for a specified date range.
 * Includes revenue from both invoiced add-ons and scheduled add-ons without invoices.
 *
 * IMPORTANT: This function includes add-ons from reservations that don't have invoices yet,
 * which is critical for accurate revenue forecasting and reporting.
 *
 * @param dateRange - The date range to calculate add-on revenue for
 * @returns An array of AddOnRevenue objects containing revenue data per add-on
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
  const totalRevenue = addOnRevenueData.reduce((sum: number, addOn: AddOnRevenue) => sum + addOn.revenue, 0);
  
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
 * Retrieves all direct payments (cash payments without invoices) within a specified date range.
 * Direct payments are implemented as financial transactions with type 'PAYMENT' but without an associated invoice.
 *
 * @param dateRange - The date range to get direct payments for
 * @returns An array of direct payment transactions
 */
export async function getDirectPaymentsInRange(dateRange: DateRange): Promise<any[]> {
  return prisma.financialTransaction.findMany({
    where: {
      createdAt: dateRange,
      type: 'PAYMENT',
      status: 'COMPLETED',
      invoiceId: null, // Direct payments don't have associated invoices
    },
    include: {
      customer: true,
      reservation: {
        include: {
          service: true,
          addOnServices: true
        }
      }
    }
  });
}

/**
 * Retrieves all reservations that don't have associated invoices within a specified date range.
 * This is critical for calculating potential revenue from scheduled services that haven't been invoiced yet.
 *
 * Only includes reservations with statuses other than 'CANCELLED'.
 *
 * @param dateRange - The date range to get reservations for
 * @returns An array of Reservation objects without associated invoices
 */
export async function getReservationsWithoutInvoices(dateRange: DateRange): Promise<any[]> {
  return prisma.reservation.findMany({
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

/**
 * Gets revenue breakdown by customer
 * 
 * This function now tracks customers from three sources:
 * 1. Customers with formal invoices
 * 2. Customers with direct payments
 * 3. Customers with reservations that haven't been invoiced yet
 * 
 * This ensures the customer count in analytics matches what's visible on the calendar.
 */
export async function getCustomerRevenue(dateRange: DateRange): Promise<CustomerRevenue[]> {
  // Get invoices for invoice-based customers
  const invoices = await getInvoicesInRange(dateRange);
  
  // Get reservations without invoices to capture all customers with bookings
  const reservationsWithoutInvoices = await getReservationsWithoutInvoices(dateRange);
  
  // Group customers across all revenue sources
  const customerMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    invoices: typeof invoices;
  }>();
  
  // Process customers from invoices
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
  
  // Process customers from reservations without invoices
  for (const reservation of reservationsWithoutInvoices) {
    if (reservation.customer) {
      const customerId = reservation.customer.id;
      
      // Only add if not already included from invoices
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
          email: reservation.customer.email || '',
          invoices: []
        });
      }
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
        const addOnTotal = invoice.reservation.addOnServices?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0;
        
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
    const serviceTotal = serviceRevenues.reduce((sum: number, service: ServiceRevenue) => sum + service.revenue, 0);
    
    if (serviceTotal > 0) {
      for (const service of serviceRevenues) {
        service.percentageOfTotal = (service.revenue / serviceTotal) * 100;
      }
    }
    
    // Calculate add-on percentages
    const addOnRevenues = Array.from(addOnMap.values());
    const addOnTotal = addOnRevenues.reduce((sum: number, addOn: AddOnRevenue) => sum + addOn.revenue, 0);
    
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

export default {
  getFinancialSummary,
  getServiceRevenue,
  getAddOnRevenue,
  getCustomerRevenue,
  getInvoicesInRange,
  getDirectPaymentsInRange,
  getReservationsWithoutInvoices,
  getDailyRevenue,
  getDateRangeFilter,
  VALID_INVOICE_STATUSES,
  INVALID_INVOICE_STATUSES,
  VALID_RESERVATION_STATUSES,
  INVALID_RESERVATION_STATUSES,
  VALID_PAYMENT_STATUSES,
  INVALID_PAYMENT_STATUSES
};
