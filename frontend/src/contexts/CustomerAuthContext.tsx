/**
 * CustomerAuthContext - Authentication for customer-facing booking portal
 * Separate from staff AuthContext to keep customer and staff auth isolated
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (customerData: any) => Promise<void>;
  logout: () => void;
  updateCustomer: (data: Partial<Customer>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedCustomer = localStorage.getItem('customer');
        if (savedCustomer) {
          setCustomer(JSON.parse(savedCustomer));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO(auth): Implement actual customer login API endpoint
      // Current: Simulated login via customer search
      // Needed: POST /api/customers/auth/login endpoint
      // - Verify email and password hash
      // - Generate JWT token
      // - Return customer data with token
      // - Store token in localStorage/sessionStorage
      const response = await customerService.searchCustomers(email, 1, 1);
      
      if (response.data && response.data.length > 0) {
        const customerData = response.data[0];
        setCustomer(customerData);
        localStorage.setItem('customer', JSON.stringify(customerData));
      } else {
        throw new Error('Customer not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (customerData: any) => {
    try {
      // Create new customer account
      const newCustomer = await customerService.createCustomer({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode,
        emergencyContact: customerData.emergencyContact,
        emergencyPhone: customerData.emergencyPhone,
        isActive: true
      });

      setCustomer(newCustomer);
      localStorage.setItem('customer', JSON.stringify(newCustomer));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer');
  };

  const updateCustomer = (data: Partial<Customer>) => {
    if (customer) {
      const updated = { ...customer, ...data };
      setCustomer(updated);
      localStorage.setItem('customer', JSON.stringify(updated));
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        signup,
        logout,
        updateCustomer
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
