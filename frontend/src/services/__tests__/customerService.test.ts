/**
 * Customer Service Tests
 * Tests for customer API service layer
 */

import { customerService } from '../customerService';
import { customerApi } from '../api';

jest.mock('../api', () => ({
  customerApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockCustomerApi = customerApi as jest.Mocked<typeof customerApi>;

describe('customerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should fetch all customers with pagination', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
          ],
          totalPages: 5,
          currentPage: 1
        }
      };

      mockCustomerApi.get.mockResolvedValue(mockResponse);

      const result = await customerService.getAllCustomers(1, 10);

      expect(mockCustomerApi.get).toHaveBeenCalledWith('/api/customers', {
        params: { page: 1, limit: 10 }
      });
      expect(result.data).toHaveLength(2);
      expect(result.totalPages).toBe(5);
    });

    it('should use default pagination values', async () => {
      const mockResponse = { data: { data: [], totalPages: 0, currentPage: 1 } };
      mockCustomerApi.get.mockResolvedValue(mockResponse);

      await customerService.getAllCustomers();

      expect(mockCustomerApi.get).toHaveBeenCalledWith('/api/customers', {
        params: { page: 1, limit: 10 }
      });
    });

    it('should handle API errors', async () => {
      mockCustomerApi.get.mockRejectedValue(new Error('Network error'));

      await expect(customerService.getAllCustomers()).rejects.toThrow('Network error');
    });
  });

  describe('getCustomerById', () => {
    it('should fetch a customer by ID', async () => {
      const mockCustomer = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234'
      };

      mockCustomerApi.get.mockResolvedValue({ data: mockCustomer });

      const result = await customerService.getCustomerById('123');

      expect(mockCustomerApi.get).toHaveBeenCalledWith('/api/customers/123');
      expect(result).toEqual(mockCustomer);
    });

    it('should handle not found errors', async () => {
      mockCustomerApi.get.mockRejectedValue(new Error('Customer not found'));

      await expect(customerService.getCustomerById('999')).rejects.toThrow('Customer not found');
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234'
      };

      const mockResponse = {
        data: { id: '123', ...newCustomer }
      };

      mockCustomerApi.post.mockResolvedValue(mockResponse);

      const result = await customerService.createCustomer(newCustomer);

      expect(mockCustomerApi.post).toHaveBeenCalledWith('/api/customers', newCustomer);
      expect(result.id).toBe('123');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle validation errors', async () => {
      const invalidCustomer = { firstName: '', lastName: '', email: 'invalid' };

      mockCustomerApi.post.mockRejectedValue(new Error('Validation failed'));

      await expect(customerService.createCustomer(invalidCustomer as any))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('updateCustomer', () => {
    it('should update an existing customer', async () => {
      const updates = {
        firstName: 'Jane',
        phone: '555-5678'
      };

      const mockResponse = {
        data: { id: '123', ...updates, lastName: 'Doe', email: 'jane@example.com' }
      };

      mockCustomerApi.put.mockResolvedValue(mockResponse);

      const result = await customerService.updateCustomer('123', updates);

      expect(mockCustomerApi.put).toHaveBeenCalledWith('/api/customers/123', updates);
      expect(result.firstName).toBe('Jane');
      expect(result.phone).toBe('555-5678');
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      mockCustomerApi.delete.mockResolvedValue({ data: { success: true } });

      await customerService.deleteCustomer('123');

      expect(mockCustomerApi.delete).toHaveBeenCalledWith('/api/customers/123');
    });

    it('should handle delete errors', async () => {
      mockCustomerApi.delete.mockRejectedValue(new Error('Cannot delete customer with active reservations'));

      await expect(customerService.deleteCustomer('123'))
        .rejects.toThrow('Cannot delete customer with active reservations');
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by query', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
          ],
          totalPages: 1,
          currentPage: 1
        }
      };

      mockCustomerApi.get.mockResolvedValue(mockResponse);

      const result = await customerService.searchCustomers('john', 1, 10);

      expect(mockCustomerApi.get).toHaveBeenCalledWith('/api/customers/search', {
        params: { q: 'john', page: 1, limit: 10 }
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
    });

    it('should return empty results for no matches', async () => {
      const mockResponse = {
        data: { data: [], totalPages: 0, currentPage: 1 }
      };

      mockCustomerApi.get.mockResolvedValue(mockResponse);

      const result = await customerService.searchCustomers('nonexistent');

      expect(result.data).toHaveLength(0);
    });
  });

});

