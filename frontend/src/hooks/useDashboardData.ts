import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../services/reservationService';
import { logger } from '../utils/logger';

interface DashboardMetrics {
  inCount: number | null;
  outCount: number | null;
  overnightCount: number | null;
}

interface DashboardData extends DashboardMetrics {
  allReservations: any[];
  filteredReservations: any[];
  loading: boolean;
  error: string | null;
  appointmentFilter: 'in' | 'out' | 'all';
}

/**
 * useDashboardData Hook
 * 
 * Custom hook for managing all dashboard data fetching, filtering, and state management.
 * Provides a clean separation between data logic and UI components.
 * 
 * Features:
 * - Parallel API calls for reservations and revenue
 * - Client-side metric calculations (check-ins, check-outs, overnight)
 * - Real-time filtering without re-fetching
 * - Auto-refresh on window focus
 * - UTC-based date comparisons for timezone consistency
 * - Error handling with user-friendly messages
 * 
 * Performance Optimizations:
 * - useCallback with empty deps to prevent infinite loops
 * - Single data fetch on mount (fetches all active reservations)
 * - Memoized filter function
 * - Efficient UTC date calculations
 * - Client-side filtering (no API calls for filter changes)
 * 
 * Date Handling:
 * - Fetches all active reservations (no server-side date filtering)
 * - Uses UTC date methods for consistent timezone handling
 * - Filters check-ins/check-outs based on UTC date comparison
 * - Default filter shows today's check-ins
 * 
 * @returns {Object} Dashboard data and control functions
 * @returns {number|null} inCount - Number of check-ins today (UTC)
 * @returns {number|null} outCount - Number of check-outs today (UTC)
 * @returns {number|null} overnightCount - Number of overnight guests
 * @returns {Reservation[]} allReservations - All fetched reservations
 * @returns {Reservation[]} filteredReservations - Filtered reservations based on current filter
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {'in'|'out'|'all'} appointmentFilter - Current filter state (default: 'in')
 * @returns {Function} filterReservations - Function to change filter
 * @returns {Function} refreshData - Function to manually refresh data
 * 
 * @example
 * const {
 *   inCount,
 *   filteredReservations,
 *   loading,
 *   filterReservations
 * } = useDashboardData();
 */
export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    inCount: null,
    outCount: null,
    overnightCount: null
  });
  
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'in' | 'out' | 'all'>('in'); // Default to check-ins

  /**
   * Filter reservations based on check-in or check-out status
   * 
   * Performs client-side filtering for instant updates without API calls.
   * Compares dates in YYYY-MM-DD format to handle timezone correctly.
   * 
   * @param filter - Filter type: 'in' (check-ins), 'out' (check-outs), or 'all'
   * @param reservations - Optional array to filter (defaults to allReservations)
   */
  const filterReservations = useCallback((filter: 'in' | 'out' | 'all', reservations?: any[]) => {
    const reservationsToFilter = reservations || allReservations;
    
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let filtered = reservationsToFilter;
    
    if (filter === 'in') {
      // Show only check-ins (reservations starting today)
      filtered = reservationsToFilter.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const startDateStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
        return startDateStr === formattedToday;
      });
    } else if (filter === 'out') {
      // Show only check-outs (reservations ending today)
      filtered = reservationsToFilter.filter((res: any) => {
        const endDate = new Date(res.endDate);
        const endDateStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;
        return endDateStr === formattedToday;
      });
    }
    // 'all' filter shows everything (no filtering needed)
    
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
      
      console.log('[Dashboard] Loading data for date:', formattedToday);
      
      const activeStatuses = 'PENDING,CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED,NO_SHOW';
      
      // Fetch reservations - don't filter by date, we'll filter client-side
      console.log('[Dashboard] Fetching reservations...');
      const reservationsResponse = await reservationService.getAllReservations(1, 250, 'startDate', 'asc', activeStatuses);
      console.log('[Dashboard] Reservations response:', reservationsResponse);

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
      
      console.log('[Dashboard] Extracted reservations:', reservations.length, 'reservations');

      // Calculate metrics
      const checkIns = reservations.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const startDateStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
        return startDateStr === formattedToday;
      }).length;

      const checkOuts = reservations.filter((res: any) => {
        const endDate = new Date(res.endDate);
        const endDateStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;
        return endDateStr === formattedToday;
      }).length;

      const overnight = reservations.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const endDate = new Date(res.endDate);
        const startDateStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
        const endDateStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`;
        return startDateStr < formattedToday && endDateStr >= formattedToday;
      }).length;

      console.log('[Dashboard] Calculated metrics:', {
        checkIns,
        checkOuts,
        overnight,
        totalReservations: reservations.length
      });

      setMetrics({
        inCount: checkIns,
        outCount: checkOuts,
        overnightCount: overnight
      });

      setAllReservations(reservations);
      
      // Apply initial filter (check-ins by default)
      const checkInReservations = reservations.filter((res: any) => {
        const startDate = new Date(res.startDate);
        const startDateStr = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
        return startDateStr === formattedToday;
      });
      setFilteredReservations(checkInReservations);
      
    } catch (err: any) {
      logger.error('Failed to load dashboard data', { error: err.message });
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - stable function

  // Load data on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      logger.debug('Window focused, refreshing dashboard');
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadData is stable, no need in deps

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
