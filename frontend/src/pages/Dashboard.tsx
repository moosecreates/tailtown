import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, CardHeader, Button, CircularProgress } from '@mui/material';
import { 
  People as PeopleIcon, 
  Pets as PetsIcon, 
  EventNote as EventNoteIcon, 
  AttachMoney as MoneyIcon,
  PersonAdd as PersonAddIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { petService } from '../services/petService';
import { reservationService } from '../services/reservationService';

const Dashboard = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [petCount, setPetCount] = useState<number | null>(null);
  const [reservationCount, setReservationCount] = useState<number | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customers, pets, reservations, upcoming, revenue] = await Promise.all([
        customerService.getAllCustomers(),
        petService.getAllPets(1, 1),
        reservationService.getAllReservations(),
        reservationService.getAllReservations(1, 5, 'startDate', 'asc', 'CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED'),
        reservationService.getTodayRevenue()
      ]);
      
      setCustomerCount(customers.data?.length || 0);
      setPetCount(pets.results);
      setReservationCount(reservations.results);
      setUpcomingReservations(upcoming.data || []);
      setTodayRevenue(revenue.revenue);
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
    title: 'Reservations', 
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

  // Mock upcoming reservations
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="Today's Appointments" 
              action={
                <Button 
                  component={Link} 
                  to="/reservations"
                  variant="contained" 
                  size="small"
                  startIcon={<EventNoteIcon />}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
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
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        p: 1,
                        fontWeight: 'bold',
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="subtitle2">Customer</Typography>
                      <Typography variant="subtitle2">Pet</Typography>
                      <Typography variant="subtitle2">Service</Typography>
                      <Typography variant="subtitle2">Time</Typography>
                    </Box>
                    
                    {upcomingReservations.map((reservation) => (
                      <Box 
                        key={reservation.id}
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
                        <Typography variant="body2">{reservation.customer?.firstName} {reservation.customer?.lastName}</Typography>
                        <Typography variant="body2">{reservation.pet?.name}</Typography>
                        <Typography variant="body2">{reservation.service?.name}</Typography>
                        <Typography variant="body2">
                          {new Date(reservation.startDate).toLocaleDateString()}
                          {reservation.startDate !== reservation.endDate ? 
                            ` - ${new Date(reservation.endDate).toLocaleDateString()}` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="Quick Actions" 
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr' }, gap: 2 }}>
                <Button
                  component={Link}
                  to="/customers/new"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  fullWidth
                >
                  New Customer
                </Button>
                <Button
                  component={Link}
                  to="/pets/new"
                  variant="outlined"
                  startIcon={<PetsIcon />}
                  fullWidth
                >
                  New Pet
                </Button>
                <Button
                  component={Link}
                  to="/reservations/new"
                  variant="outlined"
                  startIcon={<EventNoteIcon />}
                  fullWidth
                >
                  New Reservation
                </Button>
                <Button
                  component={Link}
                  to="/calendar"
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  fullWidth
                >
                  View Calendar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
