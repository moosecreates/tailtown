import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Grid from '@mui/material/Grid';
import { Customer } from '../../types/customer';
import { Pet } from '../../types/pet';
import { Service } from '../../types/service';
import { customerService } from '../../services/customerService';
import { petService } from '../../services/petService';
import { serviceManagement } from '../../services/serviceManagement';
import { resourceService, Resource } from '../../services/resourceService';

/**
 * Props for the ReservationForm component
 */
interface ReservationFormProps {
  /**
   * Callback function called when the form is submitted
   * @param formData - The form data for the reservation
   */
  onSubmit: (formData: any) => Promise<void>;

  /**
   * Optional initial data for editing an existing reservation
   */
  initialData?: any;

  /**
   * Optional default dates for a new reservation
   */
  defaultDates?: {
    /** Start date and time */
    start: Date;
    /** End date and time */
    end: Date;
  };
}

/**
 * Form component for creating and editing reservations
 * 
 * This component provides a form interface for managing reservations, including:
 * - Customer selection
 * - Pet selection (filtered by selected customer)
 * - Service selection
 * - Date and time selection
 * - Form validation
 * - Error handling
 * 
 * @component
 * @example
 * ```tsx
 * <ReservationForm
 *   onSubmit={handleSubmit}
 *   initialData={existingReservation}
 *   defaultDates={{ start: new Date(), end: new Date() }}
 * />
 * ```
 */
