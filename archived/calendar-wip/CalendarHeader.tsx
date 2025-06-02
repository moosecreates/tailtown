import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';

export type ViewType = 'day' | 'week' | 'month';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  days: Date[];
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewTypeChange: (viewType: ViewType) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewType,
  days,
  onPrevious,
  onNext,
  onToday,
  onViewTypeChange
}) => {
  // Get the title for the current view
  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    
    if (viewType === 'day') {
      options.day = 'numeric';
      return new Intl.DateTimeFormat('en-US', options).format(currentDate);
    } else if (viewType === 'week') {
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      
      const firstMonth = firstDay.getMonth();
      const lastMonth = lastDay.getMonth();
      
      if (firstMonth === lastMonth) {
        // Same month
        return `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(firstDay)} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      } else {
        // Different months
        return `${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(firstDay)} ${firstDay.getDate()} - ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(lastDay)} ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      }
    } else {
      // Month view
      return new Intl.DateTimeFormat('en-US', options).format(currentDate);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onPrevious}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 1 }}>
          {getViewTitle()}
        </Typography>
        <IconButton onClick={onNext}>
          <ChevronRightIcon />
        </IconButton>
        <IconButton onClick={onToday} sx={{ ml: 1 }}>
          <TodayIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* View Type Selector */}
        <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 1, mr: 2 }}>
          <Tooltip title="Month View">
            <IconButton 
              color={viewType === 'month' ? 'primary' : 'default'} 
              onClick={() => onViewTypeChange('month')}
            >
              <CalendarViewMonthIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Week View">
            <IconButton 
              color={viewType === 'week' ? 'primary' : 'default'} 
              onClick={() => onViewTypeChange('week')}
            >
              <CalendarViewWeekIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Day View">
            <IconButton 
              color={viewType === 'day' ? 'primary' : 'default'} 
              onClick={() => onViewTypeChange('day')}
            >
              <CalendarViewDayIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarHeader;
