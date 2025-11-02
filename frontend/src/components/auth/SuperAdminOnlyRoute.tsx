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
  const regularToken = localStorage.getItem('token');

  // If no super admin token, redirect to super admin login
  if (!superAdminToken) {
    // If they have a regular staff token, show an alert
    if (regularToken) {
      alert('This page requires Super Admin access. Please login as a Super Admin.');
    }
    // Force full redirect to ensure correct path
    window.location.href = '/super-admin/login';
    return null;
  }

  // Render protected content
  return <>{children}</>;
};

export default SuperAdminOnlyRoute;
