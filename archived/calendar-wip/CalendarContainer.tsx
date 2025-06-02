import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './CalendarCell.css';
import { Box, Paper, CircularProgress } from '@mui/material';
import { Resource } from '../../../services/calendarService';
import { Reservation } from '../../../services/reservationService';
import { ViewType } from './CalendarHeader';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { ReservationProvider, useReservations } from '../../../contexts/ReservationContext';
import api from '../../../services/api';

interface CalendarContainerProps {
  initialDate?: Date;
  initialViewType?: ViewType;
  onCellClick?: (kennel: Resource, day: Date, reservation?: Reservation) => void;
  kennelTypeFilter?: string;
}

// Helper function to get days to display based on view type
const getDaysToDisplay = (currentDate: Date, viewType: ViewType): Date[] => {
  const days: Date[] = [];
  
  if (viewType === 'day') {
    // Day view - just the current day
    days.push(new Date(currentDate));
  } else if (viewType === 'week') {
    // Week view - 7 days starting from the current day
    const startDate = new Date(currentDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
  } else {
    // Month view - all days in the current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Add all days in the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
  }
  
  return days;
};

// Inner component that uses the ReservationContext
const CalendarContainerInner: React.FC<CalendarContainerProps> = ({
  initialDate = new Date(),
  initialViewType = 'week',
  onCellClick,
  kennelTypeFilter
}) => {
  // Ref to track the current month we're viewing to prevent redundant refreshes
  const monthKeyRef = useRef('');
  
  // State
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [kennels, setKennels] = useState<Resource[]>([]);
  const [loadingKennels, setLoadingKennels] = useState<boolean>(false);
  
  // Get reservation context
  const { 
    reservations, 
    loading: loadingReservations, 
    error, 
    refreshReservations,
    isKennelOccupied
  } = useReservations();
  
  // Calculate days to display based on current view
  const days = useMemo(() => getDaysToDisplay(currentDate, viewType), [currentDate, viewType]);
  
  // Filter kennels by type if filter is provided
  const filteredKennels = useMemo(() => {
    if (!kennelTypeFilter) return kennels;
    return kennels.filter(kennel => kennel.type === kennelTypeFilter);
  }, [kennels, kennelTypeFilter]);
  
  // Load kennels from the API with proper error handling
  const loadKennels = useCallback(async () => {
    try {
      setLoadingKennels(true);
      
      console.log('CalendarContainer: Loading kennels from API');
      let kennelData: Resource[] = [];
      
      // First try our test endpoint to see if the API is working
      try {
        console.log('CalendarContainer: Testing API with /api/test-resources');
        const testResponse = await api.get('/api/test-resources');
        console.log('CalendarContainer: Test response:', testResponse.data);
      } catch (testError: any) {
        console.error('CalendarContainer: Test API call failed:', {
          message: testError.message,
          status: testError.response?.status,
          statusText: testError.response?.statusText,
          data: testError.response?.data
        });
      }
      
      // Now try the actual resources endpoint
      try {
        console.log('CalendarContainer: Now trying the actual resources endpoint');
        const response = await api.get('/api/resources', {
          params: {
            type: 'KENNEL,SUITE',
            status: 'ACTIVE'
          },
          timeout: 10000 // Add timeout to prevent hanging requests
        });
      
        if (response && response.data) {
          console.log('CalendarContainer: Received API response:', response.data);
          
          // Handle both wrapped and unwrapped responses
          if (response.data.status === 'success' && Array.isArray(response.data.data)) {
            // Wrapped in {status, data} object
            kennelData = response.data.data;
            console.log('CalendarContainer: Extracted kennel data from wrapped response:', kennelData.length);
            
            // Normalize the data structure to match what the calendar expects
            kennelData = kennelData.map(resource => {
              // Make sure the type field matches what the calendar expects
              // The backend uses enum values like STANDARD_SUITE but the frontend expects strings like 'STANDARD_SUITE'
              return {
                ...resource,
                // Ensure type is a string
                type: resource.type?.toString() || '',
                // Make sure attributes.suiteType exists if it doesn't already
                attributes: {
                  ...resource.attributes,
                  suiteType: resource.attributes?.suiteType || resource.type?.toString() || ''
                }
              };
            });
            console.log('CalendarContainer: Normalized kennel data:', kennelData[0]);
          } else if (Array.isArray(response.data)) {
            // Direct array
            kennelData = response.data;
            console.log('CalendarContainer: Using direct array response:', kennelData.length);
          } else {
            console.warn('CalendarContainer: Unexpected API response format:', response.data);
          }
        } else {
          console.warn('CalendarContainer: Unexpected API response format:', response.data);
        }
        
        console.log(`CalendarContainer: Successfully loaded ${kennelData.length} kennels from API`);
      } catch (apiError: any) {
        console.warn('CalendarContainer: Failed to load kennels from API:', apiError);
        console.error('API Error details:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          config: apiError.config
        });
        
        // Use the resources directly from the response
        console.log('CalendarContainer: Using resources from API response');
        kennelData = [];
        console.error('Failed to load kennels. Please check your connection and try again.');
      }
    } catch (outerError) {
      console.error('Outer error in loadKennels:', outerError);
      // Log error to help with debugging
      console.log('CalendarContainer: Error loading resources, unable to continue');
      const emptyData: Resource[] = [];
      setKennels(emptyData);
    } finally {
      setLoadingKennels(false);
    }
  }, []);
  
  // Load reservations for the current date range
  const loadReservationsForCurrentView = useCallback(() => {
    if (days.length > 0) {
      // Get a reference date from the current view
      const referenceDate = days[0];
      
      // Calculate the date range for the current view
      const startDate = new Date(referenceDate);
      const endDate = new Date(days[days.length - 1]);
      
      // Add a day to the end date to include the whole day
      endDate.setDate(endDate.getDate() + 1);
      
      // Create a month key to track if we're viewing the same month
      const monthKey = `${startDate.getFullYear()}-${startDate.getMonth()}`;
      
      // Only refresh if we're viewing a different month
      if (monthKey !== monthKeyRef.current) {
        console.log('CalendarContainer: Month changed, refreshing reservations');
        monthKeyRef.current = monthKey;
        refreshReservations(startDate, endDate);
      }
    }
  }, [days, refreshReservations]);
  
  // Load data on initial render and when dependencies change
  useEffect(() => {
    loadKennels();
  }, [loadKennels]);
  
  useEffect(() => {
    loadReservationsForCurrentView();
  }, [loadReservationsForCurrentView]);
  
  // Navigation functions
  const navigateToPrevious = useCallback(() => {
    setCurrentDate((prevDate: Date) => {
      const newDate = new Date(prevDate);
      
      if (viewType === 'day') {
        newDate.setDate(prevDate.getDate() - 1);
      } else if (viewType === 'week') {
        newDate.setDate(prevDate.getDate() - 7);
      } else {
        // Month view - go to previous month
        newDate.setMonth(prevDate.getMonth() - 1);
      }
      
      return newDate;
    });
  }, [viewType]);
  
  const navigateToNext = useCallback(() => {
    setCurrentDate((prevDate: Date) => {
      const newDate = new Date(prevDate);
      
      if (viewType === 'day') {
        newDate.setDate(prevDate.getDate() + 1);
      } else if (viewType === 'week') {
        newDate.setDate(prevDate.getDate() + 7);
      } else {
        // Month view - go to next month
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      
      return newDate;
    });
  }, [viewType]);
  
  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);
  
  const handleCellClick = useCallback((kennel: Resource, day: Date, reservation?: Reservation) => {
    if (onCellClick) {
      onCellClick(kennel, day, reservation);
    }
  }, [onCellClick]);
  
  // Render cell content based on kennel and date
  const renderCell = useCallback((kennel: Resource, date: Date) => {
    console.log(`CalendarContainer: Rendering cell for kennel ${kennel.id} (${kennel.name}) on ${date.toISOString().split('T')[0]}`);
    
    // Check if this kennel is occupied on this date
    const occupyingReservation = isKennelOccupied(kennel, date);
    
    if (occupyingReservation) {
      console.log(`✅ Found reservation for kennel ${kennel.id} (${kennel.name}) on ${date.toISOString().split('T')[0]}:`, {
        reservationId: occupyingReservation.id,
        kennelId: kennel.id,
        resourceId: occupyingReservation.resourceId
      });
    } else {
      console.log(`❌ No reservation found for kennel ${kennel.id} (${kennel.name}) on ${date.toISOString().split('T')[0]}`);
    }
    
    return (
      <div 
        className={`calendar-cell ${occupyingReservation ? 'occupied' : ''}`}
        onClick={() => handleCellClick(kennel, date, occupyingReservation)}
      >
        {occupyingReservation && (
          <div className="reservation-info">
            {occupyingReservation.pet && (
              <div className="pet-name">
                {occupyingReservation.pet.name}
              </div>
            )}
            {occupyingReservation.customer && (
              <div className="customer-name">
                {occupyingReservation.customer.firstName} {occupyingReservation.customer.lastName}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [reservations, handleCellClick, isKennelOccupied]);
  
  // Loading state
  const isLoading = loadingKennels || loadingReservations;
  
  return (
    <Box sx={{ height: 'calc(100vh - 170px)', p: 0 }}>
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CalendarHeader 
          currentDate={currentDate}
          viewType={viewType}
          days={days}
          onViewTypeChange={setViewType}
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          onToday={navigateToToday}
        />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CalendarGrid
            days={days}
            kennels={filteredKennels}
            reservations={reservations}
            onCellClick={handleCellClick}
          />
        )}
      </Paper>
    </Box>
  );
};

// Wrapper component that provides the ReservationContext
const CalendarContainer: React.FC<CalendarContainerProps> = (props) => {
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kennels, setKennels] = useState<Resource[]>([]);
  
  // Load kennels when the component mounts
  useEffect(() => {
    loadKennels();
  }, []);
  
  // Load kennels from the API
  const loadKennels = async () => {
    try {
      setLoading(true);
      
      console.log('CalendarContainer: Loading kennels from API');
      let kennelData: Resource[] = [];
      
      // First try our test endpoint to see if the API is working
      try {
        console.log('CalendarContainer: Testing API with /api/test-resources');
        const testResponse = await api.get('/api/test-resources');
        console.log('CalendarContainer: Test response:', testResponse.data);
      } catch (testError: any) {
        console.error('CalendarContainer: Test API call failed:', {
          message: testError.message,
          status: testError.response?.status,
          statusText: testError.response?.statusText,
          data: testError.response?.data
        });
      }
      
      // Now try the actual resources endpoint
      try {
        console.log('CalendarContainer: Now trying the actual resources endpoint');
        const response = await api.get('/api/resources', {
          params: {
            type: 'KENNEL,SUITE',
            status: 'ACTIVE'
          },
          timeout: 10000 // Add timeout to prevent hanging requests
        });
      
        if (response && response.data) {
          console.log('CalendarContainer: Received API response:', response.data);
          
          // Handle both wrapped and unwrapped responses
          if (response.data.status === 'success' && Array.isArray(response.data.data)) {
            // Wrapped in {status, data} object
            kennelData = response.data.data;
            console.log('CalendarContainer: Extracted kennel data from wrapped response:', kennelData.length);
            
            // Normalize the data structure to match what the calendar expects
            kennelData = kennelData.map(resource => {
              // Make sure the type field matches what the calendar expects
              // The backend uses enum values like STANDARD_SUITE but the frontend expects strings like 'STANDARD_SUITE'
              return {
                ...resource,
                // Ensure type is a string
                type: resource.type?.toString() || '',
                // Make sure attributes.suiteType exists if it doesn't already
                attributes: {
                  ...resource.attributes,
                  suiteType: resource.attributes?.suiteType || resource.type?.toString() || ''
                }
              };
            });
            console.log('CalendarContainer: Normalized kennel data:', kennelData[0]);
          } else if (Array.isArray(response.data)) {
            // Direct array
            kennelData = response.data;
            console.log('CalendarContainer: Using direct array response:', kennelData.length);
          } else {
            console.warn('CalendarContainer: Unexpected API response format:', response.data);
          }
        } else {
          console.warn('CalendarContainer: Unexpected API response format:', response.data);
        }
        
        console.log(`CalendarContainer: Successfully loaded ${kennelData.length} kennels from API`);
      } catch (apiError: any) {
        console.warn('CalendarContainer: Failed to load kennels from API:', apiError);
        console.error('API Error details:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          config: apiError.config
        });
        
        // Use empty array since API failed
        console.log('CalendarContainer: Using empty array since API failed');
        kennelData = [];
        console.error('Failed to load kennels. Please check your connection and try again.');
      }
      
      // Set the kennels state with whatever data we have
      setKennels(kennelData);
      
    } catch (error) {
      console.error('Error in kennel loading process:', error);
      setError('Failed to load kennels. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <ReservationProvider kennels={kennels}>
      <CalendarContainerInner {...props} />
    </ReservationProvider>
  );
};

export default CalendarContainer;
