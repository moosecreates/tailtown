export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  portalEnabled?: boolean;
  preferredContact?: 'EMAIL' | 'SMS' | 'BOTH';
  // Emergency contact information
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyContactRelationship?: string;
  emergencyContactEmail?: string;
  emergencyContactNotes?: string;
  // Other customer fields
  vatTaxId?: string;
  referralSource?: string;
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  pets?: {
    id: string;
    name: string;
    breed?: string;
    type?: string;
  }[];
}
