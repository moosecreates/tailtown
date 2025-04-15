import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  portalEnabled?: boolean;
  preferredContact?: 'EMAIL' | 'SMS' | 'BOTH';
  emergencyContact?: string;
  emergencyPhone?: string;
  vatTaxId?: string;
  referralSource?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pets?: any[];
  notifications?: any;
}

export const customerService = {
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data.data || [];
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
    await axios.delete(`${API_URL}/customers/${id}`);
  }
};
