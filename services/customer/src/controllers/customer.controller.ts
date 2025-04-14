import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ContactMethod } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Get all customers
export const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    
    // Build where condition
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    
    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      include: {
        pets: {
          select: {
            id: true,
            name: true,
            breed: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.customer.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: customers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single customer by ID
export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        pets: true,
        notifications: true
      }
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// Get all pets for a customer
export const getCustomerPets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    const pets = await prisma.pet.findMany({
      where: { customerId: id },
      include: {
        medicalRecords: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: pets.length,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new customer
export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerData = req.body;
    
    // Create customer with transaction to ensure all related records are created
    const newCustomer = await prisma.$transaction(async (prismaClient: any) => {
      const customer = await prismaClient.customer.create({
        data: {
          ...customerData,
          notifications: {
            create: {
              emailNotifications: true,
              smsNotifications: customerData.preferredContact === ContactMethod.SMS || 
                              customerData.preferredContact === ContactMethod.BOTH,
              appointmentReminders: true,
              checkinNotifications: true
            }
          },
          customerPortalSettings: {
            create: {
              allowBooking: true,
              allowPayments: true,
              passwordLastChanged: new Date()
            }
          }
        }
      });
      
      // Create emergency contacts if provided
      if (customerData.emergencyContacts && customerData.emergencyContacts.length > 0) {
        await Promise.all(
          customerData.emergencyContacts.map((contact: any) => 
            prismaClient.emergencyContact.create({
              data: {
                ...contact,
                customerId: customer.id
              }
            })
          )
        );
      }
      
      return customer;
    });
    
    res.status(201).json({
      status: 'success',
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

// Update a customer
export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const customerData = req.body;
    
    // First check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Update customer with transaction to ensure all related records are updated
    const updatedCustomer = await prisma.$transaction(async (prismaClient: any) => {
      // Update basic customer data
      const customer = await prismaClient.customer.update({
        where: { id },
        data: customerData,
        include: {
          pets: true,
          emergencyContacts: true,
          notifications: true,
          customerPortalSettings: true
        }
      });
      
      // Update emergency contacts if provided
      if (customerData.emergencyContacts && customerData.emergencyContacts.length > 0) {
        // First delete existing emergency contacts
        await prismaClient.emergencyContact.deleteMany({
          where: { customerId: id }
        });
        
        // Then create new ones
        await Promise.all(
          customerData.emergencyContacts.map((contact: any) => 
            prismaClient.emergencyContact.create({
              data: {
                ...contact,
                customerId: id
              }
            })
          )
        );
      }
      
      return customer;
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a customer
export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    if (permanent === 'true') {
      // Permanently delete customer and all related records
      await prisma.$transaction([
        prisma.document.deleteMany({ where: { customerId: id } }),
        prisma.notificationPreference.deleteMany({ where: { customerId: id } }),

        prisma.pet.deleteMany({ where: { customerId: id } }),
        prisma.payment.deleteMany({ where: { customerId: id } }),
        prisma.invoice.deleteMany({ where: { customerId: id } }),
        prisma.customer.delete({ where: { id } })
      ]);
      
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } else {
      // Soft delete (mark as inactive)
      await prisma.customer.update({
        where: { id },
        data: { isActive: false }
      });
      
      res.status(200).json({
        status: 'success',
        data: { message: 'Customer has been deactivated' },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get customer documents
export const getCustomerDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    const documents = await prisma.document.findMany({
      where: { customerId: id },
      orderBy: { uploaded: 'desc' }
    });
    
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// Upload a customer document
export const uploadCustomerDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Create the document
    const document = await prisma.document.create({
      data: {
        ...documentData,
        customerId: id,
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// Get customer notification preferences
export const getCustomerNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { notifications: true }
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    if (!customer.notifications) {
      // Create default notification preferences if they don't exist
      const defaultPreferences = await prisma.notificationPreference.create({
        data: {
          customerId: id,
          emailNotifications: true,
          smsNotifications: customer.preferredContact === 'SMS' || customer.preferredContact === 'BOTH',
          pushNotifications: false,
          marketingEmails: true,
          appointmentReminders: true,
          checkinNotifications: true
        }
      });
      
      res.status(200).json({
        status: 'success',
        data: defaultPreferences,
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: customer.notifications,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update customer notification preferences
export const updateCustomerNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const preferenceData = req.body;
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { notifications: true }
    });
    
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }
    
    let preferences;
    
    if (!customer.notifications) {
      // Create new preferences
      preferences = await prisma.notificationPreference.create({
        data: {
          ...preferenceData,
          customerId: id
        }
      });
    } else {
      // Update existing preferences
      preferences = await prisma.notificationPreference.update({
        where: { customerId: id },
        data: preferenceData
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

// Get customer invoices
export const getCustomerInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    const invoices = await prisma.invoice.findMany({
      where: { customerId: id },
      skip,
      take: limit,
      orderBy: { issueDate: 'desc' },
      include: {
        reservation: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            service: {
              select: {
                name: true
              }
            },
            pet: {
              select: {
                name: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true
          }
        }
      }
    });
    
    const total = await prisma.invoice.count({
      where: { customerId: id }
    });
    
    res.status(200).json({
      status: 'success',
      results: invoices.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// Get customer payments
export const getCustomerPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    const payments = await prisma.payment.findMany({
      where: { customerId: id },
      skip,
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            total: true,
            status: true
          }
        }
      }
    });
    
    const total = await prisma.payment.count({
      where: { customerId: id }
    });
    
    res.status(200).json({
      status: 'success',
      results: payments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
