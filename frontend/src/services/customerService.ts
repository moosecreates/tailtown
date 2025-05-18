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
      
      // Create a clean copy of the customer data
      const customerData = { ...customer };
      
      // Log the complete data being sent
      console.log('With complete data:', JSON.stringify(customerData, null, 2));
      
      // Log emergency contact fields specifically
      if (customer.emergencyContact || customer.emergencyPhone || 
          customer.emergencyContactRelationship || customer.emergencyContactEmail || 
          customer.emergencyContactNotes) {
        console.log('Emergency contact data being sent:', {
          name: customer.emergencyContact,
          phone: customer.emergencyPhone,
          relationship: customer.emergencyContactRelationship,
          email: customer.emergencyContactEmail,
          notes: customer.emergencyContactNotes
        });
      }
      
      const response = await api.put(`/api/customers/${id}`, customerData);
      console.log('Response:', response);
      
      if (!response.data?.data) {
        throw new Error('No data in response');
      }
      
      // Log emergency contact fields in response
      const responseData = response.data.data;
      if (responseData) {
        console.log('Emergency contact data received:', {
          name: responseData.emergencyContact,
          phone: responseData.emergencyPhone,
          relationship: responseData.emergencyContactRelationship,
          email: responseData.emergencyContactEmail,
          notes: responseData.emergencyContactNotes
        });
      }
      
      return responseData;
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
