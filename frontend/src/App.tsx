import React, { useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter, useLocation } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AccessibilityFix from './components/AccessibilityFix';
import ScrollFix from './components/ScrollFix';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/Customers';
import CustomerDetails from './pages/customers/CustomerDetails';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import FinancialDashboard from './pages/analytics/Dashboard';
import CustomerValueReport from './pages/analytics/CustomerValueReport';
import Pets from './pages/pets/Pets';
import PetDetails from './pages/pets/PetDetails';
import Reservations from './pages/reservations/Reservations';
import ReservationDetails from './pages/reservations/ReservationDetails';
import ReservationEdit from './pages/reservations/ReservationEdit';
import CalendarPage from './pages/calendar/CalendarPage';
import GroomingCalendarPage from './pages/calendar/GroomingCalendarPage';
import TrainingCalendarPage from './pages/calendar/TrainingCalendarPage';
import Services from './pages/services/Services';
import ServiceDetails from './pages/services/ServiceDetails';
import Resources from './pages/resources/Resources';
// Import price rules components from settings directory
import PriceRulesPage from './pages/settings/PriceRules';
import PriceRuleDetailsPage from './pages/settings/PriceRuleDetailsPage';
import ResourceDetails from './pages/resources/ResourceDetails';
import SuitesPage from './pages/suites/SuitesPage';
import Settings from './pages/settings/Settings';
import Users from './pages/settings/Users';
import NotFound from './pages/NotFound';
import PriceRuleRedirect from './components/redirects/PriceRuleRedirect';
import Scheduling from './pages/staff/Scheduling';
import OrderEntry from './pages/orders/OrderEntry';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PrintKennelCards from './pages/kennels/PrintKennelCards';

// Custom event and utility components

// Custom event for route changes
export const RouteChangeEvent = 'app:route-change';

// Emit route change event
const RouteChangeListener = () => {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(RouteChangeEvent, { detail: location }));
  }, [location]);

  return null;
};

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
        <Route path="/reservations/:id/edit" element={isAuthenticated ? <ReservationEdit /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />} />
        <Route path="/calendar/grooming" element={isAuthenticated ? <GroomingCalendarPage /> : <Navigate to="/login" />} />
        <Route path="/calendar/training" element={isAuthenticated ? <TrainingCalendarPage /> : <Navigate to="/login" />} />
        <Route path="/services" element={isAuthenticated ? <Services /> : <Navigate to="/login" />} />
        <Route path="/services/new" element={isAuthenticated ? <ServiceDetails /> : <Navigate to="/login" />} />
        <Route path="/services/:id" element={isAuthenticated ? <ServiceDetails /> : <Navigate to="/login" />} />
        <Route path="/resources" element={isAuthenticated ? <Resources /> : <Navigate to="/login" />} />
        <Route path="/resources/:id" element={isAuthenticated ? <ResourceDetails /> : <Navigate to="/login" />} />
        <Route path="/suites" element={isAuthenticated ? <SuitesPage /> : <Navigate to="/login" />} />
        <Route path="/kennels/print-cards" element={isAuthenticated ? <PrintKennelCards /> : <Navigate to="/login" />} />
        {/* Redirects for old price rules URLs */}
        <Route path="/price-rules" element={<Navigate to="/settings/price-rules" />} />
        <Route path="/price-rules/:id" element={<PriceRuleRedirect />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/settings/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
        <Route path="/settings/price-rules" element={isAuthenticated ? <PriceRulesPage /> : <Navigate to="/login" />} />
        <Route path="/settings/price-rules/new" element={isAuthenticated ? <PriceRuleDetailsPage /> : <Navigate to="/login" />} />
        <Route path="/settings/price-rules/:id" element={isAuthenticated ? <PriceRuleDetailsPage /> : <Navigate to="/login" />} />
        <Route path="/staff/scheduling" element={isAuthenticated ? <Scheduling /> : <Navigate to="/login" />} />
        <Route path="/orders/new" element={isAuthenticated ? <OrderEntry /> : <Navigate to="/login" />} />
        <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isAuthenticated ? <FinancialDashboard /> : <Navigate to="/login" />} />
        <Route path="/analytics/customers" element={isAuthenticated ? <CustomerValueReport /> : <Navigate to="/login" />} />
        
        {/* Add any test routes here if needed */}
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AccessibilityFix />
        <ScrollFix />
        <RouteChangeListener />
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
