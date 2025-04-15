import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

export interface Pet {
  id: string;
  name: string;
  type: 'DOG' | 'CAT' | 'OTHER';
  breed: string | null;
  color: string | null;
  birthdate: string | null;
  weight: number | null;
  gender: 'MALE' | 'FEMALE' | null;
  isNeutered: boolean;
  microchipNumber: string | null;
  specialNeeds: string | null;
  behaviorNotes: string | null;
  customerId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  medicalRecords?: any[];
  vaccineStatus?: {
    [key: string]: {
      status: 'CURRENT' | 'EXPIRED' | 'PENDING';
      expirationDate: string;
    };
  };
}

export const petService = {
  getAllPets: async (): Promise<Pet[]> => {
    try {
      console.log('Making GET request to:', `${API_URL}/pets`);
      const response = await axios.get(`${API_URL}/pets`);
      console.log('Response:', response);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error in getAllPets:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  getPetById: async (id: string): Promise<Pet> => {
    try {
      console.log('Making GET request to:', `${API_URL}/pets/${id}`);
      const response = await axios.get(`${API_URL}/pets/${id}`);
      console.log('Response:', response);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in getPetById:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  createPet: async (pet: Omit<Pet, 'id'>): Promise<Pet> => {
    try {
      console.log('Making POST request to:', `${API_URL}/pets`);
      console.log('With data:', pet);
      const response = await axios.post(`${API_URL}/pets`, pet);
      console.log('Response:', response);
      if (!response.data?.data) {
        throw new Error('No data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error in createPet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  updatePet: async (id: string, pet: Partial<Pet>): Promise<Pet> => {
    try {
      console.log('Making PUT request to:', `${API_URL}/pets/${id}`);
      console.log('With data:', pet);
      const response = await axios.put(`${API_URL}/pets/${id}`, pet);
      console.log('Response:', response);
      if (!response.data?.data) {
        throw new Error('No data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error in updatePet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  deletePet: async (id: string): Promise<void> => {
    try {
      console.log('Making DELETE request to:', `${API_URL}/pets/${id}?permanent=true`);
      await axios.delete(`${API_URL}/pets/${id}?permanent=true`);
    } catch (error: any) {
      console.error('Error in deletePet:', error);
      console.error('Response:', error.response);
      throw error;
    }
  },

  getPetMedicalRecords: async (id: string): Promise<any[]> => {
    try {
      console.log('Making GET request to:', `${API_URL}/pets/${id}/medical-records`);
      const response = await axios.get(`${API_URL}/pets/${id}/medical-records`);
      console.log('Response:', response);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error in getPetMedicalRecords:', error);
      console.error('Response:', error.response);
      throw error;
    }
  }
};
