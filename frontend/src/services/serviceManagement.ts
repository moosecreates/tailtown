import axios from 'axios';
import { Service } from '../types/service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Get all services
export const getAllServices = async () => {
  const response = await axios.get(`${API_URL}/services`);
  return response.data;
};

// Get a single service by ID
export const getServiceById = async (id: string) => {
  const response = await axios.get(`${API_URL}/services/${id}`);
  return response.data;
};

// Create a new service
export const createService = async (serviceData: Omit<Service, 'id'>) => {
  const response = await axios.post(`${API_URL}/services`, serviceData);
  return response.data;
};

// Update a service
export const updateService = async (id: string, serviceData: Partial<Service>) => {
  const response = await axios.put(`${API_URL}/services/${id}`, serviceData);
  return response.data;
};

// Delete a service
export const deleteService = async (id: string) => {
  const response = await axios.delete(`${API_URL}/services/${id}`);
  return response.data;
};

// Deactivate a service (soft delete)
export const deactivateService = async (id: string) => {
  const response = await axios.patch(`${API_URL}/services/${id}/deactivate`);
  return response.data;
};

// Get add-ons for a service
export const getServiceAddOns = async (id: string) => {
  const response = await axios.get(`${API_URL}/services/${id}/add-ons`);
  return response.data;
};

// Get reservations for a service
export const getServiceReservations = async (id: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axios.get(`${API_URL}/services/${id}/reservations`, { params });
  return response.data;
};
