/**
 * Simple script to check today's data
 * This will show reservations, invoices, and financial transactions for today
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TypeScript interfaces for formatted output
interface FormattedReservation {
  id: string;
  status: string;
  startDate: string;
  service: string;
  price: number;
  customer: string;
  hasInvoice: string;
}

interface FormattedFlexibleReservation {
  id: string;
  status: string;
  startDate: string;
  service: string;
  basePrice: number;
  addOns: number;
  addOnTotal: number;
  customer: string;
  hasInvoice: string;
  invoiceNumber?: string;
}

interface FormattedInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  total: number;
  status: string;
  hasPaidPayment: boolean;
  paymentTotal: number;
  service: string;
  lineItems: number;
}

interface FormattedTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  customer: string;
  hasInvoice: string;
  hasReservation: string;
  createdAt: string;
}

async function checkTodaysData() {
  try {
    console.log('======= CHECKING DATA FOR TODAY =======');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`Today's date: ${todayStr}`);
    
    // Create date objects for today with timezone handling
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`); // Midnight UTC
    const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);   // End of day UTC
    
    console.log(`UTC Date range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);
    
    // First, let's get ALL reservations to see what's in the database
    console.log("\n=== ALL RESERVATIONS IN DATABASE ===");
    const allReservations = await prisma.reservation.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true,
        service: true,
        invoice: true
      }
    });
    
    if (allReservations.length > 0) {
      const formattedAll: FormattedReservation[] = allReservations.map(r => ({
        id: r.id.substring(0, 8) + '...',
        status: r.status,
        startDate: r.startDate.toISOString(),
        service: r.service?.name || 'N/A',
        price: r.service?.price || 0,
        customer: `${r.customer.firstName} ${r.customer.lastName}`,
        hasInvoice: r.invoice ? 'Yes' : 'No'
      }));
      console.table(formattedAll);
    } else {
      console.log("No reservations found in the database at all!");
    }
    
    // Get reservations for today
    console.log("\n=== TODAY'S RESERVATIONS ===\n");
    const todayReservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        customer: true,
        service: true,
        invoice: true,
        addOnServices: {
          include: {
            addOn: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Today's reservations count: ${todayReservations.length}`);
    
    if (todayReservations.length > 0) {
      const formattedToday: FormattedFlexibleReservation[] = todayReservations.map(r => ({
        id: r.id.substring(0, 8) + '...',
        status: r.status,
        startDate: r.startDate.toISOString(),
        service: r.service?.name || 'N/A',
        basePrice: r.service?.price || 0,
        addOns: r.addOnServices.length,
        addOnTotal: r.addOnServices.reduce((sum, aos) => sum + aos.price, 0),
        customer: `${r.customer.firstName} ${r.customer.lastName}`,
        hasInvoice: r.invoice ? 'Yes' : 'No',
        invoiceNumber: r.invoice?.invoiceNumber
      }));
      console.table(formattedToday);
    } else {
      console.log("No reservations found for today");
    }
    
    // Check for today's invoices
    console.log("\n=== TODAY'S INVOICES ===\n");
    const todayInvoices = await prisma.invoice.findMany({
      where: {
        issueDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        customer: true,
        reservation: {
          include: {
            service: true
          }
        },
        payments: true,
        lineItems: true
      },
      orderBy: {
        issueDate: 'desc'
      }
    });
    
    console.log(`Today's invoices count: ${todayInvoices.length}`);
    
    if (todayInvoices.length > 0) {
      const formattedInvoices: FormattedInvoice[] = todayInvoices.map(inv => ({
        id: inv.id.substring(0, 8) + '...',
        invoiceNumber: inv.invoiceNumber,
        customer: `${inv.customer.firstName} ${inv.customer.lastName}`,
        total: inv.total,
        status: inv.status,
        hasPaidPayment: inv.payments.some(p => p.status === 'PAID'),
        paymentTotal: inv.payments.reduce((sum, p) => sum + p.amount, 0),
        service: inv.reservation?.service?.name || 'N/A',
        lineItems: inv.lineItems.length
      }));
      console.table(formattedInvoices);
    } else {
      console.log("No invoices found for today");
    }
    
    // Check for today's reservations using a more flexible date range
    console.log("\n=== TODAY'S RESERVATIONS (FLEXIBLE DATE RANGE) ===");
    
    // Use a wider date range to account for timezone differences
    const flexibleStart = new Date(todayStr);
    flexibleStart.setHours(0, 0, 0, 0);
    flexibleStart.setDate(flexibleStart.getDate() - 1); // Include yesterday to be safe
    
    const flexibleEnd = new Date(todayStr);
    flexibleEnd.setHours(23, 59, 59, 999);
    flexibleEnd.setDate(flexibleEnd.getDate() + 1); // Include tomorrow to be safe
    
    console.log(`Flexible date range: ${flexibleStart.toISOString()} to ${flexibleEnd.toISOString()}`);
    
    const flexibleReservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: flexibleStart,
          lte: flexibleEnd
        }
      },
      include: {
        customer: true,
        service: true,
        invoice: true,
        addOnServices: {
          include: {
            addOn: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Flexible date range reservations: ${flexibleReservations.length}`);
    
    if (flexibleReservations.length > 0) {
      const formattedFlexible: FormattedFlexibleReservation[] = flexibleReservations.map(r => ({
        id: r.id.substring(0, 8) + '...',
        status: r.status,
        startDate: r.startDate.toISOString(),
        service: r.service?.name || 'N/A',
        basePrice: r.service?.price || 0,
        addOns: r.addOnServices.length,
        addOnTotal: r.addOnServices.reduce((sum, aos) => sum + aos.price, 0),
        customer: `${r.customer.firstName} ${r.customer.lastName}`,
        hasInvoice: r.invoice ? 'Yes' : 'No'
      }));
      console.table(formattedFlexible);
    } else {
      console.log("No reservations found in the flexible date range");
    }
    
    // Check for invoices specifically for today
    console.log("\n=== INVOICES FOR TODAY ===");
    
    // Get all invoices for today
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: {
          gte: todayStart,
          lte: todayEnd
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        customer: true,
        reservation: {
          include: {
            service: true,
            addOnServices: {
              include: {
                addOn: true
              }
            }
          }
        },
        lineItems: true,
        payments: true
      }
    });
    
    console.log(`Invoices for today: ${todayInvoices.length}`);
    
    if (todayInvoices.length > 0) {
      const formattedInvoices: FormattedInvoice[] = todayInvoices.map(invoice => ({
        id: invoice.id.substring(0, 8) + '...',
        invoiceNumber: invoice.invoiceNumber,
        customer: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        total: invoice.total,
        status: invoice.status,
        hasPaidPayment: invoice.payments.some(p => p.status === 'PAID'),
        paymentTotal: invoice.payments.reduce((sum, p) => sum + p.amount, 0),
        service: invoice.reservation?.service?.name || 'N/A',
        lineItems: invoice.lineItems.length
      }));
      console.table(formattedInvoices);
    } else {
      console.log("No invoices found for today");
    }
    
    // Check for financial transactions
    console.log("\n=== FINANCIAL TRANSACTIONS FOR TODAY ===");
    
    const todayTransactions = await prisma.financialTransaction.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        customer: true,
        invoice: true,
        reservation: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Financial transactions for today: ${todayTransactions.length}`);
    
    if (todayTransactions.length > 0) {
      const formattedTransactions: FormattedTransaction[] = todayTransactions.map(tx => ({
        id: tx.id.substring(0, 8) + '...',
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        customer: tx.customer ? `${tx.customer.firstName} ${tx.customer.lastName}` : 'N/A',
        hasInvoice: tx.invoice ? 'Yes' : 'No',
        hasReservation: tx.reservation ? 'Yes' : 'No',
        createdAt: tx.createdAt.toISOString()
      }));
      console.table(formattedTransactions);
    } else {
      console.log("No financial transactions found for today");
    }
  } catch (error) {
    console.error('Error checking today\'s data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
checkTodaysData();
        include: {
          customer: true,
          reservation: true
        }
      });
      
      console.log(`Found ${invoices.length} invoices related to today's reservations`);
      
      if (invoices.length > 0) {
        const formattedInvoices = invoices.map(inv => ({
          id: inv.id,
          number: inv.invoiceNumber,
          status: inv.status,
          total: inv.total,
          customer: `${inv.customer.firstName} ${inv.customer.lastName}`,
          reservation: inv.reservation?.id || 'N/A'
        }));
        
        console.table(formattedInvoices);
      }
      
      // Find reservations without invoices
      const reservationsWithInvoices = new Set(invoices.map(inv => inv.reservationId));
      const reservationsWithoutInvoices = reservations.filter(r => !reservationsWithInvoices.has(r.id));
      
      console.log(`\nReservations without invoices: ${reservationsWithoutInvoices.length}`);
      
      if (reservationsWithoutInvoices.length > 0) {
        const formattedReservationsNoInvoice = reservationsWithoutInvoices.map(r => ({
          id: r.id,
          status: r.status,
          service: r.service?.name || 'N/A',
          customer: `${r.customer.firstName} ${r.customer.lastName}`,
          start: r.startDate.toLocaleTimeString()
        }));
        
        console.table(formattedReservationsNoInvoice);
      }
    }

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    // Close prisma client
    await prisma.$disconnect();
  }
}

// Execute the function
checkTodaysData();
