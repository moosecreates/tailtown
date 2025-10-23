import { PaginatedResponse } from '../types/common';
import { Customer } from '../types/customer';
import api from './api';

export type { Customer };

export const customerService = {
  getAllCustomers: async (page = 1, limit = 10): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/api/customers', {
      params: { page, limit }
    });
    return response.data;
  },
  
  searchCustomers: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/api/customers', {
      params: { 
        search: query,
        page,
        limit
      }
    });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      const response = await api.post('/api/customers', customer);
      if (!response.data?.data) {
        throw new Error('No data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error in createCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  updateCustomer: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.put(`/api/customers/${id}`, customer);
      if (!response.data?.data) {
        throw new Error('No data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error in updateCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/customers/${id}?permanent=true`);
    } catch (error: any) {
      console.error('Error in deleteCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
