import api from './api';
import { AxiosResponse } from 'axios';

export interface Pet {
  id: string;
  name: string;
  type: 'DOG' | 'CAT' | 'OTHER';
  breed: string | null;
  color: string | null;
  // Format: YYYY-MM-DD for input, ISO string for API
  birthdate: string | null;
  weight: number | null;
  gender: 'MALE' | 'FEMALE' | null;
  isNeutered: boolean;
  microchipNumber: string | null;
  rabiesTagNumber: string | null;
  profilePhoto: string | null;
  specialNeeds: string | null;
  behaviorNotes: string | null;
  foodNotes: string | null;
  medicationNotes: string | null;
  allergies: string | null;
  vetName: string | null;
  vetPhone: string | null;
  customerId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  medicalRecords?: any[];
  vaccinationStatus?: {
    [key: string]: {
      status: 'CURRENT' | 'EXPIRED' | 'PENDING';
      lastGiven?: string;
      notes?: string;
    };
  };
  vaccineExpirations?: {
    [key: string]: string; // ISO date string
  };
}

export const petService = {
  getAllPets: async (): Promise<Pet[]> => {
    try {
      console.log('Getting all pets...');
      const response: AxiosResponse = await api.get('/pets');
      console.log('Response:', response);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error in getAllPets:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  getPetById: async (id: string): Promise<Pet> => {
    try {
      console.log('Getting pet by id:', id);
      const response: AxiosResponse = await api.get(`/pets/${id}`);
      console.log('Response:', response);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error in getPetById:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  createPet: async (pet: Omit<Pet, 'id'>): Promise<Pet> => {
    try {
      console.log('Creating pet:', pet);
      const response: AxiosResponse = await api.post('/pets', pet);
      console.log('Response:', response);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error in createPet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  updatePet: async (id: string, pet: Partial<Pet>): Promise<Pet> => {
    try {
      console.log('Updating pet:', id, pet);
      const response: AxiosResponse = await api.put(`/pets/${id}`, pet);
      console.log('Response:', response);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error in updatePet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  deletePet: async (id: string): Promise<void> => {
    try {
      console.log('Deleting pet:', id);
      await api.delete(`/pets/${id}?permanent=true`);
    } catch (error: any) {
      console.error('Error in deletePet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  uploadPetPhoto: async (id: string, file: File): Promise<Pet> => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      console.log('Uploading pet photo:', id);
      const response: AxiosResponse = await api.post(`/pets/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error in uploadPetPhoto:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  getPetMedicalRecords: async (id: string): Promise<any[]> => {
    try {
      console.log('Getting pet medical records:', id);
      const response: AxiosResponse = await api.get(`/pets/${id}/medical-records`);
      console.log('Response:', response);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error in getPetMedicalRecords:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
