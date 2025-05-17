/**
 * Validation Service
 * 
 * Provides centralized validation rules for financial data.
 * This ensures consistent validation across all parts of the application
 * and prevents invalid data from entering the system.
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Amount validation schema
 * Ensures amounts are valid numbers with correct precision
 * - Must be a number
 * - Must have at most 2 decimal places (cents)
 * - Must be within reasonable range (-1,000,000 to 1,000,000)
 */
export const amountSchema = z.number()
  .finite()
  .refine((n: number) => !isNaN(n), { message: 'Amount must be a valid number' })
  .refine((n: number) => {
    // Check that the amount has at most 2 decimal places
    const decimalStr = n.toString().split('.')[1] || '';
    return decimalStr.length <= 2;
  }, { message: 'Amount must have at most 2 decimal places (cents)' })
  .refine((n: number) => n >= -1000000 && n <= 1000000, { 
    message: 'Amount must be within reasonable range (-1,000,000 to 1,000,000)' 
  });

/**
 * Tax rate validation schema
 * Ensures tax rates are valid percentages
 * - Must be a number
 * - Must be between 0 and 100
 * - Must have at most 4 decimal places
 */
export const taxRateSchema = z.number()
  .finite()
  .refine((n: number) => !isNaN(n), { message: 'Tax rate must be a valid number' })
  .refine((n: number) => n >= 0 && n <= 100, { message: 'Tax rate must be between 0 and 100' })
  .refine((n: number) => {
    // Check that the tax rate has at most 4 decimal places
    const decimalStr = n.toString().split('.')[1] || '';
    return decimalStr.length <= 4;
  }, { message: 'Tax rate must have at most 4 decimal places' });

/**
 * Discount validation schema
 * Ensures discounts are valid
 * - Must be a number
 * - Must be between 0 and 100 for percentage discounts
 * - Must be within reasonable range for fixed amount discounts
 */
// Define discount schema type first to avoid circular reference
type DiscountSchemaType = {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
};

export const discountSchema = z.object({
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().finite().refine((n: number) => !isNaN(n), { 
    message: 'Discount value must be a valid number' 
  })
})
.refine((data: DiscountSchemaType) => {
  if (data.type === 'PERCENTAGE') {
    return data.value >= 0 && data.value <= 100;
  }
  return data.value >= 0 && data.value <= 1000000;
}, {
  message: 'Invalid discount value. Percentage must be 0-100, fixed amount must be reasonable.',
  path: ['value']
});

/**
 * Transaction number validation schema
 * Ensures transaction numbers follow the required format
 * - Must be a string
 * - Must match the pattern: TX-YYYYMMDD-NNNNN (e.g., TX-20250516-00001)
 */
export const transactionNumberSchema = z.string()
  .regex(/^TX-\d{8}-\d{5}$/, {
    message: 'Transaction number must follow the format: TX-YYYYMMDD-NNNNN (e.g., TX-20250516-00001)'
  });

/**
 * Invoice number validation schema
 * Ensures invoice numbers follow the required format
 * - Must be a string
 * - Must match the pattern: INV-YYYYMMDD-NNNNN (e.g., INV-20250516-00001)
 */
export const invoiceNumberSchema = z.string()
  .regex(/^INV-\d{8}-\d{5}$/, {
    message: 'Invoice number must follow the format: INV-YYYYMMDD-NNNNN (e.g., INV-20250516-00001)'
  });

/**
 * Customer ID validation schema
 * Ensures customer IDs are valid UUIDs and exist in the database
 */
export const customerIdSchema = z.string()
  .uuid({ message: 'Customer ID must be a valid UUID' });

/**
 * Validate a customer ID exists in the database
 */
export const validateCustomerExists = async (customerId: string): Promise<boolean> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    return !!customer;
  } catch (error) {
    console.error('Error validating customer exists:', error);
    return false;
  }
};

/**
 * Date validation schema
 * Ensures dates are valid and not in the distant past or future
 */
export const dateSchema = z.date()
  .refine((d: Date) => !isNaN(d.getTime()), { message: 'Invalid date' })
  .refine((d: Date) => {
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 5, 0, 1); // 5 years ago
    const maxDate = new Date(now.getFullYear() + 5, 11, 31); // 5 years in future
    return d >= minDate && d <= maxDate;
  }, { message: 'Date must be within reasonable range (±5 years from now)' });

/**
 * Transaction item validation schema
 * Ensures transaction items have valid properties
 */
// Define transaction item schema type first to avoid circular reference
type TransactionItemSchemaType = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable?: boolean;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
};

