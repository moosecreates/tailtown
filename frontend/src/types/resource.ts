export enum ResourceType {
  // Accommodations
  KENNEL = 'KENNEL',
  RUN = 'RUN',
  SUITE = 'SUITE',
  STANDARD_SUITE = 'STANDARD_SUITE',
  STANDARD_PLUS_SUITE = 'STANDARD_PLUS_SUITE',
  VIP_SUITE = 'VIP_SUITE',
  
  // Activity areas
  PLAY_AREA = 'PLAY_AREA',
  OUTDOOR_PLAY_YARD = 'OUTDOOR_PLAY_YARD',
  PRIVATE_PLAY_AREA = 'PRIVATE_PLAY_AREA',
  
  // Grooming
  GROOMING_TABLE = 'GROOMING_TABLE',
  BATHING_STATION = 'BATHING_STATION',
  DRYING_STATION = 'DRYING_STATION',
  
  // Training
  TRAINING_ROOM = 'TRAINING_ROOM',
  AGILITY_COURSE = 'AGILITY_COURSE',
  
  // Staff
  GROOMER = 'GROOMER',
  TRAINER = 'TRAINER',
  ATTENDANT = 'ATTENDANT',
  BATHER = 'BATHER',
  
  // Other
  OTHER = 'OTHER'
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface ResourceAvailability {
  id: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string | ResourceType; // Allow both string and enum types
  description?: string;
  capacity?: number;
  availability?: any; // Weekly schedule of availability
  location?: string;
  maintenanceSchedule?: any; // Schedule for cleaning, maintenance, etc.
  attributes?: any; // Additional attributes specific to the resource type
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  availabilitySlots?: ResourceAvailability[];
}

// Helper function to get human-readable resource type names
export const getResourceTypeName = (type: string | ResourceType): string => {
  if (!type) return 'Unknown';
  
  // Handle both string and enum types
  const typeStr = typeof type === 'string' ? type : String(type);
  
  return typeStr.split('_').map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Helper function to get resource type category
export const getResourceTypeCategory = (type: string | ResourceType): string => {
  if (!type) return 'other';
  
  // Convert to string if it's not already
  const typeStr = typeof type === 'string' ? type : String(type);
  
  // Housing types
  if (['KENNEL', 'RUN', 'SUITE', 'STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE'].includes(typeStr)) {
    return 'housing';
  } 
  // Play area types
  else if (['PLAY_AREA', 'OUTDOOR_PLAY_YARD', 'PRIVATE_PLAY_AREA'].includes(typeStr)) {
    return 'play areas';
  } 
  // Grooming types
  else if (['GROOMING_TABLE', 'BATHING_STATION', 'DRYING_STATION'].includes(typeStr)) {
    return 'grooming';
  } 
  // Training types
  else if (['TRAINING_ROOM', 'AGILITY_COURSE'].includes(typeStr)) {
    return 'training';
  } 
  // Staff types
  else if (['GROOMER', 'TRAINER', 'ATTENDANT', 'BATHER'].includes(typeStr)) {
    return 'staff';
  } 
  // Default
  else {
    return 'other';
  }
};
