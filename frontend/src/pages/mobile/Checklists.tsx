import React from 'react';
import { Box, Typography } from '@mui/material';
import { MobileHeader } from '../../components/mobile/MobileHeader';

export const Checklists: React.FC = () => {
  return (
    <Box>
      <MobileHeader title="Checklists" showNotifications />
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Checklists feature coming soon...
        </Typography>
      </Box>
    </Box>
  );
};
