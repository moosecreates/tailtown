import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, CardHeader, Button, CircularProgress, Chip } from '@mui/material';
import { 
  People as PeopleIcon, 
  Pets as PetsIcon, 
  EventNote as EventNoteIcon, 
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { petService } from '../services/petService';
import { reservationService } from '../services/reservationService';

/**
 * Dashboard component displays key business metrics and upcoming reservations.
 * Shows customer count, pet count, revenue, and recent activity.
 */
const Dashboard = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [petCount, setPetCount] = useState<number | null>(null);
  const [reservationCount, setReservationCount] = useState<number | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  // Use proper type definitions for API responses
  type ReservationResponse = {
    status?: string;
    results?: number;
    pagination?: any;
    data?: any[] | {
      data?: any[];
      reservations?: any[];
    } | undefined;
  };
  
  type RevenueResponse = {
    status?: string;
    data?: number | {
      totalRevenue?: number;
      revenue?: number;
    };
    revenue?: number;
    totalRevenue?: number;
  };
  
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
 * Loads all dashboard data including metrics and upcoming reservations.
 * Handles loading states and error conditions.
 */
const loadData = async () => {
    setLoading(true);
    try {
      // Get today's date in YYYY-MM-DD format for filtering, preserving local timezone
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedToday = `${year}-${month}-${day}`;
      
      // Define statuses to include (all except CANCELLED)
      const activeStatuses = 'PENDING,CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED,NO_SHOW';
      
      console.log('Loading dashboard data for today:', formattedToday);
      // Reset all state to prevent stale or mock data from persisting
      setCustomerCount(null);
      setPetCount(null);
      setReservationCount(0); // Explicitly set to 0 until we have real data
      setTodayRevenue(0); // Explicitly set to 0 until we have real data
      setUpcomingReservations([]);
      
      const [customers, pets, todayReservations, upcoming, revenue] = await Promise.all([
        customerService.getAllCustomers(),
        petService.getAllPets(1, 1),
        reservationService.getAllReservations(1, 100, 'startDate', 'asc', activeStatuses, formattedToday),
        reservationService.getAllReservations(1, 10, 'startDate', 'asc', 'CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED', formattedToday),
        reservationService.getTodayRevenue()
      ]);
      
      // Process customer count from API response
      if (customers && customers.data && Array.isArray(customers.data)) {
        setCustomerCount(customers.data.length);
        console.log('Customer count set to:', customers.data.length);
      } else {
        setCustomerCount(0);
        console.log('No valid customer data found, setting count to 0');
      }

      // Process pet count from API response
      if (pets && pets.results !== undefined) {
        setPetCount(pets.results);
        console.log('Pet count set to:', pets.results);
      } else if (pets && pets.data && Array.isArray(pets.data)) {
        setPetCount(pets.data.length);
        console.log('Pet count set to:', pets.data.length);
      } else {
        setPetCount(0);
        console.log('No valid pet data found, setting count to 0');
      }

      // Process reservation count from API response
      console.log('Today reservations API full response:', todayReservations);
      
      let reservationCount = 0;
      
      // Based on the actual API response structure
      if (todayReservations && todayReservations.status === 'success') {
        // ALWAYS use the results field which contains the actual count of filtered reservations
        // This is the correct field to use as it represents the count of reservations after filtering
        reservationCount = todayReservations.results || 0;
        console.log('Using results field for reservation count:', reservationCount);
      } else if (Array.isArray(todayReservations)) {
        // Direct array response
        reservationCount = todayReservations.length;
        console.log('Using array length for reservation count:', reservationCount);
      } else {
        console.log('No valid reservation data structure found, setting count to 0');
      }
      
      console.log('Final reservation count being set:', reservationCount);
      setReservationCount(reservationCount);
      
      // Safely extract reservation data from response - ensure it's always an array
      // Cast upcoming to the proper response type
      const reservationResponse = upcoming as ReservationResponse;
      console.log('Processing upcoming reservations response:', reservationResponse);
      
      // Based on the API logs, we're getting: { status: 'success', results: 10, pagination: {...}, data: {...} }
      if (reservationResponse && typeof reservationResponse === 'object' && reservationResponse.status === 'success') {
        // Handle reservations where data is directly in the data field (not nested)
        console.log('Upcoming reservations full response:', reservationResponse);
        
        let upcomingReservationsData: any[] = [];
        
        // Based on the actual API response structure
        if (reservationResponse && reservationResponse.status === 'success') {
          if (reservationResponse.data && Array.isArray(reservationResponse.data)) {
            // Direct array in data field (this is the actual structure from the API)
            upcomingReservationsData = reservationResponse.data;
            console.log('Found upcoming reservations as array in data field', upcomingReservationsData.length);
          } else if (reservationResponse.data && typeof reservationResponse.data === 'object') {
            // Handle nested structure if present
            const dataObj = reservationResponse.data as Record<string, any>;
            if (dataObj.data && Array.isArray(dataObj.data)) {
              upcomingReservationsData = dataObj.data;
              console.log('Found upcoming reservations in nested data.data array', upcomingReservationsData.length);
            } else if (dataObj.reservations && Array.isArray(dataObj.reservations)) {
              upcomingReservationsData = dataObj.reservations;
              console.log('Found upcoming reservations in data.reservations array', upcomingReservationsData.length);
            }
          }
        } else if (Array.isArray(reservationResponse)) {
          // Direct array response
          upcomingReservationsData = reservationResponse;
          console.log('Found upcoming reservations as direct array response', upcomingReservationsData.length);
        }
        
        console.log('Final upcoming reservations being set:', upcomingReservationsData.length);
        setUpcomingReservations(upcomingReservationsData);
      } else {
        console.error('Invalid upcoming reservations data', reservationResponse);
        setUpcomingReservations([]);
      }
      
      // Process revenue data from API response
      console.log('Today\'s revenue full response:', revenue);
      
      let revenueValue = 0;
      
      // Handle revenue data with proper type checking
      if (revenue) {
        // Check if revenue is a direct number
        if (typeof revenue === 'number') {
          revenueValue = revenue;
          console.log('Found revenue as direct number', revenueValue);
        } 
        // Check if revenue is an object with the expected structure
        else if (typeof revenue === 'object') {
          const revenueObj = revenue as any; // Use type assertion to avoid TypeScript errors
          
          // Check for success status in API response
          if (revenueObj.status === 'success') {
            // Check for data field
            if (revenueObj.data !== undefined) {
              if (typeof revenueObj.data === 'number') {
                // Direct number in data field
                revenueValue = revenueObj.data;
                console.log('Found revenue as number in data field', revenueValue);
              } else if (typeof revenueObj.data === 'object' && revenueObj.data !== null) {
                // Object in data field
                const dataObj = revenueObj.data;
                if (dataObj.totalRevenue !== undefined) {
                  revenueValue = dataObj.totalRevenue;
                  console.log('Found revenue in data.totalRevenue', revenueValue);
                } else if (dataObj.revenue !== undefined) {
                  revenueValue = dataObj.revenue;
                  console.log('Found revenue in data.revenue', revenueValue);
                }
              }
            } 
            // Check for direct totalRevenue or revenue fields
            else if (revenueObj.totalRevenue !== undefined) {
              revenueValue = revenueObj.totalRevenue;
              console.log('Found revenue in totalRevenue', revenueValue);
            } else if (revenueObj.revenue !== undefined) {
              revenueValue = revenueObj.revenue;
              console.log('Found revenue in revenue', revenueValue);
            }
          }
        }
      }
      
      console.log('Final revenue value being set:', revenueValue);
      setTodayRevenue(revenueValue);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount, window focus, and route changes
  useEffect(() => {
    loadData();

    // Refresh data when window regains focus
    const handleFocus = () => {
      console.log('Window focused, refreshing dashboard data');
      loadData();
    };

    // Refresh data when returning to dashboard
    const handleRouteChange = (event: Event) => {
      const e = event as CustomEvent;
      if (e.detail?.pathname === '/dashboard') {
        console.log('Returned to dashboard, refreshing data');
        loadData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('app:route-change', handleRouteChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('app:route-change', handleRouteChange);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CHECKED_IN': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const stats = [
  { 
    title: 'Customers', 
    value: customerCount === null ? <CircularProgress size={20} /> : customerCount, 
    icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    link: '/customers',
    change: ''
  },
  { 
    title: 'Pets', 
    value: petCount === null ? <CircularProgress size={20} /> : petCount, 
    icon: <PetsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    link: '/pets',
    change: ''
  },
  { 
    title: "Today's Reservations", 
    value: reservationCount === null ? <CircularProgress size={20} /> : reservationCount, 
    icon: <EventNoteIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    link: '/reservations',
    change: ''
  },
  { 
    title: 'Today\'s Revenue', 
    value: todayRevenue === null ? <CircularProgress size={20} /> : `$${(todayRevenue || 0).toLocaleString()}`, 
    icon: <MoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    link: '/revenue',
    change: ''
  }
];

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          {stats.map((stat, index) => (
            <Box key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    {stat.change && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: stat.change.startsWith('+') ? 'success.main' : 'error.main',
                          fontWeight: 'medium'
                        }}
                      >
                        {stat.change}
                      </Typography>
                    )}
                  </Box>
                  <Box>{stat.icon}</Box>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: index === 0 
                      ? 'primary.main' 
                      : index === 1 
                        ? 'secondary.main' 
                        : index === 2 
                          ? 'success.main' 
                          : 'info.main',
                  }}
                />
              </Paper>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr' }, gap: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%', flexGrow: 1 }}>
            <CardHeader 
              title="Today's Appointments" 
              action={
                <Button 
                  component={Link} 
                  to="/calendar"
                  size="small"
                  variant="outlined"
                >
                  View All
                </Button>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 72px)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ overflowX: 'auto', overflowY: 'auto', flexGrow: 1 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Box sx={{ p: 3, color: 'error.main' }}>
                    <Typography>{error}</Typography>
                  </Box>
                ) : upcomingReservations.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Typography>No upcoming reservations</Typography>
                  </Box>
                ) : (
                  <Box sx={{ minWidth: 650 }}>
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                        p: 1,
                        fontWeight: 'bold',
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'background.paper',
                        zIndex: 1
                      }}
                    >
                      <Typography variant="subtitle2" align="left">Customer</Typography>
                      <Typography variant="subtitle2" align="left">Pet</Typography>
                      <Typography variant="subtitle2" align="left">Service</Typography>
                      <Typography variant="subtitle2" align="left">Time</Typography>
                      <Typography variant="subtitle2" align="left">Status</Typography>
                    </Box>
                    
                    {upcomingReservations.map((reservation) => (
                      <Box 
                        key={reservation.id}
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                          p: 1.5,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            cursor: 'pointer'
                          },
                          borderBottom: 1,
                          borderColor: 'divider'
                        }}
                        component={Link}
                        to={`/reservations/${reservation.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Typography variant="body2" align="left">{reservation.customer?.firstName} {reservation.customer?.lastName}</Typography>
                        <Typography variant="body2" align="left">{reservation.pet?.name}</Typography>
                        <Typography variant="body2" align="left">{reservation.service?.name}</Typography>
                        <Typography variant="body2" align="left">
                          {new Date(reservation.startDate).toLocaleDateString()}
                          {reservation.startDate !== reservation.endDate ? 
                            ` - ${new Date(reservation.endDate).toLocaleDateString()}` : ''}
                        </Typography>
                        <Box sx={{ textAlign: 'left' }}>
                          <Chip 
                            size="small"
                            label={reservation.status} 
                            color={getStatusColor(reservation.status)}
                            sx={{ minWidth: '90px' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
