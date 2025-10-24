import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface CustomerInfoProps {
  bookingData: any;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: any) => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ onNext, onBack }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Your Information</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Customer information form coming soon...
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>Back</Button>
        <Button variant="contained" onClick={onNext} endIcon={<ArrowForward />}>Continue</Button>
      </Box>
    </Box>
  );
};

export default CustomerInfo;
