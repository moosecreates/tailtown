import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School as ClassIcon } from '@mui/icons-material';
import SpecializedCalendar from '../../components/calendar/SpecializedCalendar';
import { ServiceCategory } from '../../types/service';

/**
 * Training Calendar Page Component
 * 
 * Displays a calendar view filtered to show only training service reservations.
 * Uses the SpecializedCalendar component with fixed time formatting.
 */
const TrainingCalendarPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Training Calendar
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ClassIcon />}
          onClick={() => navigate('/training/classes')}
        >
          Manage Classes & Enrollment
        </Button>
      </Box>
      <SpecializedCalendar 
        serviceCategories={[ServiceCategory.TRAINING]} 
        calendarTitle="Training Calendar"
      />
    </Container>
  );
};

export default TrainingCalendarPage;
