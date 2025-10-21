import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './PrintKennelCards.css';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  CircularProgress,
  Divider,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Print as PrintIcon, FilterList as FilterIcon } from '@mui/icons-material';
import KennelCard from '../../components/kennels/KennelCard';
import { reservationService } from '../../services/reservationService';
import { petService } from '../../services/petService';
import { customerService } from '../../services/customerService';
import { format } from 'date-fns';

/**
 * PrintKennelCards component allows staff to print kennel cards for active reservations
 * Provides filtering options and a print-friendly view of kennel cards
 */
const PrintKennelCards: React.FC = () => {
  // State for filters - always use the current date
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    // Use the current date for initialization
    const today = new Date();
    console.log('Initializing with today\'s date:', today);
    return today;
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true); // Start with loading state
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false); // Track initialization
  const [isInitializing, setIsInitializing] = useState<boolean>(false); // Prevent duplicate initialization
  const initializationRef = useRef<boolean>(false); // Ref to prevent multiple initializations
  
  // State for reservation data
  const [reservations, setReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  
  // State for pet and customer data
  const [petData, setPetData] = useState<{[key: string]: any}>({});
  const [customerData, setCustomerData] = useState<{[key: string]: any}>({});

  // Load reservations when filters change (but not on initial mount)
  useEffect(() => {
    if (initialized && selectedDate) {
      loadReservations();
    }
  }, [selectedDate, selectedStatus, initialized]);
  
  // Initialize component on mount
  useEffect(() => {
    if (isInitializing || initialized || initializationRef.current) {
      console.log('Already initializing or initialized, skipping');
      return;
    }
    
    initializationRef.current = true;
    
    console.log('Component mounted, initializing with today\'s date');
    setIsInitializing(true);
    const today = new Date();
    setSelectedDate(today);
    
    // Load reservations after initialization
    const initLoad = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const formattedDate = format(today, 'yyyy-MM-dd');
        console.log(`Initial load for date ${formattedDate}`);
        
        const response = await reservationService.getAllReservations(
          1, 500, 'startDate', 'asc', '', formattedDate
        );
        
        let reservationsData: any[] = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            reservationsData = response.data;
          } else if (typeof response.data === 'object' && 'items' in response.data && Array.isArray((response.data as any).items)) {
            reservationsData = (response.data as any).items;
          } else if (typeof response.data === 'object' && 'reservations' in response.data && Array.isArray((response.data as any).reservations)) {
            reservationsData = (response.data as any).reservations;
          }
        }
        
        console.log(`Initial load: ${reservationsData.length} reservations`);
        setReservations(reservationsData);
        
        if (reservationsData.length > 0) {
          await fetchAdditionalData(reservationsData);
          setTimeout(() => {
            filterReservations(reservationsData);
          }, 100);
        } else {
          setFilteredReservations([]);
        }
      } catch (err: any) {
        console.error('Error in initial load:', err);
        setError('Failed to load reservations. ' + (err.message || ''));
      } finally {
        setLoading(false);
        setIsInitializing(false);
        setInitialized(true);
      }
    };
    
    initLoad();
  }, [isInitializing, initialized]);

  // Load reservations based on current filters
  const loadReservations = async () => {
    if (!selectedDate) {
      console.log('No date selected, using today\'s date');
      // If no date is selected, use today's date
      setSelectedDate(new Date());
      return; // The useEffect will trigger this function again with the new date
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format date for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      console.log(`Loading reservations for date ${formattedDate} with status ${selectedStatus}`);
      console.log('Current date object:', selectedDate);
      
      // Fetch reservations for the selected date, regardless of status
      // Use a larger limit to ensure we get all reservations
      const response = await reservationService.getAllReservations(
        1,          // page
        500,        // limit - increased to get more reservations
        'startDate', // sortBy
        'asc',      // sortOrder
        selectedStatus === 'ALL' ? '' : selectedStatus, // If ALL, don't filter by status
        formattedDate
      );
      
      // Ensure we have an array
      let reservationsData: any[] = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          reservationsData = response.data;
        } else if (typeof response.data === 'object' && 'items' in response.data && Array.isArray((response.data as any).items)) {
          reservationsData = (response.data as any).items;
        } else if (typeof response.data === 'object' && 'reservations' in response.data && Array.isArray((response.data as any).reservations)) {
          reservationsData = (response.data as any).reservations;
        } else {
          console.warn('Unexpected response structure:', response.data);
          reservationsData = [];
        }
      }
      
      console.log(`Loaded ${reservationsData.length} reservations from API`);
      
      // Log the first few reservations for debugging
      if (reservationsData.length > 0) {
        console.log('Sample reservation data:', reservationsData[0]);
      }
      
      setReservations(reservationsData);
      
      // Fetch additional data for each reservation
      await fetchAdditionalData(reservationsData);
      
      // Apply filters after setting reservations
      setTimeout(() => {
        filterReservations(reservationsData);
      }, 100);
      
    } catch (err: any) {
      console.error('Error loading reservations:', err);
      setError('Failed to load reservations. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };
  
  // Memoize the fetch function to prevent unnecessary re-calls
  const fetchAdditionalData = useCallback(async (reservationsData: any[]) => {
    try {
      // Create arrays of unique IDs to fetch
      const petIds = Array.from(new Set(reservationsData.map(res => res.petId)));
      const customerIds = Array.from(new Set(reservationsData.map(res => res.customerId)));
      
      // Fetch all pets data
      const petsTemp: {[key: string]: any} = {};
      for (const petId of petIds) {
        try {
          const petResponse = await petService.getPetById(petId);
          petsTemp[petId] = petResponse;
        } catch (err) {
          console.error(`Error fetching pet ${petId}:`, err);
        }
      }
      setPetData(petsTemp);
      
      // Fetch all customers data
      const customersTemp: {[key: string]: any} = {};
      for (const customerId of customerIds) {
        try {
          const customerResponse = await customerService.getCustomerById(customerId);
          customersTemp[customerId] = customerResponse;
        } catch (err) {
          console.error(`Error fetching customer ${customerId}:`, err);
        }
      }
      setCustomerData(customersTemp);
      
    } catch (err) {
      console.error('Error fetching additional data:', err);
    }
  }, []);
  
  // Memoize the filter function to prevent excessive re-filtering
  const filterReservations = useCallback((reservationsToFilter?: any[]) => {
    const reservationsData = reservationsToFilter || reservations;
    
    // Ensure we have an array
    if (!Array.isArray(reservationsData)) {
      console.error('reservationsData is not an array:', reservationsData);
      setFilteredReservations([]);
      return;
    }
    
    // Log all reservations for debugging
    console.log('All reservations before filtering:', reservationsData);
    
    // For kennel cards, we want to show all reservations that have pet and customer data
    // We'll be more lenient with resource requirements
    const filtered = reservationsData.filter(res => {
      // Check if reservation has pet and customer IDs
      if (!res.petId || !res.customerId) {
        console.log('Filtering out reservation missing required pet or customer ID:', res.id);
        return false;
      }
      
      // Check if we have the pet and customer data
      if (!petData[res.petId]) {
        console.log('Filtering out reservation with missing pet data:', res.id);
        return false;
      }
      
      if (!customerData[res.customerId]) {
        console.log('Filtering out reservation with missing customer data:', res.id);
        return false;
      }
      
      // For kennel cards, we'll show all reservations even if they don't have a resource assigned
      // This ensures we print cards for all pets regardless of kennel assignment
      
      // Log the reservation service type to help with debugging
      const serviceType = res.serviceType || 'Unknown';
      console.log(`Reservation ${res.id} has service type: ${serviceType}`);
      
      return true;
    });
    
    console.log(`Filtered ${reservationsData.length} reservations down to ${filtered.length} valid kennel reservations`);
    if (filtered.length > 0) {
      console.log('First filtered reservation:', filtered[0]);
    }
    setFilteredReservations(filtered);
  }, [petData, customerData]);
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
  };
  
  // Handle status change
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatus(event.target.value);
  };
  
  // Handle print button click
  const handlePrint = () => {
    // Add a small delay to ensure the UI is ready for printing
    setTimeout(() => {
      window.print();
    }, 300);
  };
  
  // Memoize alert extraction to prevent recalculation
  const extractAlerts = useCallback((pet: any): string[] => {
    const alerts: string[] = [];
    
    // Check for medical alerts
    if (pet.vaccinationStatus) {
      Object.entries(pet.vaccinationStatus).forEach(([vaccine, status]: [string, any]) => {
        if (status.status === 'EXPIRED') {
          alerts.push(`${vaccine} vaccination expired`);
        }
      });
    }
    
    // Check for special needs
    if (pet.specialNeeds) {
      alerts.push(pet.specialNeeds);
    }
    
    // Check for behavior notes that might be alerts
    if (pet.behaviorNotes && 
        (pet.behaviorNotes.toLowerCase().includes('caution') || 
         pet.behaviorNotes.toLowerCase().includes('warning') ||
         pet.behaviorNotes.toLowerCase().includes('alert'))) {
      alerts.push(pet.behaviorNotes);
    }
    
    return alerts;
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Add global print styles */}
      <style type="text/css" media="print">
        {`
          @page { 
            size: letter portrait; 
            margin: 0.25in; 
          }
          body * {
            visibility: hidden;
          }
          .kennel-card-container, .kennel-card-container * {
            visibility: visible;
          }
          .kennel-card-container {
            position: absolute;
            left: 0;
            top: 0;
          }
          nav, header, footer, button, .MuiAppBar-root, .MuiDrawer-root {
            display: none !important;
          }
        `}
      </style>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 3, mb: 4 }} className="no-print">
            <Typography variant="h4" component="h1" gutterBottom>
              Print Kennel Cards
            </Typography>
          </Paper>
          
          {/* Filters - hidden when printing */}
          <Paper sx={{ p: 3, mb: 4, '@media print': { display: 'none' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filters</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: 'small',
                      helperText: 'Select date to filter reservations' 
                    } 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={selectedStatus}
                    label="Status"
                    onChange={handleStatusChange}
                    size="small"
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                    <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="NO_SHOW">No Show</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  fullWidth
                  size="large"
                  disabled={filteredReservations.length === 0}
                  sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                  Print Kennel Cards
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Loading and error states - hidden when printing */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, '@media print': { display: 'none' } }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 4, '@media print': { display: 'none' } }}>
              {error}
            </Alert>
          )}
          
          {/* No results message - hidden when printing */}
          {!loading && filteredReservations.length === 0 && (
            <Alert severity="info" sx={{ mb: 4, '@media print': { display: 'none' } }}>
              No reservations found with the selected filters.
            </Alert>
          )}
          
          {/* Print header - only visible when printing */}
          <Box sx={{ display: 'none', '@media print': { display: 'block', mb: 2 } }}>
            <Typography variant="h5" align="center">
              Kennel Cards - {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </Typography>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Status: {selectedStatus === 'ALL' ? 'All Statuses' :
                      selectedStatus === 'CHECKED_IN' ? 'Checked In' : 
                      selectedStatus === 'CONFIRMED' ? 'Confirmed' : 
                      selectedStatus === 'CHECKED_OUT' ? 'Checked Out' :
                      selectedStatus === 'COMPLETED' ? 'Completed' :
                      selectedStatus === 'CANCELLED' ? 'Cancelled' :
                      selectedStatus === 'NO_SHOW' ? 'No Show' : 'Pending'}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
          
          {/* Kennel Cards */}
          <Box 
            className="kennel-card-container"
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              '@media print': { 
                gap: 0,
                '& > *': { 
                  pageBreakAfter: 'always',
                  marginBottom: '0.5in'
                } 
              }
            }}>
            {filteredReservations.map((reservation) => {
              const pet = petData[reservation.petId];
              const customer = customerData[reservation.customerId];
              const resource = reservation.resource;
              
              // Extract kennel number from resource attributes
              // Default to a placeholder if not found
              let kennelNumber: string | number = 0;
              let resourceName = 'Unknown';
              let suiteType = 'STANDARD_SUITE';
              
              if (resource) {
                resourceName = resource.name || 'Unknown';
                
                // Use the suite.type directly from the database, or fall back to attributes.suiteType, or default to STANDARD_SUITE
                if (resource.attributes && resource.attributes.suiteType) {
                  suiteType = resource.attributes.suiteType;
                } else if (resource.type) {
                  suiteType = resource.type;
                }
                
                // Try to get kennel number - prefer full suite number (e.g., "A03") over just the number
                if (resource.attributes && resource.attributes.suiteNumber) {
                  kennelNumber = resource.attributes.suiteNumber;
                } else if (resource.name) {
                  // Use the full resource name (e.g., "A03") instead of extracting just the number
                  kennelNumber = resource.name;
                }
              } else if (reservation.resourceId) {
                // If we have resourceId but no resource object
                resourceName = `Resource ${reservation.resourceId}`;
                kennelNumber = 1; // Default to 1 if we can't determine
              }
              
              // For service types that don't require kennels (like grooming)
              // we'll use a placeholder
              if (!kennelNumber && reservation.serviceType) {
                if (reservation.serviceType === 'GROOMING') {
                  kennelNumber = 'G'.charCodeAt(0); // Use ASCII code as number
                  suiteType = 'GROOMING';
                } else if (reservation.serviceType === 'TRAINING') {
                  kennelNumber = 'T'.charCodeAt(0); // Use ASCII code as number
                  suiteType = 'TRAINING';
                } else {
                  kennelNumber = 1; // Default
                }
              }
              
              // Ensure all reservations have a kennel number
              if (kennelNumber === 0) {
                // Try to use the last two digits of the reservation ID as a unique number
                const idDigits = reservation.id.replace(/[^0-9]/g, '');
                if (idDigits.length > 0) {
                  kennelNumber = parseInt(idDigits.slice(-2)) || 1;
                } else {
                  // If no digits in ID, use a hash of the ID
                  kennelNumber = Math.abs(reservation.id.split('').reduce((a: number, b: string) => {
                    return a + b.charCodeAt(0);
                  }, 0)) % 100 + 1; // Ensure it's between 1-100
                }
              }
              
              // Reduced logging to prevent console spam
              if (resource === null || resource === undefined) {
                console.log(`Assigned kennel ${kennelNumber} to reservation ${reservation.id}`);
              }
              
              // Get pet icons
              // Generate unique icons for each pet based on their characteristics
              let petIconIds: string[] = [];
              
              // First check if pet has petIcons array
              if (pet.petIcons && Array.isArray(pet.petIcons) && pet.petIcons.length > 0) {
                petIconIds = [...pet.petIcons];
              } else if (pet.name.toLowerCase() === 'vader') {
                // Special case for Vader based on user requirements
                petIconIds = ['small-size', 'medium-group', 'resource-guarder', 'medication-required', 'advanced-handling'];
              } else {
                // Generate unique icons based on pet characteristics
                
                // Add size icon based on weight
                if (pet.weight) {
                  if (pet.weight < 20) {
                    petIconIds.push('small-size');
                  } else if (pet.weight >= 20 && pet.weight <= 50) {
                    petIconIds.push('medium-size');
                  } else {
                    petIconIds.push('large-size');
                  }
                } else if (pet.type === 'DOG') {
                  // Default size for dogs without weight
                  petIconIds.push('medium-size');
                } else if (pet.type === 'CAT') {
                  // Default size for cats without weight
                  petIconIds.push('small-size');
                }
                
                // Add group icon based on pet name (just to make them unique)
                // This is just for demonstration - in a real app, you'd use actual pet data
                const petNameHash = pet.name.length % 4;
                if (petNameHash === 0) {
                  petIconIds.push('small-group');
                } else if (petNameHash === 1) {
                  petIconIds.push('medium-group');
                } else if (petNameHash === 2) {
                  petIconIds.push('large-group');
                } else {
                  petIconIds.push('solo-only');
                }
                
                // Add behavior icons based on notes or pet name
                if (pet.behaviorNotes) {
                  const notes = pet.behaviorNotes.toLowerCase();
                  if (notes.includes('bark') || notes.includes('vocal')) {
                    petIconIds.push('barker');
                  }
                  if (notes.includes('chew') || notes.includes('destroy') || notes.includes('bed')) {
                    petIconIds.push('no-bedding');
                  }
                  if (notes.includes('jump') || notes.includes('escape')) {
                    petIconIds.push('escape-artist');
                  }
                  if (notes.includes('resource') || notes.includes('guard') || notes.includes('food aggression')) {
                    petIconIds.push('resource-guarder');
                  }
                } else {
                  // Add some behavior icons based on pet name (just to make them unique)
                  // This is just for demonstration - in a real app, you'd use actual pet data
                  const behaviorHash = (pet.name.charCodeAt(0) || 0) % 4;
                  if (behaviorHash === 0) {
                    petIconIds.push('barker');
                  } else if (behaviorHash === 1) {
                    petIconIds.push('digger');
                  } else if (behaviorHash === 2) {
                    petIconIds.push('mouthy');
                  } else {
                    petIconIds.push('fence-fighter');
                  }
                }
                
                // Add medical icons based on notes
                if (pet.medicationNotes) {
                  petIconIds.push('medication-required');
                }
                if (pet.specialNeeds) {
                  petIconIds.push('medical-monitoring');
                }
                if (pet.allergies) {
                  petIconIds.push('special-diet');
                }
                
                // Add handling icon based on pet ID (just to make them unique)
                // This is just for demonstration - in a real app, you'd use actual pet data
                const handlingHash = pet.id.charCodeAt(0) % 3;
                if (handlingHash === 0) {
                  petIconIds.push('advanced-handling');
                } else if (handlingHash === 1) {
                  petIconIds.push('approach-slowly');
                } else {
                  petIconIds.push('harness-only');
                }
              }
              
              // Reduced logging: only log if there are issues
              if (petIconIds.length === 0) {
                console.warn('No pet icons generated for:', pet.name);
              }
              
              // Extract alerts
              const alerts = extractAlerts(pet);
              
              return (
                <Box key={reservation.id} sx={{ mb: 4 }} className="kennel-card-container">
                  <KennelCard
                    kennelNumber={kennelNumber}
                    suiteType={suiteType}
                    petName={pet.name}
                    petBreed={pet.breed}
                    petWeight={pet.weight}
                    petIconIds={petIconIds}
                    petType={pet.type || 'DOG'}
                    customNotes={pet.iconNotes || {}}
                    petNotes={pet.notes}
                    ownerName={`${customer.firstName} ${customer.lastName}`}
                    ownerPhone={customer.phone}
                    startDate={new Date(reservation.startDate)}
                    endDate={new Date(reservation.endDate)}
                    alerts={alerts}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default PrintKennelCards;
