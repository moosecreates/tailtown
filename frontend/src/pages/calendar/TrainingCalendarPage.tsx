import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SpecializedCalendar from '../../components/calendar/SpecializedCalendar';
import { ServiceCategory } from '../../types/service';

/**
 * Training Calendar Page Component
 * 
 * Displays a calendar view filtered to show only training service reservations.
 * Uses the SpecializedCalendar component with fixed time formatting.
 */
const TrainingCalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Training Calendar
        </Typography>
      </Box>
      <SpecializedCalendar 
        serviceCategories={[ServiceCategory.TRAINING]} 
        calendarTitle="Training Calendar"
      />
    </Container>
  );
};

export default TrainingCalendarPage;