// Transaction item schema
export const transactionItemSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  unitPrice: amountSchema,
  amount: amountSchema,
  taxable: z.boolean().optional().default(true),
  taxRate: taxRateSchema.optional(),
  taxAmount: amountSchema.optional(),
  discountAmount: amountSchema.optional()
})
.refine(data => {
  // Validate that amount = quantity * unitPrice - discountAmount
  const expectedAmount = (data.quantity * data.unitPrice) - (data.discountAmount || 0);
  return Math.abs(data.amount - expectedAmount) < 0.01; // Allow for small rounding differences
}, {
  message: 'Amount must equal quantity * unitPrice - discountAmount',
  path: ['amount']
})
.refine((data: TransactionItemSchemaType) => {
  // If taxAmount is provided, validate it matches taxRate * (quantity * unitPrice - discountAmount)
  if (data.taxAmount !== undefined && data.taxRate !== undefined) {
    const taxableAmount = (data.quantity * data.unitPrice) - (data.discountAmount || 0);
    const expectedTaxAmount = taxableAmount * (data.taxRate / 100);
    return Math.abs(data.taxAmount - expectedTaxAmount) < 0.01; // Allow for small rounding differences
  }
  return true;
}, {
  message: 'Tax amount must equal taxRate * (quantity * unitPrice - discountAmount)',
  path: ['taxAmount']
});

/**
 * Transaction validation schema
 * Ensures transactions have valid properties
 */
// Define transaction schema type first to avoid circular reference
type TransactionSchemaType = {
  transactionNumber: string;
  type: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  timestamp: Date;
  customerId?: string;
  items?: TransactionItemSchemaType[];
};

export const transactionSchema = z.object({
  transactionNumber: transactionNumberSchema,
  type: z.enum(['PAYMENT', 'REFUND', 'ADJUSTMENT', 'CREDIT', 'DEBIT', 'VOID', 'FEE', 'TAX', 'DISCOUNT']),
  amount: amountSchema,
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'VOIDED', 'RECONCILED', 'DISPUTED']),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'BANK_TRANSFER', 'STORE_CREDIT']).optional(),
  notes: z.string().max(1000).optional(),
  timestamp: dateSchema,
  customerId: customerIdSchema.optional(),
  items: z.array(transactionItemSchema).optional()
})
.refine((data: TransactionSchemaType) => {
  // Validate that amount matches sum of items if items are provided
  if (data.items && data.items.length > 0) {
    const itemsTotal = data.items.reduce((sum: number, item: TransactionItemSchemaType) => sum + item.amount, 0);
    return Math.abs(data.amount - itemsTotal) < 0.01; // Allow for small rounding differences
  }
  return true;
}, {
  message: 'Transaction amount must equal the sum of all item amounts',
  path: ['amount']
})
.refine(data => {
  // Validate that payment method is provided for PAYMENT and REFUND types
  if ((data.type === 'PAYMENT' || data.type === 'REFUND') && !data.paymentMethod) {
    return false;
  }
  return true;
}, {
  message: 'Payment method is required for PAYMENT and REFUND transactions',
  path: ['paymentMethod']
});

/**
 * Invoice validation schema
 * Ensures invoices have valid properties
 */
// Define invoice schema type first to avoid circular reference
type InvoiceSchemaType = {
  number: string;
  issueDate: Date;
  dueDate: Date;
  customerId: string;
  status: string;
  notes?: string;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  items?: TransactionItemSchemaType[];
};

export const invoiceSchema = z.object({
  number: invoiceNumberSchema,
  issueDate: dateSchema,
  dueDate: dateSchema,
  customerId: customerIdSchema,
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']),
  subtotal: amountSchema,
  tax: amountSchema,
  discount: amountSchema.optional(),
  total: amountSchema,
  items: z.array(z.object({
    description: z.string().min(1).max(255),
    quantity: z.number().int().positive(),
    unitPrice: amountSchema,
    amount: amountSchema,
    taxable: z.boolean().optional().default(true),
    taxRate: taxRateSchema.optional()
  })).optional()
})
.refine(data => {
  // Validate that dueDate is after or equal to issueDate
  return data.dueDate >= data.issueDate;
}, {
  message: 'Due date must be after or equal to issue date',
  path: ['dueDate']
})
.refine(data => {
  // Validate that total = subtotal + tax - discount
  const calculatedTotal = data.subtotal + data.tax - (data.discount || 0);
  return Math.abs(data.total - calculatedTotal) < 0.01; // Allow for small rounding differences
}, {
  message: 'Total must equal subtotal + tax - discount',
  path: ['total']
})
.refine((data: InvoiceSchemaType) => {
  // Validate that subtotal matches sum of items if items are provided
  if (data.items && data.items.length > 0) {
    const itemsTotal = data.items.reduce((sum: number, item: TransactionItemSchemaType) => sum + item.amount, 0);
    return Math.abs(data.subtotal - itemsTotal) < 0.01; // Allow for small rounding differences
  }
  return true;
}, {
  message: 'Subtotal must equal the sum of all item amounts',
  path: ['subtotal']
});

