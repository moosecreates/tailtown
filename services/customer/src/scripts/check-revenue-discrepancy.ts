/**
 * Script to check revenue discrepancy between dashboard and analytics
 * 
 * This script directly calls both API endpoints that provide data to the
 * dashboard and analytics pages, then compares the totalRevenue values
 * to identify any discrepancies.
 */

import { PrismaClient } from '@prisma/client';
import financialService from '../services/financialService';

const prisma = new PrismaClient();

async function checkRevenueDiscrepancy() {
  try {
    console.log('Checking revenue discrepancy between dashboard and analytics...');
    
    // Get today's date range
    const dateRange = financialService.getDateRangeFilter('day');
    console.log('Date range:', dateRange);
    
    // Get financial summary directly from financial service (used by Dashboard)
    const financialSummary = await financialService.getFinancialSummary(dateRange);
    console.log('\n*** Financial Summary (Dashboard) ***');
    console.log('Total Revenue:', financialSummary.totalRevenue);
    console.log('Total Paid:', financialSummary.totalPaid);
    console.log('Total Outstanding:', financialSummary.totalOutstanding);
    console.log('Direct Payments Total:', financialSummary.directPaymentsTotal);
    console.log('Reservation Value Total:', financialSummary.reservationValueTotal);
    console.log('Revenue Calculation: Invoice Revenue + Direct Payments + Reservation Value');
    console.log(`${financialSummary.totalRevenue} = ? + ${financialSummary.directPaymentsTotal} + ${financialSummary.reservationValueTotal}`);
    
    // Get service revenue data
    const serviceRevenue = await financialService.getServiceRevenue(dateRange);
    const serviceTotalRevenue = serviceRevenue.reduce((sum, service) => sum + service.revenue, 0);
    console.log('\n*** Service Revenue (Sales by Service) ***');
    console.log('Service Total Revenue:', serviceTotalRevenue);
    
    // Get add-on revenue data
    const addOnRevenue = await financialService.getAddOnRevenue(dateRange);
    const addOnTotalRevenue = addOnRevenue.reduce((sum, addOn) => sum + addOn.revenue, 0);
    console.log('\n*** Add-On Revenue (Sales by Add-On) ***');
    console.log('Add-On Total Revenue:', addOnTotalRevenue);
    
    // Calculate services + add-ons (another way to get total revenue)
    const combinedRevenue = serviceTotalRevenue + addOnTotalRevenue;
    console.log('\n*** Combined Revenue (Services + Add-Ons) ***');
    console.log('Combined Total Revenue:', combinedRevenue);
    
    console.log('\n*** Discrepancy Analysis ***');
    console.log('Financial Summary vs Combined Revenue:');
    console.log(`${financialSummary.totalRevenue} vs ${combinedRevenue}`);
    console.log('Difference:', financialSummary.totalRevenue - combinedRevenue);
    
    // Get all invoices for today
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: dateRange,
        status: {
          notIn: financialService.INVALID_INVOICE_STATUSES
        }
      },
      include: {
        lineItems: true,
        payments: true,
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
      }
    });
    
    console.log('\n*** Raw Invoice Data ***');
    console.log('Invoice Count:', invoices.length);
    
    // Calculate total invoice revenue directly
    const rawInvoiceTotal = invoices.reduce((sum, inv) => sum + inv.total, 0);
    console.log('Raw Invoice Total:', rawInvoiceTotal);
    
    // Get all direct payments for today
    // Get all payments first and then filter for those without invoice IDs
    const allPayments = await prisma.payment.findMany({
      where: {
        paymentDate: dateRange,
        status: {
          in: financialService.VALID_PAYMENT_STATUSES
        }
      }
    });
    
    // Filter for payments without invoices
    const directPayments = allPayments.filter(payment => payment.invoiceId === null);
    
    console.log('\n*** Raw Direct Payment Data ***');
    console.log('Direct Payment Count:', directPayments.length);
    
    // Calculate total direct payments directly
    const rawDirectPaymentTotal = directPayments.reduce((sum, payment) => sum + payment.amount, 0);
    console.log('Raw Direct Payment Total:', rawDirectPaymentTotal);
    
    // Calculate grand total directly
    const rawGrandTotal = rawInvoiceTotal + rawDirectPaymentTotal;
    console.log('\n*** Raw Grand Total ***');
    console.log('Raw Grand Total (Invoices + Direct Payments):', rawGrandTotal);
    
    // Get reservations without invoices
    const reservationsWithoutInvoices = await prisma.reservation.findMany({
      where: {
        startDate: dateRange,
        status: {
          in: financialService.VALID_RESERVATION_STATUSES,
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
    
    console.log('\n*** Reservations Without Invoices ***');
    console.log('Count:', reservationsWithoutInvoices.length);
    
    // Calculate reservation value directly
    let rawReservationValue = 0;
    for (const res of reservationsWithoutInvoices) {
      // If the reservation has financial transactions, use those
      if (res.financialTransactions && res.financialTransactions.length > 0) {
        rawReservationValue += res.financialTransactions.reduce((txSum, tx) => txSum + tx.amount, 0);
      } else {
        // Otherwise, use the service price + addon prices as an estimate
        rawReservationValue += (res.service?.price || 0) + 
          res.addOnServices.reduce((addonSum, addon) => addonSum + addon.price, 0);
      }
    }
    console.log('Raw Reservation Value:', rawReservationValue);
    
    // Calculate complete total with reservations
    const rawCompleteTotal = rawGrandTotal + rawReservationValue;
    console.log('\n*** Raw Complete Total ***');
    console.log('Raw Complete Total (Invoices + Direct Payments + Reservations):', rawCompleteTotal);
    
    console.log('\n*** Financial Summary vs Raw Complete Total ***');
    console.log(`${financialSummary.totalRevenue} vs ${rawCompleteTotal}`);
    console.log('Difference:', financialSummary.totalRevenue - rawCompleteTotal);
    
    // Final analysis
    console.log('\n*** FINAL ANALYSIS ***');
    console.log(`Dashboard shows: ${financialSummary.totalRevenue}`);
    console.log(`Analytics pages should show: ${combinedRevenue}`);
    if (Math.abs(financialSummary.totalRevenue - combinedRevenue) > 0.01) {
      console.log(`DISCREPANCY FOUND: ${Math.abs(financialSummary.totalRevenue - combinedRevenue)}`);
      console.log('Possible reasons:');
      console.log('1. Different calculation methods between pages');
      console.log('2. Rounding errors in floating point calculations');
      console.log('3. Different status filters being applied');
      console.log('4. Caching issues between API calls');
    } else {
      console.log('No significant discrepancy found');
    }
  } catch (error) {
    console.error('Error checking revenue discrepancy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkRevenueDiscrepancy().catch(console.error);
