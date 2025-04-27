import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Calendar from '../../components/calendar/Calendar';
import { ServiceCategory } from '../../types/service';

/**
 * Training Calendar Page Component
 * 
 * Displays a calendar view filtered to show only training service reservations.
 */
const TrainingCalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Training Calendar
        </Typography>
      </Box>
      <Calendar 
        serviceCategories={[ServiceCategory.TRAINING]} 
        calendarTitle="Training Calendar"
      />
    </Container>
  );
};

export default TrainingCalendarPage;
