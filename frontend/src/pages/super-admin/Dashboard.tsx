/**
 * Super Admin Dashboard
 * 
 * Main dashboard for super admin portal.
 * Shows platform statistics and quick actions.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Business as TenantIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { superAdmin, logout } = useSuperAdmin();

  const handleLogout = async () => {
    await logout();
    navigate('/super-admin/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {superAdmin?.firstName || superAdmin?.email}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TenantIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Tenant Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage tenant accounts
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/tenants')}
                fullWidth
              >
                View Tenants
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StatsIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Platform Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Multi-tenant statistics & insights
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.open('http://localhost:3001/analytics', '_blank')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Account
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Email: {superAdmin?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {superAdmin?.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {superAdmin?.id}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* System Status Notice */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Multi-Tenant Management System - Fully Operational!
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          ✅ Super Admin Authentication • ✅ Tenant Management • ✅ Tenant Cloning • ✅ Gingr Sync (Every 8 Hours)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create tenants, clone from templates, and manage production accounts with automated Gingr synchronization.
        </Typography>
      </Box>
    </Container>
  );
};

export default SuperAdminDashboard;
