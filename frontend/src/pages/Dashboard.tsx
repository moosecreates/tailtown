import React from 'react';
import { Box, Paper, Typography, Card, CardContent, CardHeader, Button } from '@mui/material';
import { People as PeopleIcon, Pets as PetsIcon, EventNote as EventNoteIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Mock data for dashboard
const stats = [
  { 
    title: 'Customers', 
    value: 124, 
    icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    link: '/customers',
    change: '+12%'
  },
  { 
    title: 'Pets', 
    value: 186, 
    icon: <PetsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    link: '/pets',
    change: '+8%'
  },
  { 
    title: 'Reservations', 
    value: 32, 
    icon: <EventNoteIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    link: '/reservations',
    change: '+24%'
  },
  { 
    title: 'Revenue', 
    value: '$9,284', 
    icon: <MoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    link: '/reports',
    change: '+18%'
  }
];

// Mock upcoming reservations
const upcomingReservations = [
  { id: '1', customerName: 'John Smith', petName: 'Max', service: 'Boarding', startDate: '2025-04-14', endDate: '2025-04-18' },
  { id: '2', customerName: 'Sarah Johnson', petName: 'Bella', service: 'Daycare', startDate: '2025-04-14', endDate: '2025-04-14' },
  { id: '3', customerName: 'Michael Brown', petName: 'Charlie', service: 'Grooming', startDate: '2025-04-15', endDate: '2025-04-15' },
  { id: '4', customerName: 'Emily Davis', petName: 'Luna', service: 'Training', startDate: '2025-04-16', endDate: '2025-04-16' },
];

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
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
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: stat.change.startsWith('+') ? 'success.main' : 'error.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {stat.change} from last month
                  </Typography>
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
      
      {/* Today's Appointments */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        <Box>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader 
              title="Today's Appointments" 
              action={
                <Button 
                  component={Link} 
                  to="/calendar" 
                  color="primary"
                >
                  View Calendar
                </Button>
              } 
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
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
                      <Typography variant="body2">{reservation.customerName}</Typography>
                      <Typography variant="body2">{reservation.petName}</Typography>
                      <Typography variant="body2">{reservation.service}</Typography>
                      <Typography variant="body2">
                        {new Date(reservation.startDate).toLocaleDateString()}
                        {reservation.startDate !== reservation.endDate ? 
                          ` - ${new Date(reservation.endDate).toLocaleDateString()}` : ''}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader 
              title="Quick Actions" 
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link}
                  to="/customers/new"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  New Customer
                </Button>
                
                <Button 
                  variant="contained" 
                  color="secondary" 
                  component={Link}
                  to="/pets/new"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  New Pet
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success" 
                  component={Link}
                  to="/reservations/new"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  New Reservation
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="info" 
                  component={Link}
                  to="/reports"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  View Reports
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
