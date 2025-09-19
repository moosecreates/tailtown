import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon,
  Today as TodayIcon,
  ArrowBackIosNew
} from '@mui/icons-material';
import { resourceService, type Resource } from '../../services/resourceService';
import { reservationService, Reservation as BaseReservation } from '../../services/reservationService';
import ReservationForm from '../reservations/ReservationForm';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { reservationApi } from '../../services/api';

// Extended Resource interface for specific properties used in KennelCalendar
interface ExtendedResource extends Resource {
  resourceId?: string;
  resourceName?: string;
  suiteNumber?: string;
  reservations?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

// Enhanced Reservation interface with additional fields we might encounter
interface Reservation extends BaseReservation {
  resourceId?: string;
  kennelId?: string;
  suiteId?: string;
  suiteType?: string;
  staffNotes?: string;
  resource?: ExtendedResource;
}

// Define the view types
type ViewType = 'month' | 'week' | 'day';

// Define the kennel types
type KennelType = 'STANDARD_SUITE' | 'STANDARD_PLUS_SUITE' | 'VIP_SUITE';

// Define the props for the KennelCalendar component
interface KennelCalendarProps {
  onEventUpdate?: (reservation: Reservation) => void;
}

// Wrapper component to prevent unnecessary re-renders of the reservation form
// This is a separate component to avoid React hooks rules violations
interface ReservationFormWrapperProps {
  selectedKennel: ExtendedResource | null;
  selectedDate: { start: Date; end: Date } | null;
  selectedReservation: Reservation | null;
  onSubmit: (formData: any) => Promise<{reservationId?: string} | void>;
  error?: string | null;
}

const ReservationFormWrapper: React.FC<ReservationFormWrapperProps> = ({ 
  selectedKennel, 
  selectedDate, 
  selectedReservation, 
  onSubmit,
  error
}) => {
  // If we don't have the required data, don't render the form
  if (!selectedKennel || !selectedDate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Create the initial data object for the form directly
  const formInitialData = selectedReservation ? {
    ...selectedReservation,
    // For existing reservations, don't override the resourceId
    // This prevents issues with invalid resourceIds
  } : {
    // For new reservations, pre-populate with the selected kennel
    // Don't include resourceId directly to avoid out-of-range value errors
    // Instead, pass the suite information separately
    suiteNumber: selectedKennel.suiteNumber || '',
    suiteName: selectedKennel.name || '',
    suiteType: selectedKennel.type || selectedKennel.attributes?.suiteType || 'STANDARD_SUITE',
    // Include the start and end dates in the initialData
    startDate: selectedDate.start,
    endDate: selectedDate.end,
    // Add the kennel ID as a separate property that won't be used directly by the Select component
    kennelId: selectedKennel.id
  };
  
  return (
    <ReservationForm
      onSubmit={onSubmit}
      initialData={formInitialData}
      defaultDates={selectedDate}
      showAddOns={true}
    />
  );
};

/**
 * KennelCalendar component provides a grid-based calendar view for kennel reservations
 * 
 * Features:
 * - Displays kennels in rows grouped by type
 * - Shows days of the month in columns
 * - Indicates occupied kennels with reservation details
 * - Allows creating new reservations by clicking on empty cells
 * - Supports month, week, and day views
 * - Enables editing existing reservations by clicking on occupied cells
 */
// Using a standard React function component with explicit return type
const KennelCalendar = ({ onEventUpdate }: KennelCalendarProps): JSX.Element => {
  // State for the current date and view
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  
  // State for kennels and reservations
  const [kennels, setKennels] = useState<ExtendedResource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State for resource availability data from backend API
  const [availabilityData, setAvailabilityData] = useState<{
    resources?: { resourceId: string; isAvailable: boolean; conflictingReservations?: any[] }[];
    data?: {
      resources?: { resourceId: string; isAvailable: boolean; conflictingReservations?: any[] }[];
      date?: string;
      [key: string]: any;
    } | any[];
    checkStartDate?: string;
    checkEndDate?: string;
    conflictingReservations?: any[];
    status?: string;
    [key: string]: any;
  } | null>(null);
  const [fetchingAvailability, setFetchingAvailability] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  
  // State for the reservation form dialog
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedKennel, setSelectedKennel] = useState<ExtendedResource | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // State for filtering
  const [kennelTypeFilter, setKennelTypeFilter] = useState<KennelType | 'ALL'>('ALL');

  // Function to get the days to display based on the view type
  const getDaysToDisplay = useCallback(() => {
    const days: Date[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, currentDate.getDate());
    
    if (viewType === 'day') {
      // Just show the current day
      days.push(new Date(date));
    } else if (viewType === 'week') {
      // Show 7 days starting from the current day
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        days.push(new Date(newDate));
      }
    } else {
      // Show the whole month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
    }
    
    return days;
  }, [currentDate, viewType, formatDateToYYYYMMDD]);

  // Function to load kennels
  const loadKennels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Loading kennels for date:', formatDateToYYYYMMDD(currentDate));
      
      // First, get all resources of type suite
      console.log('Fetching all suite resources');
      
