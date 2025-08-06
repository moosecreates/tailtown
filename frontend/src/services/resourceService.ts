import { AxiosResponse } from 'axios';
import { reservationApi as api } from './api';
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
  
  // Additional properties for different response formats
  resourceId?: string;     // Alternative ID field used in some API responses
  resourceName?: string;   // Alternative name field used in some API responses
  resourceType?: string;   // Alternative type field used in some API responses
  number?: number;         // Alternative to suiteNumber in some API responses
  isAvailable?: boolean;   // Availability status from availability endpoints
  conflictingReservations?: any[]; // Reservations that conflict with availability
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

  // Suite-specific methods - using resource endpoints with filters
  getSuites: async (
    type?: string,
    status?: string,
    search?: string,
    date?: string
  ): Promise<{ status: string; data: Resource[]; results?: number }> => {
    try {
      // Use the resources endpoint with type filter for suites
      // All suites are resources with type containing "SUITE"
      // Use a dynamic type filter to match all suite types in the database
      const suiteTypes = ['STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE', 'SUITE'];
      
      // To get all resources, implement pagination
      let allResources: Resource[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const pageSize = 100; // Fetch 100 per page for efficiency
      
      console.log('Fetching all suite resources with pagination');
      
      // Continue fetching pages until we've got all resources
      do {
        // If a specific type is provided, use it; otherwise, query for all suite types
        const response: AxiosResponse = await api.get('/api/resources', {
          params: { 
            // Use the provided type or query for all types containing 'SUITE'
            type: type || suiteTypes.join(','),
            status,
            search,
            date,
            page: currentPage,
            limit: pageSize
          }
        });
        
        if (response?.data?.status === 'success' && Array.isArray(response?.data?.data)) {
          // Add resources from this page to our collection
          allResources = [...allResources, ...response.data.data];
          
          // Update pagination tracking
          currentPage++;
          totalPages = response.data.totalPages || 1;
          
          console.log(`Fetched page ${currentPage-1} of ${totalPages}, got ${response.data.data.length} resources, total so far: ${allResources.length}`);
        } else {
          break; // Exit the loop if we got an invalid response
        }
      } while (currentPage <= totalPages);
      
      console.log(`Completed fetching all resources. Total: ${allResources.length}`);
      
      // Return the same structure as the API but with all resources combined
      return {
        status: 'success',
        data: allResources,
        results: allResources.length
      };
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
      reserved: number;
      maintenance: number;
      needsCleaning: number;
      occupancyRate: number;
    }
  }> => {
    try {
      console.log('Fetching suite stats for date:', date);
      
      // First, get all suites with pagination
      const suiteTypes = ['STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE', 'SUITE'];
      let allSuites: Resource[] = [];
      let currentPage = 1;
      let totalPages = 1;
      const pageSize = 100; // Fetch 100 per page for efficiency
      
      // Fetch all suites across pagination
      do {
        const response: AxiosResponse = await api.get('/api/resources', {
          params: { 
            type: suiteTypes.join(','),
            date,
            page: currentPage,
            limit: pageSize
          }
        });
        
        if (response?.data?.status === 'success' && Array.isArray(response?.data?.data)) {
          const { data, totalPages: pages, currentPage: page } = response.data;
          allSuites = [...allSuites, ...data];
          
          totalPages = pages || 1;
          currentPage += 1;
          
          console.log(`Stats: Fetched page ${page} of ${pages}, got ${data.length} resources, total so far: ${allSuites.length}`);
        } else {
          break; // Exit if the response format is unexpected
        }
      } while (currentPage <= totalPages);
      
      console.log(`Stats: Completed fetching all resources. Total: ${allSuites.length}`);
      
      // Now fetch reservations for this date to determine occupied and reserved suites
      const reservationsResponse: AxiosResponse = await api.get('/api/reservations', {
        params: {
          date,
          status: ['CONFIRMED', 'CHECKED_IN'].join(',') // Only include active reservations
        }
      });
      
      // Extract reservations and organize by suiteId/resourceId
      const reservationsBySuiteId: Record<string, any[]> = {};
      
      if (reservationsResponse?.data?.status === 'success' && Array.isArray(reservationsResponse?.data?.data)) {
        const reservations = reservationsResponse.data.data;
        console.log(`Fetched ${reservations.length} reservations for date ${date}`);
        
        // Map reservations to suites
        reservations.forEach((reservation: any) => {
          const resourceId = reservation.resourceId || reservation.suiteId || reservation.kennelId;
          if (resourceId) {
            if (!reservationsBySuiteId[resourceId]) {
              reservationsBySuiteId[resourceId] = [];
            }
            reservationsBySuiteId[resourceId].push(reservation);
          }
        });
      }
      
      // Calculate stats
      let total = 0;
      let available = 0;
      let occupied = 0;
      let reserved = 0;
      let maintenance = 0;
      let needsCleaning = 0;
      
      // Debug: Log sample suite data
      console.log('Calculating stats for', allSuites.length, 'suites');
      if (allSuites.length > 0) {
        const sample = allSuites[0];
        console.log('Sample suite data:', {
          id: sample.id,
          type: sample.type,
          maintenanceStatus: sample.attributes?.maintenanceStatus,
          hasReservations: reservationsBySuiteId[sample.id] ? true : false
        });
      }
      
      allSuites.forEach(suite => {
        total += 1;
        
        // Check for maintenance status
        const isInMaintenance = suite.attributes?.maintenanceStatus === 'MAINTENANCE';
        
        // Check for reservations
        const suiteReservations = reservationsBySuiteId[suite.id] || [];
        const hasActiveReservations = suiteReservations.length > 0;
        
        // Determine if any active reservations are CHECKED_IN (occupied) vs just CONFIRMED (reserved)
        const isOccupied = hasActiveReservations && 
          suiteReservations.some(res => res.status === 'CHECKED_IN');
        
        const isReserved = hasActiveReservations && 
          !isOccupied && // Not already counted as occupied
          suiteReservations.some(res => res.status === 'CONFIRMED');
        
        // Update stats based on status
        if (isInMaintenance) {
          maintenance += 1;
        } else if (isOccupied) {
          occupied += 1;
        } else if (isReserved) {
          reserved += 1;
        } else {
          available += 1;
        }
      });
      
      // Calculate occupancy rate (including both occupied and reserved)
      const occupancyRate = total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0;
      
      console.log(`Stats calculated: Total=${total}, Occupied=${occupied}, Reserved=${reserved}, Available=${available}, Maintenance=${maintenance}, Occupancy Rate=${occupancyRate}%`);
      
      

      return {
        status: 'success',
        data: {
          total,
          occupied,
          reserved,
          available,
          maintenance,
          needsCleaning,
          occupancyRate
        }
      };
    } catch (error: any) {
      console.error('Error in getSuiteStats:', error);
      throw error;
    }
  },

  updateSuiteCleaning: async (id: string, data: { maintenanceStatus: string, notes?: string }): Promise<{ status: string; data: Resource }> => {
    try {
      // Use the standard resource update endpoint instead
      const response: AxiosResponse = await api.patch(`/api/resources/${id}`, {
        maintenanceStatus: data.maintenanceStatus,
        notes: data.notes
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in updateSuiteCleaning:', error);
      throw error;
    }
  },

  // This method would require a special endpoint on the backend
  // For now, we'll implement a fallback that returns a helpful message
  initializeSuites: async (options: { count: number, vipCount: number, standardPlusCount: number }): Promise<{ status: string; message: string; data: any }> => {
    try {
      // Since this is a specialized operation, we don't have a direct equivalent in the resource API
      // In a production environment, you would implement this endpoint on the backend
      console.warn('Suite initialization endpoint not available in this version');
      return {
        status: 'error',
        message: 'Suite initialization is not available in this version of the API',
        data: null
      };
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
  },

  /**
   * Check if a specific resource is available on a given date
   * Uses the new backend resource availability API
   * 
   * @param resourceId - ID of the resource to check
   * @param date - Date to check in YYYY-MM-DD format
   * @returns Promise resolving to an object with availability status and conflicting reservations
   */
  checkResourceAvailability: async (
    resourceId: string,
    date: string
  ): Promise<{ 
    status: string; 
    data: {
      resourceId: string;
      isAvailable: boolean;
      checkDate: string;
      conflictingReservations?: any[];
    } 
  }> => {
    try {
      const response: AxiosResponse = await api.get('/api/v1/resources/availability', {
        params: { resourceId, date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in checkResourceAvailability:', error);
      throw error;
    }
  },

  /**
   * Check availability for multiple resources at once
   * Uses the new backend batch resource availability API
   * 
   * @param resourceIds - Array of resource IDs to check
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Promise resolving to an object with availability status for each resource
   */
  batchCheckResourceAvailability: async (
    resourceIds: string[],
    startDate: string,
    endDate: string
  ): Promise<{ 
    status: string; 
    data: {
      checkDate: string | null;
      checkStartDate: string;
      checkEndDate: string;
      resources: Array<{
        resourceId: string;
        isAvailable: boolean;
        conflictingReservations?: any[];
      }>;
    } 
  }> => {
    try {
      // Using the correct endpoint path that exists in the backend
      const response: AxiosResponse = await api.post('/api/resources/availability/batch', {
        resources: resourceIds, // Also fixing the parameter name to match what the backend expects
        startDate,
        endDate
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in batchCheckResourceAvailability:', error);
      throw error;
    }
  }
};
