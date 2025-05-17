import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  TransactionType, 
  TransactionStatus,
  FinancialTransaction,
  TransactionItem,
  FinancialAccount,
  LedgerEntry,
  FinancialReconciliation,
  LedgerEntryType
} from '../types/financialTypes';
import AppError from '../utils/appError';

// Note: This controller uses temporary type definitions until
// the Prisma schema is properly migrated. The actual database
// operations will be implemented once the migration is complete.

const prisma = new PrismaClient();

// Import mock models for financial transactions until Prisma models are available
import { MockPrismaModels } from '../types/financialTypes';

// Extend prisma with our mock models
// This is a temporary solution until we run the Prisma migration
const prismaExtended = {
  ...prisma,
  ...MockPrismaModels
};

/**
 * Financial Transaction Controller
 * 
 * This controller handles all financial transaction-related operations in the application.
 * It serves as the single source of truth for all financial data by:
 * - Recording every financial event with complete metadata
 * - Ensuring atomic operations through database transactions
 * - Maintaining audit trails for all financial activities
 */
export const createFinancialTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      type,
      amount,
      status = 'PENDING',
      paymentMethod,
      notes,
      metadata,
      customerId,
      invoiceId,
      paymentId,
      reservationId,
      items = [],
    } = req.body;

    // Validate required fields
    if (!type || !amount) {
      return next(new AppError('Transaction type and amount are required', 400));
    }

    if (!Object.values(TransactionType).includes(type)) {
      return next(new AppError(`Invalid transaction type: ${type}`, 400));
    }

    // Generate unique transaction number
    const transactionNumber = `TR-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Use a database transaction to ensure atomicity
    const result = await prismaExtended.$transaction(async (prisma) => {
      // Create the main transaction record
      const transaction = await prismaExtended.financialTransaction.create({
        data: {
          transactionNumber,
          type,
          amount,
          status: status as TransactionStatus,
          paymentMethod,
          notes,
          metadata,
          customerId,
          invoiceId,
          paymentId,
          reservationId,
          createdById: req.body.userId, // Current user ID from auth middleware
          timestamp: new Date(),
        },
      });

      // Create transaction items if provided
      if (items && items.length > 0) {
        await Promise.all(
          items.map((item: any) =>
            prisma.transactionItem.create({
              data: {
                transactionId: transaction.id,
                description: item.description,
                amount: item.amount,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice,
                taxable: item.taxable !== undefined ? item.taxable : true,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount,
                discountAmount: item.discountAmount,
                discountType: item.discountType,
                discountRuleId: item.discountRuleId,
                invoiceLineItemId: item.invoiceLineItemId,
                serviceId: item.serviceId,
                addOnServiceId: item.addOnServiceId,
                reservationId: item.reservationId,
              },
            })
          )
        );
      }

      // If customer is provided, update or create a financial account
      if (customerId) {
        // Check if customer has a financial account
        let account = await prismaExtended.financialAccount.findFirst({
          where: { customerId },
        });

        if (!account) {
          // Create new account if doesn't exist
          account = await prismaExtended.financialAccount.create({
            data: {
              accountNumber: `ACCT-${customerId.substring(0, 8)}`,
              customerId,
              currentBalance: 0,
              availableBalance: 0,
            },
          });
        }

        // Calculate new balance based on transaction type
        let balanceChange = 0;
        let entryType: any = 'PAYMENT';

        switch (type) {
          case 'PAYMENT':
            balanceChange = amount;
            entryType = 'DEPOSIT';
            break;
          case 'REFUND':
            balanceChange = -amount;
            entryType = 'REFUND';
            break;
          case 'CREDIT':
            balanceChange = amount;
            entryType = 'ADJUSTMENT';
            break;
          case 'DEBIT':
            balanceChange = -amount;
            entryType = 'WITHDRAWAL';
            break;
          default:
            balanceChange = 0;
        }

        if (balanceChange !== 0 && account) {
          // Update account balance
          const newBalance = account.currentBalance + balanceChange;
          await prismaExtended.financialAccount.update({
            where: { id: account.id },
            data: {
              currentBalance: newBalance,
              lastTransaction: new Date(),
            },
          });

          // Create ledger entry
          await prismaExtended.ledgerEntry.create({
            data: {
              accountId: account.id,
              transactionId: transaction.id,
              entryType: balanceChange > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
              amount: Math.abs(balanceChange),
              balanceAfter: newBalance,
              description: `Transaction ${transaction.transactionNumber} - ${notes || 'No description'}`,
              timestamp: new Date(),
            },
          });
        }
      }

      return transaction;
    });

    // Return the created transaction
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating financial transaction:', error);
    return next(new AppError(error.message || 'Error creating financial transaction', 500));
  }
};

/**
 * Get all financial transactions with filtering options
 */
export const getFinancialTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      customerId,
      invoiceId,
      type,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (type) where.type = type;
    if (status) where.status = status;

    // Date range filtering
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    // Amount range filtering
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount as string);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get total count for pagination
    const totalCount = await prismaExtended.financialTransaction.count({ where });

    // Fetch transactions with pagination
    const transactions = await prismaExtended.financialTransaction.findMany({
      where,
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      totalPages,
      currentPage: parseInt(page as string),
      data: transactions,
    });
  } catch (error: any) {
    console.error('Error fetching financial transactions:', error);
    return next(new AppError(error.message || 'Error fetching financial transactions', 500));
  }
};

/**
 * Get a specific financial transaction by ID
 */
export const getFinancialTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const transaction = await prismaExtended.financialTransaction.findUnique({
      where: { id },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            lineItems: true,
          },
        },
        payment: true,
        childTransactions: true,
      },
    });

    if (!transaction) {
      return next(new AppError('Financial transaction not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Error fetching financial transaction:', error);
    return next(new AppError(error.message || 'Error fetching financial transaction', 500));
  }
};

/**
 * Update a financial transaction's status
 */
export const updateTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !Object.values(TransactionStatus).includes(status)) {
      return next(new AppError(`Invalid transaction status: ${status}`, 400));
    }

    // First, get the current transaction
    const transaction = await prismaExtended.financialTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return next(new AppError('Financial transaction not found', 404));
    }

    // Use a transaction to ensure atomicity
    const result = await prismaExtended.$transaction(async (prisma) => {
      // Update the transaction status
      const updatedTransaction = await prismaExtended.financialTransaction.update({
        where: { id },
        data: {
          status: status as TransactionStatus,
          notes: notes || transaction.notes,
          processedById: req.body.userId, // Current user ID from auth middleware
          processedAt: new Date(),
        },
      });

      // If status is changed to COMPLETED and it was PENDING before, update account balances
      if (status === 'COMPLETED' && transaction.status === 'PENDING' && transaction.customerId) {
        // Get customer's financial account
        const account = await prismaExtended.financialAccount.findFirst({
          where: { customerId: transaction.customerId },
        });

        if (account) {
          // Update available balance to match current balance
          await prismaExtended.financialAccount.update({
            where: { id: account.id },
            data: {
              availableBalance: account.currentBalance,
              updatedAt: new Date(),
            },
          });
        }
      }

      // If status is changed to VOIDED or FAILED and it was COMPLETED before, reverse the transaction
      if ((status === 'VOIDED' || status === 'FAILED') && transaction.status === 'COMPLETED') {
        // Create a reversal transaction
        await prismaExtended.financialTransaction.create({
          data: {
            transactionNumber: `REV-${transaction.transactionNumber}`,
            type: 'ADJUSTMENT',
            amount: -transaction.amount,
            status: 'COMPLETED',
            notes: `Reversal of transaction ${transaction.transactionNumber} due to ${status.toLowerCase()} status`,
            customerId: transaction.customerId,
            invoiceId: transaction.invoiceId,
            paymentId: transaction.paymentId,
            reservationId: transaction.reservationId,
            relatedTransactionId: transaction.id,
            createdById: req.body.userId,
            processedById: req.body.userId,
            processedAt: new Date(),
            timestamp: new Date(),
          },
        });

        // If the transaction affected a customer account, update balances
        if (transaction.customerId) {
          const account = await prismaExtended.financialAccount.findFirst({
            where: { customerId: transaction.customerId },
          });

          if (account) {
            // Reverse the original transaction's effect on balance
            const newBalance = account.currentBalance - transaction.amount;
            await prismaExtended.financialAccount.update({
              where: { id: account.id },
              data: {
                currentBalance: newBalance,
                availableBalance: newBalance,
                lastTransaction: new Date(),
              },
            });

            // Create ledger entry for reversal
            await prismaExtended.ledgerEntry.create({
              data: {
                accountId: account.id,
                entryType: 'ADJUSTMENT',
                amount: -transaction.amount,
                balanceAfter: newBalance,
                description: `Reversal due to ${status.toLowerCase()} status of transaction ${transaction.transactionNumber}`,
                timestamp: new Date(),
              },
            });
          }
        }
      }

      return updatedTransaction;
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Error updating transaction status:', error);
    return next(new AppError(error.message || 'Error updating transaction status', 500));
  }
};

/**
 * Create a payment transaction with related financial transactions
 * This is a higher-level function that handles the entire payment process
 */
export const processPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      invoiceId,
      customerId,
      amount,
      method,
      notes,
      items = [],
    } = req.body;

    // Validate required fields
    if (!invoiceId || !customerId || !amount || !method) {
      return next(new AppError('Invoice ID, customer ID, amount, and payment method are required', 400));
    }

    // Use a transaction to ensure atomicity
    const result = await prismaExtended.$transaction(async (prisma) => {
      // Step 1: Create the payment record
      const payment = await prismaExtended.payment.create({
        data: {
          invoiceId,
          customerId,
          amount,
          method,
          status: 'PAID', // Set as paid by default
          notes,
          paymentDate: new Date(),
        },
      });

      // Step 2: Create the financial transaction record
      const transactionNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const transaction = await prismaExtended.financialTransaction.create({
        data: {
          transactionNumber,
          type: 'PAYMENT',
          amount,
          status: 'COMPLETED',
          paymentMethod: method,
          notes: notes || `Payment for invoice`,
          customerId,
          invoiceId,
          paymentId: payment.id,
          createdById: req.body.userId,
          processedById: req.body.userId,
          processedAt: new Date(),
          timestamp: new Date(),
        },
      });

      // Step 3: Create transaction items if provided
      if (items && items.length > 0) {
        await Promise.all(
          items.map((item: any) =>
            prisma.transactionItem.create({
              data: {
                transactionId: transaction.id,
                description: item.description,
                amount: item.amount,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice,
                taxable: item.taxable !== undefined ? item.taxable : true,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount,
                discountAmount: item.discountAmount,
                discountType: item.discountType,
                invoiceLineItemId: item.invoiceLineItemId,
                serviceId: item.serviceId,
                addOnServiceId: item.addOnServiceId,
                reservationId: item.reservationId,
              },
            })
          )
        );
      }

      // Step 4: Update invoice status if payment amount covers the total
      const invoice = await prismaExtended.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (invoice) {
        // Get total payments for this invoice
        const payments = await prismaExtended.payment.findMany({
          where: {
            invoiceId,
            status: 'PAID',
          },
        });

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        // Update invoice status based on payment amount
        if (totalPaid >= invoice.total) {
          await prismaExtended.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'PAID',
              updatedAt: new Date(),
            },
          });
        }
      }

      // Step 5: Update customer financial account
      let account = await prismaExtended.financialAccount.findFirst({
        where: { customerId },
      });

      if (!account) {
        // Create account if it doesn't exist
        account = await prismaExtended.financialAccount.create({
          data: {
            accountNumber: `ACCT-${customerId.substring(0, 8)}`,
            customerId,
            currentBalance: 0,
            availableBalance: 0,
          },
        });
      }

      // Only update account if it exists
      if (account) {
        const newBalance = account.currentBalance + amount;
        await prismaExtended.financialAccount.update({
          where: { id: account.id },
          data: {
            currentBalance: newBalance,
            availableBalance: newBalance,
            lastTransaction: new Date(),
          },
        });

        // Create ledger entry if account exists
        const accountBalance = account.currentBalance;
        await prismaExtended.ledgerEntry.create({
          data: {
            accountId: account.id,
            transactionId: transaction.id,
            entryType: 'PAYMENT',
            amount: amount,
            balanceAfter: accountBalance,
            description: notes || `Payment for invoice ${invoice?.invoiceNumber || invoiceId}`,
            timestamp: new Date(),
          },
        });
      }

      return {
        payment,
        transaction,
      };
    });

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return next(new AppError(error.message || 'Error processing payment', 500));
  }
};

/**
 * Get customer's financial account and transaction history
 */
export const getCustomerFinancialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerId } = req.params;

    // Get customer's financial account
    const account = await prismaExtended.financialAccount.findFirst({
      where: { customerId },
      include: {
        entries: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 20,
        },
      },
    });

    // Get recent transactions
    const transactions = await prismaExtended.financialTransaction.findMany({
      where: { customerId },
      include: {
        items: true,
        invoice: {
          select: {
            invoiceNumber: true,
            total: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20,
    });

    // Get pending invoices
    const pendingInvoices = await prismaExtended.invoice.findMany({
      where: {
        customerId,
        status: {
          in: ['DRAFT', 'SENT', 'OVERDUE'],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Calculate total pending amount
    const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    res.status(200).json({
      status: 'success',
      data: {
        account: account || {
          currentBalance: 0,
          availableBalance: 0,
          entries: [],
        },
        recentTransactions: transactions,
        pendingInvoices,
        totalPendingAmount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer financial data:', error);
    return next(new AppError(error.message || 'Error fetching customer financial data', 500));
  }
};

/**
 * Process a refund transaction
 */
export const processRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      originalTransactionId,
      amount,
      reason,
      method,
      fullRefund = false,
    } = req.body;

    // Validate required fields
    if (!originalTransactionId) {
      return next(new AppError('Original transaction ID is required', 400));
    }

    // Get the original transaction
    const originalTransaction = await prismaExtended.financialTransaction.findUnique({
      where: { id: originalTransactionId },
      include: {
        payment: true,
        items: true,
      },
    });

    if (!originalTransaction) {
      return next(new AppError('Original transaction not found', 404));
    }

    // Calculate refund amount
    const refundAmount = fullRefund 
      ? originalTransaction.amount 
      : (amount || originalTransaction.amount);

    // Validate refund amount
    if (refundAmount <= 0 || refundAmount > originalTransaction.amount) {
      return next(new AppError('Invalid refund amount', 400));
    }

    // Use a transaction to ensure atomicity
    const result = await prismaExtended.$transaction(async (prisma) => {
      // Step 1: Create refund transaction
      const transactionNumber = `REF-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const refundTransaction = await prismaExtended.financialTransaction.create({
        data: {
          transactionNumber,
          type: 'REFUND',
          amount: refundAmount,
          relatedAmount: originalTransaction.amount,
          status: 'COMPLETED',
          paymentMethod: method || originalTransaction.paymentMethod,
          notes: reason || `Refund for transaction ${originalTransaction.transactionNumber}`,
          customerId: originalTransaction.customerId,
          invoiceId: originalTransaction.invoiceId,
          paymentId: originalTransaction.paymentId,
          relatedTransactionId: originalTransaction.id,
          createdById: req.body.userId,
          processedById: req.body.userId,
          processedAt: new Date(),
          timestamp: new Date(),
        },
      });

      // Step 2: Update original payment if applicable
      if (originalTransaction.paymentId) {
        const originalPayment = await prismaExtended.payment.findUnique({
          where: { id: originalTransaction.paymentId },
        });

        if (originalPayment) {
          await prismaExtended.payment.update({
            where: { id: originalPayment.id },
            data: {
              refundedAmount: fullRefund 
                ? originalPayment.amount 
                : (originalPayment.refundedAmount + refundAmount),
              refundReason: reason,
              status: fullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
              updatedAt: new Date(),
            },
          });
        }
      }

      // Step 3: Update customer's financial account if applicable
      if (originalTransaction.customerId) {
        const account = await prismaExtended.financialAccount.findFirst({
          where: { customerId: originalTransaction.customerId },
        });

        if (account) {
          // Adjust account balance for the refund
          const newBalance = account.currentBalance - refundAmount;
          await prismaExtended.financialAccount.update({
            where: { id: account.id },
            data: {
              currentBalance: newBalance,
              availableBalance: newBalance,
              lastTransaction: new Date(),
            },
          });

          // Create ledger entry for refund
          await prismaExtended.ledgerEntry.create({
            data: {
              accountId: account.id,
              transactionId: refundTransaction.id,
              entryType: 'REFUND',
              amount: -refundAmount,
              balanceAfter: newBalance,
              description: reason || `Refund for transaction ${originalTransaction.transactionNumber}`,
              timestamp: new Date(),
            },
          });
        }
      }

      // Step 4: Update invoice status if necessary
      if (originalTransaction.invoiceId) {
        const invoice = await prismaExtended.invoice.findUnique({
          where: { id: originalTransaction.invoiceId },
        });

        if (invoice && invoice.status === 'PAID') {
          await prismaExtended.invoice.update({
            where: { id: invoice.id },
            data: {
              status: fullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
              updatedAt: new Date(),
            },
          });
        }
      }

      return refundTransaction;
    });

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return next(new AppError(error.message || 'Error processing refund', 500));
  }
};

