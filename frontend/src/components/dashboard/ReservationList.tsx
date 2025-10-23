import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, Chip, Button, CircularProgress, List, ListItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
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
 * ReservationList Component
 * 
 * Displays upcoming reservations in a compact, scrollable list optimized for high-volume operations.
 * Designed to handle 200+ daily reservations efficiently.
 * 
 * Features:
 * - Compact list layout (~60px per item)
 * - Scrollable container (500px max height)
 * - Pet avatars with profile photos
 * - Pet icons (medical/behavioral/dietary alerts)
 * - Filter buttons (All, Check-Ins, Check-Outs)
 * - Reservation count badge
 * - Status chips with color coding
 * - Hover effects for better UX
 * 
 * @param reservations - Array of reservation objects to display
 * @param loading - Loading state indicator
 * @param error - Error message if data fetch failed
 * @param filter - Current filter ('in' | 'out' | 'all')
 * @param onFilterChange - Callback to change filter
 * 
 * @example
 * <ReservationList
 *   reservations={filteredReservations}
 *   loading={loading}
 *   error={error}
 *   filter="in"
 *   onFilterChange={(filter) => setFilter(filter)}
 * />
 */
const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  loading,
  error,
  filter,
  onFilterChange
}) => {
  const navigate = useNavigate();

  /**
   * Maps reservation status to Material-UI chip color
   * @param status - Reservation status string
   * @returns Chip color variant
   */
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
                onClick={() => navigate(`/reservations/${reservation.id}`)}
                sx={{
                  py: 1,
                  px: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                    <Typography variant="caption" color="text.secondary">
                      • {reservation.customer?.firstName} {reservation.customer?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(reservation.startDate)}
                    </Typography>
                    {reservation.service?.name && (
                      <>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.service.name}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
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
