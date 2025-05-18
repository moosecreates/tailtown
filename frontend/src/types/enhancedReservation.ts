import { Reservation } from '../services/reservationService';
import { 
  LodgingPreference, 
  PetFeedingPreference, 
  PetMedication,
  RecurringReservationPattern 
} from './petCare';

/**
 * Enhanced reservation interface that extends the base Reservation
 * with additional pet care management capabilities
 */
export interface EnhancedReservation extends Reservation {
  /** Feeding preferences for associated pets */
  feedingPreferences?: PetFeedingPreference[];
  
  /** Medications for associated pets */
  medications?: PetMedication[];
  
  /** Preference for multiple pets (standard, shared, separate) */
  lodgingPreference?: LodgingPreference;
  
  /** For recurring reservations - pattern information */
  recurringPattern?: RecurringReservationPattern;
  
  /** For reservations in a series - the parent pattern */
  partOfSeries?: RecurringReservationPattern;
  
  /** Multiple pets associated with this reservation (for multi-pet reservations) */
  additionalPets?: Array<{
    petId: string;
    petDetails?: {
      id: string;
      name: string;
      type: string;
      breed?: string;
    }
  }>;
}

/**
 * Helper function to convert a standard Reservation to an EnhancedReservation
 */
export function toEnhancedReservation(reservation: Reservation): EnhancedReservation {
  return {
    ...reservation,
    // Default values for enhanced properties
    lodgingPreference: LodgingPreference.STANDARD,
    feedingPreferences: [],
    medications: [],
    additionalPets: []
  };
}

/**
 * Interface for creating a new enhanced reservation
 */
export interface CreateEnhancedReservationRequest {
  /** Basic reservation details */
  baseReservation: Omit<Reservation, 'id'>;
  
  /** Feeding preferences for associated pets */
  feedingPreferences?: PetFeedingPreference[];
  
  /** Medications for associated pets */
  medications?: PetMedication[];
  
  /** Preference for multiple pets (standard, shared, separate) */
  lodgingPreference?: LodgingPreference;
  
  /** For recurring reservations - pattern information */
  recurringPattern?: Omit<RecurringReservationPattern, 'id' | 'parentReservationId'>;
  
  /** Multiple pets associated with this reservation (for multi-pet reservations) */
  additionalPets?: Array<{
    petId: string;
  }>;
}
