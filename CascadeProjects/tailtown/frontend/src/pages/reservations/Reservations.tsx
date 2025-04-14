import React from 'react';
import { Typography, Container, Box, Button, Paper, Chip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const Reservations = () => {
  // Mock data for display purposes
  const mockReservations = [
    { 
      id: '1', 
      pet: { id: '1', name: 'Buddy', type: 'DOG' },
      customer: { id: '101', firstName: 'John', lastName: 'Doe' },
      service: { name: 'Boarding' },
      startDate: '2025-04-14T09:00:00',
      endDate: '2025-04-16T17:00:00',
      status: 'CONFIRMED'
    },
    { 
      id: '2', 
      pet: { id: '2', name: 'Whiskers', type: 'CAT' },
      customer: { id: '102', firstName: 'Jane', lastName: 'Smith' },
      service: { name: 'Grooming' },
      startDate: '2025-04-15T13:00:00',
      endDate: '2025-04-15T14:30:00',
      status: 'PENDING'
    }
  ];

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Helper function to get chip color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CHECKED_IN': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Reservations
          </Typography>
          <Button variant="contained" color="primary">
            Add New Reservation
          </Button>
        </Box>
        
        <Paper elevation={3}>
          <Box sx={{ p: 2 }}>
            {mockReservations.length === 0 ? (
              <Typography variant="body1">No reservations found</Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {mockReservations.map(reservation => (
                  <Paper key={reservation.id} elevation={1} sx={{ p: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2">Pet</Typography>
                        <Typography variant="body1">{reservation.pet.name} ({reservation.pet.type})</Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Owner</Typography>
                        <Typography variant="body1">{reservation.customer.firstName} {reservation.customer.lastName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Service</Typography>
                        <Typography variant="body1">{reservation.service.name}</Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Status</Typography>
                        <Chip 
                          size="small"
                          label={reservation.status} 
                          color={getStatusColor(reservation.status) as any}
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Check-In</Typography>
                        <Typography variant="body1">{formatDate(reservation.startDate)}</Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Check-Out</Typography>
                        <Typography variant="body1">{formatDate(reservation.endDate)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton color="primary" size="small" href={`/reservations/${reservation.id}`}>
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Reservations;
