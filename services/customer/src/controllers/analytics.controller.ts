import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

/**
 * Get sales data by service type
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getSalesByService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting sales by service with period:', period);
    
    // Set up date filters based on the period
    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);
    console.log('Analytics: Date filter:', JSON.stringify(dateFilter));
    
    // Get all reservations for the period
    const reservations = await prisma.reservation.findMany({
      where: {
        startDate: dateFilter,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      }
    });
    
    console.log(`Analytics: Found ${reservations.length} reservations for the period`);
    
    // Get all services
    const allServices = await prisma.service.findMany({
      where: {
        isActive: true
      }
    });
    
    // Get all invoices for the period to calculate revenue
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: dateFilter,
        status: {
          notIn: ['CANCELLED', 'REFUNDED']
        }
      },
      include: {
        reservation: true
      }
    });
    
    console.log(`Analytics: Found ${invoices.length} invoices for the period`);
    
    // Group sales by service
    const serviceMap = new Map();
    
    // First, count all reservations by service, but only for active services
    for (const reservation of reservations) {
      const serviceId = reservation.serviceId;
      const service = allServices.find(s => s.id === serviceId);
      
      // Only count reservations for services that are still active
      if (service) {
        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            id: serviceId,
            name: service.name,
            revenue: 0,
            count: 0
          });
        }
        
        const serviceData = serviceMap.get(serviceId);
        serviceData.count += 1;
      }
    }
    
    // Then, add revenue from invoices
    for (const invoice of invoices) {
      if (invoice.reservation) {
        const serviceId = invoice.reservation.serviceId;
        
        if (serviceMap.has(serviceId)) {
          const serviceData = serviceMap.get(serviceId);
          serviceData.revenue += invoice.total || 0;
        }
      }
    }
    
    // Convert map to array
    const salesByService = Array.from(serviceMap.values());
    
    // Calculate total revenue
    const totalRevenue = salesByService.reduce((sum, service) => sum + service.revenue, 0);
    
    // Calculate percentages
    const servicesWithPercentages = salesByService.map(service => ({
      ...service,
      percentage: totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0
    }));
    
    console.log(`Analytics: Found ${salesByService.length} services with total revenue ${totalRevenue}`);
    console.log(`Analytics: Total service bookings: ${reservations.length}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        period: period,
        totalRevenue,
        services: servicesWithPercentages,
        totalBookings: reservations.length
      }
    });
  } catch (error) {
    console.error('Error getting sales by service:', error);
    return next(new AppError('Error getting sales by service', 500));
  }
};

/**
 * Get sales data by add-on type
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getSalesByAddOn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    console.log('Analytics: Getting sales by add-on with period:', period);
    
    // Set up date filters based on the period
    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);
    console.log('Analytics: Date filter:', JSON.stringify(dateFilter));
    
    // Get all reservations with add-ons for the period
    const reservationAddOns = await prisma.reservationAddOn.findMany({
      where: {
        reservation: {
          startDate: dateFilter,
          status: {
            notIn: ['CANCELLED', 'NO_SHOW']
          }
        }
      },
      include: {
        addOn: true,
        reservation: true
      }
    });
    
    console.log(`Analytics: Found ${reservationAddOns.length} reservation add-ons for the period`);
    
    // Get all add-on services
    const allAddOns = await prisma.addOnService.findMany({
      where: {
        isActive: true
      }
    });
    
    // Get all invoices for the period to calculate revenue
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: dateFilter,
        status: {
          notIn: ['CANCELLED', 'REFUNDED']
        },
        reservation: {
          addOnServices: {
            some: {}
          }
        }
      },
      include: {
        lineItems: true,
        reservation: {
          include: {
            addOnServices: {
              include: {
                addOn: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Analytics: Found ${invoices.length} invoices with add-ons for the period`);
    
    // Group by add-on
    const addOnMap = new Map();
    
    // First, count all add-ons by reservation, but only for active add-ons
    for (const reservationAddOn of reservationAddOns) {
      const addOnId = reservationAddOn.addOnId;
      
      // Check if this add-on is still active
      const addOn = allAddOns.find(a => a.id === addOnId);
      
      // Only count add-ons that are still active
      if (addOn) {
        if (!addOnMap.has(addOnId)) {
          addOnMap.set(addOnId, {
            id: addOnId,
            name: addOn.name,
            count: 0,
            revenue: 0
          });
        }
        
        const addOnData = addOnMap.get(addOnId);
        addOnData.count += 1;
      }
    }
    
    // Then, add revenue from invoices
    for (const invoice of invoices) {
      if (invoice.reservation && invoice.reservation.addOnServices) {
        for (const addOnService of invoice.reservation.addOnServices) {
          const addOnId = addOnService.addOnId;
          
          if (addOnMap.has(addOnId)) {
            const addOnData = addOnMap.get(addOnId);
            addOnData.revenue += addOnService.price || 0;
          }
        }
      }
    }
    
    // Convert map to array
    const salesByAddOn = Array.from(addOnMap.values());
    
    // Calculate total revenue
    const totalRevenue = salesByAddOn.reduce((sum, addOn) => sum + addOn.revenue, 0);
    
    console.log(`Analytics: Found ${salesByAddOn.length} add-ons with total revenue ${totalRevenue}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        period: period,
        totalRevenue,
        addOns: salesByAddOn,
        totalAddOns: reservationAddOns.length
      }
    });
  } catch (error) {
    console.error('Error getting sales by add-on:', error);
    return next(new AppError('Error getting sales by add-on', 500));
  }
};

/**
 * Get customer value data (total spend, breakdown by service type)
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getCustomerValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    // Set up date filters based on the period
    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);
    
    // Get all customers with their invoices in the date range
    const customers = await prisma.customer.findMany({
      include: {
        invoices: {
          where: {
            issueDate: dateFilter,
            status: {
              notIn: ['CANCELLED', 'REFUNDED']
            }
          },
          include: {
            lineItems: true,
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
        }
      }
    });
    
    // Process customer data
    const customerValues = customers.map(customer => {
      // Skip customers with no invoices in the period
      if (customer.invoices.length === 0) {
        return null;
      }
      
      // Calculate total spend
      const totalSpend = customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      
      // Group by service type
      const serviceMap = new Map();
      const addOnMap = new Map();
      
      // Process each invoice
      for (const invoice of customer.invoices) {
        if (invoice.reservation && invoice.reservation.service) {
          const serviceName = invoice.reservation.service.name;
          const serviceId = invoice.reservation.service.id;
          
          // Find line items related to this service (excluding add-ons)
          const serviceLineItems = invoice.lineItems.filter(item => 
            item.description.includes(serviceName) && 
            !item.description.toLowerCase().includes('add-on')
          );
          
          // Calculate service revenue
          const serviceRevenue = serviceLineItems.reduce((sum, item) => sum + item.amount, 0);
          
          // Update service map
          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              id: serviceId,
              name: serviceName,
              count: 0,
              revenue: 0
            });
          }
          
          const serviceData = serviceMap.get(serviceId);
          serviceData.count += 1;
          serviceData.revenue += serviceRevenue;
          serviceMap.set(serviceId, serviceData);
          
          // Process add-ons
          if (invoice.reservation.addOnServices) {
            for (const addOnService of invoice.reservation.addOnServices) {
              const addOnName = addOnService.addOn.name;
              const addOnId = addOnService.addOn.id;
              
              // Update add-on map
              if (!addOnMap.has(addOnId)) {
                addOnMap.set(addOnId, {
                  id: addOnId,
                  name: addOnName,
                  count: 0,
                  revenue: 0
                });
              }
              
              const addOnData = addOnMap.get(addOnId);
              addOnData.count += 1;
              addOnData.revenue += addOnService.price;
              addOnMap.set(addOnId, addOnData);
            }
          }
        }
      }
      
      // Calculate add-on total
      const addOnTotal = Array.from(addOnMap.values()).reduce((sum, addOn) => sum + addOn.revenue, 0);
      
      return {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        totalSpend,
        invoiceCount: customer.invoices.length,
        serviceBreakdown: Array.from(serviceMap.values()),
        addOnBreakdown: Array.from(addOnMap.values()),
        addOnTotal
      };
    }).filter(Boolean); // Remove null entries
    
    // Sort by total spend (highest first)
    customerValues.sort((a, b) => (b?.totalSpend || 0) - (a?.totalSpend || 0));
    
    res.status(200).json({
      status: 'success',
      results: customerValues.length,
      data: customerValues
    });
  } catch (error) {
    console.error('Error getting customer value data:', error);
    return next(new AppError('Error getting customer value data', 500));
  }
};

/**
 * Get summary analytics data for dashboard
 * Includes total revenue, service counts, customer counts
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Analytics: Getting dashboard summary with current month data');
    
    // Get basic counts
    const customerCount = await prisma.customer.count();
    const petCount = await prisma.pet.count();
    
    // Get current month reservations (more relevant than total)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const currentMonthReservations = await prisma.reservation.count({
      where: {
        startDate: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    });
    
    // Get today's reservations
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayReservations = await prisma.reservation.count({
      where: {
        startDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    });
    
    console.log(`Analytics: Dashboard summary - Customers: ${customerCount}, Pets: ${petCount}, This Month Reservations: ${currentMonthReservations}, Today: ${todayReservations}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        customerCount,
        petCount,
        reservationCount: currentMonthReservations, // Show current month, not total
        todayRevenue: 0,
        todayReservations,
        services: 0,
        appointments: []
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return next(new AppError('Error getting dashboard summary', 500));
  }
};

/**
 * Get detailed customer report for a specific customer
 * Includes all transactions, service breakdown, add-on usage
 * Supports filtering by time period (day, month, year, all-time)
 */
