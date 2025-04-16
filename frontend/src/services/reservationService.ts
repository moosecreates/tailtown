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
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  notes?: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  pet?: {
    id: string;
    name: string;
    type: string;
  };
  service?: {
    id: string;
    name: string;
  };
}

export const reservationService = {
  getAllReservations: async (page = 1, limit = 10): Promise<PaginatedResponse<Reservation>> => {
    try {
      const response: AxiosResponse = await api.get('/reservations', {
        params: { page, limit }
      });
      return {
        status: response.data.status || 'success',
        data: response.data.data,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page,
        results: response.data.data?.length || 0
      };
    } catch (error: any) {
      console.error('Error in getAllReservations:', error);
      throw error;
    }
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    try {
      const response: AxiosResponse = await api.get(`/reservations/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in getReservationById:', error);
      throw error;
    }
  },

  createReservation: async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
    try {
      const response: AxiosResponse = await api.post('/reservations', reservation);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in createReservation:', error);
      throw error;
    }
  },

  updateReservation: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
    try {
      const response: AxiosResponse = await api.patch(`/reservations/${id}`, reservation);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in updateReservation:', error);
      throw error;
    }
  },

  deleteReservation: async (id: string): Promise<void> => {
    try {
      await api.delete(`/reservations/${id}`);
    } catch (error: any) {
      console.error('Error in deleteReservation:', error);
      throw error;
    }
  },

  getReservationsByCustomer: async (customerId: string, page = 1, limit = 10): Promise<PaginatedResponse<Reservation>> => {
    try {
      const response: AxiosResponse = await api.get(`/reservations/customer/${customerId}`, {
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
      const response: AxiosResponse = await api.get(`/reservations/pet/${petId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in getReservationsByPet:', error);
      throw error;
    }
  }
};
