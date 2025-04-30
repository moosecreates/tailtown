import { AxiosResponse } from 'axios';
import api from './api';
import { PaginatedResponse } from '../types/common';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';

export interface Resource {
  id: string;
  name: string;
  type: string;
  description?: string;
  capacity: number;
  availability?: string;
  location?: string;
  // Direct columns for suite properties
  suiteNumber?: number;
  lastCleanedAt?: Date | string | null;
  maintenanceStatus?: string;
  // JSON attributes for flexible, non-queryable properties
  attributes?: {
    suiteType?: string;
    amenities?: string[];
    size?: string;
    location?: string;
    [key: string]: any;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reservations?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    pet: {
      id: string;
      name: string;
      type: string;
      owner?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

export const resourceService = {
  getAllResources: async (
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    type?: string
  ): Promise<{ status: string; data: Resource[]; totalPages?: number; currentPage?: number; results?: number }> => {
    try {
      const response: AxiosResponse = await api.get('/api/resources', {
        params: { 
          page, 
          limit,
          sortBy,
          sortOrder,
          type
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllResources:', error);
      throw error;
    }
  },

  getResource: async (id: string, date?: string): Promise<{ status: string; data: Resource }> => {
    try {
      // Use the date provided or get today's date
      const formattedDate = date || formatDateToYYYYMMDD(new Date());
      console.log(`Fetching resource ${id} for date: ${formattedDate}`);
      
      // Get the resource details with the date parameter to include reservations
      const resourceResponse: AxiosResponse = await api.get(`/api/resources/${id}`, {
        params: {
          date: formattedDate
        }
      });
      
      // If no reservations array, initialize it
      if (!resourceResponse.data.data.reservations) {
        resourceResponse.data.data.reservations = [];
      }
      
      // Direct approach: Fetch all reservations for this specific resource on the given date
      console.log(`Fetching reservations for resource ${id} with date ${formattedDate}`);
      const reservationsResponse: AxiosResponse = await api.get(`/api/reservations`, {
        params: {
          resourceId: id,
          date: formattedDate,
          status: 'PENDING,CONFIRMED,CHECKED_IN' // Include pending reservations too
        }
      });
      console.log('Reservations API response:', reservationsResponse.data);
      
      // If we have reservations, add them to the resource
      if (reservationsResponse.data?.status === 'success' && 
          Array.isArray(reservationsResponse.data?.data) && 
          reservationsResponse.data.data.length > 0) {
        
        // Replace the reservations with the ones we just fetched
        resourceResponse.data.data.reservations = reservationsResponse.data.data;
        console.log(`Found ${reservationsResponse.data.data.length} reservations for suite ${id} on date ${formattedDate}`);
      } else {
        // Ensure we have an empty array if no reservations were found
        resourceResponse.data.data.reservations = [];
        console.log(`No active reservations found for suite ${id} on date ${formattedDate}`);
      }
      
      return resourceResponse.data;
    } catch (error: any) {
      console.error('Error in getResource:', error);
      throw error;
    }
  },

  createResource: async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ status: string; data: Resource }> => {
    try {
      const response: AxiosResponse = await api.post('/api/resources', resource);
      return response.data;
    } catch (error: any) {
      console.error('Error in createResource:', error);
      throw error;
    }
  },

  updateResource: async (id: string, resource: Partial<Resource>): Promise<{ status: string; data: Resource }> => {
    try {
      const response: AxiosResponse = await api.put(`/api/resources/${id}`, resource);
      return response.data;
    } catch (error: any) {
      console.error('Error in updateResource:', error);
      throw error;
    }
  },

  deleteResource: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/resources/${id}`);
    } catch (error: any) {
      console.error('Error in deleteResource:', error);
      throw error;
    }
  },

  // Suite-specific methods
  getSuites: async (
    type?: string,
    status?: string,
    search?: string,
    date?: string
  ): Promise<{ status: string; data: Resource[]; results?: number }> => {
    try {
      const response: AxiosResponse = await api.get('/api/suites', {
        params: { 
          type,
          status,
          search,
          date
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getSuites:', error);
      throw error;
    }
  },

  getSuiteStats: async (date?: string): Promise<{ 
    status: string; 
    data: {
      total: number;
      occupied: number;
      available: number;
      maintenance: number;
      needsCleaning: number;
      occupancyRate: number;
    }
  }> => {
    try {
      const response: AxiosResponse = await api.get('/api/suites/stats', {
        params: { date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getSuiteStats:', error);
      throw error;
    }
  },

  updateSuiteCleaning: async (id: string, data: { maintenanceStatus: string, notes?: string }): Promise<{ status: string; data: Resource }> => {
    try {
      const response: AxiosResponse = await api.put(`/api/suites/${id}/cleaning`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error in updateSuiteCleaning:', error);
      throw error;
    }
  },

  initializeSuites: async (options: { count: number, vipCount: number, standardPlusCount: number }): Promise<{ status: string; message: string; data: any }> => {
    try {
      const response: AxiosResponse = await api.post('/api/suites/initialize', options);
      return response.data;
    } catch (error: any) {
      console.error('Error in initializeSuites:', error);
      throw error;
    }
  },

  // Get available resources by date range
  getAvailableResourcesByDate: async (
    startDate: string,
    endDate: string,
    serviceId?: string
  ): Promise<{ status: string; data: Resource[] }> => {
    try {
      const response: AxiosResponse = await api.get('/api/resources/available', {
        params: {
          startDate,
          endDate,
          serviceId
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getAvailableResourcesByDate:', error);
      throw error;
    }
  }
};
