import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import ReservationList from '../components/dashboard/ReservationList';
import { useDashboardData } from '../hooks/useDashboardData';

/**
 * Dashboard component displays key business metrics and upcoming reservations.
 * Shows reservation counts (In, Out, Overnight), revenue, and recent activity.
 * 
 * Refactored to use:
 * - useDashboardData hook for data management
 * - DashboardMetrics component for metric cards
 * - ReservationList component for appointment display
 */
const Dashboard = () => {
  const {
    inCount,
    outCount,
    overnightCount,
    filteredReservations,
    loading,
    error,
    appointmentFilter,
    filterReservations
  } = useDashboardData();

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Metrics Cards */}
        <DashboardMetrics
          inCount={inCount}
          outCount={outCount}
          overnightCount={overnightCount}
          appointmentFilter={appointmentFilter}
          onFilterChange={filterReservations}
        />

        {/* Reservations List */}
        <ReservationList
          reservations={filteredReservations}
          loading={loading}
          error={error}
          filter={appointmentFilter}
          onFilterChange={filterReservations}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
