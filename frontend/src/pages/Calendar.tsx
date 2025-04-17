import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import Calendar from '../components/calendar/Calendar';

const CalendarPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Calendar
        </Typography>
        <Calendar />
      </Box>
    </Container>
  );
};

export default CalendarPage;
