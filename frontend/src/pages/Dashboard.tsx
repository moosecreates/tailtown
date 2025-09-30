import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, CardHeader, Button, CircularProgress, Chip } from '@mui/material';
import { 
  Login as InIcon, 
  Logout as OutIcon, 
  Hotel as OvernightIcon, 
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { petService } from '../services/petService';
import PetNameWithIcons from '../components/pets/PetNameWithIcons';

/**
 * Dashboard component displays key business metrics and upcoming reservations.
 * Shows reservation counts (In, Out, Overnight), revenue, and recent activity.
 */
const Dashboard = () => {
  const [inCount, setInCount] = useState<number | null>(null);
  const [outCount, setOutCount] = useState<number | null>(null);
  const [overnightCount, setOvernightCount] = useState<number | null>(null);
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
      // Get today's date in local timezone (YYYY-MM-DD format)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedToday = `${year}-${month}-${day}`;
      
      // Get tomorrow's date for overnight calculations
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowYear = tomorrow.getFullYear();
      const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
      const formattedTomorrow = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
      
      console.log('Local timezone info:', {
        currentTime: today.toString(),
        timezoneOffset: today.getTimezoneOffset(),
        formattedToday,
        formattedTomorrow
      });
      
      // Define statuses to include (all except CANCELLED)
      const activeStatuses = 'PENDING,CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED,NO_SHOW';
      
      console.log('Loading dashboard data for today:', formattedToday);
      // Reset all state to prevent stale or mock data from persisting
      setInCount(0);
      setOutCount(0);
      setOvernightCount(0);
      setTodayRevenue(0);
      setUpcomingReservations([]);
      
      console.log('Making API calls...');
      
      // Get a date range around today (yesterday to tomorrow) to capture all relevant reservations
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      console.log('Date range for reservations:', yesterdayFormatted, 'to', formattedTomorrow);
      
      // Make separate calls to get exactly what we need
      // Get ALL reservations that overlap with today (not just starting today)
      const [allReservations, upcoming, revenue] = await Promise.all([
        // Get reservations that are active on today's date (start <= today AND end >= today)
        reservationService.getAllReservations(1, 200, 'startDate', 'asc', activeStatuses),
        reservationService.getAllReservations(1, 10, 'startDate', 'asc', 'CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED', formattedToday),
        reservationService.getTodayRevenue()
      ]);
      console.log('API calls completed');
      
      // Process reservations to calculate In, Out, and Overnight counts
      let inCount = 0;
      let outCount = 0;
      let overnightCount = 0;
      
      console.log('All reservations response:', allReservations);
      
      let reservations: any[] = [];
      
      // Handle different response structures
      if (allReservations && allReservations.data) {
        if (Array.isArray(allReservations.data)) {
          // Direct array in data field
          reservations = allReservations.data;
        } else if (typeof allReservations.data === 'object' && allReservations.data !== null) {
          // Check for nested reservations array
          const dataObj = allReservations.data as any;
          if (dataObj.reservations && Array.isArray(dataObj.reservations)) {
            reservations = dataObj.reservations;
          }
        }
      }
      
      console.log('Processing all reservations:', reservations.length);
      
      if (reservations.length > 0) {
        reservations.forEach((reservation: any) => {
          // Parse dates and normalize to local date strings for comparison
          const startDateStr = reservation.startDate.split('T')[0]; // YYYY-MM-DD
          const endDateStr = reservation.endDate.split('T')[0]; // YYYY-MM-DD
          const todayStr = formattedToday; // YYYY-MM-DD
          
          console.log('Processing reservation:', {
            id: reservation.id,
            customer: reservation.customer?.firstName + ' ' + reservation.customer?.lastName,
            pet: reservation.pet?.name,
            service: reservation.service?.name,
            startDateStr,
            endDateStr,
            todayStr
          });
          
          // Check if reservation is active today (overlaps with today)
          const isActiveToday = startDateStr <= todayStr && endDateStr >= todayStr;
          
          if (!isActiveToday) {
            // Skip reservations that don't overlap with today
            console.log('Skipping - not active today');
            return;
          }
          
          console.log('Active reservation found!');
          
          // IN: Reservations checking in today (start date = today)
          if (startDateStr === todayStr) {
            inCount++;
            console.log('IN count incremented for reservation:', reservation.id, reservation.pet?.name);
          }
          
          // OUT: Reservations checking out today (end date = today)
          if (endDateStr === todayStr) {
            outCount++;
            console.log('OUT count incremented for reservation:', reservation.id, reservation.pet?.name);
          }
          
          // OVERNIGHT: Reservations staying overnight (active today AND end date is after today)
          if (endDateStr > todayStr) {
            overnightCount++;
            console.log('OVERNIGHT count incremented for reservation:', reservation.id, reservation.pet?.name);
          }
        });
      }
      
      console.log('Reservation counts - In:', inCount, 'Out:', outCount, 'Overnight:', overnightCount);
      setInCount(inCount);
      setOutCount(outCount);
      setOvernightCount(overnightCount);
      
      // Safely extract reservation data from response - ensure it's always an array
      // Cast upcoming to the proper response type
      const reservationResponse = upcoming as ReservationResponse;
      console.log('Processing upcoming reservations response:', reservationResponse);
      
      // Process upcoming reservations with the same structure handling
      console.log('Upcoming reservations full response:', reservationResponse);
      
      let upcomingReservationsData: any[] = [];
      
      if (reservationResponse && reservationResponse.status === 'success' && reservationResponse.data) {
        if (Array.isArray(reservationResponse.data)) {
          // Direct array in data field
          upcomingReservationsData = reservationResponse.data;
          console.log('Found upcoming reservations as array in data field', upcomingReservationsData.length);
        } else if (typeof reservationResponse.data === 'object' && reservationResponse.data !== null) {
          // Handle nested structure
          const dataObj = reservationResponse.data as any;
          if (dataObj.reservations && Array.isArray(dataObj.reservations)) {
            upcomingReservationsData = dataObj.reservations;
            console.log('Found upcoming reservations in data.reservations array', upcomingReservationsData.length);
          } else if (dataObj.data && Array.isArray(dataObj.data)) {
            upcomingReservationsData = dataObj.data;
            console.log('Found upcoming reservations in nested data.data array', upcomingReservationsData.length);
          }
        }
      } else if (Array.isArray(reservationResponse)) {
        // Direct array response
        upcomingReservationsData = reservationResponse;
        console.log('Found upcoming reservations as direct array response', upcomingReservationsData.length);
      }
      
      console.log('Final upcoming reservations being set:', upcomingReservationsData.length);
      
      // Fetch detailed pet data for each reservation to get pet icons
      const reservationsWithPetDetails = await Promise.all(
        upcomingReservationsData.map(async (reservation) => {
          // Use petId from reservation root level, not from pet object
          const petId = reservation.petId || reservation.pet?.id;
          if (petId) {
            try {
              const petDetails = await petService.getPetById(petId);
              console.log(`Pet ${petDetails.name} icons from database:`, petDetails.petIcons);
              console.log(`Pet ${petDetails.name} iconNotes from database:`, petDetails.iconNotes);
              
              // Merge pet details with reservation
              return {
                ...reservation,
                pet: {
                  ...reservation.pet,
                  petIcons: petDetails.petIcons || [],
                  iconNotes: petDetails.iconNotes || {},
                  profilePhoto: petDetails.profilePhoto
                }
              };
            } catch (error) {
              console.error('Error fetching pet details for pet ID:', petId, error);
              return reservation; // Return original reservation if pet fetch fails
            }
          }
          return reservation; // Return original reservation if no pet ID
        })
      );
      
      console.log('Reservations with pet details:', reservationsWithPetDetails);
      setUpcomingReservations(reservationsWithPetDetails);
      
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
    title: 'In', 
    value: inCount === null ? <CircularProgress size={20} /> : inCount, 
    icon: <InIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    link: '/calendar',
    change: ''
  },
  { 
    title: 'Out', 
    value: outCount === null ? <CircularProgress size={20} /> : outCount, 
    icon: <OutIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    link: '/calendar',
    change: ''
  },
  { 
    title: 'Overnight', 
    value: overnightCount === null ? <CircularProgress size={20} /> : overnightCount, 
    icon: <OvernightIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    link: '/calendar',
    change: ''
  },
  { 
    title: 'Today\'s Revenue', 
    value: todayRevenue === null ? <CircularProgress size={20} /> : `$${(todayRevenue || 0).toLocaleString()}`, 
    icon: <MoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    link: '/reports',
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
                    
                    {upcomingReservations.map((reservation) => {
                      // Pet icons will display here once assigned to pets
                      
                      return (
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
                        <Box sx={{ textAlign: 'left' }}>
                          <PetNameWithIcons
                            petName={reservation.pet?.name || 'Unknown Pet'}
                            petIcons={reservation.pet?.petIcons}
                            iconNotes={reservation.pet?.iconNotes}
                            petType={reservation.pet?.type}
                            profilePhoto={reservation.pet?.profilePhoto}
                            size="small"
                            nameVariant="body2"
                            showPhoto={true}
                          />
                        </Box>
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
                      );
                    })}
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
