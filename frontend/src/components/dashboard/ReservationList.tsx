import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, Chip, Button, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
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
    type?: string;
    breed?: string;
    profilePhoto?: string;
    petIcons?: any; // JSON array of icon IDs
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
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
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getFilterTitle()}
            {reservations.length > 0 && (
              <Chip 
                label={reservations.length} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
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
          <List 
            sx={{ 
              maxHeight: 500, 
              overflow: 'auto',
              p: 0,
              '& .MuiListItem-root': {
                borderBottom: 1,
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 0
                }
              }
            }}
          >
            {reservations.map((reservation) => (
              <ListItem
                key={reservation.id}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemText
                  disableTypography
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {reservation.pet && (
                        <PetNameWithIcons
                          petName={reservation.pet.name}
                          petIcons={reservation.pet.petIcons}
                          petType={reservation.pet.type as any}
                          profilePhoto={reservation.pet.profilePhoto}
                          size="medium"
                          showPhoto={true}
                          nameVariant="body2"
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" component="span">
                        • {reservation.customer?.firstName} {reservation.customer?.lastName}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {formatTime(reservation.startDate)}
                      </Typography>
                      {reservation.service?.name && (
                        <>
                          <Typography variant="caption" color="text.secondary" component="span">•</Typography>
                          <Typography variant="caption" color="text.secondary" component="span">
                            {reservation.service.name}
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />
                <Chip 
                  label={reservation.status} 
                  color={getStatusColor(reservation.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </ListItem>
            ))}
          </List>
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
