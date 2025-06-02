import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Reservation } from '../services/reservationService';
import { Resource } from '../services/calendarService';
import * as calendarService from '../services/calendarService';
import axios from 'axios';
// Import the API instance from services
import api from '../services/api';

interface ReservationContextType {
  reservations: Reservation[];
  categorizedReservations: {
    standardPlusSuite: Reservation[];
    standardSuite: Reservation[];
    vipSuite: Reservation[];
    unclassified: Reservation[];
  };
  loading: boolean;
  error: string | null;
  refreshReservations: (startDate: Date, endDate: Date) => Promise<void>;
  refreshAllReservations: () => Promise<void>;
  isKennelOccupied: (kennel: Resource, date: Date) => Reservation | undefined;
  kennels: Resource[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setCategorizedReservations: React.Dispatch<React.SetStateAction<{
    standardPlusSuite: Reservation[];
    standardSuite: Reservation[];
    vipSuite: Reservation[];
    unclassified: Reservation[];
  }>>;
  calendarService: typeof calendarService;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: React.ReactNode;
  kennels?: Resource[];
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children, kennels = [] }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categorizedReservations, setCategorizedReservations] = useState<{
    standardPlusSuite: Reservation[];
    standardSuite: Reservation[];
    vipSuite: Reservation[];
    unclassified: Reservation[];
  }>({
    standardPlusSuite: [],
    standardSuite: [],
    vipSuite: [],
    unclassified: []
  });
  
  const isLoadingRef = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);
  
  // Simple effect to track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Function to categorize reservations by suite type
  const categorizeReservations = (reservations: Reservation[]) => {
    return {
      standardPlusSuite: reservations.filter(r => 
        calendarService.getReservationSuiteType(r) === 'STANDARD_PLUS_SUITE'),
      standardSuite: reservations.filter(r => 
        calendarService.getReservationSuiteType(r) === 'STANDARD_SUITE'),
      vipSuite: reservations.filter(r => 
        calendarService.getReservationSuiteType(r) === 'VIP_SUITE'),
      unclassified: reservations.filter(r => 
        !calendarService.getReservationSuiteType(r))
    };
  };

  // Create a ref to track the last refresh key
  const lastRefreshKeyRef = useRef('');
  
  // Refresh reservations with retry logic
  const refreshReservations = useCallback(async (startDate: Date, endDate: Date) => {
    // Add debounce mechanism to prevent multiple rapid refreshes
    const refreshKey = `${startDate.toISOString()}_${endDate.toISOString()}`;
    
    // Skip if we just refreshed with the same parameters in the last second
    if (refreshKey === lastRefreshKeyRef.current) {
      console.log('ReservationContext: Skipping duplicate refresh request');
      return;
    }
    
    lastRefreshKeyRef.current = refreshKey;
    console.log('ReservationContext: Refreshing reservations for date range', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    // If already loading, skip this refresh
    if (isLoadingRef.current) {
      console.log('ReservationContext: Already loading reservations, skipping refresh');
      return;
    }
    
    // Reset loading state
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('ReservationContext: Fetching reservations from API');
      
      // Fetch real reservations using the calendar service
      const reservationsData = await calendarService.fetchReservationsForDateRange(startDate, endDate);
      
      if (isMounted.current) {
        console.log(`ReservationContext: Successfully loaded ${reservationsData.length} reservations`);
        
        // Categorize reservations by suite type for debugging
        const categorized = calendarService.categorizeReservationsBySuiteType(reservationsData);
        console.log('ReservationContext: Categorized reservations:', {
          standardPlusSuite: categorized.standardPlusSuite.length,
          standardSuite: categorized.standardSuite.length,
          vipSuite: categorized.vipSuite.length,
          unclassified: categorized.unclassified.length
        });
        
        // Update state with the new reservations
        setReservations(reservationsData);
        setError(null);
        
        // Reset loading flags
        isLoadingRef.current = false;
        setLoading(false);
      }
    } catch (error: any) {
      console.error('ReservationContext: Error loading reservations:', error);
      
      // Set error and reset loading flags
      if (isMounted.current) {
        setError(error);
        setLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, []);
  
  // Effect to listen for reservation creation events
  useEffect(() => {
    const handleReservationCreated = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('ReservationContext: Detected new reservation created:', customEvent.detail);
    
    // Refresh reservations with a slight delay to allow for backend processing
    setTimeout(() => {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(today.getMonth() + 1);
      
      refreshReservations(today, oneMonthLater);
    }, 500);
  };
    
    window.addEventListener('reservation-created', handleReservationCreated);
    
    return () => {
      window.removeEventListener('reservation-created', handleReservationCreated);
    };
  }, [refreshReservations]);
  
  // Function to check if a kennel is occupied on a specific date
  const isKennelOccupied = useCallback((kennel: Resource, date: Date): Reservation | undefined => {
    return calendarService.isKennelOccupied(kennel, date, reservations, kennels);
  }, [reservations, kennels]);
  
  // Function to refresh all reservations for the current month and next month
  const refreshAllReservations = useCallback(async () => {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3); // Get 3 months of data for better coverage
    
    console.log('ReservationContext: Refreshing all reservations for next 3 months');
    return refreshReservations(today, threeMonthsLater);
  }, [refreshReservations]);
  
  // Create the context value object
  const contextValue = {
    reservations,
    categorizedReservations,
    loading,
    error,
    refreshReservations,
    refreshAllReservations,
    isKennelOccupied: (kennel: Resource, date: Date) => calendarService.isKennelOccupied(kennel, date, reservations, kennels),
    kennels,
    setReservations,
    setCategorizedReservations,
    calendarService
  };
  
  // Expose the context value globally for testing purposes
  if (typeof window !== 'undefined') {
    (window as any).__RESERVATION_CONTEXT__ = contextValue;
  }

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
};

export default ReservationContext;
