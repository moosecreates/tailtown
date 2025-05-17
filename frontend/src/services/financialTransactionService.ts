import { AxiosResponse } from 'axios';
import api from './api';
import { FinancialCartItem } from './financialService';

/**
 * Transaction Type
 * Matches the backend TransactionType enum
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

/**
 * Transaction Status
 * Matches the backend TransactionStatus enum
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  RECONCILED = 'RECONCILED',
  DISPUTED = 'DISPUTED'
}

/**
 * Payment Method
 * Matches the backend PaymentMethod enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  CHECK = 'CHECK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STORE_CREDIT = 'STORE_CREDIT',
  GIFT_CARD = 'GIFT_CARD'
}

/**
 * Transaction Item interface
 */
export interface TransactionItem {
  id?: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  taxable?: boolean;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  discountType?: string;
  invoiceLineItemId?: string;
  serviceId?: string;
  addOnServiceId?: string;
  reservationId?: string;
}

/**
 * Financial Transaction interface
 */
export interface FinancialTransaction {
  id?: string;
  transactionNumber?: string;
  type: TransactionType;
  amount: number;
  relatedAmount?: number;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  customerId?: string;
  invoiceId?: string;
  paymentId?: string;
  reservationId?: string;
  createdById?: string;
  processedById?: string;
  processedAt?: string;
  relatedTransactionId?: string;
  items?: TransactionItem[];
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
  };
}

/**
 * Financial Account interface
 */
export interface FinancialAccount {
  id?: string;
  accountNumber?: string;
  customerId: string;
  currentBalance: number;
  availableBalance: number;
  lastTransaction?: string;
  entries?: LedgerEntry[];
}

/**
 * Ledger Entry interface
 */
export interface LedgerEntry {
  id?: string;
  accountId: string;
  transactionId?: string;
  entryType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

/**
 * Payment Process Request
 */
export interface PaymentRequest {
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  items?: TransactionItem[];
}

/**
 * Refund Process Request
 */
export interface RefundRequest {
  originalTransactionId: string;
  amount?: number;
  reason?: string;
  method?: PaymentMethod;
  fullRefund?: boolean;
}

/**
 * Customer Financial Data Response
 */
export interface CustomerFinancialData {
  account: FinancialAccount;
  recentTransactions: FinancialTransaction[];
  pendingInvoices: any[];
  totalPendingAmount: number;
}

/**
 * Reconciliation Request
 */
export interface ReconciliationRequest {
  startDate: string;
  endDate: string;
  reconciliationType?: string;
}

/**
 * Reconciliation Response
 */
export interface ReconciliationResponse {
  reconciliation: any;
  discrepancies: any[];
  summary: {
    transactionsCount: number;
    paymentsCount: number;
    invoicesCount: number;
    startDate: string;
    endDate: string;
  };
}

/**
 * Financial Transaction Service
 * Provides a clean interface to interact with the financial transaction API
 */
class FinancialTransactionService {
  private baseUrl = '/financial-transactions';

  /**
   * Create a new financial transaction
   */
  async createTransaction(transaction: FinancialTransaction): Promise<FinancialTransaction> {
    try {
      const response: AxiosResponse = await api.post(this.baseUrl, transaction);
      return response.data.data;
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      throw error;
    }
  }

  /**
   * Get all financial transactions with filtering
   */
  async getTransactions(filters: Record<string, any> = {}): Promise<{ data: FinancialTransaction[], totalPages: number, currentPage: number }> {
    try {
      // Convert filters to query params
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response: AxiosResponse = await api.get(`${this.baseUrl}?${queryParams.toString()}`);
      return {
        data: response.data.data,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      };
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      throw error;
    }
  }

  /**
   * Get a specific financial transaction by ID
   */
  async getTransaction(id: string): Promise<FinancialTransaction> {
    try {
      const response: AxiosResponse = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching financial transaction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a transaction's status
   */
  async updateTransactionStatus(id: string, status: TransactionStatus, notes?: string): Promise<FinancialTransaction> {
    try {
      const response: AxiosResponse = await api.patch(`${this.baseUrl}/${id}/status`, { status, notes });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating transaction ${id} status:`, error);
      throw error;
    }
  }

  /**
   * Process a payment with full financial tracking
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<any> {
    try {
      const response: AxiosResponse = await api.post(`${this.baseUrl}/payment`, paymentRequest);
      return response.data.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Process a refund with full financial tracking
   */
  async processRefund(refundRequest: RefundRequest): Promise<FinancialTransaction> {
    try {
      const response: AxiosResponse = await api.post(`${this.baseUrl}/refund`, refundRequest);
      return response.data.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get customer's financial data including account, transactions, and pending invoices
   */
  async getCustomerFinancialData(customerId: string): Promise<CustomerFinancialData> {
    try {
      const response: AxiosResponse = await api.get(`${this.baseUrl}/customer/${customerId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching financial data for customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Perform financial data reconciliation
   */
  async reconcileFinancialData(request: ReconciliationRequest): Promise<ReconciliationResponse> {
    try {
      const response: AxiosResponse = await api.post(`${this.baseUrl}/reconcile`, request);
      return response.data.data;
    } catch (error) {
      console.error('Error performing financial reconciliation:', error);
      throw error;
    }
  }

  /**
   * Convert cart items to transaction items
   * This bridges the frontend shopping cart with the financial transaction system
   */
  convertCartItemsToTransactionItems(cartItems: FinancialCartItem[]): TransactionItem[] {
    return cartItems.map(item => {
      // Create the main item
      const mainItem: TransactionItem = {
        description: item.name || 'Service item',
        amount: item.price || 0,
        quantity: item.quantity || 1,
        unitPrice: item.price || 0,
        taxable: true,
        serviceId: item.serviceId,
        reservationId: item.id.startsWith('temp-') ? undefined : item.id
      };

      // Add-on items will be converted to separate transaction items
      const addOnItems: TransactionItem[] = (item.addOns || []).map(addOn => ({
        description: `Add-on: ${addOn.name}`,
        amount: addOn.price * addOn.quantity,
        quantity: addOn.quantity,
        unitPrice: addOn.price,
        taxable: true,
        addOnServiceId: addOn.id
      }));

      return [mainItem, ...addOnItems];
    }).flat();
  }
}

// Create singleton instance
const financialTransactionService = new FinancialTransactionService();
export default financialTransactionService;
