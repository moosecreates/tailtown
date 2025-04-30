import api from './api';
import { ENDPOINTS } from '../config/constants';
import { Payment } from './invoiceService';

// Additional types
export interface StoreCredit {
  customerId: string;
  amount: number;
  reason?: string;
}

export interface CreditApplication {
  invoiceId: string;
  customerId: string;
  amount: number;
}

// Service methods
export const paymentService = {
  // Get all payments for a customer
  getCustomerPayments: async (customerId: string): Promise<Payment[]> => {
    try {
      const response = await api.get(`${ENDPOINTS.PAYMENTS}/customer/${customerId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    try {
      const response = await api.get(`${ENDPOINTS.PAYMENTS}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Create a new payment
  createPayment: async (paymentData: Omit<Payment, 'id' | 'paymentDate'>): Promise<Payment> => {
    try {
      const response = await api.post(ENDPOINTS.PAYMENTS, paymentData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Record store credit
  recordStoreCredit: async (storeCreditData: StoreCredit): Promise<Payment> => {
    try {
      const response = await api.post(`${ENDPOINTS.PAYMENTS}/store-credit`, storeCreditData);
      return response.data.data;
    } catch (error) {
      console.error('Error recording store credit:', error);
      throw error;
    }
  },

  // Apply store credit to an invoice
  applyStoreCredit: async (creditApplicationData: CreditApplication): Promise<any> => {
    try {
      const response = await api.post(`${ENDPOINTS.PAYMENTS}/apply-credit`, creditApplicationData);
      return response.data.data;
    } catch (error) {
      console.error('Error applying store credit:', error);
      throw error;
    }
  },
};
