/**
 * Reference Data Service
 * 
 * Handles API calls for reference data (breeds, vets, temperaments)
 * imported from Gingr
 */

import api from './api';

export interface Breed {
  id: string;
  name: string;
  species: string;
  gingrId?: string;
  isActive: boolean;
}

export interface Veterinarian {
  id: string;
  name: string;
  phone?: string;
  fax?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  isActive: boolean;
}

export interface TemperamentType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PetTemperament {
  id: string;
  petId: string;
  temperament: string;
}

class ReferenceDataService {
  /**
   * Get all breeds, optionally filtered by species
   */
  async getBreeds(species?: string): Promise<Breed[]> {
    try {
      const params = species ? { species } : {};
      const response = await api.get('/breeds', { params });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching breeds:', error);
      throw error;
    }
  }

  /**
   * Get all veterinarians
   */
  async getVeterinarians(): Promise<Veterinarian[]> {
    try {
      const response = await api.get('/veterinarians');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      throw error;
    }
  }

  /**
   * Get all temperament types
   */
  async getTemperamentTypes(): Promise<TemperamentType[]> {
    try {
      const response = await api.get('/temperament-types');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching temperament types:', error);
      throw error;
    }
  }

  /**
   * Get temperaments for a specific pet
   */
  async getPetTemperaments(petId: string): Promise<PetTemperament[]> {
    try {
      const response = await api.get(`/pets/${petId}/temperaments`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching pet temperaments:', error);
      throw error;
    }
  }

  /**
   * Update temperaments for a pet
   */
  async updatePetTemperaments(petId: string, temperaments: string[]): Promise<void> {
    try {
      await api.put(`/pets/${petId}/temperaments`, { temperaments });
    } catch (error) {
      console.error('Error updating pet temperaments:', error);
      throw error;
    }
  }
}

export const referenceDataService = new ReferenceDataService();
export default referenceDataService;
