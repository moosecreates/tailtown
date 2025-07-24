import { Service } from '../types/service';
import api, { reservationApi, customerApi } from './api';

export const serviceManagement = {
  // Get all services
  getAllServices: async () => {
    try {
      console.log('Fetching services from customer API');
      const response = await customerApi.get('/api/v1/services');
      console.log('Services response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get a single service by ID
  getServiceById: async (id: string, includeDeleted: boolean = false) => {
    try {
      const response = await customerApi.get(`/api/v1/services/${id}`, {
        params: { includeDeleted }
      });
      return response.data;
    } catch (error: any) {
      // If the service is not found or inactive, handle gracefully
      if (error.response && error.response.status === 404) {
        throw new Error('Service not found or has been deleted');
      }
      throw error;
    }
  },

  // Create a new service
  createService: async (serviceData: Omit<Service, 'id'>) => {
    const response = await customerApi.post('/api/v1/services', serviceData);
    return response.data;
  },

  // Update a service
  updateService: async (id: string, serviceData: Partial<Service>) => {
    try {
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

      // Make sure isActive is always included and set to true if updating a deactivated service
      const updatedData = {
        name,
        description,
        duration,
        price,
        serviceCategory,
        isActive: isActive !== undefined ? isActive : true,
        requiresStaff,
        notes,
        availableAddOns: availableAddOns?.map(addOn => ({
          name: addOn.name,
          description: addOn.description,
          price: addOn.price,
          duration: addOn.duration
        }))
      };

      console.log('Updating service with data:', updatedData);
      
      const response = await customerApi.put(`/api/v1/services/${id}`, updatedData);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      let errorMessage = 'Failed to update service';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Soft delete a service (mark as inactive)
  deleteService: async (id: string) => {
    try {
      const response = await customerApi.delete(`/api/v1/services/${id}`);
      return response.data;
    } catch (error: any) {
      // Handle error cases
      let errorMessage = 'Failed to delete service';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Deactivate a service (mark as inactive)
  deactivateService: async (id: string) => {
    try {
      // This sends a PATCH with isActive: false to deactivate instead of delete
      const response = await customerApi.patch(`/api/v1/services/${id}`, { isActive: false });
      return response.data;
    } catch (error: any) {
      // Handle error cases
      let errorMessage = 'Failed to deactivate service';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get add-ons for a service
  getServiceAddOns: async (id: string) => {
    console.log('serviceManagement: Getting add-ons for service ID:', id);
    
    try {
      // First, get the service details to check its category
      const serviceDetails = await customerApi.get(`/api/v1/services/${id}`);
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
      const addOnsResponse = await customerApi.get(`/api/v1/services/${id}/add-ons`);
      console.log('serviceManagement: Raw add-ons response:', addOnsResponse);
      
      // If this is a grooming service, we should have add-ons
      if (serviceCategory === 'GROOMING') {
        console.log('This is a grooming service, processing add-ons');
      }
      
      // Handle different response formats
      if (addOnsResponse && addOnsResponse.data) {
        // If the response is an array, return it directly
        if (Array.isArray(addOnsResponse.data)) {
          console.log(`serviceManagement: Found ${addOnsResponse.data.length} add-ons in array format`);
          return addOnsResponse.data;
        }
        
        // If the response has a data property that's an array, return that
        if (addOnsResponse.data.data && Array.isArray(addOnsResponse.data.data)) {
          console.log(`serviceManagement: Found ${addOnsResponse.data.data.length} add-ons in nested data format`);
          return addOnsResponse.data.data;
        }
        
        // If the response has an addOns property that's an array, return that
        if (addOnsResponse.data.addOns && Array.isArray(addOnsResponse.data.addOns)) {
          console.log(`serviceManagement: Found ${addOnsResponse.data.addOns.length} add-ons in addOns property`);
          return addOnsResponse.data.addOns;
        }
        
        // Otherwise, return the response data as is
        return addOnsResponse.data;
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
    const response = await api.get(`/api/v1/services/${id}/reservations`, { params });
    return response.data;
  }
};
