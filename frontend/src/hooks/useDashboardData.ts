import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../services/reservationService';
import { logger } from '../utils/logger';

interface DashboardMetrics {
  inCount: number | null;
  outCount: number | null;
  overnightCount: number | null;
  todayRevenue: number | null;
}

interface DashboardData extends DashboardMetrics {
  allReservations: any[];
  filteredReservations: any[];
  loading: boolean;
  error: string | null;
  appointmentFilter: 'in' | 'out' | 'all';
}

/**
 * Custom hook for managing dashboard data and state
 * Handles data fetching, filtering, and state management
 */
export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    inCount: null,
    outCount: null,
    overnightCount: null,
    todayRevenue: null
  });
  
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'in' | 'out' | 'all'>('all');

  /**
   * Filter reservations based on check-in or check-out status
   */
  const filterReservations = useCallback((filter: 'in' | 'out' | 'all', reservations?: any[]) => {
    const reservationsToFilter = reservations || allReservations;
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let filtered = reservationsToFilter;
    
    if (filter === 'in') {
      // Show only check-ins (reservations starting today)
      filtered = reservationsToFilter.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        return startDateStr === formattedToday;
      });
    } else if (filter === 'out') {
      // Show only check-outs (reservations ending today)
      filtered = reservationsToFilter.filter((res: any) => {
        const endDate = new Date(res.endDate);
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        return endDateStr === formattedToday;
      });
    }
    
    setFilteredReservations(filtered);
    setAppointmentFilter(filter);
  }, [allReservations]);

  /**
   * Load all dashboard data
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Get tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedTomorrow = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      
      // Get yesterday's date for range
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      const activeStatuses = 'PENDING,CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED,NO_SHOW';
      
      // Fetch all data in parallel
      const [reservationsResponse, revenueResponse] = await Promise.all([
        reservationService.getAllReservations(1, 250, 'startDate', 'asc', activeStatuses, yesterdayFormatted),
        reservationService.getTodayRevenue()
      ]);

      // Extract reservations from response
      let reservations: any[] = [];
      const resResponse = reservationsResponse as any;
      if (resResponse?.data && Array.isArray(resResponse.data)) {
        reservations = resResponse.data;
      } else if (resResponse?.data?.data && Array.isArray(resResponse.data.data)) {
        reservations = resResponse.data.data;
      } else if (resResponse?.data?.reservations && Array.isArray(resResponse.data.reservations)) {
        reservations = resResponse.data.reservations;
      }

      // Calculate metrics
      const checkIns = reservations.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        return startDateStr === formattedToday;
      }).length;

      const checkOuts = reservations.filter((res: any) => {
        const endDate = new Date(res.endDate);
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        return endDateStr === formattedToday;
      }).length;

      const overnight = reservations.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const endDate = new Date(res.endDate);
        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        return startDateStr < formattedToday && endDateStr >= formattedToday;
      }).length;

      // Extract revenue
      let revenue = 0;
      const revResponse = revenueResponse as any;
      if (typeof revResponse?.data === 'number') {
        revenue = revResponse.data;
      } else if (revResponse?.data?.totalRevenue) {
        revenue = revResponse.data.totalRevenue;
      } else if (revResponse?.data?.revenue) {
        revenue = revResponse.data.revenue;
      } else if (revResponse?.revenue) {
        revenue = revResponse.revenue;
      } else if (revResponse?.totalRevenue) {
        revenue = revResponse.totalRevenue;
      }

      setMetrics({
        inCount: checkIns,
        outCount: checkOuts,
        overnightCount: overnight,
        todayRevenue: revenue
      });

      setAllReservations(reservations);
      filterReservations(appointmentFilter, reservations);
      
    } catch (err: any) {
      logger.error('Failed to load dashboard data', { error: err.message });
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [appointmentFilter, filterReservations]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      logger.debug('Window focused, refreshing dashboard');
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  return {
    ...metrics,
    allReservations,
    filteredReservations,
    loading,
    error,
    appointmentFilter,
    filterReservations,
    refreshData: loadData
  };
};
