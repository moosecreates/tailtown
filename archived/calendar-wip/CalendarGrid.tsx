import React from 'react';
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Typography, 
  Box
} from '@mui/material';
import { Resource } from '../../../services/calendarService';
import { Reservation } from '../../../services/reservationService';
import KennelRow from './KennelRow';
import calendarService from '../../../services/calendarService';

interface CalendarGridProps {
  days: Date[];
  kennels: Resource[];
  reservations: Reservation[];
  onCellClick: (kennel: Resource, day: Date, reservation?: Reservation) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  kennels,
  reservations,
  onCellClick
}) => {
  // Group kennels by type
  const groupedKennels = calendarService.groupKennelsByType(kennels);

  return (
    <Box sx={{ overflow: 'auto', height: 'calc(100% - 64px)' }}>
      <Table stickyHeader sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                position: 'sticky', 
                left: 0, 
                zIndex: 3,
                width: 120,
                borderRight: '1px solid rgba(224, 224, 224, 1)',
                bgcolor: 'background.paper'
              }}
            >
              Kennel
            </TableCell>
            {days.map((day, index) => (
              <TableCell key={index} align="center" sx={{ minWidth: 100 }}>
                <Typography variant="body2">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
                <Typography variant="body1">
                  {day.getDate()}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(groupedKennels).map(([type, kennelsOfType]) => (
            kennelsOfType.length > 0 && (
              <React.Fragment key={type}>
                {/* Kennel Type Header */}
                <TableRow>
                  <TableCell 
                    colSpan={days.length + 1} 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      py: 0.5
                    }}
                  >
                    <Typography variant="subtitle2">
                      {type === 'VIP_SUITE' ? 'VIP Suites' : 
                       type === 'STANDARD_PLUS_SUITE' ? 'Standard Plus Suites' : 
                       'Standard Suites'}
                    </Typography>
                  </TableCell>
                </TableRow>
                
                {/* Kennels of this type */}
                {kennelsOfType.map((kennel) => (
                  <KennelRow
                    key={kennel.id}
                    kennel={kennel}
                    days={days}
                    reservations={reservations}
                    onCellClick={onCellClick}
                  />
                ))}
              </React.Fragment>
            )
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default CalendarGrid;
