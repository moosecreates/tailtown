import { PaginatedResponse } from '../types/common';
import { Customer } from '../types/customer';
import api, { customerApi } from './api';

export type { Customer };

export const customerService = {
  getAllCustomers: async (page = 1, limit = 10): Promise<PaginatedResponse<Customer>> => {
    try {
      console.log('Fetching all customers from API...');
      const response = await customerApi.get('/api/customers', {
        params: { page, limit }
      });
      console.log('Customers API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },
  
  searchCustomers: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Customer>> => {
    const response = await customerApi.get('/api/customers', {
      params: { 
        search: query,
        page,
        limit
      }
    });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await customerApi.get(`/api/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      console.log('Making POST request to: /api/customers');
      console.log('With data:', customer);
      const response = await customerApi.post('/api/customers', customer);
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
      console.log('Making PUT request to: /customers/' + id);
      console.log('With data:', customer);
      const response = await customerApi.put(`/api/customers/${id}`, customer);
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
      await customerApi.delete(`/api/customers/${id}`);
    } catch (error: any) {
      console.error('Error in deleteCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
