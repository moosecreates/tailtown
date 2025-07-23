import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SpecializedCalendar from '../../components/calendar/SpecializedCalendar';
import { ServiceCategory } from '../../types/service';

/**
 * Grooming Calendar Page Component
 * 
 * Uses the SpecializedCalendar component to properly render grooming appointments
 * with fixed time formatting to avoid the "context.cmdFormatter is not a function" error.
 */
const GroomingCalendarPage: React.FC = () => {
  // Filter for grooming services only
  const serviceCategories = [ServiceCategory.GROOMING];
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Grooming Calendar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View and manage grooming appointments
        </Typography>
      </Box>
      
      <SpecializedCalendar 
        serviceCategories={serviceCategories}
        calendarTitle="Grooming Schedule"
      />
    </Container>
  );
};

export default GroomingCalendarPage;
