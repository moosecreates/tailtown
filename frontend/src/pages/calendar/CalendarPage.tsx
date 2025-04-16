import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Calendar from '../../components/calendar/Calendar';

const CalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Reservation Calendar
        </Typography>
      </Box>
      <Calendar />
    </Container>
  );
};

export default CalendarPage;
