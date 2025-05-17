/**
 * Script to check all upcoming reservations
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReservationsData() {
  try {
    console.log('======= CHECKING UPCOMING RESERVATIONS =======');
    const today = new Date();
    
    // Get upcoming 7 days of reservations
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    console.log(`Checking reservations between ${today.toISOString().split('T')[0]} and ${nextWeek.toISOString().split('T')[0]}`);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        startDate: {
          gte: today,
          lte: nextWeek
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
    
    console.log(`\nFound ${reservations.length} upcoming reservations in the next 7 days`);
    
    if (reservations.length > 0) {
      // Group by date
      const reservationsByDate: Record<string, typeof reservations> = {};
      
      reservations.forEach(reservation => {
        const dateStr = reservation.startDate.toISOString().split('T')[0];
        if (!reservationsByDate[dateStr]) {
          reservationsByDate[dateStr] = [];
        }
        reservationsByDate[dateStr].push(reservation);
      });
      
      // Display each day's reservations
      for (const [date, dayReservations] of Object.entries(reservationsByDate)) {
        console.log(`\n=== Reservations for ${date} (${dayReservations.length}) ===`);
        
        const formattedReservations = dayReservations.map(r => ({
          id: r.id,
          status: r.status,
          service: r.service?.name || 'N/A',
          customer: `${r.customer.firstName} ${r.customer.lastName}`,
          start: r.startDate.toLocaleTimeString(),
          end: r.endDate.toLocaleTimeString()
        }));
        
        console.table(formattedReservations);
      }
    }

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
checkReservationsData();
