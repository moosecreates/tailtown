import React from 'react';
import { TableRow, TableCell, Typography } from '@mui/material';
import { Resource } from '../../../services/calendarService';
import { Reservation } from '../../../services/reservationService';
import ReservationCell from './ReservationCell';
import calendarService from '../../../services/calendarService';

interface KennelRowProps {
  kennel: Resource;
  days: Date[];
  reservations: Reservation[];
  onCellClick: (kennel: Resource, day: Date, reservation?: Reservation) => void;
}

const KennelRow: React.FC<KennelRowProps> = ({
  kennel,
  days,
  reservations,
  onCellClick
}) => {
  return (
    <TableRow>
      <TableCell 
        sx={{ 
          position: 'sticky', 
          left: 0, 
          zIndex: 1,
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(224, 224, 224, 1)'
        }}
      >
        <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
          {kennel.suiteNumber ? `${kennel.suiteNumber}` : kennel.name}
        </Typography>
      </TableCell>
      
      {days.map((day, index) => {
        const reservation = calendarService.isKennelOccupied(kennel, day, reservations, [kennel]);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        
        // Check for reservation continuation from previous/next day
        const yesterday = new Date(day);
        yesterday.setDate(day.getDate() - 1);
        
        const tomorrow = new Date(day);
        tomorrow.setDate(day.getDate() + 1);
        
        const yesterdayReservation = calendarService.isKennelOccupied(
          kennel, yesterday, reservations, [kennel]
        );
        const tomorrowReservation = calendarService.isKennelOccupied(
          kennel, tomorrow, reservations, [kennel]
        );
        
        // Add border styling for multi-day reservations
        const continuationStyle = reservation ? {
          borderLeft: index > 0 && yesterdayReservation?.id === reservation?.id
            ? `2px solid ${calendarService.getStatusColor(reservation.status)}`
            : undefined,
          borderRight: index < days.length - 1 && tomorrowReservation?.id === reservation?.id
            ? `2px solid ${calendarService.getStatusColor(reservation.status)}`
            : undefined,
        } : {};
        
        return (
          <TableCell 
            key={index}
            sx={{ 
              p: 0,
              ...continuationStyle
            }}
          >
            <ReservationCell
              kennel={kennel}
              day={day}
              reservation={reservation}
              isWeekend={isWeekend}
              onClick={onCellClick}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default KennelRow;
