export interface Pet {
  id: string;
  name: string;
  type: 'DOG' | 'CAT' | 'OTHER';
  breed?: string | null;
  birthdate?: string | null;
  weight?: number | null;
  customerId: string;
  profilePhoto?: string | null;
  vaccinationStatus?: Record<string, { 
    status: 'CURRENT' | 'EXPIRED' | 'PENDING';
    lastGiven?: string;
    notes?: string;
  }>;
  vaccineExpirations?: Record<string, string> | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}
