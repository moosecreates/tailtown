import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, Paper, Button, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationService, Reservation } from '../../services/reservationService';

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservation = async () => {
    try {
      if (!id) return;
      const data = await reservationService.getReservationById(id);
      setReservation(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      setError('Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !reservation) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'Reservation not found'}</Alert>
        </Box>
      </Container>
    );
  }

  const handleEdit = () => {
    navigate(`/reservations/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/reservations');
  };

  const handleCancel = async () => {
    try {
      if (!id) return;
      await reservationService.updateReservation(id, { status: 'CANCELLED' });
      await fetchReservation();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError('Failed to cancel reservation');
    }
  };

  const handleCheckIn = async () => {
    try {
      if (!id) return;
      await reservationService.updateReservation(id, { status: 'CHECKED_IN' });
      await fetchReservation();
    } catch (error) {
      console.error('Error checking in reservation:', error);
      setError('Failed to check in reservation');
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!id) return;
      await reservationService.updateReservation(id, { status: 'CHECKED_OUT' });
      await fetchReservation();
    } catch (error) {
      console.error('Error checking out reservation:', error);
      setError('Failed to check out reservation');
    }
  };

  const {
    startDate,
    endDate,
    status,
    notes,
    staffNotes,
    customer,
    pet,
    service,
    createdAt
  } = reservation;

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
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
    const basePrice = service?.price || 0;
    return basePrice;
  };

  // Helper function to get chip color based on status
  const getStatusChipColor = (status: string): 'success' | 'warning' | 'info' | 'default' | 'error' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CHECKED_IN':
        return 'info';
      case 'CHECKED_OUT':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Reservation Details
          </Typography>
          <Chip 
            label={reservation.status} 
            color={getStatusChipColor(reservation.status)}
            size="medium"
          />
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Reservation Information</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Check-In</Typography>
                <Typography variant="body2">{formatDate(startDate)}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Check-Out</Typography>
                <Typography variant="body1">{formatDate(endDate)}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Service</Typography>
                <Typography variant="body1">{service?.name || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {service?.description || 'No description available'}
                </Typography>
              </Box>
              
              {reservation.resource && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Assigned Resource</Typography>
                  <Typography variant="body1">{reservation.resource.name} ({reservation.resource.type})</Typography>
                </Box>
              )}
              
              {/* Add-ons feature to be implemented */}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Total Price</Typography>
                <Typography variant="body1" fontWeight="bold">${calculateTotal()}</Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>Pet & Customer Information</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Pet</Typography>
                <Typography variant="body1">{pet?.name || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pet?.type || 'N/A'} • {pet?.breed || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Owner</Typography>
                <Typography variant="body1">{customer?.firstName || 'N/A'} {customer?.lastName || ''}</Typography>
                <Typography variant="body2">
                  {customer?.email || 'N/A'} • {customer?.phone || 'N/A'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Customer Notes</Typography>
                <Typography variant="body2">
                  {notes || 'No notes provided'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Staff Notes</Typography>
                <Typography variant="body2">
                  {staffNotes || 'No staff notes'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Reservation Created</Typography>
                <Typography variant="body2">{formatDate(createdAt)}</Typography>
              </Box>
              
              {/* Confirmed by feature to be implemented */}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit Reservation
          </Button>
          {reservation.status === 'CONFIRMED' && (
            <Button variant="contained" color="info" onClick={handleCheckIn}>
              Check In
            </Button>
          )}
          {reservation.status === 'CHECKED_IN' && (
            <Button variant="contained" color="secondary" onClick={handleCheckOut}>
              Check Out
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleCancel}
            disabled={reservation.status === 'CANCELLED'}
          >
            Cancel Reservation
          </Button>
          <Button variant="outlined" onClick={handleBack}>
            Back to Reservations
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReservationDetails;
