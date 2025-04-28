import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Paper, 
  Chip, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import ReservationForm from '../../components/reservations/ReservationForm';
import { reservationService } from '../../services/reservationService';
import { debounce } from 'lodash';

const Reservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  // Initialize with today's date in local timezone using YYYY-MM-DD format
  // Store the date as a Date object to avoid timezone issues with the picker
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Initialize with today's date 
    return new Date();
  });
  
  // Create a formatted string version for API calls
  const getFormattedDateString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const dateString = getFormattedDateString(selectedDate);
      console.log('Loading reservations for date:', dateString);
      const response = await reservationService.getAllReservations(
        page,
        10, // limit
        'startDate', // sortBy
        'asc', // sortOrder
        undefined, // status - get all statuses
        getFormattedDateString(selectedDate) // date filter using formatted string
      );
      console.log('Reservations response:', response);
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        setReservations(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error('Invalid reservations response format:', response);
        setReservations([]);
      }
    } catch (err) {
      setError('Failed to load reservations');
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedDate]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleCreateReservation = async (formData: any) => {
    try {
      await reservationService.createReservation(formData);
      setIsFormOpen(false);
      loadReservations(); // Reload the list
    } catch (err) {
      console.error('Error creating reservation:', err);
      throw err; // Let the form handle the error
    }
  };

  const reservationsData = [
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
      status: 'CONFIRMED'
    }
  ];

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CHECKED_IN': return 'info';
      case 'CHECKED_OUT': return 'secondary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'error';
      default: return 'default';
    }
  }, []);

  const handleStatusClick = (event: React.MouseEvent<HTMLDivElement>, reservation: any) => {
    setStatusMenuAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => {
    if (!selectedReservation) return;
    
    try {
      setStatusUpdateLoading(true);
      await reservationService.updateReservation(selectedReservation.id, { status: newStatus });
      
      // Update the local state to reflect the change immediately
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === selectedReservation.id ? { ...res, status: newStatus } : res
        )
      );
      
      // Close the menu
      handleStatusMenuClose();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError('Failed to update reservation status');
    } finally {
      setStatusUpdateLoading(false);
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

  if (loading && !reservations.length) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>  
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Reservations</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by Date"
                value={selectedDate}
                onChange={(newDate) => {
                  if (newDate) {
                    console.log('Setting selected date to:', newDate);
                    setSelectedDate(newDate);
                  }
                }}
                slotProps={{ 
                  textField: { 
                    size: "small",
                    sx: { minWidth: '150px' }
                  } 
                }}
              />
            </LocalizationProvider>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
            >
              New Reservation
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Paper elevation={3}>
          <Box sx={{ p: 1.5 }}>
            {reservations.length === 0 ? (
              <Typography variant="body1">No reservations found</Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {reservations.map(reservation => (
                  <Paper 
                    key={reservation.id} 
                    elevation={1} 
                    onClick={() => window.location.href = `/reservations/${reservation.id}`}
                    sx={{ 
                      p: 1.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: '2fr 2fr 2.5fr 100px' 
                      }, 
                      gap: 2,
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Pet:</Typography>
                          <Typography variant="body2">{reservation.pet.name}</Typography>
                          <Typography variant="caption" color="text.secondary">({reservation.pet.type})</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Owner:</Typography>
                          <Typography variant="body2">{reservation.customer.firstName} {reservation.customer.lastName}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Service:</Typography>
                          <Typography variant="body2">{reservation.service.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Status:</Typography>
                          <Chip 
                            size="small"
                            label={reservation.status} 
                            color={getStatusColor(reservation.status) as any}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent onClick
                              handleStatusClick(e, reservation);
                            }}
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Kennel:</Typography>
                          {reservation.resource ? (
                            <Chip
                              size="small"
                              label={reservation.resource.attributes?.suiteNumber ? 
                                `#${reservation.resource.attributes.suiteNumber} - ${reservation.resource.name || 'Suite'}` : 
                                (reservation.resource.name || `#${reservation.resource.id.substring(0, 6)}`)}
                              color="primary"
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                '& .MuiChip-label': { px: 1, fontSize: '0.7rem' }
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {reservation.suiteType ? 
                                `Auto-assigned (${reservation.suiteType.replace('_SUITE', '').replace('_', ' ')})` : 
                                'Not assigned'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Check-In:</Typography>
                          <Typography variant="body2">{formatDate(reservation.startDate)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Check-Out:</Typography>
                          <Typography variant="body2">{formatDate(reservation.endDate)}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            window.location.href = `/reservations/${reservation.id}`;
                          }}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'primary.light',
                              color: 'common.white'
                            }
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New Reservation
        </DialogTitle>
        <DialogContent>
          <ReservationForm onSubmit={handleCreateReservation} />
        </DialogContent>
      </Dialog>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {availableStatuses.map((status) => (
          <MenuItem 
            key={status} 
            onClick={() => handleStatusChange(status)}
            disabled={statusUpdateLoading || (selectedReservation && selectedReservation.status === status)}
            sx={{
              fontSize: '0.875rem',
              py: 0.75,
              minHeight: 'auto',
              color: selectedReservation && selectedReservation.status === status ? 'text.disabled' : 'inherit'
            }}
          >
            <Chip
              size="small"
              label={status}
              color={getStatusColor(status) as any}
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

export default Reservations;
