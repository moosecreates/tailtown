import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/Customers';
import CustomerDetails from './pages/customers/CustomerDetails';
import Pets from './pages/pets/Pets';
import PetDetails from './pages/pets/PetDetails';
import Reservations from './pages/reservations/Reservations';
import ReservationDetails from './pages/reservations/ReservationDetails';
import Calendar from './pages/Calendar';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/customers" element={isAuthenticated ? <Customers /> : <Navigate to="/login" />} />
        <Route path="/customers/:id" element={isAuthenticated ? <CustomerDetails /> : <Navigate to="/login" />} />
        <Route path="/pets" element={isAuthenticated ? <Pets /> : <Navigate to="/login" />} />
        <Route path="/pets/:id" element={isAuthenticated ? <PetDetails /> : <Navigate to="/login" />} />
        <Route path="/reservations" element={isAuthenticated ? <Reservations /> : <Navigate to="/login" />} />
        <Route path="/reservations/:id" element={isAuthenticated ? <ReservationDetails /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#4c8bf5',
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <React.Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </Box>
          }>
            <AppRoutes />
          </React.Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
