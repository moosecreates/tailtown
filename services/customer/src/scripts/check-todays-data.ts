/**
 * Script to check if there are any reservations for today
 * Simple version to avoid type errors
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTodaysData() {
  try {
    console.log('======= CHECKING DATA FOR TODAY =======');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`Today's date: ${todayStr}`);
    
    // Create date objects for today (midnight to 11:59 PM)
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get all reservations for today - focus on just seeing what's scheduled
    const reservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        customer: true,
        service: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`\nReservations for today: ${reservations.length}`);
    
    if (reservations.length > 0) {
      // Format for console.table
      const formattedReservations = reservations.map(r => ({
        id: r.id,
        status: r.status,
        service: r.service?.name || 'N/A',
        customer: `${r.customer.firstName} ${r.customer.lastName}`,
        start: r.startDate.toLocaleTimeString(),
        end: r.endDate.toLocaleTimeString(),
      }));
      console.table(formattedReservations);
    } else {
      console.log('No reservations found for today');
    }
    
    // Check for invoices related to today's reservations
    console.log('\nChecking for invoices related to today\'s reservations:');
    
    if (reservations.length > 0) {
      const reservationIds = reservations.map(r => r.id);
      
      const invoices = await prisma.invoice.findMany({
        where: {
          reservationId: {
            in: reservationIds
          }
        },
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
