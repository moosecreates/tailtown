import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Reservation } from '../../../services/reservationService';
import { Resource } from '../../../services/calendarService';
import calendarService from '../../../services/calendarService';

interface ReservationCellProps {
  kennel: Resource;
  day: Date;
  reservation: Reservation | undefined;
  isWeekend: boolean;
  onClick: (kennel: Resource, day: Date, reservation?: Reservation) => void;
}

const ReservationCell: React.FC<ReservationCellProps> = ({
  kennel,
  day,
  reservation,
  isWeekend,
  onClick
}) => {
  const isOccupied = !!reservation;
  
  // Check if the reservation continues from previous day and to next day
  const getContinuationStyle = (
    kennel: Resource, 
    day: Date, 
    reservation: Reservation | undefined, 
    reservations: Reservation[]
  ) => {
    if (!reservation) return {};
    
    const yesterday = new Date(day);
    yesterday.setDate(day.getDate() - 1);
    
    const tomorrow = new Date(day);
    tomorrow.setDate(day.getDate() + 1);
    
    const yesterdayReservation = calendarService.isKennelOccupied(kennel, yesterday, reservations, [kennel]);
    const tomorrowReservation = calendarService.isKennelOccupied(kennel, tomorrow, reservations, [kennel]);
    
    return {
      borderLeft: yesterdayReservation?.id === reservation.id
        ? `2px solid ${calendarService.getStatusColor(reservation.status)}`
        : undefined,
      borderRight: tomorrowReservation?.id === reservation.id
        ? `2px solid ${calendarService.getStatusColor(reservation.status)}`
        : undefined,
    };
  };

  return (
    <Box
      onClick={() => onClick(kennel, day, reservation)}
      sx={{ 
        cursor: 'pointer',
        bgcolor: isOccupied 
          ? `${calendarService.getStatusColor(reservation.status)}22` // Light version of status color
          : isWeekend 
            ? 'rgba(0, 0, 0, 0.04)' 
            : 'inherit',
        '&:hover': {
          bgcolor: isOccupied 
            ? `${calendarService.getStatusColor(reservation.status)}44` // Slightly darker on hover
            : 'rgba(0, 0, 0, 0.08)',
        },
        p: 0.5,
        height: 45,
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        // We'll add continuation borders in the parent component
      }}
    >
      {isOccupied ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
            <Chip 
              label={reservation.status} 
              size="small" 
              sx={{ 
                bgcolor: calendarService.getStatusColor(reservation.status),
                color: 'white',
                fontSize: '0.6rem',
                height: 16,
                '& .MuiChip-label': { px: 0.5 }
              }} 
            />
          </Box>
          <Typography variant="caption" display="block" noWrap sx={{ fontSize: '0.7rem' }}>
            {reservation.pet?.name || 'Unknown Pet'}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

export default ReservationCell;
