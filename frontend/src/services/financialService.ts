import { CartItem } from '../contexts/ShoppingCartContext';

/**
 * Financial Configuration Interface
 * Centralized configuration for all financial calculations
 */
interface FinancialConfig {
  taxRate: number;
  roundingPrecision: number;
  currency: string;
}

/**
 * Financial Calculation Results
 * Standardized interface for calculation results
 */
export interface FinancialCalculation {
  subtotal: number;
  tax: number;
  total: number;
  items: ItemCalculation[];
  metadata: {
    calculatedAt: string;
    configVersion: string;
    taxRate: number;
  };
}

/**
 * Individual Item Calculation
 */
export interface ItemCalculation {
  id: string;
  name: string;
  basePrice: number;
  addOnsPrice: number;
  quantity: number;
  totalPrice: number;
  itemMetadata?: Record<string, any>;
}

/**
 * Financial Transaction Record
 * Used for audit and transaction logging
 */
export interface FinancialTransaction {
  transactionId: string;
  type: 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  timestamp: string;
  userId?: string;
  method: 'CASH' | 'CREDIT_CARD' | 'STORE_CREDIT' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'VOIDED';
  relatedEntities: {
    customerId?: string;
    reservationId?: string;
    invoiceId?: string;
  };
  metadata: Record<string, any>;
}

/**
 * AddOn interface for financial calculations
 */
export interface FinancialAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Extended CartItem for financial calculations
 */
export interface FinancialCartItem extends CartItem {
  price?: number;
  quantity?: number;
  addOns?: FinancialAddOn[];
  serviceName?: string;
  petName?: string;
  startDate?: Date;
  endDate?: Date;
  calculationMetadata?: Record<string, any>;
}

// Default financial configuration
const DEFAULT_CONFIG: FinancialConfig = {
  taxRate: 0.0744, // 7.44% tax rate as per application standard
  roundingPrecision: 2,
  currency: 'USD',
};

/**
 * Finance Service Class
 * Provides centralized financial calculations and transaction handling
 */
class FinancialService {
  private config: FinancialConfig;
  private configVersion: string = '1.0.0';
  private transactionLog: FinancialTransaction[] = [];

  constructor(config: Partial<FinancialConfig> = {}) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    console.log('FinancialService: Initialized with config', this.config);
  }

  /**
   * Calculate financial totals for cart items
   * This is the primary method for all cart calculations
   */
  calculateTotals(items: FinancialCartItem[]): FinancialCalculation {
    console.log('FinancialService: Calculating totals for items', items);
    
    // Calculate individual item totals
    const itemCalculations: ItemCalculation[] = items.map(item => {
      const basePrice = item.price || 0;
      const addOnsTotal = this.calculateAddOnsTotal(item.addOns);
      const quantity = item.quantity || 1;
      const totalPrice = (basePrice + addOnsTotal) * quantity;
      
      return {
        id: item.id,
        name: item.name || 'Unnamed Item',
        basePrice,
        addOnsPrice: addOnsTotal,
        quantity,
        totalPrice,
        itemMetadata: item.calculationMetadata,
      };
    });
    
    // Calculate overall totals
    const subtotal = this.roundCurrency(
      itemCalculations.reduce((total, item) => total + item.totalPrice, 0)
    );
    
    const tax = this.roundCurrency(subtotal * this.config.taxRate);
    const total = this.roundCurrency(subtotal + tax);
    
    // Create calculation result
    const result: FinancialCalculation = {
      subtotal,
      tax,
      total,
      items: itemCalculations,
      metadata: {
        calculatedAt: new Date().toISOString(),
        configVersion: this.configVersion,
        taxRate: this.config.taxRate,
      },
    };
    
    console.log('FinancialService: Calculation result', result);
    return result;
  }
  
  /**
   * Calculate total for add-ons
   */
  private calculateAddOnsTotal(addOns?: FinancialAddOn[]): number {
    if (!addOns || !addOns.length) {
      return 0;
    }
    
    return addOns.reduce(
      (total, addOn) => total + (addOn.price * (addOn.quantity || 1)),
      0
    );
  }
  
  /**
   * Apply discount to a total amount
   */
  applyDiscount(amount: number, discountType: 'PERCENTAGE' | 'FIXED_AMOUNT', discountValue: number): number {
    if (discountType === 'PERCENTAGE') {
      // Ensure percentage is between 0 and 100
      const validPercentage = Math.min(Math.max(discountValue, 0), 100);
      return this.roundCurrency(amount * (1 - validPercentage / 100));
    } else {
      // Ensure fixed discount doesn't exceed amount
      const validDiscount = Math.min(discountValue, amount);
      return this.roundCurrency(amount - validDiscount);
    }
  }
  
  /**
   * Round currency values to specified precision
   */
  roundCurrency(value: number): number {
    const multiplier = Math.pow(10, this.config.roundingPrecision);
    return Math.round(value * multiplier) / multiplier;
  }
  
  /**
   * Format currency for display
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: this.config.roundingPrecision,
      maximumFractionDigits: this.config.roundingPrecision,
    }).format(value);
  }
  
  /**
   * Record a financial transaction
   * This will be expanded in future implementations to persist transactions
   */
  recordTransaction(transaction: Omit<FinancialTransaction, 'transactionId' | 'timestamp'>): FinancialTransaction {
    const completeTransaction: FinancialTransaction = {
      ...transaction,
      transactionId: this.generateTransactionId(),
      timestamp: new Date().toISOString(),
    };
    
    // Add to in-memory transaction log
    this.transactionLog.push(completeTransaction);
    console.log('FinancialService: Recorded transaction', completeTransaction);
    
    // TODO: In future implementations, persist this transaction to the database
    
    return completeTransaction;
  }
  
  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get transaction history
   */
  getTransactionHistory(): FinancialTransaction[] {
    return [...this.transactionLog];
  }
  
  /**
   * Update financial configuration
   */
  updateConfig(newConfig: Partial<FinancialConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    console.log('FinancialService: Updated config', this.config);
  }
  
  /**
   * Get current financial configuration
   */
  getConfig(): FinancialConfig {
    return { ...this.config };
  }
}

// Create and export singleton instance
const financialService = new FinancialService();
export default financialService;
