import React, { memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Grid
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { KennelType } from '../../../hooks/useKennelData';

// Define the view types
type ViewType = 'month' | 'week' | 'day';

interface KennelCalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  kennelTypeFilter: KennelType | 'ALL';
  onDateChange: (date: Date) => void;
  onViewTypeChange: (viewType: ViewType) => void;
  onKennelTypeFilterChange: (filter: KennelType | 'ALL') => void;
  onTodayClick: () => void;
}

/**
 * Header component for the KennelCalendar with navigation and filter controls
 * Memoized to prevent unnecessary re-renders
 */
const KennelCalendarHeader: React.FC<KennelCalendarHeaderProps> = memo(({
  currentDate,
  viewType,
  kennelTypeFilter,
  onDateChange,
  onViewTypeChange,
  onKennelTypeFilterChange,
  onTodayClick
}) => {
  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    onDateChange(newDate);
  };

  // Format the current date display
  const formatCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    
    if (viewType === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Date Navigation */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Previous">
              <IconButton onClick={navigatePrevious} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {formatCurrentDate()}
            </Typography>
            
            <Tooltip title="Next">
              <IconButton onClick={navigateNext} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Today">
              <Button
                variant="outlined"
                size="small"
                startIcon={<TodayIcon />}
                onClick={onTodayClick}
                sx={{ ml: 2 }}
              >
                Today
              </Button>
            </Tooltip>
          </Box>
        </Grid>

        {/* View Type and Filter Controls */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
            {/* View Type Selector */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Month View">
                <IconButton
                  onClick={() => onViewTypeChange('month')}
                  color={viewType === 'month' ? 'primary' : 'default'}
                  size="small"
                >
                  <CalendarViewMonthIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Week View">
                <IconButton
                  onClick={() => onViewTypeChange('week')}
                  color={viewType === 'week' ? 'primary' : 'default'}
                  size="small"
                >
                  <CalendarViewWeekIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Day View">
                <IconButton
                  onClick={() => onViewTypeChange('day')}
                  color={viewType === 'day' ? 'primary' : 'default'}
                  size="small"
                >
                  <CalendarViewDayIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Kennel Type Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Kennel Type</InputLabel>
              <Select
                value={kennelTypeFilter}
                label="Kennel Type"
                onChange={(e) => onKennelTypeFilterChange(e.target.value as KennelType | 'ALL')}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="STANDARD_SUITE">Standard</MenuItem>
                <MenuItem value="STANDARD_PLUS_SUITE">Standard Plus</MenuItem>
                <MenuItem value="VIP_SUITE">VIP</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

KennelCalendarHeader.displayName = 'KennelCalendarHeader';

export default KennelCalendarHeader;
