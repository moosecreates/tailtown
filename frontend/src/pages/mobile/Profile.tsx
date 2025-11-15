import React from 'react';
import { Box, Typography } from '@mui/material';
import { MobileHeader } from '../../components/mobile/MobileHeader';

const Profile: React.FC = () => {
  return (
    <Box>
      <MobileHeader title="Profile" showNotifications />
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Profile feature coming soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default Profile;
