import { Resource, ResourceAvailability } from '../types/resource';
import api from './api';

// Get all resources
export const getAllResources = async () => {
  try {
    console.log('Getting all resources...');
    const response = await api.get('/resources');
    console.log('Response:', response);
    if (response.data.status === 'success') {
      return response.data.data || [];
    }
    throw new Error('Failed to get resources');
  } catch (error: any) {
    console.error('Error getting resources:', error.response?.data || error.message);
    throw error;
  }
};

// Get a single resource by ID
export const getResourceById = async (id: string) => {
  try {
    console.log('Getting resource:', id);
    const response = await api.get(`/resources/${id}`);
    console.log('Response:', response);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting resource:', error.response?.data || error.message);
    throw error;
  }
};

// Create a new resource
export const createResource = async (resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('Creating resource:', resourceData);
    const response = await api.post('/resources', {
      ...resourceData,
      isActive: true,
      attributes: resourceData.attributes || {}
    });
    console.log('Response:', response);
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Failed to create resource');
  } catch (error: any) {
    console.error('Error creating resource:', error.response?.data || error.message);
    throw error;
  }
};

// Update a resource
export const updateResource = async (id: string, resourceData: Partial<Resource>) => {
  try {
    console.log('Updating resource:', id, resourceData);
    const response = await api.put(`/resources/${id}`, resourceData);
    console.log('Response:', response);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating resource:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a resource
export const deleteResource = async (id: string) => {
  try {
    console.log('Deleting resource:', id);
    const response = await api.delete(`/resources/${id}`);
    console.log('Response:', response);
    return response.data.data;
  } catch (error: any) {
    console.error('Error deleting resource:', error.response?.data || error.message);
    throw error;
  }
};

// Create availability slot
export const createAvailabilitySlot = async (
  resourceId: string,
  slotData: Omit<ResourceAvailability, 'id' | 'resourceId' | 'createdAt' | 'updatedAt'>
) => {
  const response = await api.post(`/resources/${resourceId}/availability`, slotData);
  return response.data;
};

// Update availability slot
export const updateAvailabilitySlot = async (
  id: string,
  slotData: Partial<Omit<ResourceAvailability, 'id' | 'resourceId' | 'createdAt' | 'updatedAt'>>
) => {
  const response = await api.put(`/resources/availability/${id}`, slotData);
  return response.data;
};

// Delete availability slot
export const deleteAvailabilitySlot = async (id: string) => {
  const response = await api.delete(`/resources/availability/${id}`);
  return response.data;
};
