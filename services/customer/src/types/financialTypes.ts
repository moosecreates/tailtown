/**
 * Financial Transaction Types
 * 
 * These types define the structure for our financial transaction models.
 * They are used as a temporary solution until the Prisma schema is updated
 * and proper types are generated.
 */

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  VOID = 'VOID',
  FEE = 'FEE',
  TAX = 'TAX',
  DISCOUNT = 'DISCOUNT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  RECONCILED = 'RECONCILED',
  DISPUTED = 'DISPUTED'
}

export enum LedgerEntryType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  ADJUSTMENT = 'ADJUSTMENT',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
  REFUND = 'REFUND',
  PAYMENT = 'PAYMENT'
}

export enum ReconciliationType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM'
}

export enum ReconciliationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISCREPANCIES_FOUND = 'DISCREPANCIES_FOUND',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED'
}

// Type definitions that match our Prisma models
export interface FinancialTransaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  amount: number;
  relatedAmount?: number;
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  metadata?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  customerId?: string;
  invoiceId?: string;
  paymentId?: string;
  reservationId?: string;
  createdById?: string;
  processedById?: string;
  processedAt?: Date;
  relatedTransactionId?: string;
  items?: TransactionItem[];
  childTransactions?: FinancialTransaction[];
  relatedTransaction?: FinancialTransaction;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  discountType?: string;
  discountRuleId?: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceLineItemId?: string;
  serviceId?: string;
  addOnServiceId?: string;
  reservationId?: string;
  transaction: FinancialTransaction;
}

export interface FinancialAccount {
  id: string;
  accountNumber: string;
  customerId: string;
  currentBalance: number;
  availableBalance: number;
  lastTransaction?: Date;
  createdAt: Date;
  updatedAt: Date;
  entries?: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  transactionId?: string;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  account: FinancialAccount;
}

export interface FinancialReconciliation {
  id: string;
  reconciliationDate: Date;
  startDate: Date;
  endDate: Date;
  reconciliationType: ReconciliationType;
  status: ReconciliationStatus;
  discrepancies?: any;
  notes?: string;
  performedById?: string;
  verifiedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Additional types needed for the controller
export interface Payment {
  id: string;
  invoiceId?: string;
  customerId?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: Date;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  customerId?: string;
  number: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock transaction function that simulates Prisma's transaction behavior
const mockTransaction = async <T>(callback: (tx: any) => Promise<T>): Promise<T> => {
  // Create a transaction context that will be passed to the callback
  const txContext = {
    // Include all the same mock models
    financialTransaction: {
      create: async (data: any) => ({ id: `ft-${Date.now()}`, ...data.data }),
      findUnique: async (data: any) => ({ id: data.where.id, status: 'PENDING', amount: 100, transactionNumber: 'TX123', customerId: 'cust1' }),
      findMany: async (data: any) => [],
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
      count: async (data: any) => 0,
      delete: async (data: any) => null,
    },
    transactionItem: {
      create: async (data: any) => ({ id: `ti-${Date.now()}`, ...data.data }),
      findMany: async (data: any) => [],
    },
    financialAccount: {
      findFirst: async (data: any) => data.where.customerId ? 
        { id: `acct-${data.where.customerId}`, customerId: data.where.customerId, currentBalance: 0, availableBalance: 0 } : null,
      create: async (data: any) => ({ id: `acct-${Date.now()}`, ...data.data }),
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
    },
    ledgerEntry: {
      create: async (data: any) => ({ id: `le-${Date.now()}`, ...data.data }),
      findMany: async (data: any) => [],
    },
    payment: {
      create: async (data: any) => ({ id: `pay-${Date.now()}`, ...data.data }),
      findUnique: async (data: any) => ({ id: data.where.id, amount: 100, status: 'PENDING' }),
      findMany: async (data: any) => [],
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
    },
    invoice: {
      findUnique: async (data: any) => ({ id: data.where.id, total: 100, status: 'PENDING' }),
      findMany: async (data: any) => [],
      update: async (data: any) => ({ id: data.where.id, ...data.data }),
    },
  };

  // Execute the callback with the transaction context
  return await callback(txContext);
};

// Mock Prisma models to use until Prisma schema is updated
export const MockPrismaModels = {
  financialTransaction: {
    create: async (data: any) => ({ id: `ft-${Date.now()}`, ...data.data }),
    findUnique: async (data: any) => data.where?.id ? 
      { 
        id: data.where.id, 
        status: 'PENDING', 
        amount: 100, 
        transactionNumber: 'TX123', 
        customerId: 'cust1',
        invoiceId: 'inv1',
        paymentId: 'pay1',
        reservationId: 'res1',
        paymentMethod: 'CARD',
        notes: '',
        type: 'PAYMENT',
        items: [],
        payment: { id: 'pay1', amount: 100, status: 'PENDING' }
      } : null,
    findMany: async (data: any) => [
      { 
        id: 'ft-1', 
        status: 'COMPLETED', 
        amount: 150, 
        transactionNumber: 'TX001', 
        customerId: 'cust1',
        invoiceId: 'inv1',
        paymentId: 'pay1',
        reservationId: null,
        paymentMethod: 'CARD',
        notes: 'Payment for services',
        type: 'PAYMENT',
        items: [{ id: 'item1', amount: 150, description: 'Product A' }],
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date()
      },
      { 
        id: 'ft-2', 
        status: 'PENDING', 
        amount: 75, 
        transactionNumber: 'TX002', 
        customerId: 'cust1',
        invoiceId: 'inv2',
        paymentId: 'pay2',
        reservationId: null,
        paymentMethod: 'CARD',
        notes: 'Payment for services',
        type: 'PAYMENT',
        items: [{ id: 'item2', amount: 75, description: 'Product B' }],
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date()
      }
    ],
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
    count: async (data: any) => 2,
    delete: async (data: any) => null,
  },
  transactionItem: {
    create: async (data: any) => ({ id: `ti-${Date.now()}`, ...data.data }),
    findMany: async (data: any) => [],
  },
  financialAccount: {
    findFirst: async (data: any) => data.where.customerId ? 
      { id: `acct-${data.where.customerId}`, customerId: data.where.customerId, currentBalance: 0, availableBalance: 0 } : null,
    create: async (data: any) => ({ id: `acct-${Date.now()}`, ...data.data }),
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
  },
  ledgerEntry: {
    create: async (data: any) => ({ id: `le-${Date.now()}`, ...data.data }),
    findMany: async (data: any) => [],
  },
  financialReconciliation: {
    create: async (data: any) => ({ id: `fr-${Date.now()}`, ...data.data }),
    findMany: async (data: any) => [],
  },
  payment: {
    create: async (data: any) => ({ id: `pay-${Date.now()}`, ...data.data }),
    findUnique: async (data: any) => ({ 
      id: data.where?.id, 
      amount: 100, 
      status: 'PENDING',
      refundedAmount: 0
    }),
    findMany: async (data: any) => [
      { 
        id: 'pay1', 
        amount: 100, 
        status: 'PENDING',
        refundedAmount: 0 
      }
    ],
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
  },
  invoice: {
    findUnique: async (data: any) => ({ 
      id: data.where.id, 
      total: 100, 
      status: 'PENDING', 
      invoiceNumber: `INV-${data.where.id}`,
      number: `INV-${data.where.id}`
    }),
    findMany: async (data: any) => [
      { 
        id: 'inv1', 
        total: 100, 
        status: 'PENDING', 
        invoiceNumber: 'INV-001',
        number: 'INV-001' 
      }
    ],
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
  },
  // Add the transaction method to our mock
  $transaction: mockTransaction
};
