export enum ServiceCategory {
  DAYCARE = 'DAYCARE',
  BOARDING = 'BOARDING',
  GROOMING = 'GROOMING',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER'
}

export interface AddOnService {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  serviceId?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  serviceCategory: ServiceCategory;
  price: number;
  duration: number;
  capacityLimit?: number;
  requiresStaff: boolean;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  availableAddOns?: AddOnService[];
}
