import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, BrowserRouter, useLocation } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShoppingCartProvider } from './contexts/ShoppingCartContext';
import AccessibilityFix from './components/AccessibilityFix';
import ScrollFix from './components/ScrollFix';
import ApiTester from './components/debug/ApiTester';
import PageLoader from './components/common/PageLoader';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages - Lazy loaded for code splitting
// Core pages (loaded immediately)
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Lazy loaded pages - Customer Management
const Customers = lazy(() => import('./pages/customers/Customers'));
const CustomerDetails = lazy(() => import('./pages/customers/CustomerDetails'));

// Lazy loaded pages - Analytics & Reports
const AnalyticsDashboard = lazy(() => import('./pages/analytics/AnalyticsDashboard'));
const CustomerValueReport = lazy(() => import('./pages/analytics/CustomerValueReport'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

// Lazy loaded pages - Pet Management
const Pets = lazy(() => import('./pages/pets/Pets'));
const PetDetails = lazy(() => import('./pages/pets/PetDetails'));

// Lazy loaded pages - Reservations
const Reservations = lazy(() => import('./pages/reservations/Reservations'));
const ReservationDetails = lazy(() => import('./pages/reservations/ReservationDetails'));
const ReservationEdit = lazy(() => import('./pages/reservations/ReservationEdit'));

// Lazy loaded pages - Calendar
const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const GroomingCalendarPage = lazy(() => import('./pages/calendar/GroomingCalendarPage'));
const TrainingCalendarPage = lazy(() => import('./pages/calendar/TrainingCalendarPage'));

// Lazy loaded pages - Services & Resources
const Services = lazy(() => import('./pages/services/Services'));
const ServiceDetails = lazy(() => import('./pages/services/ServiceDetails'));
const Resources = lazy(() => import('./pages/resources/Resources'));
const ResourceDetails = lazy(() => import('./pages/resources/ResourceDetails'));
const SuitesPage = lazy(() => import('./pages/suites/SuitesPage'));

// Lazy loaded pages - Settings & Admin
const PriceRulesPage = lazy(() => import('./pages/settings/PriceRules'));
const PriceRuleDetailsPage = lazy(() => import('./pages/settings/PriceRuleDetailsPage'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Users = lazy(() => import('./pages/settings/Users'));
const PriceRuleRedirect = lazy(() => import('./components/redirects/PriceRuleRedirect'));

// Lazy loaded pages - Staff & Operations
const Scheduling = lazy(() => import('./pages/staff/Scheduling'));
const OrderEntry = lazy(() => import('./pages/orders/OrderEntry'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const PrintKennelCards = lazy(() => import('./pages/kennels/PrintKennelCards'));

// Lazy loaded pages - Marketing
const MarketingHub = lazy(() => import('./pages/admin/marketing/MarketingHub'));
const SmsMarketing = lazy(() => import('./pages/admin/marketing/SmsMarketing'));
const EmailMarketing = lazy(() => import('./pages/admin/marketing/EmailMarketing'));

// Lazy loaded pages - Check-In
const CheckInWorkflow = lazy(() => import('./pages/check-in/CheckInWorkflow'));
const CheckInComplete = lazy(() => import('./pages/check-in/CheckInComplete'));
const CheckInTemplateManager = lazy(() => import('./pages/admin/CheckInTemplateManager'));

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
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/reports" element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isAuthenticated ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
        <Route path="/analytics/customers" element={isAuthenticated ? <CustomerValueReport /> : <Navigate to="/login" />} />
        
        {/* Marketing Routes */}
        <Route path="/admin/marketing" element={isAuthenticated ? <MarketingHub /> : <Navigate to="/login" />} />
        <Route path="/admin/marketing/sms" element={isAuthenticated ? <SmsMarketing /> : <Navigate to="/login" />} />
        <Route path="/admin/marketing/email" element={isAuthenticated ? <EmailMarketing /> : <Navigate to="/login" />} />
        
        {/* Check-In Routes */}
        <Route path="/check-in/:reservationId" element={isAuthenticated ? <CheckInWorkflow /> : <Navigate to="/login" />} />
        <Route path="/check-in/:checkInId/complete" element={isAuthenticated ? <CheckInComplete /> : <Navigate to="/login" />} />
        <Route path="/admin/check-in-templates" element={isAuthenticated ? <CheckInTemplateManager /> : <Navigate to="/login" />} />
        
        {/* Debug routes */}
        <Route path="/debug/api" element={<ApiTester />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
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
          <ShoppingCartProvider>
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            }>
              <AppRoutes />
            </React.Suspense>
          </ShoppingCartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
