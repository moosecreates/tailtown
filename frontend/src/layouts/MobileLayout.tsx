import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { BottomNav } from '../components/mobile/BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  unreadMessages?: number;
  pendingTasks?: number;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
  unreadMessages = 0,
  pendingTasks = 0,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: showBottomNav ? 8 : 0, // Add padding for bottom nav
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {children}
      </Box>

      {/* Bottom navigation */}
      {showBottomNav && (
        <BottomNav
          unreadMessages={unreadMessages}
          pendingTasks={pendingTasks}
        />
      )}
    </Box>
  );
};
