import { Reservation } from '../services/reservationService';

// Extended version of Reservation with additional fields for EnhancedReservationModal
export interface ExtendedReservation {
  // Basic reservation fields from the original Reservation type
  id: string;
  serviceId: string;
  customerId: string;
  petId: string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Extended fields for additional reservation details
  orderNumber?: string;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  total?: number;
  
  // Payment & invoice information
  paymentMethod?: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceTotal?: number;
  
  // Services and add-ons
  services?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
  }>;
  
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }>;
  
  // Payment records
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    transactionId?: string;
  }>;
  
  // Notes
  staffNotes?: string;
  customerNotes?: string;
}

// Helper function to convert Reservation to ExtendedReservation
export const toExtendedReservation = (reservation: Reservation): ExtendedReservation => {
  return {
    ...reservation,
    // Default values for extended properties
    paymentMethod: '',
    paymentStatus: 'PENDING',
    subtotal: 0,
    taxAmount: 0,
    taxRate: 0,
    total: 0
  };
};
