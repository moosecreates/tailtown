import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Today as TodayIcon } from '@mui/icons-material';
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
    selectedDate,
    setSelectedDate,
    filterReservations
  } = useDashboardData();

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change from input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + 'T00:00:00');
    setSelectedDate(newDate);
  };

  // Reset to today
  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  return (
    <Box>
      {/* Header with Date Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ width: 180 }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<TodayIcon />}
            onClick={handleTodayClick}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Today
          </Button>
        </Box>
      </Box>
      
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
