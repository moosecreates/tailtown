import React from 'react';
import { Container, Typography, Box, Button, Paper, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Grooming Calendar Page Component - Placeholder
 * 
 * This is a temporary placeholder for the grooming calendar page
 * to avoid the FullCalendar error: "context.cmdFormatter is not a function"
 */
const GroomingCalendarPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Grooming Calendar
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Grooming Calendar - Coming Soon
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          We're currently working on improving the grooming calendar functionality.
          In the meantime, you can use the following options to navigate to other areas of the application.
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            component={Link} 
            to="/calendar"
            color="primary"
          >
            Main Calendar
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/reservations"
            color="primary"
          >
            Reservations
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/customers"
            color="primary"
          >
            Customers
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default GroomingCalendarPage;
