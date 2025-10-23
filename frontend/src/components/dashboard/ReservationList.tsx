import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, Chip, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import PetNameWithIcons from '../pets/PetNameWithIcons';

interface Reservation {
  id: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  pet?: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    profileImageUrl?: string;
    icons?: string[];
  };
  startDate: string;
  endDate: string;
  status: string;
  service?: {
    name?: string;
  };
}

interface ReservationListProps {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  filter: 'in' | 'out' | 'all';
  onFilterChange: (filter: 'in' | 'out' | 'all') => void;
}

/**
 * ReservationList - Displays upcoming reservations with filtering
 * Shows check-ins, check-outs, or all appointments
 */
const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  loading,
  error,
  filter,
  onFilterChange
}) => {
  const getStatusColor = (status: string): "success" | "warning" | "info" | "error" | "default" => {
    switch(status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CHECKED_IN': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getFilterTitle = () => {
    switch(filter) {
      case 'in': return 'Check-Ins Today';
      case 'out': return 'Check-Outs Today';
      default: return 'Upcoming Appointments';
    }
  };

  return (
    <Card>
      <CardHeader 
        title={getFilterTitle()}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => onFilterChange('all')}
            >
              All
            </Button>
            <Button 
              size="small" 
              variant={filter === 'in' ? 'contained' : 'outlined'}
              onClick={() => onFilterChange('in')}
            >
              Check-Ins
            </Button>
            <Button 
              size="small" 
              variant={filter === 'out' ? 'contained' : 'outlined'}
              onClick={() => onFilterChange('out')}
            >
              Check-Outs
            </Button>
          </Box>
        }
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : reservations.length === 0 ? (
          <Typography color="text.secondary">
            No {filter === 'in' ? 'check-ins' : filter === 'out' ? 'check-outs' : 'appointments'} scheduled
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reservations.map((reservation) => (
              <Box
                key={reservation.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {reservation.pet && (
                      <>
                        <PetNameWithIcons 
                          petName={reservation.pet.name}
                          petIcons={reservation.pet.icons || []}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({reservation.customer?.firstName} {reservation.customer?.lastName})
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                  </Typography>
                  {reservation.service?.name && (
                    <Typography variant="caption" color="text.secondary">
                      {reservation.service.name}
                    </Typography>
                  )}
                </Box>
                <Chip 
                  label={reservation.status} 
                  color={getStatusColor(reservation.status)}
                  size="small"
                />
              </Box>
            ))}
          </Box>
        )}
        {reservations.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              component={Link}
              to="/calendar"
              variant="outlined"
              size="small"
            >
              View All Reservations
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationList;
