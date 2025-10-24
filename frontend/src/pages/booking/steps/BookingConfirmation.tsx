import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface BookingConfirmationProps {
  bookingData: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>Booking Confirmed!</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Thank you for your booking. You will receive a confirmation email shortly.
      </Typography>
      <Button variant="contained" href="/">Return to Home</Button>
    </Box>
  );
};

export default BookingConfirmation;
