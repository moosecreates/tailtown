import React, { createContext, useContext, useReducer, useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Customer } from '../../../types/customer';
import { Pet } from '../../../types/pet';
import { Service, ServiceCategory } from '../../../types/service';
import { 
  PetFeedingPreference, 
  PetMedication, 
  LodgingPreference,
  RecurringReservationPattern
} from '../../../types/petCare';
import { EnhancedReservation } from '../../../types/enhancedReservation';

// Step 1: Customer & Pet Selection
import CustomerPetSelectionStep from './steps/CustomerPetSelectionStep';
// Step 2: Care Requirements
import CareRequirementsStep from './steps/CareRequirementsStep';
// Step 3: Schedule & Recurrence
import ScheduleRecurrenceStep from './steps/ScheduleRecurrenceStep';
// Step 4: Notes & Confirmation
import NotesConfirmationStep from './steps/NotesConfirmationStep';

// Define the steps in our wizard
const steps = [
  'Customer & Pets',
  'Care Requirements',
  'Schedule',
  'Confirmation'
];

// Note: We've removed the 'Lodging & Services' step as it's now handled automatically from calendar selection

// Define the form data structure for the wizard
export interface ReservationWizardFormData {
  // Step 1: Customer & Pet Selection
  customer: Customer | null;
  pets: Pet[];
  selectedPets: string[];

  // Step 2: Care Requirements
  feedingPreferences: Record<string, PetFeedingPreference>;
  medications: Record<string, PetMedication[]>;

  // Step 3: Lodging & Services
  service: Service | null;
  lodgingPreference: LodgingPreference | null;
  manualRoomSelection?: boolean; // Whether to manually select rooms for separate pets
  addOns: Service[];
  suiteId: string;
  // Additional suite information for display
  suiteNumber?: string;
  suiteType?: string;
  suiteTypeDisplay?: string;

  // Step 4: Schedule & Recurrence
  startDate: Date | null;
  endDate: Date | null;
  isRecurring: boolean;
  recurringPattern: RecurringReservationPattern | null;

  // Step 5: Notes & Confirmation
  staffNotes: string;
  customerNotes: string;
  status: string;
}

// Initial form data
const initialFormData: ReservationWizardFormData = {
  customer: null,
  pets: [],
  selectedPets: [],
  feedingPreferences: {},
  medications: {},
  service: null,
  lodgingPreference: LodgingPreference.STANDARD,
  manualRoomSelection: false,
  addOns: [],
  suiteId: '', // Empty string instead of null to match type
  startDate: null,
  endDate: null,
  isRecurring: false,
  recurringPattern: null,
  staffNotes: '',
  customerNotes: '',
  status: 'PENDING'
};

// Action types for the reducer
type ReservationWizardAction =
  | { type: 'SET_CUSTOMER'; payload: Customer | null }
  | { type: 'SET_PETS'; payload: Pet[] }
  | { type: 'SET_SELECTED_PETS'; payload: string[] }
  | { type: 'SET_FEEDING_PREFERENCE'; payload: { petId: string; preference: PetFeedingPreference } }
  | { type: 'SET_MEDICATIONS'; payload: { petId: string; medications: PetMedication[] } }
  | { type: 'SET_SERVICE'; payload: Service | null }
  | { type: 'SET_LODGING_PREFERENCE'; payload: LodgingPreference }
  | { type: 'SET_MANUAL_ROOM_SELECTION'; payload: boolean }
  | { type: 'SET_ADDONS'; payload: any[] }
  | { type: 'SET_SUITE_ID'; payload: string }
  | { type: 'SET_START_DATE'; payload: Date | null }
  | { type: 'SET_END_DATE'; payload: Date | null }
  | { type: 'SET_IS_RECURRING'; payload: boolean }
  | { type: 'SET_RECURRING_PATTERN'; payload: RecurringReservationPattern | null }
  | { type: 'SET_STAFF_NOTES'; payload: string }
  | { type: 'SET_CUSTOMER_NOTES'; payload: string }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_INITIAL_DATA'; payload: Partial<ReservationWizardFormData> };

