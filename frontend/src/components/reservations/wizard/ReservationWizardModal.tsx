import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  DialogTitle,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { EnhancedReservation } from '../../../types/enhancedReservation';
import ReservationWizard, { ReservationWizardFormData } from './ReservationWizard';
import { toEnhancedReservation } from '../../../types/enhancedReservation';
import { Reservation } from '../../../services/reservationService';
import { petCareService } from '../../../services/petCareService';

// Define reservation status type
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

// Props for the modal component
interface ReservationWizardModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: EnhancedReservation;
  defaultDates?: {
    start: Date;
    end: Date;
  };
  onSubmit: (formData: any) => Promise<{ reservationId?: string }>;
}

/**
 * Modal component that contains the ReservationWizard
 * 
 * This is the container for the multi-step wizard form for creating
 * and editing reservations with enhanced pet care management.
 */
const ReservationWizardModal: React.FC<ReservationWizardModalProps> = ({
  open,
  onClose,
  initialData,
  defaultDates,
  onSubmit
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Transform wizard form data to backend reservation data
  const transformFormData = async (formData: ReservationWizardFormData): Promise<any> => {
    // First create the base reservation
    const baseReservation: Partial<Reservation> = {
      customerId: formData.customer?.id || '',
      petId: formData.selectedPets[0] || '', // Primary pet
      serviceId: formData.service?.id || '',
      startDate: formData.startDate?.toISOString() || '',
      endDate: formData.endDate?.toISOString() || '',
      status: formData.status as ReservationStatus,
      notes: formData.customerNotes,
      staffNotes: formData.staffNotes,
      // If we have a suite ID, create a proper resource object
      resource: formData.suiteId ? {
        id: formData.suiteId,
        name: 'Suite ' + formData.suiteId, // Placeholder name
        type: 'STANDARD_SUITE' // Default type
      } : undefined,
      // Note: isRecurring will be handled in the enhancedReservation object
    };

    // Create the enhanced reservation object
    const enhancedReservation = {
      baseReservation,
      // Set additional pets if multiple pets are selected
      additionalPets: formData.selectedPets.slice(1).map(petId => ({ petId })),
      // Set lodging preference
      lodgingPreference: formData.lodgingPreference,
      // Transform feeding preferences
      feedingPreferences: Object.entries(formData.feedingPreferences).map(
        ([petId, pref]) => ({
          ...pref,
          petId
        })
      ),
      // Transform medications
      medications: Object.entries(formData.medications).flatMap(
        ([petId, meds]) => meds.map(med => ({
          ...med,
          petId
        }))
      ),
      // Set recurring pattern if it's a recurring reservation
      recurringPattern: formData.isRecurring && formData.recurringPattern
        ? {
            frequency: formData.recurringPattern.frequency,
            daysOfWeek: formData.recurringPattern.daysOfWeek || [],
            interval: formData.recurringPattern.interval || 1,
            endDate: formData.recurringPattern.endDate?.toISOString() || ''
          }
        : undefined
    };

    return enhancedReservation;
  };

  // Handle form submission
  const handleFormSubmit = async (formData: ReservationWizardFormData) => {
    try {
      // Transform form data to backend format
      const submissionData = await transformFormData(formData);
      
      // Submit using the provided onSubmit function
      const result = await onSubmit(submissionData);
      
      // If we have a reservation ID and pet care data, save that separately
      if (result.reservationId) {
        // Save feeding preferences
        for (const pref of submissionData.feedingPreferences) {
          await petCareService.saveFeedingPreference({
            ...pref,
            reservationId: result.reservationId
          });
        }
        
        // Save medications
        for (const med of submissionData.medications) {
          await petCareService.saveMedication({
            ...med,
            reservationId: result.reservationId
          });
        }
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error submitting reservation:', error);
      // Error handling would go here
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        {initialData ? 'Edit Reservation' : 'New Reservation'}
      </DialogTitle>
      <DialogContent>
        <ReservationWizard
          initialData={initialData}
          onSubmit={handleFormSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReservationWizardModal;
