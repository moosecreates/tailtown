export enum ResourceType {
  // Housing
  DOG_KENNEL = 'DOG_KENNEL',
  CAT_CONDO = 'CAT_CONDO',
  LUXURY_SUITE = 'LUXURY_SUITE',
  
  // Play Areas
  INDOOR_PLAY_YARD = 'INDOOR_PLAY_YARD',
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
  type: ResourceType;
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
export const getResourceTypeName = (type: ResourceType): string => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Helper function to get resource type category
export const getResourceTypeCategory = (type: ResourceType): string => {
  if ([ResourceType.DOG_KENNEL, ResourceType.CAT_CONDO, ResourceType.LUXURY_SUITE].includes(type)) {
    return 'Housing';
  } else if ([ResourceType.INDOOR_PLAY_YARD, ResourceType.OUTDOOR_PLAY_YARD, ResourceType.PRIVATE_PLAY_AREA].includes(type)) {
    return 'Play Areas';
  } else if ([ResourceType.GROOMING_TABLE, ResourceType.BATHING_STATION, ResourceType.DRYING_STATION].includes(type)) {
    return 'Grooming';
  } else if ([ResourceType.TRAINING_ROOM, ResourceType.AGILITY_COURSE].includes(type)) {
    return 'Training';
  } else if ([ResourceType.GROOMER, ResourceType.TRAINER, ResourceType.ATTENDANT, ResourceType.BATHER].includes(type)) {
    return 'Staff';
  } else {
    return 'Other';
  }
};
