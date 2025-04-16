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
      color,
      serviceCategory,
      isActive,
      capacityLimit,
      requiresStaff,
      notes,
      availableAddOns
    } = serviceData;

    const response = await api.put(`/api/services/${id}`, {
      name,
      description,
      duration,
      price,
      color,
      serviceCategory,
      isActive,
      capacityLimit,
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
    const response = await api.get(`/api/services/${id}/add-ons`);
    return response.data;
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
