import api from './api';
import { 
  PetFeedingPreference, 
  PetMedication,
  RecurringReservationPattern
} from '../types/petCare';

/**
 * Service for managing pet care-related data (feeding, medications, etc.)
 */
export const petCareService = {
  /**
   * Get feeding preferences for a specific pet
   * @param petId - Pet ID to get feeding preferences for
   * @returns Promise with the pet's feeding preferences
   */
  getPetFeedingPreferences: async (petId: string): Promise<PetFeedingPreference[]> => {
    try {
      const response = await api.get(`/api/pet-care/feeding/pet/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting pet feeding preferences:', error);
      throw error;
    }
  },

  /**
   * Get feeding preferences for a specific reservation
   * @param reservationId - Reservation ID to get feeding preferences for
   * @returns Promise with the reservation's feeding preferences
   */
  getReservationFeedingPreferences: async (reservationId: string): Promise<PetFeedingPreference[]> => {
    try {
      // Query by reservation ID
      const response = await api.get(`/api/pet-care/feeding`, {
        params: { reservationId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting reservation feeding preferences:', error);
      throw error;
    }
  },

  /**
   * Create or update feeding preferences for a pet
   * @param feedingPreference - Feeding preference data to save
   * @returns Promise with the saved feeding preference
   */
  saveFeedingPreference: async (feedingPreference: PetFeedingPreference): Promise<PetFeedingPreference> => {
    try {
      const isNew = !feedingPreference.id;
      const method = isNew ? 'post' : 'put';
      const url = isNew 
        ? '/api/pet-care/feeding' 
        : `/api/pet-care/feeding/${feedingPreference.id}`;
      
      const response = await api[method](url, feedingPreference);
      return response.data;
    } catch (error) {
      console.error('Error saving feeding preference:', error);
      throw error;
    }
  },

  /**
   * Delete a feeding preference
   * @param id - ID of the feeding preference to delete
   */
  deleteFeedingPreference: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/pet-care/feeding/${id}`);
    } catch (error) {
      console.error('Error deleting feeding preference:', error);
      throw error;
    }
  },

  /**
   * Get medications for a specific pet
   * @param petId - Pet ID to get medications for
   * @returns Promise with the pet's medications
   */
  getPetMedications: async (petId: string): Promise<PetMedication[]> => {
    try {
      const response = await api.get(`/api/pet-care/medication/pet/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting pet medications:', error);
      throw error;
    }
  },

  /**
   * Get medications for a specific reservation
   * @param reservationId - Reservation ID to get medications for
   * @returns Promise with the reservation's medications
   */
  getReservationMedications: async (reservationId: string): Promise<PetMedication[]> => {
    try {
      // Query by reservation ID
      const response = await api.get(`/api/pet-care/medication`, {
        params: { reservationId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting reservation medications:', error);
      throw error;
    }
  },

  /**
   * Create or update medication for a pet
   * @param medication - Medication data to save
   * @returns Promise with the saved medication
   */
  saveMedication: async (medication: PetMedication): Promise<PetMedication> => {
    try {
      const isNew = !medication.id;
      const method = isNew ? 'post' : 'put';
      const url = isNew 
        ? '/api/pet-care/medication' 
        : `/api/pet-care/medication/${medication.id}`;
      
      const response = await api[method](url, medication);
      return response.data;
    } catch (error) {
      console.error('Error saving medication:', error);
      throw error;
    }
  },

  /**
   * Delete a medication
   * @param id - ID of the medication to delete
   */
  deleteMedication: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/pet-care/medication/${id}`);
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },

  /**
   * Get feeding schedule report for a specific date
   * @param date - Date to get feeding schedule for
   * @returns Promise with the feeding schedule report
   */
  getFeedingScheduleReport: async (date: string): Promise<any> => {
    try {
      const response = await api.get('/api/reports/feeding-schedule', {
        params: { date }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting feeding schedule report:', error);
      throw error;
    }
  },

  /**
   * Get medication schedule report for a specific date
   * @param date - Date to get medication schedule for
   * @returns Promise with the medication schedule report
   */
  getMedicationScheduleReport: async (date: string): Promise<any> => {
    try {
      const response = await api.get('/api/reports/medication-schedule', {
        params: { date }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting medication schedule report:', error);
      throw error;
    }
  }
};

/**
 * Service for managing recurring reservations
 */
export const recurringReservationService = {
  /**
   * Get a recurring reservation pattern by ID
   * @param id - Pattern ID to get
   * @returns Promise with the recurring reservation pattern
   */
  getRecurringPattern: async (reservationId: string): Promise<RecurringReservationPattern> => {
    try {
      const response = await api.get(`/api/recurring-reservations/pattern/reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recurring pattern:', error);
      throw error;
    }
  },

  /**
   * Get all reservations in a recurring series
   * @param patternId - Pattern ID to get reservations for
   * @returns Promise with the reservations in the series
   */
  getReservationsInSeries: async (reservationId: string): Promise<any[]> => {
    try {
      // Generate with previewOnly=true to just get a preview of recurring instances
      const response = await api.post(`/api/recurring-reservations/pattern/reservation/${reservationId}/generate`, null, {
        params: { previewOnly: true }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting reservations in series:', error);
      throw error;
    }
  },

  /**
   * Update a recurring reservation pattern
   * @param id - Pattern ID to update
   * @param pattern - Pattern data to save
   * @returns Promise with the updated pattern
   */
  updateRecurringPattern: async (
    reservationId: string, 
    pattern: Partial<RecurringReservationPattern>
  ): Promise<RecurringReservationPattern> => {
    try {
      const response = await api.put(`/api/recurring-reservations/pattern/reservation/${reservationId}`, pattern);
      return response.data;
    } catch (error) {
      console.error('Error updating recurring pattern:', error);
      throw error;
    }
  },

  /**
   * Delete a recurring reservation pattern and optionally all future reservations
   * @param id - Pattern ID to delete
   * @param deleteAllFuture - Whether to delete all future reservations in the series
   */
  deleteRecurringPattern: async (reservationId: string, deleteAllFuture: boolean = false): Promise<void> => {
    try {
      await api.delete(`/api/recurring-reservations/pattern/reservation/${reservationId}`, {
        params: { deleteAllFuture }
      });
    } catch (error) {
      console.error('Error deleting recurring pattern:', error);
      throw error;
    }
  },
  
  /**
   * Generate recurring reservation instances
   * @param reservationId - Reservation ID to generate instances for
   * @param maxInstances - Maximum number of instances to generate (optional)
   * @returns Promise with the generated reservation instances
   */
  generateRecurringInstances: async (reservationId: string, maxInstances?: number): Promise<any[]> => {
    try {
      const params: any = {};
      if (maxInstances) {
        params.maxInstances = maxInstances;
      }
      
      const response = await api.post(`/api/recurring-reservations/pattern/reservation/${reservationId}/generate`, null, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error generating recurring instances:', error);
      throw error;
    }
  }
};