/**
 * Payment validation schema
 * Ensures payments have valid properties
 */
// Define payment schema type first to avoid circular reference
type PaymentSchemaType = {
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: Date;
  customerId?: string;
  invoiceId?: string;
  refundedAmount?: number;
};

export const paymentSchema = z.object({
  amount: amountSchema,
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'CHECK', 'BANK_TRANSFER', 'STORE_CREDIT']),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']),
  paymentDate: dateSchema,
  customerId: customerIdSchema.optional(),
  invoiceId: z.string().uuid({ message: 'Invoice ID must be a valid UUID' }).optional(),
  refundedAmount: amountSchema.optional()
})
.refine((data: z.infer<typeof paymentSchema>) => {
  // Validate payment status and amount
  if (data.status === 'REFUNDED' && (!data.refundedAmount || data.refundedAmount <= 0 || data.refundedAmount > data.amount)) {
    return false;
  }
  return true;
}, {
  message: 'Refunded amount must be > 0 and <= payment amount for refunded payments',
  path: ['refundedAmount']
})
.refine((data: z.infer<typeof paymentSchema>) => {
  // Validate that refundedAmount equals amount for REFUNDED status
  if (data.status === 'REFUNDED' && data.refundedAmount !== data.amount) {
    return false;
  }
  return true;
}, {
  message: 'Refunded amount must equal payment amount for fully refunded payments',
  path: ['refundedAmount']
});

/**
 * Validate a transaction
 * Returns validation result with success flag and error messages
 */
export const validateTransaction = async (
  transaction: Record<string, any>
): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    // Parse and validate the transaction
    transactionSchema.parse(transaction);
    
    // Additional validation for customerId if provided
    if (transaction.customerId) {
      const customerExists = await validateCustomerExists(transaction.customerId);
      if (!customerExists) {
        return {
          success: false,
          errors: [`Customer with ID ${transaction.customerId} does not exist`]
        };
      }
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod error messages
      const errors = error.errors.map((e: z.ZodIssue) => {
        const path = e.path.join('.');
        return `${path ? path + ': ' : ''}${e.message}`;
      });
      return { success: false, errors };
    }
    
    // Handle other errors
    console.error('Validation error:', error);
    return {
      success: false,
      errors: ['Unexpected validation error occurred']
    };
  }
};

/**
 * Validate an invoice
 * Returns validation result with success flag and error messages
 */
export const validateInvoice = async (
  invoice: Record<string, any>
): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    // Parse and validate the invoice
    invoiceSchema.parse(invoice);
    
    // Additional validation for customerId
    const customerExists = await validateCustomerExists(invoice.customerId);
    if (!customerExists) {
      return {
        success: false,
        errors: [`Customer with ID ${invoice.customerId} does not exist`]
      };
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod error messages
      const errors = error.errors.map((e: z.ZodIssue) => {
        const path = e.path.join('.');
        return `${path ? path + ': ' : ''}${e.message}`;
      });
      return { success: false, errors };
    }
    
    // Handle other errors
    console.error('Validation error:', error);
    return {
      success: false,
      errors: ['Unexpected validation error occurred']
    };
  }
};

/**
 * Validate a payment
 * Returns validation result with success flag and error messages
 */
export const validatePayment = async (
  payment: Record<string, any>
): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    // Parse and validate the payment
    paymentSchema.parse(payment);
    
    // Additional validation for customerId if provided
    if (payment.customerId) {
      const customerExists = await validateCustomerExists(payment.customerId);
      if (!customerExists) {
        return {
          success: false,
          errors: [`Customer with ID ${payment.customerId} does not exist`]
        };
      }
    }
    
    // Additional validation for invoiceId if provided
    if (payment.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId }
      });
      
      if (!invoice) {
        return {
          success: false,
          errors: [`Invoice with ID ${payment.invoiceId} does not exist`]
        };
      }
      
      // Validate that payment amount does not exceed invoice total
      if (payment.amount > invoice.total) {
        return {
          success: false,
          errors: [`Payment amount (${payment.amount}) exceeds invoice total (${invoice.total})`]
        };
      }
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod error messages
      const errors = error.errors.map((e: z.ZodIssue) => {
        const path = e.path.join('.');
        return `${path ? path + ': ' : ''}${e.message}`;
      });
      return { success: false, errors };
    }
    
    // Handle other errors
    console.error('Validation error:', error);
    return {
      success: false,
      errors: ['Unexpected validation error occurred']
    };
  }
};

export default {
  validateTransaction,
  validateInvoice,
  validatePayment,
  amountSchema,
  taxRateSchema,
  discountSchema,
  transactionNumberSchema,
  invoiceNumberSchema,
  customerIdSchema,
  dateSchema,
  transactionItemSchema,
  transactionSchema,
  invoiceSchema,
  paymentSchema
};
