import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControl, 
  FormLabel, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  TextField, 
  Switch, 
  Chip, 
  Alert, 
  Divider, 
  List, 
  ListItem, 
  ListItemText
} from '@mui/material';
import { 
  DatePicker, 
  TimePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isSameDay, differenceInDays } from 'date-fns';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useReservationWizard } from '../ReservationWizard';
import { RecurrenceFrequency } from '../../../../types/petCare';

// Days of the week for recurring reservations
const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

/**
 * Schedule & Recurrence Step
 * 
 * Fourth step in the reservation wizard where the user sets
 * the schedule (start/end dates and times) and recurrence pattern
 * if applicable.
 */
const ScheduleRecurrenceStep: React.FC = () => {
  const { formData, dispatch } = useReservationWizard();
  const { 
    startDate, 
    endDate, 
    isRecurring, 
    recurringPattern,
    service
  } = formData;

  // Local state for recurrence preview
  const [previewDates, setPreviewDates] = useState<Date[]>([]);

  // Handle start date change
  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    
    dispatch({ type: 'SET_START_DATE', payload: date });
    
    // If end date is before new start date, update end date
    if (endDate && date > endDate) {
      let newEndDate: Date;
      if (service?.duration) {
        // If service has a duration, calculate end time based on duration
        newEndDate = new Date(date.getTime() + service.duration * 60000);
      } else {
        // Otherwise, default to end of day
        newEndDate = new Date(date);
        newEndDate.setHours(17, 0, 0, 0);
      }
      dispatch({ type: 'SET_END_DATE', payload: newEndDate });
    }
    
    // Update recurrence preview
    updateRecurrencePreview(date, endDate, isRecurring, recurringPattern);
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    
    dispatch({ type: 'SET_END_DATE', payload: date });
    
    // If start date is after new end date, update start date
    if (startDate && date < startDate) {
      dispatch({ type: 'SET_START_DATE', payload: date });
    }
    
    // Update recurrence preview
    updateRecurrencePreview(startDate, date, isRecurring, recurringPattern);
  };

  // Handle start time change
  const handleStartTimeChange = (time: Date | null) => {
    if (!time || !startDate) return;
    
    const newStart = new Date(startDate);
    newStart.setHours(time.getHours(), time.getMinutes());
    
    dispatch({ type: 'SET_START_DATE', payload: newStart });
    
    // If service has duration, update end time based on duration
    if (service?.duration && endDate) {
      const newEnd = new Date(newStart.getTime() + service.duration * 60000);
      dispatch({ type: 'SET_END_DATE', payload: newEnd });
    }
  };

  // Handle end time change
  const handleEndTimeChange = (time: Date | null) => {
    if (!time || !endDate) return;
    
    const newEnd = new Date(endDate);
    newEnd.setHours(time.getHours(), time.getMinutes());
    
    dispatch({ type: 'SET_END_DATE', payload: newEnd });
  };

  // Toggle recurring reservation
  const handleRecurringToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    dispatch({ type: 'SET_IS_RECURRING', payload: newValue });
    
    if (newValue && !recurringPattern) {
      // Initialize default recurring pattern
      const defaultPattern = {
        frequency: RecurrenceFrequency.WEEKLY,
        daysOfWeek: startDate ? [startDate.getDay()] : [0],
        interval: 1,
        endDate: endDate ? addDays(endDate, 28) : undefined
      };
      
      dispatch({ type: 'SET_RECURRING_PATTERN', payload: defaultPattern });
      
      // Update preview with default pattern
      updateRecurrencePreview(startDate, endDate, newValue, defaultPattern);
    } else {
      // Clear preview if recurring is turned off
      setPreviewDates([]);
    }
  };

  // Handle recurring pattern frequency change
  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = event.target.value as RecurrenceFrequency;
    
    const updatedPattern = {
      ...recurringPattern,
      frequency
    };
    
    dispatch({ type: 'SET_RECURRING_PATTERN', payload: updatedPattern });
    
    // Update preview
    updateRecurrencePreview(startDate, endDate, isRecurring, updatedPattern);
  };

  // Handle recurring days of week change
  const handleDayOfWeekChange = (day: number) => {
    // Check if the day is already selected
    let newDays: number[];
    
    // Initialize days of week if undefined
    const currentDays = recurringPattern?.daysOfWeek || [];
    
    if (currentDays.includes(day)) {
      // Remove day if already selected
      newDays = currentDays.filter(d => d !== day);
    } else {
      // Add day if not already selected
      newDays = [...currentDays, day];
    }
    
    // Ensure at least one day is selected
    if (newDays.length === 0) return;
    
    const updatedPattern = {
      ...recurringPattern,
      daysOfWeek: newDays
    };
    
    dispatch({ type: 'SET_RECURRING_PATTERN', payload: updatedPattern });
    
    // Update preview
    updateRecurrencePreview(startDate, endDate, isRecurring, updatedPattern);
  };

  // Handle recurring interval change
  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!recurringPattern) return;
    
    const interval = parseInt(event.target.value) || 1;
    
    const updatedPattern = {
      ...recurringPattern,
      interval: Math.max(1, interval) // Ensure interval is at least 1
    };
    
    dispatch({ type: 'SET_RECURRING_PATTERN', payload: updatedPattern });
    
    // Update preview
    updateRecurrencePreview(startDate, endDate, isRecurring, updatedPattern);
  };

  // Handle recurrence end date change
  const handleRecurrenceEndDateChange = (date: Date | null) => {
    if (!date || !recurringPattern) return;
    
    const updatedPattern = {
      ...recurringPattern,
      endDate: date
    };
    
    dispatch({ type: 'SET_RECURRING_PATTERN', payload: updatedPattern });
    
    // Update preview
    updateRecurrencePreview(startDate, endDate, isRecurring, updatedPattern);
  };

  // Update recurrence preview based on pattern
  const updateRecurrencePreview = (
    start: Date | null,
    end: Date | null,
    recurring: boolean,
    pattern: any
  ) => {
    if (!start || !end || !recurring || !pattern) {
      setPreviewDates([]);
      return;
    }
    
    const preview: Date[] = [];
    const patternEndDate = pattern.endDate || addDays(end, 30);
    const interval = pattern.interval || 1;
    
    switch (pattern.frequency) {
      case RecurrenceFrequency.DAILY:
        // Add dates at daily interval
        let currentDate = addDays(start, interval);
        while (currentDate <= patternEndDate) {
          preview.push(new Date(currentDate));
          currentDate = addDays(currentDate, interval);
        }
        break;
        
      case RecurrenceFrequency.WEEKLY:
        // Add dates on selected days of week
        if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) break;
        
        // Start from the day after the initial reservation
        currentDate = addDays(start, 1);
        
        while (currentDate <= patternEndDate) {
          // Check if this day of week is selected
          if (pattern.daysOfWeek.includes(currentDate.getDay())) {
            // Check if we're at the right interval week
            const weekDiff = Math.floor(differenceInDays(currentDate, start) / 7);
            if (weekDiff % interval === 0) {
              preview.push(new Date(currentDate));
            }
          }
          
          currentDate = addDays(currentDate, 1);
        }
        break;
        
      case RecurrenceFrequency.MONTHLY:
        // Add dates on the same day of month
        const dayOfMonth = start.getDate();
        let currentMonth = start.getMonth() + interval;
        let currentYear = start.getFullYear();
        
        while (true) {
          // Adjust year if month exceeds 11 (December)
          if (currentMonth > 11) {
            currentYear += Math.floor(currentMonth / 12);
            currentMonth = currentMonth % 12;
          }
          
          // Create date for this month
          const monthDate = new Date(currentYear, currentMonth, dayOfMonth);
          
          // Break if we've exceeded the end date
          if (monthDate > patternEndDate) break;
          
          preview.push(monthDate);
          
          // Move to next interval month
          currentMonth += interval;
        }
        break;
        
      default:
        break;
    }
    
    // Limit preview to 10 dates
    setPreviewDates(preview.slice(0, 10));
  };

  // Format time from date object
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'h:mm a');
  };

  // Calculate reservation duration
  const getReservationDuration = () => {
    if (!startDate || !endDate) return '';
    
    if (isSameDay(startDate, endDate)) {
      return 'Same-day reservation';
    }
    
    const days = differenceInDays(endDate, startDate);
    return `${days} night${days !== 1 ? 's' : ''}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Schedule
        </Typography>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Start Date & Time */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <CalendarTodayIcon 
                    fontSize="small" 
                    sx={{ mr: 1, verticalAlign: 'text-bottom' }}
                  />
                  Start Date
                </Typography>
                <DatePicker
                  value={startDate}
                  onChange={handleStartDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      helperText: "Arrival date"
                    } 
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <AccessTimeIcon 
                    fontSize="small" 
                    sx={{ mr: 1, verticalAlign: 'text-bottom' }}
                  />
                  Start Time
                </Typography>
                <TimePicker
                  value={startDate}
                  onChange={handleStartTimeChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      helperText: "Arrival time"
                    } 
                  }}
                />
              </Box>
            </Grid>
            
            {/* End Date & Time */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <CalendarTodayIcon 
                    fontSize="small" 
                    sx={{ mr: 1, verticalAlign: 'text-bottom' }}
                  />
                  End Date
                </Typography>
                <DatePicker
                  value={endDate}
                  onChange={handleEndDateChange}
                  minDate={startDate || undefined}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      helperText: "Departure date"
                    } 
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <AccessTimeIcon 
                    fontSize="small" 
                    sx={{ mr: 1, verticalAlign: 'text-bottom' }}
                  />
                  End Time
                </Typography>
                <TimePicker
                  value={endDate}
                  onChange={handleEndTimeChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      helperText: "Departure time"
                    } 
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          {/* Schedule Summary */}
          {startDate && endDate && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: 'background.default', 
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2">
                Reservation Summary:
              </Typography>
              <Typography variant="body2">
                From {format(startDate, 'MMMM d, yyyy')} at {formatTime(startDate)} to{' '}
                {format(endDate, 'MMMM d, yyyy')} at {formatTime(endDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getReservationDuration()}
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Recurring Reservation Toggle */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={isRecurring} 
                onChange={handleRecurringToggle}
                disabled={!startDate || !endDate}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventRepeatIcon sx={{ mr: 1 }} />
                <Typography>Recurring Reservation</Typography>
              </Box>
            }
          />
        </Box>
        
        {/* Recurring Pattern Options - only show if recurring is enabled */}
        {isRecurring && recurringPattern && (
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recurrence Pattern
            </Typography>
            
            {/* Frequency Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Frequency</FormLabel>
              <RadioGroup
                value={recurringPattern.frequency}
                onChange={handleFrequencyChange}
                row
              >
                <FormControlLabel
                  value={RecurrenceFrequency.DAILY}
                  control={<Radio />}
                  label="Daily"
                />
                <FormControlLabel
                  value={RecurrenceFrequency.WEEKLY}
                  control={<Radio />}
                  label="Weekly"
                />
                <FormControlLabel
                  value={RecurrenceFrequency.MONTHLY}
                  control={<Radio />}
                  label="Monthly"
                />
              </RadioGroup>
            </FormControl>
            
            {/* Interval Selection */}
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="body1">Every</Typography>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    type="number"
                    value={recurringPattern.interval || 1}
                    onChange={handleIntervalChange}
                    inputProps={{ min: 1, max: 12 }}
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {recurringPattern.frequency === RecurrenceFrequency.DAILY 
                      ? 'day(s)' 
                      : recurringPattern.frequency === RecurrenceFrequency.WEEKLY
                      ? 'week(s)'
                      : 'month(s)'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {/* Days of Week - only show for weekly recurrence */}
            {recurringPattern.frequency === RecurrenceFrequency.WEEKLY && (
              <Box sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  On these days
                </FormLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {daysOfWeek.map((day) => (
                    <Chip
                      key={day.value}
                      label={day.label}
                      onClick={() => handleDayOfWeekChange(day.value)}
                      color={recurringPattern?.daysOfWeek?.includes(day.value) ? "primary" : "default"}
                      variant={recurringPattern?.daysOfWeek?.includes(day.value) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* End Date */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <CalendarTodayIcon 
                  fontSize="small" 
                  sx={{ mr: 1, verticalAlign: 'text-bottom' }}
                />
                Series End Date
              </Typography>
              <DatePicker
                value={recurringPattern.endDate || null}
                onChange={handleRecurrenceEndDateChange}
                minDate={endDate || undefined}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    size: "small",
                    helperText: "When will the recurring reservations end?"
                  } 
                }}
              />
            </Box>
            
            {/* Recurrence Preview */}
            {previewDates.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Preview of Future Dates
                </Typography>
                <List dense>
                  {previewDates.map((date, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={format(date, 'EEEE, MMMM d, yyyy')} 
                      />
                    </ListItem>
                  ))}
                  {recurringPattern.endDate && previewDates.length === 10 && (
                    <ListItem>
                      <ListItemText 
                        secondary={`Additional dates until ${format(recurringPattern.endDate, 'MMMM d, yyyy')}`} 
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Paper>
        )}
        
        {/* Warning if no dates are selected */}
        {(!startDate || !endDate) && (
          <Alert severity="info">
            Please select both start and end dates to continue.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleRecurrenceStep;