const ReservationForm: React.FC<ReservationFormProps> = ({ onSubmit, initialData, defaultDates }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedSuiteType, setSelectedSuiteType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('CONFIRMED');
  const [startDate, setStartDate] = useState<Date | null>(defaultDates?.start || null);
  const [endDate, setEndDate] = useState<Date | null>(defaultDates?.end || null);
  const [currentServiceDuration, setCurrentServiceDuration] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Kennel/suite override state
  const [availableSuites, setAvailableSuites] = useState<Resource[]>([]);
  const [suiteLoading, setSuiteLoading] = useState(false);
  const [suiteError, setSuiteError] = useState<string>('');
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [customersResponse, servicesResponse] = await Promise.all([
          customerService.getAllCustomers(),
          serviceManagement.getAllServices(),
        ]);
        setCustomers(customersResponse.data || []);
        setServices(servicesResponse.data || []);

        if (initialData) {
          console.log('Loading initial data for editing:', initialData);
          setSelectedCustomer(initialData.customerId);
          setSelectedPet(initialData.petId);
          setSelectedService(initialData.serviceId);
          setStartDate(new Date(initialData.startDate));
          setEndDate(new Date(initialData.endDate));
          
          // Set suite type if it exists in initialData
          if (initialData.resourceId) {
            console.log('Setting resource ID from initial data:', initialData.resourceId);
            
            // Fetch the resource details to display the kennel information
            try {
              const resourceResponse = await resourceService.getResource(initialData.resourceId);
              if (resourceResponse?.status === 'success' && resourceResponse?.data) {
                console.log('Fetched resource details:', resourceResponse.data);
                
                // Determine the suite type from the resource
                const resourceType = resourceResponse.data.type || resourceResponse.data.attributes?.suiteType;
                if (resourceType) {
                  console.log('Setting suite type from resource:', resourceType);
                  setSelectedSuiteType(resourceType);
                } else if (initialData.suiteType) {
                  console.log('Setting suite type from initial data:', initialData.suiteType);
                  setSelectedSuiteType(initialData.suiteType);
                }
                
                // We'll set the selectedSuiteId after the suites are loaded in the useEffect
                // This prevents the "out-of-range value" warning
              }
            } catch (err) {
              console.error('Error fetching resource details:', err);
            }
          } else if (initialData.suiteType) {
            console.log('Setting suite type from initial data:', initialData.suiteType);
            setSelectedSuiteType(initialData.suiteType);
          }
          
          // Set the status if it exists in the initialData
          if (initialData.status) {
            setSelectedStatus(initialData.status);
          }
          
          // Load pets for the selected customer
          if (initialData.customerId) {
            const petsResponse = await petService.getPetsByCustomer(initialData.customerId);
            setPets(petsResponse.data || []);
          }
        }
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialData]);

  /**
   * Handle customer selection change
   * Loads the selected customer's pets and updates the form state
   * @param event - The select change event
   */
  const handleCustomerChange = async (event: SelectChangeEvent<string>) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
    setSelectedPet(''); // Reset pet selection when customer changes
  };

  useEffect(() => {
    const loadPets = async () => {
      if (!selectedCustomer) {
        setPets([]);
        return;
      }
      
      try {
        console.log('Getting pets for customer:', selectedCustomer);
        const response = await petService.getPetsByCustomer(selectedCustomer);
        console.log('Pet response:', response);
        setPets(response.data || []);
      } catch (err) {
        console.error('Error loading pets:', err);
        setPets([]);
      }
    };
    
    loadPets();
  }, [selectedCustomer]);

  // Reset suiteType and suite override if service changes to a category that doesn't require it
  useEffect(() => {
    if (!selectedService) return;
    
    const selectedServiceObj = services.find(s => s.id === selectedService);
    const requiresSuiteType = selectedServiceObj && (selectedServiceObj.serviceCategory === 'DAYCARE' || selectedServiceObj.serviceCategory === 'BOARDING');
    
    if (!requiresSuiteType) {
      setSelectedSuiteType('');
      setSelectedSuiteId('');
      setAvailableSuites([]);
    }
  }, [selectedService, services]);

  // Fetch available suites when suite type changes
  useEffect(() => {
    const loadAvailableSuites = async () => {
      if (!selectedSuiteType) return;
      
      try {
        setSuiteLoading(true);
        setSuiteError('');
        
        // If we're editing an existing reservation, include its resource in the list
        let includeResourceId = initialData?.resourceId;
        
        console.log('Loading available suites with type:', selectedSuiteType);
        console.log('Resource ID to include:', includeResourceId);
        
        const response = await resourceService.getSuites(
          selectedSuiteType,
          'AVAILABLE'
        );
        
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          let suites = [...response.data]; // Create a copy to avoid mutation issues
          
          // If we have a specific resourceId and it's not in the available suites,
          // we need to fetch it separately and add it to the list
          if (includeResourceId && !suites.find(s => s.id === includeResourceId)) {
            try {
              console.log('Fetching specific resource:', includeResourceId);
              const resourceResponse = await resourceService.getResource(includeResourceId);
              if (resourceResponse?.status === 'success' && resourceResponse?.data) {
                // Add the resource to the available suites list
                const resourceData = resourceResponse.data;
                console.log('Found resource:', resourceData);
                
                // Make sure the resource is of the correct type
                if (resourceData.type === selectedSuiteType || 
                    resourceData.attributes?.suiteType === selectedSuiteType) {
                  suites = [resourceData, ...suites];
                } else {
                  console.log('Resource type does not match selected suite type, not adding to list');
                }
              }
            } catch (err) {
              console.error('Error fetching specific resource:', err);
            }
          }
          
          console.log('Available suites:', suites);
          setAvailableSuites(suites);
          
          // Now that we have the suites loaded, set the selected suite ID if we're editing
          if (includeResourceId && suites.some(s => s.id === includeResourceId)) {
            setSelectedSuiteId(includeResourceId);
          } else {
            // Clear the selection if the resource is not available
            setSelectedSuiteId('');
          }
        } else {
          setAvailableSuites([]);
          setSuiteError('Failed to load available suites');
        }
      } catch (error) {
        console.error('Error loading available suites:', error);
        setAvailableSuites([]);
        setSuiteError('Error loading available suites');
      } finally {
        setSuiteLoading(false);
      }
    };
    
    loadAvailableSuites();
  }, [selectedSuiteType, initialData]);

  /**
   * Handle form submission
   * Validates the form data and calls the onSubmit callback
   * @param event - The form submission event
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validate all required fields
    // Find the selected service object
    const selectedServiceObj = services.find(s => s.id === selectedService);
    const requiresSuiteType = selectedServiceObj && 
      (selectedServiceObj.serviceCategory === 'DAYCARE' || 
       selectedServiceObj.serviceCategory === 'BOARDING');

    if (!selectedCustomer || !selectedPet || !selectedService || !startDate || !endDate) {
      setError('Please fill in all required fields');
      console.error('Missing required fields:', {
        customer: selectedCustomer,
        pet: selectedPet,
        service: selectedService,
        startDate,
        endDate
      });
      return;
    }

    // For services requiring a suite type, ensure one is selected or use default
    let effectiveSuiteType = selectedSuiteType;
    if (requiresSuiteType && !selectedSuiteType) {
      // Set a default suite type if none is selected
      effectiveSuiteType = 'STANDARD_SUITE';
      console.log('ReservationForm: Using default suite type:', effectiveSuiteType);
    }

    // Prepare form data
    const formData: any = {
      customerId: selectedCustomer,
      petId: selectedPet,
      serviceId: selectedService,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      status: selectedStatus,
      notes: '', // Add empty notes as it's expected by the backend
    };
    
    // Handle resource selection based on suite type
    if (requiresSuiteType) {
      console.log('ReservationForm: Adding suiteType to form data:', effectiveSuiteType);
      
      // Always include the suiteType field for DAYCARE or BOARDING services
      formData.suiteType = effectiveSuiteType;
      
      // Only set resourceId if a specific suite is selected and it's not empty
      if (selectedSuiteId && selectedSuiteId.trim() !== '') {
        formData.resourceId = selectedSuiteId;
        console.log('ReservationForm: Adding specific resourceId:', selectedSuiteId);
      } else {
        // Explicitly set resourceId to null for auto-assign
        formData.resourceId = null;
        console.log('ReservationForm: Using auto-assign (resourceId: null)');
      }
    }
    
    console.log('ReservationForm: Final form data before submission:', JSON.stringify(formData, null, 2));

    try {
      console.log('Submitting reservation data:', formData);
      await onSubmit(formData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create reservation';
      setError(errorMessage);
      console.error('Error creating reservation:', err.response?.data || err);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={selectedCustomer || ""}
              label="Customer"
              onChange={handleCustomerChange}
              required
              displayEmpty
            >
              <MenuItem value="" disabled>Select a customer</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={selectedPet || ""}
              label="Pet"
              onChange={(e) => setSelectedPet(e.target.value)}
              required
              disabled={!selectedCustomer}
              displayEmpty
            >
              <MenuItem value="" disabled>Select a pet</MenuItem>
              {pets.length > 0 ? (
                pets.map((pet) => (
                  <MenuItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No pets available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={selectedService}
              label="Service"
              onChange={(e) => {
                const serviceId = e.target.value;
                setSelectedService(serviceId);
                
                // Find the selected service to get its duration
                if (serviceId) {
                  const service = services.find(s => s.id === serviceId);
                  if (service && service.duration) {
                    setCurrentServiceDuration(service.duration);
                    
                    // Update end date based on service duration if we have a start date
                    if (startDate) {
                      const newEndDate = new Date(startDate.getTime());
                      // Add the service duration in minutes to the start date
                      newEndDate.setMinutes(newEndDate.getMinutes() + service.duration);
                      setEndDate(newEndDate);
                    }
                  }
                }
              }}
              required
              displayEmpty
            >
              <MenuItem value="" disabled>Select a service</MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Conditionally show suiteType dropdown for Daycare or Boarding */}
          {(() => {
            const selectedServiceObj = services.find(s => s.id === selectedService);
            const requiresSuiteType = selectedServiceObj && 
              (selectedServiceObj.serviceCategory === 'DAYCARE' || 
               selectedServiceObj.serviceCategory === 'BOARDING');
            
            // If the service doesn't require a suite type, don't show the dropdown
            if (!requiresSuiteType) return null;
            
            // If no suite type is selected yet and we need one, set a default
            if (requiresSuiteType && !selectedSuiteType) {
              // Set a default suite type when a service that requires it is selected
              setTimeout(() => setSelectedSuiteType('STANDARD_SUITE'), 0);
            }
            
            return (
              <>
                <FormControl fullWidth required size="small" sx={{ mb: 1 }}>
                  <Select
                    value={selectedSuiteType || ""}
                    label="Kennel Type"
                    onChange={e => {
                      setSelectedSuiteType(e.target.value);
                      setSelectedSuiteId(''); // Reset suite selection on type change
                    }}
                    required
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select kennel type</MenuItem>
                    <MenuItem value="VIP_SUITE">VIP Suite</MenuItem>
                    <MenuItem value="STANDARD_PLUS_SUITE">Standard Plus Suite</MenuItem>
                    <MenuItem value="STANDARD_SUITE">Standard Suite</MenuItem>
                  </Select>
                </FormControl>
                {/* Suite override dropdown */}
                {selectedSuiteType && (
                  <FormControl fullWidth size="small" sx={{ mb: 1 }} disabled={suiteLoading}>
                    <Select
                      value={selectedSuiteId || ""}
                      label="Kennel/Suite Number"
                      onChange={e => setSelectedSuiteId(e.target.value)}
                      renderValue={(selected) => {
                        if (!selected) return "Auto-assign (recommended)";
                        const suite = availableSuites.find(s => s.id === selected);
                        if (suite) {
                          const suiteNumber = suite.attributes?.suiteNumber;
                          const suiteName = suite.name || 'Suite';
                          return suiteNumber ? `#${suiteNumber} - ${suiteName}` : suiteName;
                        }
                        return `Suite ID: ${selected.substring(0, 8)}...`;
                      }}
                    >
                      <MenuItem value="">Auto-assign (recommended)</MenuItem>
                      {suiteLoading ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : suiteError ? (
                        <MenuItem disabled>{suiteError}</MenuItem>
                      ) : availableSuites.length > 0 ? (
                        availableSuites.map(suite => (
                          <MenuItem key={suite.id} value={suite.id}>
                            {suite.name || `Suite #${suite.attributes?.suiteNumber || suite.id}`}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No available suites</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </>
            );
          })()}

          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>Start Date & Time</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  if (!newValue) return;
                  
                  // Preserve the time from the existing startDate if it exists
                  if (startDate) {
                    const hours = startDate.getHours();
                    const minutes = startDate.getMinutes();
                    newValue.setHours(hours, minutes);
                  } else {
                    // Default to 9:00 AM if no previous time
                    newValue.setHours(9, 0, 0, 0);
                  }
                  
                  setStartDate(newValue);
                  
                  // Update end date based on service duration when start date changes
                  if (currentServiceDuration) {
                    const newEndDate = new Date(newValue.getTime());
                    // Add the service duration in minutes to the start date
                    newEndDate.setMinutes(newEndDate.getMinutes() + currentServiceDuration);
                    setEndDate(newEndDate);
                  }
                }}
                slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 1 } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Start Time"
                value={startDate}
                onChange={(newValue) => {
                  if (!newValue) return;
                  
                  // Create a new date with the current date but updated time
                  const updatedDate = startDate ? new Date(startDate) : new Date();
                  updatedDate.setHours(newValue.getHours(), newValue.getMinutes());
                  
                  setStartDate(updatedDate);
                  
                  // Update end date based on service duration when time changes
                  if (currentServiceDuration) {
                    const newEndDate = new Date(updatedDate.getTime());
                    // Add the service duration in minutes
                    newEndDate.setMinutes(newEndDate.getMinutes() + currentServiceDuration);
                    setEndDate(newEndDate);
                  }
                }}
                slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 1 } } }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>End Date & Time</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  if (!newValue) return;
                  
                  // Preserve the time from the existing endDate if it exists
                  if (endDate) {
                    const hours = endDate.getHours();
                    const minutes = endDate.getMinutes();
                    newValue.setHours(hours, minutes);
                  } else {
                    // Default to 5:00 PM if no previous time
                    newValue.setHours(17, 0, 0, 0);
                  }
                  
                  setEndDate(newValue);
                }}
                slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 1 } } }}
                minDate={startDate || undefined}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="End Time"
                value={endDate}
                onChange={(newValue) => {
                  if (!newValue) return;
                  
                  // Create a new date with the current date but updated time
                  const updatedDate = endDate ? new Date(endDate) : new Date();
                  updatedDate.setHours(newValue.getHours(), newValue.getMinutes());
                  
                  setEndDate(updatedDate);
                }}
                slotProps={{ textField: { fullWidth: true, size: "small", sx: { mb: 1 } } }}
              />
            </Grid>
          </Grid>
          
          {/* Status dropdown - only show for editing existing reservations */}
          {initialData && (
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <Select
                value={selectedStatus || "CONFIRMED"}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
                displayEmpty
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>
            </FormControl>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button type="submit" variant="contained" color="primary" size="small">
              {initialData ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ReservationForm;
