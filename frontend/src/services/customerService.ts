import { PaginatedResponse } from '../types/common';
import { Customer } from '../types/customer';
import api from './api';

export type { Customer };

export const customerService = {
  getAllCustomers: async (): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/api/customers');
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      console.log('Making POST request to: /api/customers');
      console.log('With data:', customer);
      const response = await api.post('/api/customers', customer);
      console.log('Response:', response);
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
      console.log('Making PUT request to: /api/customers/' + id);
      console.log('With data:', customer);
      const response = await api.put(`/api/customers/${id}`, customer);
      console.log('Response:', response);
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
      console.log('Making DELETE request to: /api/customers/' + id + '?permanent=true');
      await api.delete(`/api/customers/${id}?permanent=true`);
    } catch (error: any) {
      console.error('Error in deleteCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
