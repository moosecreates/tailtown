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
    console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));
    
    // Create customer with transaction to ensure all related records are created
    const newCustomer = await prisma.$transaction(async (prismaClient: any) => {
      // Extract only the fields that belong to the Customer model
      const {
        emergencyContacts,
        pets, // Extract pets to handle separately
        notifications, // Extract notifications to handle separately
        ...customerFields
      } = customerData;
      
      // Remove any fields that might cause Prisma validation errors
      const sanitizedCustomerData = { ...customerFields };
      
      // Remove empty arrays and undefined/null fields that might cause Prisma validation errors
      if (sanitizedCustomerData.pets && Array.isArray(sanitizedCustomerData.pets) && sanitizedCustomerData.pets.length === 0) {
        delete sanitizedCustomerData.pets;
      }
      
      // Remove empty strings for optional fields
      for (const key in sanitizedCustomerData) {
        if (sanitizedCustomerData[key] === '') {
          delete sanitizedCustomerData[key];
        }
      }
      
      // Ensure required fields are present
      if (!sanitizedCustomerData.firstName || !sanitizedCustomerData.lastName) {
        throw new AppError('First name and last name are required', 400);
      }
      
      // Create default notification preferences
      const notificationData = {
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        checkinNotifications: true,
        ...(notifications || {})
      };
      
      // Create the customer with default notification preferences
      const customer = await prismaClient.customer.create({
        data: {
          ...sanitizedCustomerData,
          // Set default preferred contact method if not provided
          preferredContact: sanitizedCustomerData.preferredContact || ContactMethod.EMAIL,
          // Create default notification preferences
          notifications: {
            create: notificationData
          }
        },
        include: {
          notifications: true
        }
      });
      
      // Create emergency contacts if provided
      if (emergencyContacts && Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
        await Promise.all(
          emergencyContacts.map((contact: any) => 
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
    
    console.log('Customer created successfully:', newCustomer.id);
    res.status(201).json({
      status: 'success',
      data: newCustomer,
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    // Provide more specific error messages for common issues
    if (error.code === 'P2002') {
      return next(new AppError('A customer with this email already exists', 400));
    } else if (error.code === 'P2000') {
      return next(new AppError('Input value is too long for one or more fields', 400));
    }
    
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
    
    console.log('Updating customer with data:', JSON.stringify(customerData, null, 2));
    
    // First check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { id },
      include: { notifications: true }
    });
    
    if (!customerExists) {
      return next(new AppError('Customer not found', 404));
    }
    
    // Validate emergency contact information when provided
    if (customerData.emergencyPhone && !customerData.emergencyContact) {
      return next(new AppError('Emergency contact name is required when providing an emergency phone', 400));
    }
    
    // Update customer with transaction to ensure all related records are updated
    const updatedCustomer = await prisma.$transaction(async (prismaClient) => {
      // Remove nested objects and arrays from the update data
      const { pets, notifications, financialTransactions, financialAccounts, documents, invoices, payments, reservations, ...basicCustomerData } = customerData;
      
      // Make sure we're not trying to update the ID or timestamps
      delete basicCustomerData.id;
      delete basicCustomerData.createdAt;
      delete basicCustomerData.updatedAt;
      
      // Log emergency contact fields if they're included in the update
      if (basicCustomerData.emergencyContact || basicCustomerData.emergencyPhone || 
          basicCustomerData.emergencyContactRelationship || basicCustomerData.emergencyContactEmail || 
          basicCustomerData.emergencyContactNotes) {
        console.log('Emergency contact information being updated:', {
          contact: basicCustomerData.emergencyContact,
          phone: basicCustomerData.emergencyPhone,
          relationship: basicCustomerData.emergencyContactRelationship,
          email: basicCustomerData.emergencyContactEmail,
          notes: basicCustomerData.emergencyContactNotes
        });
      }

      // Update basic customer data
      const customer = await prismaClient.customer.update({
        where: { id },
        data: basicCustomerData,
        include: {
          pets: true,
          notifications: true
        }
      });

      // Handle notification preferences if they exist
      if (notifications) {
        if (customerExists.notifications) {
          // Update existing preferences
          await prismaClient.notificationPreference.update({
            where: { customerId: id },
            data: notifications
          });
        } else {
          // Create new preferences
          await prismaClient.notificationPreference.create({
            data: {
              ...notifications,
              customerId: id
            }
          });
        }
      }
      
      // Return the updated customer with notifications
      return prismaClient.customer.findUnique({
        where: { id },
        include: {
          pets: true,
          notifications: true
        }
      });
    });
    
    console.log('Customer updated successfully:', updatedCustomer?.id || 'unknown');
    
    // Log the emergency contact information in the updated customer
    if (updatedCustomer) {
      // Type safe approach to log emergency contact info
      const emergencyInfo: Record<string, any> = {
        contact: updatedCustomer.emergencyContact,
        phone: updatedCustomer.emergencyPhone
      };
      
      // Add the new fields if they exist in the data
      // These will be available after Prisma regenerates types from the schema
      const customerData = updatedCustomer as any;
      if ('emergencyContactRelationship' in customerData) {
        emergencyInfo.relationship = customerData.emergencyContactRelationship;
      }
      if ('emergencyContactEmail' in customerData) {
        emergencyInfo.email = customerData.emergencyContactEmail;
      }
      if ('emergencyContactNotes' in customerData) {
        emergencyInfo.notes = customerData.emergencyContactNotes;
      }
      
      console.log('Updated emergency contact information:', emergencyInfo);
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    
    // Log more detailed error information
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Send a more detailed error response
    res.status(500).json({
      status: 'error',
      message: 'Failed to update customer',
      error: {
        code: error.code,
        meta: error.meta,
        message: error.message
      }
    });
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