export const getCustomerReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const { period = 'all', startDate, endDate } = req.query;
    
    if (!customerId) {
      return next(new AppError('Customer ID is required', 400));
    }
    
    // Set up date filters based on the period
    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);
    
    // Get customer with invoices in the date range
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: {
          where: {
            issueDate: dateFilter,
            status: {
              notIn: ['CANCELLED', 'REFUNDED']
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
          },
          orderBy: {
            issueDate: 'desc'
          }
        }
      }
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Group by service type
    const serviceMap = new Map();
    const addOnMap = new Map();
    
    // Process each invoice
    for (const invoice of customer.invoices) {
      if (invoice.reservation && invoice.reservation.service) {
        const serviceName = invoice.reservation.service.name;
        const serviceId = invoice.reservation.service.id;
        
        // Find line items related to this service (excluding add-ons)
        const serviceLineItems = invoice.lineItems.filter(item => 
          item.description.includes(serviceName) && 
          !item.description.toLowerCase().includes('add-on')
        );
        
        // Calculate service revenue
        const serviceRevenue = serviceLineItems.reduce((sum, item) => sum + item.amount, 0);
        
        // Update service map
        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            id: serviceId,
            name: serviceName,
            count: 0,
            revenue: 0,
            transactions: []
          });
        }
        
        const serviceData = serviceMap.get(serviceId);
        serviceData.count += 1;
        serviceData.revenue += serviceRevenue;
        serviceData.transactions.push({
          id: invoice.id,
          date: invoice.issueDate,
          amount: serviceRevenue,
          invoiceNumber: invoice.invoiceNumber
        });
        serviceMap.set(serviceId, serviceData);
        
        // Process add-ons
        if (invoice.reservation.addOnServices) {
          for (const addOnService of invoice.reservation.addOnServices) {
            const addOnName = addOnService.addOn.name;
            const addOnId = addOnService.addOn.id;
            
            // Update add-on map
            if (!addOnMap.has(addOnId)) {
              addOnMap.set(addOnId, {
                id: addOnId,
                name: addOnName,
                count: 0,
                revenue: 0,
                transactions: []
              });
            }
            
            const addOnData = addOnMap.get(addOnId);
            addOnData.count += 1;
            addOnData.revenue += addOnService.price;
            addOnData.transactions.push({
              id: invoice.id,
              date: invoice.issueDate,
              amount: addOnService.price,
              invoiceNumber: invoice.invoiceNumber
            });
            addOnMap.set(addOnId, addOnData);
          }
        }
      }
    }
    
    // Calculate total spend
    const totalSpend = customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Calculate add-on total
    const addOnTotal = Array.from(addOnMap.values()).reduce((sum, addOn) => sum + addOn.revenue, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        customer: {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone
        },
        period: period,
        totalSpend,
        invoiceCount: customer.invoices.length,
        serviceBreakdown: Array.from(serviceMap.values()),
        addOnBreakdown: Array.from(addOnMap.values()),
        addOnTotal,
        transactions: customer.invoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.issueDate,
          total: invoice.total,
          status: invoice.status,
          serviceName: invoice.reservation?.service?.name || 'N/A',
          addOns: invoice.reservation?.addOnServices?.map(addOn => ({
            name: addOn.addOn.name,
            price: addOn.price
          })) || []
        }))
      }
    });
  } catch (error) {
    console.error('Error getting customer report:', error);
    return next(new AppError('Error getting customer report', 500));
  }
};

