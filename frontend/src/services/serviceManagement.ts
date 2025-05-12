import { Service } from '../types/service';
import api from './api';

export const serviceManagement = {
  // Get all services
  getAllServices: async () => {
    const response = await api.get('/api/services');
    return response.data;
  },

  // Get a single service by ID
  getServiceById: async (id: string) => {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },

  // Create a new service
  createService: async (serviceData: Omit<Service, 'id'>) => {
    const response = await api.post('/api/services', serviceData);
    return response.data;
  },

  // Update a service
  updateService: async (id: string, serviceData: Partial<Service>) => {
    // Ensure we only send the fields that the backend expects
    const {
      name,
      description,
      duration,
      price,
      serviceCategory,
      isActive,
      requiresStaff,
      notes,
      availableAddOns
    } = serviceData;

    const response = await api.put(`/api/services/${id}`, {
      name,
      description,
      duration,
      price,
      serviceCategory,
      isActive,
      requiresStaff,
      notes,
      availableAddOns: availableAddOns?.map(addOn => ({
        name: addOn.name,
        description: addOn.description,
        price: addOn.price,
        duration: addOn.duration
      }))
    });
    return response.data;
  },

  // Delete a service
  deleteService: async (id: string) => {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },

  // Deactivate a service (soft delete)
  deactivateService: async (id: string) => {
    const response = await api.patch(`/api/services/${id}/deactivate`);
    return response.data;
  },

  // Get add-ons for a service
  getServiceAddOns: async (id: string) => {
    console.log('serviceManagement: Getting add-ons for service ID:', id);
    
    try {
      // First, get the service details to check its category
      const serviceDetails = await api.get(`/api/services/${id}`);
      console.log('serviceManagement: Service details:', serviceDetails.data);
      
      // Extract service category
      let serviceCategory = '';
      if (serviceDetails.data) {
        if (serviceDetails.data.category) {
          serviceCategory = serviceDetails.data.category;
        } else if (serviceDetails.data.data && serviceDetails.data.data.serviceCategory) {
          serviceCategory = serviceDetails.data.data.serviceCategory;
        }
      }
      
      console.log(`serviceManagement: Service ${id} has category: ${serviceCategory}`);
      
      // Get the add-ons for this service
      const response = await api.get(`/api/services/${id}/add-ons`);
      console.log('serviceManagement: Raw add-ons response:', response);
      
      // If this is a grooming service, we should have add-ons
      if (serviceCategory === 'GROOMING') {
        console.log('serviceManagement: This is a GROOMING service, should have add-ons');
      }
      
      // Handle different response formats
      if (response && response.data) {
        // If the response is an array, return it directly
        if (Array.isArray(response.data)) {
          console.log(`serviceManagement: Found ${response.data.length} add-ons in array format`);
          return response.data;
        }
        
        // If the response has a data property that's an array, return that
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`serviceManagement: Found ${response.data.data.length} add-ons in nested data format`);
          return response.data.data;
        }
        
        // If the response has an addOns property that's an array, return that
        if (response.data.addOns && Array.isArray(response.data.addOns)) {
          console.log(`serviceManagement: Found ${response.data.addOns.length} add-ons in addOns property`);
          return response.data.addOns;
        }
        
        // Otherwise, return the response data as is
        return response.data;
      }
      
      console.warn('serviceManagement: No add-ons data found in response');
      return [];
    } catch (error: any) {
      console.error('serviceManagement: Error fetching add-ons:', error);
      console.error('serviceManagement: Error details:', error.message);
      if (error.response) {
        console.error('serviceManagement: Error response status:', error.response.status);
        console.error('serviceManagement: Error response data:', error.response.data);
      }
      throw error;
    }
  },

  // Get reservations for a service
  getServiceReservations: async (id: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get(`/api/services/${id}/reservations`, { params });
    return response.data;
  }
};
