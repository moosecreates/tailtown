import { AxiosResponse } from 'axios';
import api from './api';
import { PaginatedResponse } from '../types/common';

export interface Reservation {
  id: string;
  customerId: string;
  petId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  staffNotes?: string;
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
    breed: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
  resource?: {
    id: string;
    name: string;
    type: string;
  };
}

export const reservationService = {
  getAllReservations: async (
    page = 1,
    limit = 10,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    status?: string
  ): Promise<{ status: string; data: Reservation[]; totalPages: number; currentPage: number; results: number }> => {
    try {
      const response: AxiosResponse = await api.get('/api/reservations', {
        params: { 
          page, 
          limit,
          sortBy,
          sortOrder,
          status
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllReservations:', error);
      throw error;
    }
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    try {
      const response: AxiosResponse = await api.get(`/api/reservations/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in getReservationById:', error);
      throw error;
    }
  },

  createReservation: async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
    try {
      const response: AxiosResponse = await api.post('/api/reservations', reservation);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in createReservation:', error);
      throw error;
    }
  },

  updateReservation: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      console.log('Sending update request:', { id, data: reservation });
      const response: AxiosResponse = await api.put(`/api/reservations/${id}`, reservation);
      console.log('Update response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in updateReservation:', error);
      throw error;
    }
  },

  deleteReservation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/reservations/${id}`);
    } catch (error: any) {
      console.error('Error in deleteReservation:', error);
      throw error;
    }
  },

  getReservationsByCustomer: async (customerId: string, page = 1, limit = 10): Promise<PaginatedResponse<Reservation>> => {
    try {
      const response: AxiosResponse = await api.get(`/api/reservations/customer/${customerId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getReservationsByCustomer:', error);
      throw error;
    }
  },

  getReservationsByPet: async (petId: string, page = 1, limit = 10): Promise<PaginatedResponse<Reservation>> => {
    try {
      const response: AxiosResponse = await api.get(`/api/reservations/pet/${petId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getReservationsByPet:', error);
      throw error;
    }
  },

  getTodayRevenue: async (): Promise<{ revenue: number }> => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const response: AxiosResponse = await api.get('/api/reservations/revenue/today');
      return response.data;
    } catch (error: any) {
      console.error('Error in getTodayRevenue:', error);
      throw error;
    }
  }
};
