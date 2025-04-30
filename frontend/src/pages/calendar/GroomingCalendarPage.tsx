import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SpecializedCalendar from '../../components/calendar/SpecializedCalendar';
import { ServiceCategory } from '../../types/service';

/**
 * Grooming Calendar Page Component
 * 
 * Displays a calendar view filtered to show only grooming service reservations.
 * Uses the SpecializedCalendar component with fixed time formatting.
 */
const GroomingCalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Grooming Calendar
        </Typography>
      </Box>
      <SpecializedCalendar 
        serviceCategories={[ServiceCategory.GROOMING]} 
        calendarTitle="Grooming Calendar"
      />
    </Container>
  );
};

export default GroomingCalendarPage;
