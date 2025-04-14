import React from 'react';
import { Typography, Container, Box, Paper, Button, Chip, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>();

  // This would be replaced with actual API call
  const mockReservation = {
    id: id || '1',
    pet: { 
      id: '1', 
      name: 'Buddy', 
      type: 'DOG',
      breed: 'Golden Retriever'
    },
    customer: { 
      id: '101', 
      firstName: 'John', 
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567'
    },
    service: { 
      id: '201',
      name: 'Boarding',
      price: 45.00,
      description: 'Overnight boarding in a comfortable suite'
    },
    resource: {
      id: '301',
      name: 'Suite 5',
      type: 'KENNEL'
    },
    addons: [
      { id: 'a1', name: 'Extra Walk', price: 10.00 },
      { id: 'a2', name: 'Playtime Session', price: 15.00 }
    ],
    startDate: '2025-04-14T09:00:00',
    endDate: '2025-04-16T17:00:00',
    status: 'CONFIRMED',
    notes: 'Please ensure Buddy gets his medication each morning.',
    staffNotes: 'Owner mentioned Buddy might be anxious first day.',
    confirmedBy: 'Sarah',
    createdAt: '2025-04-01T14:30:00'
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    const basePrice = mockReservation.service.price;
    const addonTotal = mockReservation.addons.reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonTotal;
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
            Reservation Details
          </Typography>
          <Chip 
            label={mockReservation.status} 
            color={getStatusColor(mockReservation.status) as any}
            size="medium"
          />
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Reservation Information</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Check-In</Typography>
                <Typography variant="body1">{formatDate(mockReservation.startDate)}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Check-Out</Typography>
                <Typography variant="body1">{formatDate(mockReservation.endDate)}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Service</Typography>
                <Typography variant="body1">{mockReservation.service.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mockReservation.service.description}
                </Typography>
              </Box>
              
              {mockReservation.resource && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Assigned Resource</Typography>
                  <Typography variant="body1">{mockReservation.resource.name} ({mockReservation.resource.type})</Typography>
                </Box>
              )}
              
              {mockReservation.addons.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Add-On Services</Typography>
                  {mockReservation.addons.map(addon => (
                    <Typography key={addon.id} variant="body2">
                      • {addon.name} (${addon.price.toFixed(2)})
                    </Typography>
                  ))}
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Total Price</Typography>
                <Typography variant="body1" fontWeight="bold">${calculateTotal().toFixed(2)}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>Pet & Customer Information</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Pet</Typography>
                <Typography variant="body1">{mockReservation.pet.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mockReservation.pet.type} • {mockReservation.pet.breed}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Owner</Typography>
                <Typography variant="body1">{mockReservation.customer.firstName} {mockReservation.customer.lastName}</Typography>
                <Typography variant="body2">
                  {mockReservation.customer.email} • {mockReservation.customer.phone}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Customer Notes</Typography>
                <Typography variant="body2">
                  {mockReservation.notes || 'No notes provided'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Staff Notes</Typography>
                <Typography variant="body2">
                  {mockReservation.staffNotes || 'No staff notes'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Reservation Created</Typography>
                <Typography variant="body2">
                  {formatDate(mockReservation.createdAt)}
                </Typography>
              </Box>
              
              {mockReservation.confirmedBy && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Confirmed By</Typography>
                  <Typography variant="body2">{mockReservation.confirmedBy}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">
            Edit Reservation
          </Button>
          {mockReservation.status === 'CONFIRMED' && (
            <Button variant="contained" color="info">
              Check In
            </Button>
          )}
          {mockReservation.status === 'CHECKED_IN' && (
            <Button variant="contained" color="secondary">
              Check Out
            </Button>
          )}
          <Button variant="outlined" color="error">
            Cancel Reservation
          </Button>
          <Button variant="outlined">
            Back to Reservations
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReservationDetails;
