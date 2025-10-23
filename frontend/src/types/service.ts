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

export enum DepositType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  serviceCategory: ServiceCategory;
  price: number;
  duration: number;
  color?: string;
  requiresStaff: boolean;
  notes?: string;
  isActive: boolean;
  depositRequired?: boolean;
  depositType?: DepositType;
  depositAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  availableAddOns?: AddOnService[];
}
