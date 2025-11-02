/**
 * Super Admin Only Route
 * 
 * Wrapper component that requires super admin authentication.
 * Redirects to super admin login if not authenticated.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

interface SuperAdminOnlyRouteProps {
  children: React.ReactNode;
}

const SuperAdminOnlyRoute: React.FC<SuperAdminOnlyRouteProps> = ({ children }) => {
  const superAdminToken = localStorage.getItem('superAdminAccessToken');

  // If no super admin token, redirect to super admin login
  if (!superAdminToken) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default SuperAdminOnlyRoute;
