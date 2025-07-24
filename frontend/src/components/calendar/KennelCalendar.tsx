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
import { resourceService, Resource } from '../../services/resourceService';
import { reservationService, Reservation } from '../../services/reservationService';
import ReservationForm from '../reservations/ReservationForm';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import api from '../../services/api';

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
  selectedKennel: Resource | null;
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
  const [kennels, setKennels] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for resource availability data from backend API
  const [availabilityData, setAvailabilityData] = useState<{
    resources: Array<{
      resourceId: string;
      isAvailable: boolean;
      conflictingReservations?: any[];
    }>;
    checkStartDate: string;
    checkEndDate: string;
  } | null>(null);
  const [fetchingAvailability, setFetchingAvailability] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  
  // State for the reservation form dialog
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedKennel, setSelectedKennel] = useState<Resource | null>(null);
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
  }, [currentDate, viewType]);

  // Function to load kennels
  const loadKennels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all kennels (suites) - using specific suite types instead of generic 'suite'
      const response = await api.get('/api/v1/resources/availability', {
        params: {
          resourceType: ['STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE'].join(','),
          date: formatDateToYYYYMMDD(currentDate),
        }
      });
      
      if (response?.data?.status === 'success' && Array.isArray(response?.data?.data)) {
        // Sort kennels by type and number
        const sortedKennels = [...response.data.data].sort((a, b) => {
          // First sort by type
          const typeOrder: Record<string, number> = {
            'VIP_SUITE': 1,
            'STANDARD_PLUS_SUITE': 2,
            'STANDARD_SUITE': 3
          };
          
          const typeA = a.attributes?.suiteType || '';
          const typeB = b.attributes?.suiteType || '';
          
          const typeComparison = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
          
          if (typeComparison !== 0) {
            return typeComparison;
          }
          
          // Then sort by suite number
          return (a.suiteNumber || 0) - (b.suiteNumber || 0);
        });
        
        setKennels(sortedKennels);
      } else {
        setError('Failed to load kennels');
      }
    } catch (error) {
      console.error('Error loading kennels:', error);
      setError('Failed to load kennels');
    } finally {
      setLoading(false);
    }
  }, [kennelTypeFilter]);

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
      const reservationsResponse = await api.get('/api/reservations', {
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
          const availabilityResponse = await api.post('/api/v1/resources/availability/batch', {
            resourceIds: kennelIds,
            startDate: startDate,
            endDate: endDate
          });
          
          if (availabilityResponse?.data?.status === 'success') {
            setAvailabilityData(availabilityResponse.data.data);
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
      if (reservationsResponse?.data?.status === 'success' && Array.isArray(reservationsResponse?.data?.data)) {
        setReservations(reservationsResponse.data.data);
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
  const handleCellClick = (kennel: Resource, date: Date, existingReservation?: Reservation) => {
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

  // State for error messages
  const [formError, setFormError] = useState<string | null>(null);

  // Function to handle form submission
  const handleFormSubmit = async (formData: any) => {
    console.log('KennelCalendar: handleFormSubmit called with data:', formData);
    setFormError(null); // Clear any previous errors
    
    try {
      // Set loading state to true at the beginning of the operation
      setLoading(true);
      
      // Don't close the form immediately - the ReservationForm will handle showing the add-ons dialog
      // and we'll let the user close the dialog when they're done
      
      let updatedReservation;
      
      if (selectedReservation) {
        console.log('KennelCalendar: Updating existing reservation', selectedReservation.id);
        updatedReservation = await reservationService.updateReservation(
          selectedReservation.id,
          formData
        );
        
        // For updates, we can close the form immediately since we don't need to show add-ons
        // Reload reservations to refresh the calendar
        await loadReservations();
        
        if (onEventUpdate && typeof updatedReservation === 'object' && updatedReservation !== null) {
          // Cast to Reservation type before passing to onEventUpdate
          onEventUpdate(updatedReservation as Reservation);
        }
        
        // Close the form dialog for updates
        setIsFormOpen(false);
        setSelectedReservation(null);
        setSelectedKennel(null);
        setSelectedDate(null);
      } else {
        console.log('KennelCalendar: Creating new reservation');
        try {
          const response = await reservationService.createReservation(formData);
          console.log('KennelCalendar: Raw API response:', response);
          
          // Store the response in the updatedReservation variable
          updatedReservation = response;
          
          // Check if we need to navigate the response object to get to the actual reservation data
          // This is done to handle different API response formats
          if (typeof response === 'object' && response !== null) {
            // If the response has a data property and a success status, use the data property
            if ('data' in response && 'status' in response && response.status as string === 'success') {
              console.log('KennelCalendar: Found nested data structure in response');
              updatedReservation = response.data as any; // Use 'any' to avoid TypeScript errors
            }
          }
        } catch (createError: any) {
          // Handle specific error for duplicate reservation
          if (createError.response && createError.response.status === 400) {
            console.error('KennelCalendar: Error creating reservation - 400 Bad Request');
            // Set a more specific error message for double booking
            setFormError('This kennel is already booked for the selected time period. Please choose a different kennel or time.');
            // Ensure loading state is reset
            setLoading(false);
            return undefined;
          }
          // Re-throw the error to be caught by the outer catch block
          throw createError;
        }
        
        // Reload reservations to refresh the calendar
        await loadReservations();
        
        if (onEventUpdate && typeof updatedReservation === 'object' && updatedReservation !== null) {
          // Cast to Reservation type before passing to onEventUpdate
          onEventUpdate(updatedReservation as Reservation);
        }
        
        // For new reservations, we DON'T close the form dialog immediately
        // because we want to show the add-ons dialog first
        // The ReservationForm component will handle closing the dialog after add-ons are processed
        // This is key to ensuring the add-ons dialog appears after reservation creation
        console.log('KennelCalendar: Keeping form open for add-ons dialog');
      }

      console.log('KennelCalendar: Processed API response:', updatedReservation);

      if (updatedReservation) {
        // Extract the reservation ID (handling different response formats)
        let reservationId = '';
        if (typeof updatedReservation === 'object' && updatedReservation !== null) {
          if ('id' in updatedReservation) {
            reservationId = updatedReservation.id as string;
          } else if ('_id' in updatedReservation) {
            reservationId = updatedReservation._id as string;
          }
        }
        
        // Return the reservation ID so it can be used for add-ons
        console.log('KennelCalendar: Returning reservation ID for add-ons:', reservationId);
        return { reservationId };
      } else {
        console.warn('KennelCalendar: No reservation returned from server');
        
        // If no reservation was created, don't close the form but show an error
        // Use a more specific error message for double-booking scenarios
        setFormError('This kennel is already booked for the selected time period.');
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
      console.log('KennelCalendar: Setting form error:', errorMessage);
      
      // Force a re-render to ensure the error message is displayed
      setTimeout(() => {
        // This will trigger a re-render
        setLoading(false);
      }, 0);
      
      // Don't close the form so the user can see the error
      return undefined;
    } finally {
      // Ensure loading state is reset even if there's an error
      setLoading(false);
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
   * Uses backend API data when available, falls back to frontend check if API data isn't available
   */
  const isKennelOccupied = (kennel: Resource, date: Date): Reservation | undefined => {
    const dateStr = formatDateToYYYYMMDD(date);
    
    // First priority: Use backend availability data if we have it
    if (availabilityData && availabilityData.resources && availabilityData.resources.length > 0) {
      // Find this resource in our availability data
      const resourceData = availabilityData.resources.find(r => r.resourceId === kennel.id);
      
      if (resourceData) {
        // If the resource is not available, we need to find the conflicting reservation
        if (!resourceData.isAvailable && resourceData.conflictingReservations && resourceData.conflictingReservations.length > 0) {
          // Return the first conflicting reservation that matches our date
          for (const conflict of resourceData.conflictingReservations) {
            // Convert reservation dates to Date objects for comparison
            const startDate = new Date(conflict.startDate);
            const endDate = new Date(conflict.endDate);
            
            // Reset time components for date comparison
            const compareDate = new Date(date);
            compareDate.setHours(0, 0, 0, 0);
            
            const compareStartDate = new Date(startDate);
            compareStartDate.setHours(0, 0, 0, 0);
            
            const compareEndDate = new Date(endDate);
            compareEndDate.setHours(0, 0, 0, 0);
            
            // If this date falls within the reservation period, return the reservation
            if (compareDate >= compareStartDate && compareDate <= compareEndDate) {
              return conflict as Reservation;
            }
          }
        }
        
        // If we got here, the resource is available on this date
        return undefined;
      }
    }
    
    // Fallback: Check reservations in frontend state (how we did it before)
    // This is a backup in case the API fails
    return reservations.find(reservation => {
      // Check if the reservation is for this kennel
      // The resource property contains the kennel information
      if (reservation.resource?.id !== kennel.id) {
        return false;
      }
      
      // Check if the date falls within the reservation period
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      // Reset time components for date comparison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      const compareStartDate = new Date(startDate);
      compareStartDate.setHours(0, 0, 0, 0);
      
      const compareEndDate = new Date(endDate);
      compareEndDate.setHours(0, 0, 0, 0);
      
      return compareDate >= compareStartDate && compareDate <= compareEndDate;
    });
  };

  // Function to group kennels by type
  const groupedKennels = useMemo(() => {
    const grouped: Record<string, Resource[]> = {
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
