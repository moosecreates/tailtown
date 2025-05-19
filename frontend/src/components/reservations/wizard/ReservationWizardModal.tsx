import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  DialogTitle,
  useTheme,
  useMediaQuery,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { EnhancedReservation } from '../../../types/enhancedReservation';
import ReservationWizard, { ReservationWizardFormData } from './ReservationWizard';
import { toEnhancedReservation } from '../../../types/enhancedReservation';
import { Reservation, reservationService } from '../../../services/reservationService';
import { petCareService } from '../../../services/petCareService';
import { useNavigate } from 'react-router-dom';
import { useShoppingCart } from '../../../contexts/ShoppingCartContext';

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
  onSubmit,
  initialData,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { addToCart, clearCart } = useShoppingCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // If we have a suite ID, create a proper resource object with correct information
      resource: formData.suiteId ? {
        id: formData.suiteId,
        name: formData.suiteNumber ? 
              (formData.suiteNumber.includes('Suite') ? formData.suiteNumber : `Suite ${formData.suiteNumber}`) : 
              `Suite ${formData.suiteId.split('-').pop() || ''}`,
        type: formData.suiteType || 'STANDARD_SUITE'
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
      setIsSubmitting(true);
      console.log('ReservationWizardModal: Submitting form data:', formData);
      
      // Transform form data to backend format
      const submissionData = await transformFormData(formData);
      console.log('ReservationWizardModal: Transformed data for submission:', submissionData);
      
      // Submit using the provided onSubmit function
      const result = await onSubmit(submissionData);
      console.log('ReservationWizardModal: Submission result:', result);
      
      // If we have a reservation ID and pet care data, save that separately
      if (result.reservationId) {
        console.log('ReservationWizardModal: Saving pet care data for reservation:', result.reservationId);
        
        // Save feeding preferences
        const feedingPromises = submissionData.feedingPreferences.map((pref: any) => {
          console.log('ReservationWizardModal: Saving feeding preference:', pref);
          return petCareService.saveFeedingPreference({
            ...pref,
            reservationId: result.reservationId
          });
        });
        await Promise.all(feedingPromises);
        
        // Save medications
        const medicationPromises = submissionData.medications.map((med: any) => {
          console.log('ReservationWizardModal: Saving medication:', med);
          return petCareService.saveMedication({
            ...med,
            reservationId: result.reservationId
          });
        });
        await Promise.all(medicationPromises);
        
        // Save lodging preference if multiple pets
        if (formData.selectedPets.length > 1 && formData.lodgingPreference) {
          console.log('ReservationWizardModal: Saving lodging preference:', formData.lodgingPreference);
          await reservationService.updateReservation(result.reservationId, {
            lodgingPreference: formData.lodgingPreference,
            manualRoomSelection: formData.manualRoomSelection || false
          });
        }
        
        // Refresh the calendar to show the new reservation
        const refreshEvent = new CustomEvent('reservation-updated', { 
          detail: { reservationId: result.reservationId } 
        });
        window.dispatchEvent(refreshEvent);
        
        // Create a cart item with complete reservation details
        const petNames = formData.selectedPets
          .map(petId => formData.pets.find(p => p.id === petId)?.name || 'Pet')
          .join(', ');
        
        const cartItem = {
          id: result.reservationId,
          name: `${formData.service?.name || 'Reservation'}: ${petNames}`,
          price: formData.service?.price || 0,
          quantity: 1,
          type: 'reservation',
          customerId: formData.customer?.id,
          customerName: formData.customer ? `${formData.customer.firstName} ${formData.customer.lastName}` : '',
          petIds: formData.selectedPets,
          petNames: petNames,
          serviceId: formData.service?.id,
          serviceName: formData.service?.name || '',
          startDate: formData.startDate?.toISOString(),
          endDate: formData.endDate?.toISOString(),
          // Include any add-ons if selected
          addOns: formData.addOns.map(addon => ({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            quantity: 1
          }))
        };
        
        console.log('ReservationWizardModal: Adding reservation to cart:', cartItem);
        
        // Clear any existing cart items before adding the new one
        // This ensures we don't have multiple reservations in the cart
        clearCart();
        
        // Add the new reservation to the cart
        addToCart(cartItem);
        
        // Show success notification
        const successEvent = new CustomEvent('show-notification', {
          detail: {
            message: 'Reservation created successfully. Redirecting to payment...',
            severity: 'success'
          }
        });
        window.dispatchEvent(successEvent);
        
        // Close the modal
        onClose();
        
        // Navigate to checkout/payment page after a short delay
        setTimeout(() => {
          navigate('/checkout');
        }, 500);
      } else {
        // Show success notification without checkout redirect
        const successEvent = new CustomEvent('show-notification', {
          detail: {
            message: 'Reservation successfully saved to calendar',
            severity: 'success'
          }
        });
        window.dispatchEvent(successEvent);
        
        // Close the modal
        onClose();
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      
      // Show error notification
      const errorEvent = new CustomEvent('show-notification', {
        detail: {
          message: 'Failed to save reservation',
          severity: 'error'
        }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsSubmitting(false);
    }
  }
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
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationWizardModal;