/**
 * Helper function to generate date filters based on period
 */
const getDateFilter = (period: string, startDate?: string, endDate?: string) => {
  const now = new Date();
  console.log(`Analytics: Generating date filter for period: ${period}`);
  
  // If custom date range is provided
  if (period === 'custom' && startDate && endDate) {
    const customStart = new Date(startDate);
    const customEnd = new Date(endDate);
    console.log(`Analytics: Custom date range - Start: ${customStart.toISOString()}, End: ${customEnd.toISOString()}`);
    return {
      gte: customStart,
      lte: customEnd
    };
  }
  
  // Standard periods
  switch (period) {
    case 'day':
      // Today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      console.log(`Analytics: Day filter - Start: ${today.toISOString()}, End: ${tomorrow.toISOString()}`);
      return {
        gte: today,
        lt: tomorrow
      };
      
    case 'week':
      // Current week (Sunday to Saturday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday
      
      console.log(`Analytics: Week filter - Start: ${startOfWeek.toISOString()}, End: ${endOfWeek.toISOString()}`);
      return {
        gte: startOfWeek,
        lt: endOfWeek
      };
      
    case 'month':
      // Current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      console.log(`Analytics: Month filter - Start: ${startOfMonth.toISOString()}, End: ${endOfMonth.toISOString()}`);
      return {
        gte: startOfMonth,
        lte: endOfMonth
      };
      
    case 'year':
      // Current year
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
      console.log(`Analytics: Year filter - Start: ${startOfYear.toISOString()}, End: ${endOfYear.toISOString()}`);
      return {
        gte: startOfYear,
        lte: endOfYear
      };
      
    case 'all':
    default:
      // All time (no date filter)
      console.log('Analytics: No date filter (all time)');
      return {};
  }
};