/**
 * Data reconciliation for financial transactions
 */
export const reconcileFinancialData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      startDate,
      endDate,
      reconciliationType = 'MANUAL',
    } = req.body;

    // Validate date range
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all transactions in the date range
    const transactions = await prismaExtended.financialTransaction.findMany({
      where: {
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
    });

    // Get all payments in the date range
    const payments = await prismaExtended.payment.findMany({
      where: {
        paymentDate: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get all invoices in the date range
    const invoices = await prismaExtended.invoice.findMany({
      where: {
        issueDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        lineItems: true,
      },
    });

    // Perform reconciliation checks
    const discrepancies = [];

    // Check 1: Verify all payments have corresponding financial transactions
    for (const payment of payments) {
      const matchingTransaction = transactions.find(t => 
        t.paymentId === payment.id && t.type === 'PAYMENT' && t.amount === payment.amount
      );

      if (!matchingTransaction) {
        discrepancies.push({
          type: 'MISSING_TRANSACTION',
          entityType: 'PAYMENT',
          entityId: payment.id,
          details: `Payment ${payment.id} for $${payment.amount} has no matching financial transaction`,
        });
      }
    }

    // Check 2: Verify transaction totals match item totals
    for (const transaction of transactions) {
      if (transaction.items.length > 0) {
        const itemsTotal = transaction.items.reduce((sum, item) => sum + item.amount, 0);
        
        if (Math.abs(itemsTotal - transaction.amount) > 0.01) {
          discrepancies.push({
            type: 'AMOUNT_MISMATCH',
            entityType: 'TRANSACTION',
            entityId: transaction.id,
            details: `Transaction ${transaction.transactionNumber} amount $${transaction.amount} does not match items total $${itemsTotal}`,
          });
        }
      }
    }

    // Check 3: Verify invoice totals match transaction totals
    for (const invoice of invoices) {
      const invoiceTransactions = transactions.filter(t => t.invoiceId === invoice.id);
      const transactionsTotal = invoiceTransactions
        .filter(t => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const refundsTotal = invoiceTransactions
        .filter(t => t.type === 'REFUND')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netTransactions = transactionsTotal - refundsTotal;
      
      if (invoice.status === 'PAID' && Math.abs(netTransactions - invoice.total) > 0.01) {
        discrepancies.push({
          type: 'INVOICE_PAYMENT_MISMATCH',
          entityType: 'INVOICE',
          entityId: invoice.id,
          details: `Paid invoice ${invoice.invoiceNumber} total $${invoice.total} does not match net transaction amount $${netTransactions}`,
        });
      }
    }

    // Create reconciliation record
    const reconciliation = await prismaExtended.financialReconciliation.create({
      data: {
        reconciliationDate: new Date(),
        startDate: start,
        endDate: end,
        reconciliationType,
        status: discrepancies.length > 0 ? 'DISCREPANCIES_FOUND' : 'COMPLETED',
        discrepancies: discrepancies.length > 0 ? discrepancies : null,
        performedById: req.body.userId,
        notes: `Reconciliation of ${transactions.length} transactions, ${payments.length} payments, and ${invoices.length} invoices`,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        reconciliation,
        discrepancies,
        summary: {
          transactionsCount: transactions.length,
          paymentsCount: payments.length,
          invoicesCount: invoices.length,
          startDate: start,
          endDate: end,
        },
      },
    });
  } catch (error: any) {
    console.error('Error performing financial reconciliation:', error);
    return next(new AppError(error.message || 'Error performing financial reconciliation', 500));
  }
};

export default {
  createFinancialTransaction,
  getFinancialTransactions,
  getFinancialTransaction,
  updateTransactionStatus,
  processPayment,
  getCustomerFinancialData,
  processRefund,
  reconcileFinancialData,
};
