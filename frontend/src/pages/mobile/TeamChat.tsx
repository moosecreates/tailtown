import React from 'react';
import { Box, Typography } from '@mui/material';
import { MobileHeader } from '../../components/mobile/MobileHeader';

export const TeamChat: React.FC = () => {
  return (
    <Box>
      <MobileHeader title="Team Chat" showNotifications />
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Team chat feature coming soon...
        </Typography>
      </Box>
    </Box>
  );
};
