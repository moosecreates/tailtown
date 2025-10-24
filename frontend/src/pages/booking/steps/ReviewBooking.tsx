import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface ReviewBookingProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
}

const ReviewBooking: React.FC<ReviewBookingProps> = ({ onNext, onBack }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Review & Pay</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review and payment coming soon...
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>Back</Button>
        <Button variant="contained" onClick={onNext} endIcon={<ArrowForward />}>Complete Booking</Button>
      </Box>
    </Box>
  );
};

export default ReviewBooking;
