/**
 * Script to check resource bookings for today
 * This might help us understand why UI shows reservations but database query doesn't
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResourceBookings() {
  try {
    console.log('======= CHECKING RESOURCE BOOKINGS FOR TODAY =======');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`Today's date: ${todayStr}`);
    
    // Create date objects for today (midnight to 11:59 PM)
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr);
    todayEnd.setHours(23, 59, 59, 999);
    
    // 1. Check resources and their bookings
    const resources = await prisma.resource.findMany({
      where: {
        reservations: {
          some: {
            startDate: {
              lte: todayEnd
            },
            endDate: {
              gte: todayStart
            }
          }
        }
      },
      include: {
        reservations: {
          where: {
            startDate: {
              lte: todayEnd
            },
            endDate: {
              gte: todayStart
            }
          },
          include: {
            pet: true,
            customer: true,
            service: true
          }
        }
      }
    });
    
    console.log(`\nResources with bookings for today: ${resources.length}`);
    
    if (resources.length > 0) {
      // Display resources and their bookings
      for (const resource of resources) {
        console.log(`\n=== Resource: ${resource.name} (Suite ${resource.suiteNumber || 'N/A'}) ===`);
        console.log(`Reservations for this resource: ${resource.reservations.length}`);
        
        if (resource.reservations.length > 0) {
          const formattedReservations = resource.reservations.map(r => ({
            id: r.id,
            status: r.status,
            pet: r.pet.name,
            customer: `${r.customer.firstName} ${r.customer.lastName}`,
            start: new Date(r.startDate).toLocaleString(),
            end: new Date(r.endDate).toLocaleString(),
            service: r.service?.name || 'N/A'
          }));
          
          console.table(formattedReservations);
        }
      }
    } else {
      console.log('No resources have bookings for today according to the database.');
    }
    
    // 2. Also check if there are any "loose" reservations without linked resources
    const looseReservations = await prisma.reservation.findMany({
      where: {
        resourceId: null,
        startDate: {
          lte: todayEnd
        },
        endDate: {
          gte: todayStart
        }
      },
      include: {
        pet: true,
        customer: true,
        service: true
      }
    });
    
    console.log(`\nReservations without linked resources for today: ${looseReservations.length}`);
    
    if (looseReservations.length > 0) {
      const formattedLooseReservations = looseReservations.map(r => ({
        id: r.id,
        status: r.status,
        pet: r.pet.name,
        customer: `${r.customer.firstName} ${r.customer.lastName}`,
        start: new Date(r.startDate).toLocaleString(),
        end: new Date(r.endDate).toLocaleString(),
        service: r.service?.name || 'N/A'
      }));
      
      console.table(formattedLooseReservations);
    }
    
    // 3. Check database directly with raw query to see all reservations for today's date
    // Using raw SQL with the actual database column names (not Prisma model names)
    const result = await prisma.$queryRaw`
      SELECT 
        r.id, 
        r.status, 
        r."startDate" as start_date, 
        r."endDate" as end_date,
        p.name as pet_name,
        c."firstName" as first_name, 
        c."lastName" as last_name
      FROM reservations r
      JOIN pets p ON r."petId" = p.id
      JOIN customers c ON r."customerId" = c.id
      WHERE DATE(r."startDate") <= DATE(${todayEnd})
      AND DATE(r."endDate") >= DATE(${todayStart})
    `;
    
    console.log(`\nRAW QUERY - All reservations for today's date: ${Array.isArray(result) ? result.length : 0}`);
    
    if (Array.isArray(result) && result.length > 0) {
      console.table(result);
    }

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
checkResourceBookings();