      try {
        // Use paginated helper to fetch ALL suite resources across pages
        const suitesResponse = await resourceService.getSuites(
          undefined,
          undefined,
          undefined,
          formatDateToYYYYMMDD(currentDate)
        );
        
        console.log('Suites (paginated) API response:', JSON.stringify(suitesResponse));
        
        // Extract resources from the response
        let kennelResources: ExtendedResource[] = [];
        
        if (suitesResponse?.status === 'success' && Array.isArray(suitesResponse?.data)) {
          kennelResources = suitesResponse.data;
          console.log(`Found ${kennelResources.length} suite resources (all pages)`);
        } else {
          console.error('Could not find suite resources in response');
          setError('Failed to load kennels: Could not find suite resources');
          setLoading(false);
          return;
        }
        
        // Now check availability for these resources
        console.log('Checking availability for suite resources');
        
        // Get the current date in YYYY-MM-DD format
        const formattedDate = formatDateToYYYYMMDD(currentDate);
        
        // Extract resource IDs for batch availability check
        const resourceIds = kennelResources.map((resource: ExtendedResource) => resource.id);
        
        let availabilityResponse;
        
        // Only make batch availability request if there are resources
        if (resourceIds.length > 0) {
          // Make batch availability request
          availabilityResponse = await reservationApi.post('/api/resources/availability/batch', {
            resourceIds: resourceIds, // Changed from 'resources' to 'resourceIds' to match backend expectation
            startDate: formattedDate,
            endDate: formattedDate
          });
        } else {
          console.log('No resources found, skipping availability check');
          // Create a mock successful response with empty data
          availabilityResponse = {
            data: {
              success: true,
              status: 'success',
              data: []
            }
          };
        }
        
        console.log('Availability API response:', JSON.stringify(availabilityResponse.data));
        
        // Process availability data
        interface AvailabilityMap {
          [key: string]: boolean;
        }
        
        let availabilityMap: AvailabilityMap = {};
        
        if (availabilityResponse?.data?.status === 'success' && 
            availabilityResponse?.data?.data?.resources && 
            Array.isArray(availabilityResponse?.data?.data?.resources)) {
          
          // Store the full availability data for later use
          setAvailabilityData(availabilityResponse.data.data);
          
          // Create a map of resource ID to availability
          availabilityResponse.data.data.resources.forEach((item: { resourceId: string; isAvailable: boolean }) => {
            availabilityMap[item.resourceId] = item.isAvailable;
          });
          
          console.log('Created availability map:', availabilityMap);
        } else {
          console.warn('Could not process availability data, assuming all available');
        }
        
        // Combine resource data with availability data
        const kennelData = kennelResources.map((resource: ExtendedResource) => ({
          ...resource,
          isAvailable: availabilityMap[resource.id] !== undefined ? availabilityMap[resource.id] : true,
          checkDate: formattedDate
        }));
        
        console.log(`Processed ${kennelData.length} kennels with availability data`);
        
        // Sort kennels by type and number
        const sortedKennels = [...kennelData].sort((a: any, b: any) => {
          // First sort by type
          const typeOrder: Record<string, number> = {
            'VIP_SUITE': 1,
            'STANDARD_PLUS_SUITE': 2,
            'STANDARD_SUITE': 3
          };
          
          // Handle different property names in different response formats
          const typeA = a.type || a.resourceType || a.attributes?.suiteType || '';
          const typeB = b.type || b.resourceType || b.attributes?.suiteType || '';
          
          const typeComparison = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
          
          if (typeComparison !== 0) {
            return typeComparison;
          }
          
          // Then sort by suite number
          const numA = a.suiteNumber || a.number || 0;
          const numB = b.suiteNumber || b.number || 0;
          return Number(numA) - Number(numB);
        });
        
        console.log('Sorted kennels:', sortedKennels.length);
        setKennels(sortedKennels);
        setLoading(false);
        return;
        
      } catch (apiError: any) {
        console.error('Error fetching resources:', apiError);
        
        // Fallback to the original availability endpoint
        console.log('Falling back to availability endpoint');
        
        try {
          const response = await reservationApi.get('/api/resources/availability', {
            params: {
              resourceType: 'suite',
              date: formatDateToYYYYMMDD(currentDate),
            }
          });
          
          console.log('API response status:', response.status);
          console.log('API response data:', JSON.stringify(response.data));
          
          // Extract kennels from the response, handling different response formats
          let kennelData: any[] = [];
          
          console.log('Analyzing response format...');
          
          // Log the response structure for debugging
          if (response?.data) {
            console.log('Response data keys:', Object.keys(response.data));
            if (response.data.status) {
              console.log('Response status:', response.data.status);
            }
          }

          // Handle the actual response structure from the API:
          // { status: "success", data: { isAvailable: true, checkDate: "...", ... } }
          if (response?.data?.status === 'success') {
            console.log('Found success response, creating kennel data from response');

            // For the single resource availability endpoint, we need to create a synthetic kennels array
            // since this endpoint returns data for a single resource type, not individual kennels
            if (response?.data?.data) {
              console.log('Creating synthetic kennel data from resource type response');

              // Store the availability data for later use
              setAvailabilityData(response.data.data);

              // Create a synthetic kennel entry for the resource type
              // This will be replaced with actual data when we load reservations
              kennelData = [{
                id: 'suite-placeholder',
                name: 'Suite',
                type: 'suite',
                isAvailable: response.data.data.isAvailable || true,
                checkDate: response.data.data.checkDate || formatDateToYYYYMMDD(currentDate)
              }];

              // Make a follow-up request to get actual kennels
              try {
                const suiteResponse = await reservationApi.get('/api/resources', {
                  params: { type: 'STANDARD_SUITE,STANDARD_PLUS_SUITE,VIP_SUITE' }
                });
                if (suiteResponse?.data?.status === 'success' && Array.isArray(suiteResponse?.data?.data)) {
                  console.log(`Found ${suiteResponse.data.data.length} suites in follow-up request`);
                  kennelData = suiteResponse.data.data.map((suite: any) => ({
                    ...suite,
                    isAvailable: response.data.data.isAvailable || true,
                    checkDate: response.data.data.checkDate || formatDateToYYYYMMDD(currentDate)
                  }));
                } else if (Array.isArray(suiteResponse?.data)) {
                  // Legacy/fallback
                  console.log(`Found ${suiteResponse.data.length} suites in follow-up request (legacy format)`);
                  kennelData = suiteResponse.data.map((suite: any) => ({
                    ...suite,
                    isAvailable: response.data.data.isAvailable || true,
                    checkDate: response.data.data.checkDate || formatDateToYYYYMMDD(currentDate)
                  }));
                }
              } catch (error) {
                console.warn('Could not fetch suite details, using placeholder data', error);
              }
            }
          }
          // Handle batch response format with resources array
          else if (response?.data?.status === 'success' && response?.data?.data?.resources && Array.isArray(response?.data?.data?.resources)) {
            console.log('Using exact format match: { status: "success", data: { resources: [...] } }');
            kennelData = response.data.data.resources;
            console.log(`Found ${kennelData.length} resources in response.data.data.resources`);
            
            // Set availabilityData for later use in isKennelOccupied
            setAvailabilityData(response.data.data);
          }
          // Handle legacy response formats as fallbacks
          else if (response?.data?.resources && Array.isArray(response?.data?.resources)) {
            console.log('Using format: resources array');
            kennelData = response.data.resources;
          } else if (Array.isArray(response?.data)) {
            console.log('Using format: direct array');
            kennelData = response.data;
          } 
          // Check for nested data structure with data property
          else if (response?.data?.data && typeof response.data.data === 'object') {
            console.log('Found nested data object, checking for arrays inside');
            
            // Look for any array property in the nested data object
            for (const key in response.data.data) {
              if (Array.isArray(response.data.data[key])) {
                console.log(`Found array in response.data.data.${key}`);
                kennelData = response.data.data[key];
                break;
              }
            }
          }
          
          // If we still don't have data, show an error
          if (kennelData.length === 0) {
            console.error('Could not find any array data in response');
            setError('Failed to load kennels: Could not find array data in response');
            setLoading(false);
            return;
          }
          
          console.log(`Found ${kennelData.length} kennels in the response`);
          
          if (kennelData.length === 0) {
            console.warn('No kennels found in the response');
            setKennels([]);
            setLoading(false);
            return;
          }
          
          // Sort kennels by type and number
          const sortedKennels = [...kennelData].sort((a: any, b: any) => {
            // First sort by type
            const typeOrder: Record<string, number> = {
              'VIP_SUITE': 1,
              'STANDARD_PLUS_SUITE': 2,
              'STANDARD_SUITE': 3
            };
            
            // Handle different property names in different response formats
            const typeA = a.type || a.resourceType || a.attributes?.suiteType || '';
            const typeB = b.type || b.resourceType || b.attributes?.suiteType || '';
            
            const typeComparison = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
            
            if (typeComparison !== 0) {
              return typeComparison;
            }
            
            // Then sort by suite number
            const numA = a.suiteNumber || a.number || 0;
            const numB = b.suiteNumber || b.number || 0;
            return Number(numA) - Number(numB);
          });
          
          console.log('Sorted kennels:', sortedKennels.length);
          setKennels(sortedKennels);
          setLoading(false);
        } catch (innerError: any) {
          console.error('Error in fallback API call:', innerError);
          setError(`Failed to load kennels: ${innerError.message}`);
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error in loadKennels:', error);
      setError(`Failed to load kennels: ${error.message}`);
      setLoading(false);
    }
  }, [currentDate, formatDateToYYYYMMDD, kennelTypeFilter]);

  // Function to load reservations and check resource availability
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setFetchingAvailability(true);
      
      // Calculate the date range to fetch reservations
      const days = getDaysToDisplay();
      const startDate = formatDateToYYYYMMDD(days[0]);
      const endDate = formatDateToYYYYMMDD(days[days.length - 1]);
      
      // Get traditional reservations for the calendar display
      const reservationsResponse = await reservationApi.get('/api/reservations', {
        params: {
          page: 1,
          limit: 1000,
          sortBy: 'startDate',
          sortOrder: 'asc',
          status: 'PENDING,CONFIRMED,CHECKED_IN', // Only valid statuses
          startDate,
          endDate,
          serviceCategory: 'BOARDING,DAYCARE'
        }
      });
      
      // Get resource availability data for the same date range using the new API
      // First, we need the list of kennel IDs to check
      // TypeScript fix: Ensure we only work with kennels that have valid string IDs
      const kennelIds: string[] = [];
      kennels.forEach(kennel => {
        if (kennel && kennel.id && typeof kennel.id === 'string') {
          kennelIds.push(kennel.id);
        }
      });
      
      if (kennelIds.length > 0) {
        try {
          // Reset any previous errors
          setAvailabilityError(null);
          
          // Call the new batch availability API
          const availabilityResponse = await reservationApi.post('/api/resources/availability/batch', {
            resourceIds: kennelIds, // Changed from 'resources' to 'resourceIds' to match backend expectation
            startDate: startDate,
            endDate: endDate
          });
          
          if (availabilityResponse?.data) {
            // Store the entire response data for more flexible parsing
            console.log('Availability response structure:', Object.keys(availabilityResponse.data));
            setAvailabilityData(availabilityResponse.data);
          } else {
            setAvailabilityError('Failed to load resource availability');
          }
        } catch (err: any) {
          console.error('Error loading resource availability:', err);
          // Ensure we always pass a string to setAvailabilityError
          setAvailabilityError(err.message ? err.message : 'Failed to load resource availability');
          // We'll continue with the frontend fallback if the availability API fails
        }
      }
      
      // Set the reservations data for traditional display
      let parsedReservations: any[] | null = null;
      if (reservationsResponse?.data?.status === 'success') {
        // Preferred shape: { status: 'success', data: { reservations: [...] } }
        if (Array.isArray(reservationsResponse?.data?.data?.reservations)) {
          parsedReservations = reservationsResponse.data.data.reservations;
        }
        // Fallback: { status: 'success', data: [...] }
        else if (Array.isArray(reservationsResponse?.data?.data)) {
          parsedReservations = reservationsResponse.data.data;
        }
        // Fallback: { status: 'success', reservations: [...] }
        else if (Array.isArray(reservationsResponse?.data?.reservations)) {
          parsedReservations = reservationsResponse.data.reservations;
        }
      }
      if (Array.isArray(parsedReservations)) {
        setReservations(parsedReservations as Reservation[]);
      } else {
        setError('Failed to load reservations');
      }
    } catch (err: any) {
      console.error('Error loading reservations:', err);
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
      setFetchingAvailability(false);
    }
  }, [getDaysToDisplay, kennels]);

  // Load kennels and reservations when the component mounts or when dependencies change
  useEffect(() => {
    loadKennels();
  }, [loadKennels]);

  useEffect(() => {
    // Only load reservations if we have successfully loaded kennels first
    // This prevents errors when trying to check availability for non-existent kennels
    if (kennels.length > 0) {
      loadReservations();
    }
  }, [loadReservations, currentDate, viewType, kennels]);
  
  /**
   * Event listener to handle reservation completion
   * This is triggered when add-ons are added to a reservation
   * It closes the form dialog and refreshes the calendar
   */
  useEffect(() => {
    const handleReservationComplete = (event: Event) => {
      // Close the form dialog and reset all selection state
      setIsFormOpen(false);
      setSelectedReservation(null);
      setSelectedKennel(null);
      setSelectedDate(null);
      
      // Reload reservations to refresh the calendar with the updated data
      loadReservations();
    };
    
    // Add the event listener for the custom event
    document.addEventListener('reservationComplete', handleReservationComplete);
    
    // Clean up the event listener when the component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener('reservationComplete', handleReservationComplete);
    };
  }, [loadReservations]);

  // Function to handle clicking on a cell
  const handleCellClick = (kennel: ExtendedResource, date: Date, existingReservation?: Reservation) => {
    if (existingReservation) {
      // If there's an existing reservation, open the form to edit it
      setSelectedReservation(existingReservation);
      setSelectedKennel(kennel);
      setSelectedDate({
        start: new Date(existingReservation.startDate),
        end: new Date(existingReservation.endDate)
      });
    } else {
      // Otherwise, open the form to create a new reservation
      setSelectedReservation(null);
      setSelectedKennel(kennel);
      
      // Set the start and end dates for the new reservation
      const start = new Date(date);
      start.setHours(9, 0, 0, 0); // Default start time: 9:00 AM
      
      const end = new Date(date);
      end.setHours(17, 0, 0, 0); // Default end time: 5:00 PM
      
      setSelectedDate({ start, end });
    }
    
    setIsFormOpen(true);
  };

  // Function to handle form submission with improved refresh mechanism
  const handleFormSubmit = async (formData: any): Promise<{reservationId?: string} | undefined> => {
    console.log('KennelCalendar: Form submitted with data:', formData);
    setFormError(null);
    
    try {
      // Determine if this is a new reservation or an update
      const isNewReservation = !selectedReservation;
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // If a specific kennel was selected, include its ID
        resourceId: selectedKennel?.id || formData.resourceId || formData.kennelId,
      };
      console.log('KennelCalendar: Submitting reservation data:', submissionData);
      setLoading(true);
      
      // Call API and normalize response to a Reservation object
      let result: any;
      let updatedReservation: any = null;
      
      if (isNewReservation) {
        // Create a new reservation
        result = await reservationService.createReservation(submissionData);
      } else if (selectedReservation) {
        // Update an existing reservation
        result = await reservationService.updateReservation(selectedReservation.id, submissionData);
      } else {
        throw new Error('No reservation selected for update');
      }
      
      console.log('KennelCalendar: Reservation API response:', result);
      
      // Normalize result: support API wrapper, direct Reservation, or { reservation: {...} }
      if (result && typeof result === 'object') {
        const statusVal = (result as any).status;
        if (typeof statusVal === 'string') {
          const lowered = statusVal.toLowerCase();
          // Treat explicit API failure statuses as errors when wrapper has no data
          if ((lowered === 'fail' || lowered === 'error') && !('data' in (result as any))) {
            const msg = (result as any).message || 'Failed to save reservation.';
            setFormError(msg);
            setLoading(false);
            return undefined;
          }
        }
        if ('data' in (result as any)) {
          const wrapper: any = result;
          if ('status' in wrapper && typeof wrapper.status === 'string' && wrapper.status !== 'success') {
            const msg = wrapper.message || 'Failed to save reservation.';
            setFormError(msg);
            setLoading(false);
            return undefined;
          }
          // Unwrap common shapes: data.reservation or data
          updatedReservation = wrapper.data?.reservation ?? wrapper.data;
        } else if ('reservation' in (result as any)) {
          updatedReservation = (result as any).reservation;
        } else {
          updatedReservation = result;
        }
      } else {
        updatedReservation = result;
      }

      console.log('KennelCalendar: Normalized reservation:', updatedReservation);
      
      // Helper: narrow if the object looks like a reservation (lenient but meaningful)
      const isReservationLike = (obj: any) => {
        if (!obj || typeof obj !== 'object') return false;
        return ('id' in obj || '_id' in obj || 'serviceId' in obj || ('customerId' in obj && 'petId' in obj));
      };
      
      // Treat as success only if it looks like a reservation
      if (isReservationLike(updatedReservation)) {
        
        // For updates, close the form immediately
        if (!isNewReservation) {
          setIsFormOpen(false);
          setSelectedReservation(null);
          setSelectedKennel(null);
          setSelectedDate(null);
        }
        // This is key to ensuring the add-ons dialog appears after reservation creation
        console.log('KennelCalendar: Keeping form open for add-ons dialog');
        
        // Implement a more reliable refresh mechanism
        // First clear the existing data to prevent stale data display
        setReservations([]);
        setAvailabilityData(null);
        
        // Wait a short delay to ensure backend has processed the change
        setTimeout(async () => {
          try {
            // Reload both reservations and availability data
            await loadReservations();
            console.log('KennelCalendar: Calendar data refreshed after reservation change');
            
            // If a callback was provided, call it with the updated reservation
            if (onEventUpdate && updatedReservation) {
              onEventUpdate(updatedReservation as Reservation);
            }
          } catch (refreshError) {
            console.error('KennelCalendar: Error refreshing calendar data:', refreshError);
          }
        }, 500); // 500ms delay to ensure backend has processed the change
        
        // Extract the reservation ID (handling different response formats)
        let reservationId = '';
        if (typeof updatedReservation === 'object' && updatedReservation !== null) {
          if ('id' in updatedReservation) {
            reservationId = (updatedReservation as any).id as string;
          } else if ('_id' in updatedReservation) {
            reservationId = (updatedReservation as any)._id as string;
          }
        }
        
        // Stop loading spinner
        setLoading(false);
        
        // Return the reservation ID so it can be used for add-ons
        console.log('KennelCalendar: Returning reservation ID for add-ons:', reservationId);
        return { reservationId };
      } else {
        console.error('KennelCalendar: Reservation API response was not successful:', result);
        // Extract error message from the response if available
        let errorMessage = 'An error occurred while saving the reservation.';
        
        if (result && typeof result === 'object' && 'message' in result) {
          errorMessage = result.message as string;
        }
        
        // Set the error message to display in the form
        setFormError(errorMessage);
        setLoading(false);
        
        // Don't close the form so the user can see the error
        return undefined;
      }
    } catch (error: any) {
      console.error('KennelCalendar: Error creating/updating reservation:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'An error occurred while saving the reservation.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('KennelCalendar: Error response data:', error.response.data);
        console.error('KennelCalendar: Error response status:', error.response.status);
        
        if (error.response.status === 400) {
          // Handle specific error cases
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else {
            // Common 400 error for kennel reservations
            errorMessage = 'This kennel is already booked for the selected time period.';
          }
        } else if (error.response.status === 404) {
          errorMessage = 'Resource not found. Please refresh and try again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Unknown error occurred.';
      }
      
      // Set the error message to display in the form
      setFormError(errorMessage);
      setLoading(false);
      
      // Don't close the form so the user can see the error
      return undefined;
    }
  };

  // Function to navigate to the previous period
  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    
    setCurrentDate(newDate);
  };

  // Function to navigate to the next period
  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setCurrentDate(newDate);
  };

  // Function to navigate to today
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Function to get the status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return '#4caf50'; // Green
      case 'CHECKED_IN':
        return '#2196f3'; // Blue
      case 'PENDING':
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e'; // Grey
    }
  };

  /**
   * Function to check if a kennel is occupied on a specific date
   * Simplified version that directly checks reservations data
   */
  const isKennelOccupied = (kennel: ExtendedResource, date: Date): Reservation | undefined => {
    const dateStr = formatDateToYYYYMMDD(date);
    const kennelId = kennel.id || kennel.resourceId;
    
    console.log(`Checking occupancy for kennel ${kennel.name || kennel.resourceName} (ID: ${kennelId}) on ${dateStr}`);
    
    // Directly check the reservations data for this kennel and date
    const matchingReservation = reservations.find(reservation => {
      // Check if this reservation is for this kennel
      if (reservation.resourceId !== kennelId) {
        return false;
      }
      
      // Check if the date falls within the reservation period
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      const checkDate = new Date(date);
      
      // Set times to compare just dates
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      checkDate.setHours(12, 0, 0, 0); // Noon to avoid timezone issues
      
      const isInRange = checkDate >= startDate && checkDate <= endDate;
      
      if (isInRange) {
        console.log(`Found reservation for kennel ${kennelId} on ${dateStr}:`, {
          reservationId: reservation.id,
          customer: reservation.customer?.firstName + ' ' + reservation.customer?.lastName,
          status: reservation.status,
          startDate: reservation.startDate,
          endDate: reservation.endDate
        });
      }
      
      return isInRange;
    });
    
    return matchingReservation;
  };

  // Legacy complex availability checking (keeping as fallback)
  const isKennelOccupiedLegacy = (kennel: ExtendedResource, date: Date): Reservation | undefined => {
    const dateStr = formatDateToYYYYMMDD(date);
    const kennelId = kennel.id || kennel.resourceId;
    
    // First check availability data from the API
    if (availabilityData) {
      console.log('Availability data structure:', Object.keys(availabilityData));
      
      // Extract resources from the nested structure we're seeing in the API response
      let resources: any[] = [];
      
      // Using the exact format we know from the API:
      // { date: "...", data: [...] } or { status: "success", data: [...] }
      if (availabilityData.data && Array.isArray(availabilityData.data)) {
        resources = availabilityData.data;
        console.log('Found resources at availabilityData.data');
      } else if (availabilityData.resources && Array.isArray(availabilityData.resources)) {
        resources = availabilityData.resources;
        console.log('Found resources at availabilityData.resources');
      } else if (availabilityData.data?.resources && Array.isArray(availabilityData.data.resources)) {
        resources = availabilityData.data.resources;
        console.log('Found resources at availabilityData.data.resources');
      } else if (availabilityData.conflictingReservations && Array.isArray(availabilityData.conflictingReservations)) {
        resources = availabilityData.conflictingReservations;
        console.log('Found resources at availabilityData.conflictingReservations');
      } else if (availabilityData.status === 'success' && availabilityData.data && typeof availabilityData.data === 'object' && !Array.isArray(availabilityData.data)) {
        // Handle the case where data is an object with nested arrays
        const dataObj = availabilityData.data as Record<string, any>;
        const dataKeys = Object.keys(dataObj);
        console.log('Data keys in success response:', dataKeys);
        
        // Try to find any arrays in the data object
        for (const key of dataKeys) {
          if (Array.isArray(dataObj[key])) {
            resources = dataObj[key];
            console.log(`Found resources at availabilityData.data.${key}`);
            break;
          }
        }
      } else {
        // Try to find any array in the structure that might contain our resources
        const findResourcesArray = (obj: any): any[] | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              // Check if this looks like our resources array (contains objects with resourceId/resourceName)
              if (obj[key].length > 0 && 
                  (obj[key][0].resourceId || obj[key][0].id) && 
                  (obj[key][0].resourceName || obj[key][0].name)) {
                console.log(`Found resources array at key: ${key}`);
                return obj[key];
              }
            } else if (typeof obj[key] === 'object') {
              const result = findResourcesArray(obj[key]);
              if (result) return result;
            }
          }
          return null;
        };
        
        const foundResources = findResourcesArray(availabilityData);
        if (foundResources) {
          resources = foundResources;
        }
      }
      
      if (resources.length > 0) {
        // Try to find the resource by different possible ID properties
        const resourceData = resources.find(r => {
          // Make sure we handle all possible ID field names
          const resourceId = r.resourceId || r.id || r.kennelId || r.suiteId;
          
          // Check for direct ID match
          if (resourceId === kennelId) {
            return true;
          }
          
          // Check for type match for Standard Plus Suite (special case)
          // This handles cases where the specific kennel ID doesn't match but the suite type does
          // BUT we need to make sure we're only matching the specific kennel this reservation belongs to
          if (kennel.type === 'STANDARD_PLUS_SUITE' && 
              (r.suiteType === 'STANDARD_PLUS_SUITE' || 
               r.type === 'STANDARD_PLUS_SUITE' || 
               (r.notes && r.notes.includes('Standard Plus')) || 
               (r.staffNotes && r.staffNotes.includes('Standard Plus')))) {
            // Only return true if this resource has the same ID as our kennel
            // This prevents a single reservation from appearing in multiple kennels
            return resourceId === kennelId;
          }  
          
          return false;
        });
        
        if (resourceData) {
          // Check if the resource is unavailable and has conflicting reservations
          if (!resourceData.isAvailable && resourceData.conflictingReservations && resourceData.conflictingReservations.length > 0) {
            // Look through conflicts to find one that matches the date
            for (const conflict of resourceData.conflictingReservations) {
              // Normalize dates for comparison
              const compareDate = new Date(date);
              compareDate.setHours(0, 0, 0, 0);
              
              const startDate = new Date(conflict.startDate || conflict.checkInDate);
              const compareStartDate = new Date(startDate);
              compareStartDate.setHours(0, 0, 0, 0);
              
              const endDate = new Date(conflict.endDate || conflict.checkOutDate);
              const compareEndDate = new Date(endDate);
              compareEndDate.setHours(0, 0, 0, 0);
              
              // Check if the date falls within the conflict period
              if (compareDate >= compareStartDate && compareDate <= compareEndDate) {
                console.log(`Found conflict for kennel ${kennel.name || kennel.resourceName} on ${dateStr}:`, conflict);
                return conflict as Reservation;
              }
            }
          }
          return undefined; // Resource found but no conflicts for this date
        }
      }
    }
    
    // If we don't have availability data or couldn't find the resource, 
    // fall back to checking reservations directly
    if (reservations.length > 0) {
      // Find any reservation that matches this kennel and date
      const matchingReservation = reservations.find(reservation => {
        // Check if the reservation is for this kennel using multiple possible ID fields
        // The resource property contains the kennel information
        const reservationKennelId = 
          reservation.resourceId || 
          reservation.kennelId || 
          reservation.suiteId || 
          reservation.resource?.id || 
          reservation.resource?.resourceId;
        
        // First check for direct ID match
        if (reservationKennelId === kennelId) {
          // Now check if the date falls within the reservation period
          const reservationStart = new Date(reservation.startDate);
          reservationStart.setHours(0, 0, 0, 0);
          
          const reservationEnd = new Date(reservation.endDate);
          reservationEnd.setHours(0, 0, 0, 0);
          
          const compareDate = new Date(date);
          compareDate.setHours(0, 0, 0, 0);
          
          if (compareDate >= reservationStart && compareDate <= reservationEnd) {
            console.log(`Found direct ID match for kennel ${kennel.name || kennel.resourceName} on date ${compareDate.toISOString().split('T')[0]}`);
            return true;
          }
        }
        
        // Special handling for Standard Plus Suite
        if (kennel.type === 'STANDARD_PLUS_SUITE') {
          // Check if this reservation is for a Standard Plus Suite
          const isStandardPlusSuite = 
            reservation.suiteType === 'STANDARD_PLUS_SUITE' || 
            reservation.resource?.type === 'STANDARD_PLUS_SUITE' || 
            (reservation.notes && reservation.notes.includes('Standard Plus')) || 
            (reservation.staffNotes && reservation.staffNotes.includes('Standard Plus'));
            
          // Only match if we have a specific resourceId match OR if this reservation has the same resourceId
          // This prevents a single reservation from appearing in multiple kennels
          const hasMatchingResourceId = 
            (reservation.resourceId && reservation.resourceId === kennelId) ||
            (reservation.resource?.id && reservation.resource.id === kennelId);
            
          if (isStandardPlusSuite && hasMatchingResourceId) {
            // Check date range for this suite type match
            const reservationStart = new Date(reservation.startDate);
            reservationStart.setHours(0, 0, 0, 0);
            
            const reservationEnd = new Date(reservation.endDate);
            reservationEnd.setHours(0, 0, 0, 0);
            
            const compareDate = new Date(date);
            compareDate.setHours(0, 0, 0, 0);
            
            if (compareDate >= reservationStart && compareDate <= reservationEnd) {
              console.log(`Found Standard Plus Suite match for kennel ${kennel.name || kennel.resourceName} on date ${compareDate.toISOString().split('T')[0]}`);
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (matchingReservation) {
        console.log(`Found matching reservation for kennel ${kennel.name || kennel.resourceName} on ${dateStr}:`, matchingReservation);
        return matchingReservation;
      }
    }
    
    // No matching reservation found
    return undefined;
  };

  // Function to group kennels by type
  const groupedKennels = useMemo(() => {
    const grouped: Record<string, ExtendedResource[]> = {
      'VIP_SUITE': [],
      'STANDARD_PLUS_SUITE': [],
      'STANDARD_SUITE': []
    };
    
    kennels.forEach(kennel => {
      // First try to use the type field directly, then fall back to attributes.suiteType
      const type = kennel.type || kennel.attributes?.suiteType || 'STANDARD_SUITE';
      if (grouped[type]) {
        grouped[type].push(kennel);
      }
    });
    
    return grouped;
  }, [kennels]);

  // Get the days to display
  const days = getDaysToDisplay();
  
  // Get the title for the current view
  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    
    if (viewType === 'day') {
      options.day = 'numeric';
      return new Intl.DateTimeFormat('en-US', options).format(currentDate);
    } else if (viewType === 'week') {
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      
      const firstMonth = firstDay.getMonth();
      const lastMonth = lastDay.getMonth();
      
      if (firstMonth === lastMonth) {
        // Same month
        return `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(firstDay)} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      } else {
        // Different months
        return `${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(firstDay)} ${firstDay.getDate()} - ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(lastDay)} ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      }
    } else {
      // Month view
      return new Intl.DateTimeFormat('en-US', options).format(currentDate);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 170px)', p: 0 }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={navigateToPrevious}>
              <ArrowBackIosNew />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 1 }}>
              {getViewTitle()}
            </Typography>
            <IconButton onClick={navigateToNext}>
              <ChevronRightIcon />
            </IconButton>
            {fetchingAvailability ? (
              <CircularProgress size={24} sx={{ ml: 1 }} />
            ) : availabilityError ? (
              <Typography color="error" sx={{ ml: 1 }}>
                {availabilityError}
              </Typography>
            ) : null}
            <IconButton onClick={navigateToToday} sx={{ ml: 1 }}>
              <TodayIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* View Type Selector */}
            <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 1, mr: 2 }}>
              <Tooltip title="Month View">
                <IconButton 
                  color={viewType === 'month' ? 'primary' : 'default'} 
                  onClick={() => setViewType('month')}
                >
                  <CalendarViewMonthIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Week View">
                <IconButton 
                  color={viewType === 'week' ? 'primary' : 'default'} 
                  onClick={() => setViewType('week')}
                >
                  <CalendarViewWeekIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Day View">
                <IconButton 
                  color={viewType === 'day' ? 'primary' : 'default'} 
                  onClick={() => setViewType('day')}
                >
                  <CalendarViewDayIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Kennel Type Filter */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Kennel Type</InputLabel>
              <Select
                value={kennelTypeFilter}
                onChange={(e) => setKennelTypeFilter(e.target.value as KennelType | 'ALL')}
                label="Kennel Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="VIP_SUITE">VIP Suite</MenuItem>
                <MenuItem value="STANDARD_PLUS_SUITE">Standard Plus</MenuItem>
                <MenuItem value="STANDARD_SUITE">Standard</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Calendar Content */}
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
              <Button variant="contained" onClick={() => { loadKennels(); loadReservations(); }} sx={{ mt: 2 }}>
                Retry
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                <TableHead sx={{ bgcolor: 'background.paper' }}>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        minWidth: 120, 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 3,
                        bgcolor: 'background.paper',
                        borderBottom: '2px solid rgba(224, 224, 224, 1)'
                      }}
                    >
                      Kennel
                    </TableCell>
                    {days.map((day, index) => (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          minWidth: 100,
                          bgcolor: day.getDay() === 0 || day.getDay() === 6 ? '#f0f0f0' : 'background.paper',
                          fontWeight: formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date()) ? 'bold' : 'normal',
                          color: formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date()) ? 'primary.main' : 'inherit',
                          borderBottom: '2px solid rgba(224, 224, 224, 1)'
                        }}
                      >
                        <Typography variant="body2">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </Typography>
                        <Typography variant="body1">
                          {day.getDate()}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedKennels).map(([type, kennelsOfType]) => (
                    kennelsOfType.length > 0 && (
                      <React.Fragment key={type}>
                        {/* Kennel Type Header */}
                        <TableRow>
                          <TableCell 
                            colSpan={days.length + 1} 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              py: 0.5
                            }}
                          >
                            <Typography variant="subtitle2">
                              {type === 'VIP_SUITE' ? 'VIP Suites' : 
                               type === 'STANDARD_PLUS_SUITE' ? 'Standard Plus Suites' : 
                               'Standard Suites'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        
                        {/* Kennels of this type */}
                        {kennelsOfType.map((kennel) => (
                          <TableRow key={kennel.id}>
                            <TableCell 
                              sx={{ 
                                position: 'sticky', 
                                left: 0, 
                                zIndex: 1,
                                bgcolor: 'background.paper',
                                borderRight: '1px solid rgba(224, 224, 224, 1)'
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                                {kennel.suiteNumber ? `${kennel.suiteNumber}` : kennel.name}
                              </Typography>
                            </TableCell>
                            
                            {days.map((day, index) => {
                              const reservation = isKennelOccupied(kennel, day);
                              const isOccupied = !!reservation;
                              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                              
                              return (
                                <TableCell 
                                  key={index}
                                  onClick={() => handleCellClick(kennel, day, reservation)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    bgcolor: isOccupied 
                                      ? `${getStatusColor(reservation.status)}22` // Light version of status color
                                      : isWeekend 
                                        ? 'rgba(0, 0, 0, 0.04)' 
                                        : 'inherit',
                                    '&:hover': {
                                      bgcolor: isOccupied 
                                        ? `${getStatusColor(reservation.status)}44` // Slightly darker on hover
                                        : 'rgba(0, 0, 0, 0.08)',
                                    },
                                    p: 0.5,
                                    height: 45,
                                    borderLeft: index > 0 && isOccupied && isKennelOccupied(kennel, days[index - 1])?.id === reservation?.id
                                      ? `2px solid ${getStatusColor(reservation.status)}`
                                      : undefined,
                                    borderRight: index < days.length - 1 && isOccupied && isKennelOccupied(kennel, days[index + 1])?.id === reservation?.id
                                      ? `2px solid ${getStatusColor(reservation.status)}`
                                      : undefined,
                                    borderBottom: '1px solid rgba(224, 224, 224, 1)'
                                  }}
                                >
                                  {isOccupied ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                                        <Chip 
                                          label={reservation.status} 
                                          size="small" 
                                          sx={{ 
                                            bgcolor: getStatusColor(reservation.status),
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            height: 16,
                                            '& .MuiChip-label': { px: 0.5 }
                                          }} 
                                        />
                                      </Box>
                                      <Typography variant="caption" display="block" noWrap sx={{ fontSize: '0.7rem' }}>
                                        {reservation.pet?.name || 'Unknown Pet'}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      color: 'text.secondary'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>•</Typography>
                                    </Box>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Reservation Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => {
          // First clear focus from any element inside the dialog
          // This prevents the accessibility warning when the dialog closes
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          
          // Then close the dialog and reset state
          setIsFormOpen(false);
          setSelectedReservation(null);
          setSelectedKennel(null);
          setSelectedDate(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '80vh' }
        }}
        // Prevent dialog from re-rendering its children unnecessarily
        keepMounted
        // Add proper focus handling for accessibility
        disableRestoreFocus
      >
        <DialogTitle sx={{ py: 1, px: 2, fontSize: '1rem' }}>
          {selectedReservation ? 'Edit Reservation' : 'Create New Reservation'}
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2 }}>
          {formError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                fontWeight: 'medium',
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
              variant="filled"
            >
              {formError}
            </Alert>
          )}
          {!selectedKennel || !selectedDate ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReservationFormWrapper 
              selectedKennel={selectedKennel}
              selectedDate={selectedDate}
              selectedReservation={selectedReservation}
              onSubmit={handleFormSubmit}
              error={formError}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default KennelCalendar;
