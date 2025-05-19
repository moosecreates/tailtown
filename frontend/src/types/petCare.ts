/**
 * Types related to pet care requirements for the enhanced reservation system
 */

export enum FeedingTime {
  AM = 'AM',
  LUNCH = 'LUNCH',
  PM = 'PM',
  SNACK = 'SNACK'
}

export enum MedicationFrequency {
  ONCE_DAILY = 'ONCE_DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  AS_NEEDED = 'AS_NEEDED',
  CUSTOM = 'CUSTOM'
}

export enum MedicationTiming {
  MORNING = 'MORNING',
  MIDDAY = 'MIDDAY',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  WITH_FOOD = 'WITH_FOOD',
  BEFORE_FOOD = 'BEFORE_FOOD',
  AFTER_FOOD = 'AFTER_FOOD',
  CUSTOM = 'CUSTOM'
}

export enum LodgingPreference {
  STANDARD = 'STANDARD',
  SHARED_WITH_SIBLING = 'SHARED_WITH_SIBLING',
  SEPARATE_FROM_SIBLING = 'SEPARATE_FROM_SIBLING'
}

/**
 * Interface for probiotic details
 */
export interface ProbioticDetails {
  /** Amount of probiotic to administer */
  quantity: string;
  /** When to administer probiotic */
  timing: FeedingTime[];
  /** Any special instructions */
  notes?: string;
}

/**
 * Interface for pet feeding preferences
 */
export interface PetFeedingPreference {
  /** Unique identifier */
  id?: string;
  /** Associated pet ID */
  petId: string;
  /** Optional reservation ID (null for default preferences) */
  reservationId?: string;
  /** Array of feeding times */
  feedingSchedule: FeedingTime[];
  /** Whether to use house food */
  useHouseFood: boolean;
  /** Whether staff can add toppings when pet isn't eating */
  allowAddIns: boolean;
  /** Probiotic administration details */
  probioticDetails?: ProbioticDetails;
  /** Any special feeding instructions */
  specialInstructions?: string;
}

/**
 * Interface for pet medication
 */
export interface PetMedication {
  /** Unique identifier */
  id?: string;
  /** Associated pet ID */
  petId: string;
  /** Optional reservation ID (null for permanent medications) */
  reservationId?: string;
  /** Medication name */
  name: string;
  /** Medication dosage */
  dosage: string;
  /** How often to administer medication */
  frequency: MedicationFrequency;
  /** When to administer medication */
  timingSchedule: MedicationTiming[];
  /** How to administer medication */
  administrationMethod?: string;
  /** Any special instructions */
  specialInstructions?: string;
  /** When to start administering medication */
  startDate?: Date | string;
  /** When to stop administering medication */
  endDate?: Date | string;
  /** Whether medication is currently active */
  isActive: boolean;
}

/**
 * Interface for recurring reservation patterns
 */
export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

export interface RecurringReservationPattern {
  /** Unique identifier */
  id?: string;
  /** The original reservation that created this pattern */
  parentReservationId?: string;
  /** How often the reservation recurs */
  frequency: RecurrenceFrequency;
  /** Days of the week (0-6, Sunday to Saturday) */
  daysOfWeek: number[];
  /** Every X days/weeks/months */
  interval: number;
  /** When the recurring series ends */
  endDate: Date;
  /** Maximum number of occurrences */
  maxOccurrences?: number;
}