// Reducer function to handle state updates
function reservationWizardReducer(
  state: ReservationWizardFormData, 
  action: ReservationWizardAction
): ReservationWizardFormData {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    case 'SET_PETS':
      return { ...state, pets: action.payload };
    case 'SET_SELECTED_PETS':
      return { ...state, selectedPets: action.payload };
    case 'SET_FEEDING_PREFERENCE':
      return {
        ...state,
        feedingPreferences: {
          ...state.feedingPreferences,
          [action.payload.petId]: action.payload.preference
        }
      };
    case 'SET_MEDICATIONS':
      return {
        ...state,
        medications: {
          ...state.medications,
          [action.payload.petId]: action.payload.medications
        }
      };
    case 'SET_SERVICE':
      return { ...state, service: action.payload };
    case 'SET_LODGING_PREFERENCE':
      return { ...state, lodgingPreference: action.payload };
    case 'SET_MANUAL_ROOM_SELECTION':
      return { ...state, manualRoomSelection: action.payload };
    case 'SET_ADDONS':
      return { ...state, addOns: action.payload };
    case 'SET_SUITE_ID':
      return { ...state, suiteId: action.payload };
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };
    case 'SET_END_DATE':
      return { ...state, endDate: action.payload };
    case 'SET_IS_RECURRING':
      return { ...state, isRecurring: action.payload };
    case 'SET_RECURRING_PATTERN':
      return { ...state, recurringPattern: action.payload };
    case 'SET_STAFF_NOTES':
      return { ...state, staffNotes: action.payload };
    case 'SET_CUSTOMER_NOTES':
      return { ...state, customerNotes: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'RESET_FORM':
      return initialFormData;
    case 'LOAD_INITIAL_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Create the context for the wizard
interface ReservationWizardContextType {
  formData: ReservationWizardFormData;
  dispatch: React.Dispatch<ReservationWizardAction>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isStepValid: (step: number) => boolean;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const ReservationWizardContext = createContext<ReservationWizardContextType | undefined>(undefined);

// Hook to use the wizard context
export function useReservationWizard() {
  const context = useContext(ReservationWizardContext);
  if (!context) {
    throw new Error('useReservationWizard must be used within a ReservationWizardProvider');
  }
  return context;
}

// Props for the ReservationWizard component
interface ReservationWizardProps {
  initialData?: Partial<EnhancedReservation>;
  onSubmit: (formData: ReservationWizardFormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * Reservation Wizard component
 * 
 * A multi-step form for creating and editing pet reservations with
 * enhanced care management capabilities.
 */
const ReservationWizard: React.FC<ReservationWizardProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const theme = useTheme();
  
  // State for the current step
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form state with reducer
  const [formData, dispatch] = useReducer(
    reservationWizardReducer, 
    initialFormData
  );
  
  // Load initial data if provided (for editing an existing reservation or from calendar selection)
  React.useEffect(() => {
    if (initialData) {
      console.log('Loading initial data:', initialData);
      
      // Create a payload with the initial data
      const payload: Partial<ReservationWizardFormData> = {};
      
      // Copy dates if available
      if (initialData.startDate) {
        payload.startDate = new Date(initialData.startDate);
      }
      
      if (initialData.endDate) {
        payload.endDate = new Date(initialData.endDate);
      }
      
      // Copy suite/service information if available
      if (initialData.suiteId) {
        payload.suiteId = initialData.suiteId;
        
        // Copy additional suite information if available
        if (initialData.suiteNumber) {
          payload.suiteNumber = initialData.suiteNumber;
        }
        
        if (initialData.suiteType) {
          payload.suiteType = initialData.suiteType;
        }
        
        if (initialData.suiteTypeDisplay) {
          payload.suiteTypeDisplay = initialData.suiteTypeDisplay;
        }
      }
      
      if (initialData.service) {
        // Use type assertion to create a proper Service object
        const service = initialData.service as any;
        payload.service = {
          id: service.id || '',
          name: service.name || '',
          description: service.description || '',
          serviceCategory: service.serviceCategory || ServiceCategory.BOARDING,
          price: service.price || 0,
          duration: service.duration || 0,
          requiresStaff: service.requiresStaff || false,
          isActive: service.isActive || true
        };
      }
      
      // Load other properties as needed
      if (initialData.customer) {
        payload.customer = initialData.customer;
      }
      
      if (initialData.lodgingPreference) {
        payload.lodgingPreference = initialData.lodgingPreference;
      }
      
      // Dispatch the action to load the initial data
      dispatch({ type: 'LOAD_INITIAL_DATA', payload });
    }
  }, [initialData]);
  
  // Function to go to the next step
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Function to go to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Function to validate steps
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Customer & Pets
        return !!formData.customer && formData.selectedPets.length > 0;
      case 1: // Care Requirements
        // For care requirements, just check if there's at least one pet selected
        // We'll make feeding preferences optional for now
        return formData.selectedPets.length > 0;
      case 2: // Schedule
        return !!formData.startDate && !!formData.endDate;
      case 3: // Confirmation
        // For the final step, just make sure we have the basic required data
        return !!formData.customer && 
               formData.selectedPets.length > 0 && 
               !!formData.service &&
               !!formData.startDate && 
               !!formData.endDate;
      default:
        return true; // Default to true for any other step
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    console.log('ReservationWizard: handleSubmit called');
    console.log('ReservationWizard: Current step:', currentStep);
    console.log('ReservationWizard: Step valid?', isStepValid(currentStep));
    console.log('ReservationWizard: Form data:', formData);
    
    // Always validate the current step, not step 4
    if (isStepValid(currentStep)) {
      console.log('ReservationWizard: Step is valid, proceeding with submission');
      setIsSubmitting(true);
      try {
        console.log('ReservationWizard: Calling onSubmit with form data');
        await onSubmit(formData);
        console.log('ReservationWizard: Form submitted successfully');
      } catch (error) {
        console.error('ReservationWizard: Error submitting reservation:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('ReservationWizard: Form validation failed, cannot submit');
    }
  };
  
  // Context value
  const contextValue: ReservationWizardContextType = {
    formData,
    dispatch,
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isStepValid,
    isSubmitting,
    setIsSubmitting
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CustomerPetSelectionStep />;
      case 1:
        return <CareRequirementsStep />;
      case 2:
        return <ScheduleRecurrenceStep />;
      case 3:
        return <NotesConfirmationStep />;
      default:
        return null;
    }
  };
  
  return (
    <ReservationWizardContext.Provider value={contextValue}>
      <Paper elevation={2} sx={{ p: 2, maxWidth: '100%' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {initialData ? 'Edit Reservation' : 'New Reservation'}
        </Typography>
        
        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Step content */}
        <Box sx={{ mb: 2 }}>
          {renderStep()}
        </Box>
        
        {/* Navigation buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          pt: 2
        }}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentStep > 0 && (
              <Button onClick={goToPreviousStep} color="inherit">
                Back
              </Button>
            )}
            
            {/* Hidden submit button that can be triggered by the dialog actions */}
            <Button 
              id="reservation-submit-button"
              onClick={handleSubmit}
              sx={{ display: 'none' }}
            >
              Submit
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={goToNextStep} 
                variant="contained" 
                color="primary"
                disabled={!isStepValid(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                color="primary"
                disabled={!isStepValid(currentStep) || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Processing...' : 'Complete & Checkout'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </ReservationWizardContext.Provider>
  );
};

export default ReservationWizard;
