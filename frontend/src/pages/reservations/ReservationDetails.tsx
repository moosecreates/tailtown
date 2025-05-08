import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, Paper, Button, Chip, Divider, CircularProgress, Alert, Menu, MenuItem } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationService, Reservation } from '../../services/reservationService';

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

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
    
    // Calculate add-ons total
    const addOnsTotal = reservation.addOnServices?.reduce((total: number, addOn: { price?: number }) => {
      return total + (addOn.price || 0);
    }, 0) || 0;
    
    // Apply any discounts if present
    const discount = reservation.discount || 0;
    
    // Calculate the total
    const subtotal = basePrice + addOnsTotal;
    const total = subtotal - discount;
    
    return total;
  };

  // Helper function to get chip color based on status
  const getStatusChipColor = (status: string): 'success' | 'warning' | 'info' | 'default' | 'error' | 'secondary' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CHECKED_IN':
        return 'info';
      case 'CHECKED_OUT':
        return 'secondary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Available statuses for the dropdown
  const availableStatuses: Array<'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'> = [
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
  ];
  
  const handleStatusClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => {
    if (!id) return;
    
    try {
      setStatusUpdateLoading(true);
      await reservationService.updateReservation(id, { status: newStatus });
      await fetchReservation(); // Reload the reservation data
      handleStatusMenuClose();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Failed to update reservation status');
    } finally {
      setStatusUpdateLoading(false);
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
            color={getStatusChipColor(reservation.status as any)}
            size="small"
            sx={{ ml: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            onClick={handleStatusClick}
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
                  <Typography variant="body1">
                    {(() => {
                      const resource: any = reservation.resource;
                      const suiteNum = resource.suiteNumber || (resource.attributes && resource.attributes.suiteNumber);
                      if (suiteNum) {
                        return <>Suite #{suiteNum} ({resource.type})</>;
                      }
                      return <>{resource.name} ({resource.type})</>;
                    })()}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Pricing Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Base Service:</Typography>
                    <Typography variant="body2">${service?.price?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                  
                  {/* Display add-ons if any */}
                  {reservation.addOnServices && reservation.addOnServices.length > 0 && (
                    <>
                      {reservation.addOnServices.map((addOn, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{addOn.addOn?.name || 'Add-on'}:</Typography>
                          <Typography variant="body2">${addOn.price?.toFixed(2) || '0.00'}</Typography>
                        </Box>
                      ))}
                    </>
                  )}
                  
                  {/* Display discount if any */}
                  {reservation.discount && reservation.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2" color="error">-${reservation.discount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  
                  {/* Display total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                    <Typography variant="body1" fontWeight="bold">Total:</Typography>
                    <Typography variant="body1" fontWeight="bold">${calculateTotal().toFixed(2)}</Typography>
                  </Box>
                </Box>
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
      
      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {availableStatuses.map((status) => (
          <MenuItem 
            key={status} 
            onClick={() => handleStatusChange(status)}
            disabled={statusUpdateLoading || (reservation && reservation.status === status)}
            sx={{
              fontSize: '0.875rem',
              py: 0.75,
              minHeight: 'auto',
              color: reservation && reservation.status === status ? 'text.disabled' : 'inherit'
            }}
          >
            <Chip
              size="small"
              label={status}
              color={getStatusChipColor(status as any)}
              sx={{ 
                height: 20, 
                '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                minWidth: '80px'
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};

export default ReservationDetails;
