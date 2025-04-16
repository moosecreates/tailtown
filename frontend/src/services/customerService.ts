import axios from 'axios';
import { PaginatedResponse } from '../types/common';
import { Customer } from '../types/customer';

const API_URL = 'http://localhost:3002/api';

export type { Customer };

export const customerService = {
  getAllCustomers: async (): Promise<PaginatedResponse<Customer>> => {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      console.log('Making POST request to:', `${API_URL}/customers`);
      console.log('With data:', customer);
      const response = await axios.post(`${API_URL}/customers`, customer);
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
      console.log('Making PUT request to:', `${API_URL}/customers/${id}`);
      console.log('With data:', customer);
      const response = await axios.put(`${API_URL}/customers/${id}`, customer);
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
      console.log('Making DELETE request to:', `${API_URL}/customers/${id}?permanent=true`);
      await axios.delete(`${API_URL}/customers/${id}?permanent=true`);
    } catch (error: any) {
      console.error('Error in deleteCustomer:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
