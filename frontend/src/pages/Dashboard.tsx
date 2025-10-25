import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import ReservationList from '../components/dashboard/ReservationList';
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments';
import UpcomingClasses from '../components/dashboard/UpcomingClasses';
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
    todayRevenue,
    filteredReservations,
    loading,
    error,
    appointmentFilter,
    filterReservations
  } = useDashboardData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Metrics Cards */}
        <DashboardMetrics
          inCount={inCount}
          outCount={outCount}
          overnightCount={overnightCount}
          todayRevenue={todayRevenue}
          appointmentFilter={appointmentFilter}
          onFilterChange={filterReservations}
        />

        {/* New Widgets Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <UpcomingAppointments />
          </Grid>
          <Grid item xs={12} md={6}>
            <UpcomingClasses />
          </Grid>
        </Grid>

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
