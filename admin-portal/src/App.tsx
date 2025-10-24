import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import theme from './theme';

// Lazy load pages
const TenantList = lazy(() => import('./pages/tenants/TenantList'));
const CreateTenant = lazy(() => import('./pages/tenants/CreateTenant'));
const TenantDetail = lazy(() => import('./pages/tenants/TenantDetail'));
const TenantEdit = lazy(() => import('./pages/tenants/TenantEdit'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Tenant Management */}
            <Route path="/tenants" element={<TenantList />} />
            <Route path="/tenants/new" element={<CreateTenant />} />
            <Route path="/tenants/:id" element={<TenantDetail />} />
            <Route path="/tenants/:id/edit" element={<TenantEdit />} />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
