import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { resourceService, Resource } from '../../services/resourceService';
import { reservationService, Reservation } from '../../services/reservationService';
import ReservationForm from '../reservations/ReservationForm';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import api from '../../services/api';

// Define the view types
type ViewType = 'month' | 'week' | 'day';

// Define the kennel types
type KennelType = 'STANDARD_SUITE' | 'STANDARD_PLUS_SUITE' | 'VIP_SUITE';

// Define the props for the KennelCalendar component
interface KennelCalendarProps {
  onEventUpdate?: (reservation: Reservation) => void;
}

/**
 * KennelCalendar component provides a grid-based calendar view for kennel reservations
 * 
 * Features:
 * - Displays kennels in rows grouped by type
 * - Shows days of the month in columns
 * - Indicates occupied kennels with reservation details
 * - Allows creating new reservations by clicking on empty cells
 * - Supports month, week, and day views
 * - Enables editing existing reservations by clicking on occupied cells
 */
const KennelCalendar: React.FC<KennelCalendarProps> = ({ onEventUpdate }) => {
  // State for the current date and view
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  
  // State for kennels and reservations
  const [kennels, setKennels] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the reservation form dialog
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedKennel, setSelectedKennel] = useState<Resource | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // State for filtering
  const [kennelTypeFilter, setKennelTypeFilter] = useState<KennelType | 'ALL'>('ALL');

  // Function to get the days to display based on the view type
  const getDaysToDisplay = useCallback(() => {
    const days: Date[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, currentDate.getDate());
    
    if (viewType === 'day') {
      // Just show the current day
      days.push(new Date(date));
    } else if (viewType === 'week') {
      // Show 7 days starting from the current day
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        days.push(new Date(newDate));
      }
    } else {
      // Show the whole month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
    }
    
    return days;
  }, [currentDate, viewType]);

  // Function to load kennels
  const loadKennels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all kennels (suites)
      const response = await resourceService.getSuites(
        kennelTypeFilter !== 'ALL' ? kennelTypeFilter : undefined
      );
      
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        // Sort kennels by type and number
        const sortedKennels = [...response.data].sort((a, b) => {
          // First sort by type
          const typeOrder: Record<string, number> = {
            'VIP_SUITE': 1,
            'STANDARD_PLUS_SUITE': 2,
            'STANDARD_SUITE': 3
          };
          
          const typeA = a.attributes?.suiteType || '';
          const typeB = b.attributes?.suiteType || '';
          
          const typeComparison = (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
          
          if (typeComparison !== 0) {
            return typeComparison;
          }
          
          // Then sort by suite number
          return (a.suiteNumber || 0) - (b.suiteNumber || 0);
        });
        
        setKennels(sortedKennels);
      } else {
        setError('Failed to load kennels');
      }
    } catch (error) {
      console.error('Error loading kennels:', error);
      setError('Failed to load kennels');
    } finally {
      setLoading(false);
    }
  }, [kennelTypeFilter]);

  // Function to load reservations
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate the date range to fetch reservations
      const days = getDaysToDisplay();
      const startDate = formatDateToYYYYMMDD(days[0]);
      const endDate = formatDateToYYYYMMDD(days[days.length - 1]);
      
      // Get reservations for the date range
      // Note: The API actually supports more parameters than the TypeScript interface shows
      // We're using the actual API capabilities here
      const response = await api.get('/api/reservations', {
        params: {
          page: 1,
          limit: 1000,
          sortBy: 'startDate',
          sortOrder: 'asc',
          status: 'PENDING,CONFIRMED,CHECKED_IN',
          startDate,
          endDate,
          serviceCategory: 'BOARDING,DAYCARE'
        }
      });
      
      // The API returns data in a standard format { status: string, data: any[] }
      if (response?.data?.status === 'success' && Array.isArray(response?.data?.data)) {
        setReservations(response.data.data);
      } else {
        setError('Failed to load reservations');
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [getDaysToDisplay]);

  // Load kennels and reservations when the component mounts or when dependencies change
  useEffect(() => {
    loadKennels();
  }, [loadKennels]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Function to handle clicking on a cell
  const handleCellClick = (kennel: Resource, date: Date, existingReservation?: Reservation) => {
    if (existingReservation) {
      // If there's an existing reservation, open the form to edit it
      setSelectedReservation(existingReservation);
      setSelectedKennel(kennel);
      setSelectedDate({
        start: new Date(existingReservation.startDate),
        end: new Date(existingReservation.endDate)
      });
    } else {
      // Otherwise, open the form to create a new reservation
      setSelectedReservation(null);
      setSelectedKennel(kennel);
      
      // Set the start and end dates for the new reservation
      const start = new Date(date);
      start.setHours(9, 0, 0, 0); // Default start time: 9:00 AM
      
      const end = new Date(date);
      end.setHours(17, 0, 0, 0); // Default end time: 5:00 PM
      
      setSelectedDate({ start, end });
    }
    
    setIsFormOpen(true);
  };

  // Function to handle form submission
  const handleFormSubmit = async (formData: any) => {
    try {
      // First close the form to prevent any refreshing during API calls
      setIsFormOpen(false);
      
      let updatedReservation;
      
      if (selectedReservation) {
        updatedReservation = await reservationService.updateReservation(
          selectedReservation.id,
          formData
        );
      } else {
        updatedReservation = await reservationService.createReservation(formData);
      }

      if (updatedReservation) {
        // Reload reservations to refresh the calendar
        await loadReservations();
        
        if (onEventUpdate) {
          onEventUpdate(updatedReservation);
        }
      } else {
        console.warn('KennelCalendar: No reservation returned from server');
      }
      
      // Reset state after all operations are complete
      setSelectedReservation(null);
      setSelectedKennel(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('KennelCalendar: Error saving reservation:', error);
    }
  };

  // Function to navigate to the previous period
  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    
    setCurrentDate(newDate);
  };

  // Function to navigate to the next period
  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setCurrentDate(newDate);
  };

  // Function to navigate to today
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Function to get the status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return '#4caf50'; // Green
      case 'CHECKED_IN':
        return '#2196f3'; // Blue
      case 'PENDING':
        return '#ff9800'; // Orange
      default:
        return '#9e9e9e'; // Grey
    }
  };

  // Function to check if a kennel is occupied on a specific date
  const isKennelOccupied = (kennel: Resource, date: Date): Reservation | undefined => {
    const dateStr = formatDateToYYYYMMDD(date);
    
    return reservations.find(reservation => {
      // Check if the reservation is for this kennel
      // The resource property contains the kennel information
      if (reservation.resource?.id !== kennel.id) {
        return false;
      }
      
      // Check if the date falls within the reservation period
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      // Reset time components for date comparison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      const compareStartDate = new Date(startDate);
      compareStartDate.setHours(0, 0, 0, 0);
      
      const compareEndDate = new Date(endDate);
      compareEndDate.setHours(0, 0, 0, 0);
      
      return compareDate >= compareStartDate && compareDate <= compareEndDate;
    });
  };

  // Function to group kennels by type
  const groupedKennels = useMemo(() => {
    const grouped: Record<string, Resource[]> = {
      'VIP_SUITE': [],
      'STANDARD_PLUS_SUITE': [],
      'STANDARD_SUITE': []
    };
    
    kennels.forEach(kennel => {
      // First try to use the type field directly, then fall back to attributes.suiteType
      const type = kennel.type || kennel.attributes?.suiteType || 'STANDARD_SUITE';
      if (grouped[type]) {
        grouped[type].push(kennel);
      }
    });
    
    return grouped;
  }, [kennels]);

  // Get the days to display
  const days = getDaysToDisplay();
  
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
    <Box sx={{ height: 'calc(100vh - 170px)', p: 0 }}>
      <Paper elevation={3} sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Calendar Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={navigateToPrevious}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 1 }}>
              {getViewTitle()}
            </Typography>
            <IconButton onClick={navigateToNext}>
              <ChevronRightIcon />
            </IconButton>
            <IconButton onClick={navigateToToday} sx={{ ml: 1 }}>
              <TodayIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* View Type Selector */}
            <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 1, mr: 2 }}>
              <Tooltip title="Month View">
                <IconButton 
                  color={viewType === 'month' ? 'primary' : 'default'} 
                  onClick={() => setViewType('month')}
                >
                  <CalendarViewMonthIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Week View">
                <IconButton 
                  color={viewType === 'week' ? 'primary' : 'default'} 
                  onClick={() => setViewType('week')}
                >
                  <CalendarViewWeekIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Day View">
                <IconButton 
                  color={viewType === 'day' ? 'primary' : 'default'} 
                  onClick={() => setViewType('day')}
                >
                  <CalendarViewDayIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Kennel Type Filter */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Kennel Type</InputLabel>
              <Select
                value={kennelTypeFilter}
                onChange={(e) => setKennelTypeFilter(e.target.value as KennelType | 'ALL')}
                label="Kennel Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="VIP_SUITE">VIP Suite</MenuItem>
                <MenuItem value="STANDARD_PLUS_SUITE">Standard Plus</MenuItem>
                <MenuItem value="STANDARD_SUITE">Standard</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Calendar Content */}
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
              <Button variant="contained" onClick={() => { loadKennels(); loadReservations(); }} sx={{ mt: 2 }}>
                Retry
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                <TableHead sx={{ bgcolor: 'background.paper' }}>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        minWidth: 120, 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 3,
                        bgcolor: 'background.paper',
                        borderBottom: '2px solid rgba(224, 224, 224, 1)'
                      }}
                    >
                      Kennel
                    </TableCell>
                    {days.map((day, index) => (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          minWidth: 100,
                          bgcolor: day.getDay() === 0 || day.getDay() === 6 ? '#f0f0f0' : 'background.paper',
                          fontWeight: formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date()) ? 'bold' : 'normal',
                          color: formatDateToYYYYMMDD(day) === formatDateToYYYYMMDD(new Date()) ? 'primary.main' : 'inherit',
                          borderBottom: '2px solid rgba(224, 224, 224, 1)'
                        }}
                      >
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
                          <TableRow key={kennel.id}>
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
                              const reservation = isKennelOccupied(kennel, day);
                              const isOccupied = !!reservation;
                              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                              
                              return (
                                <TableCell 
                                  key={index}
                                  onClick={() => handleCellClick(kennel, day, reservation)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    bgcolor: isOccupied 
                                      ? `${getStatusColor(reservation.status)}22` // Light version of status color
                                      : isWeekend 
                                        ? 'rgba(0, 0, 0, 0.04)' 
                                        : 'inherit',
                                    '&:hover': {
                                      bgcolor: isOccupied 
                                        ? `${getStatusColor(reservation.status)}44` // Slightly darker on hover
                                        : 'rgba(0, 0, 0, 0.08)',
                                    },
                                    p: 0.5,
                                    height: 45,
                                    borderLeft: index > 0 && isOccupied && isKennelOccupied(kennel, days[index - 1])?.id === reservation?.id
                                      ? `2px solid ${getStatusColor(reservation.status)}`
                                      : undefined,
                                    borderRight: index < days.length - 1 && isOccupied && isKennelOccupied(kennel, days[index + 1])?.id === reservation?.id
                                      ? `2px solid ${getStatusColor(reservation.status)}`
                                      : undefined,
                                    borderBottom: '1px solid rgba(224, 224, 224, 1)'
                                  }}
                                >
                                  {isOccupied ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                                        <Chip 
                                          label={reservation.status} 
                                          size="small" 
                                          sx={{ 
                                            bgcolor: getStatusColor(reservation.status),
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
                                  ) : (
                                    <Box sx={{ 
                                      height: '100%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      color: 'text.secondary'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>•</Typography>
                                    </Box>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Reservation Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={() => {
          // First clear focus from any element inside the dialog
          // This prevents the accessibility warning when the dialog closes
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          
          // Then close the dialog and reset state
          setIsFormOpen(false);
          setSelectedReservation(null);
          setSelectedKennel(null);
          setSelectedDate(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '80vh' }
        }}
        // Prevent dialog from re-rendering its children unnecessarily
        keepMounted
        // Add proper focus handling for accessibility
        disableRestoreFocus
      >
        <DialogTitle sx={{ py: 1, px: 2, fontSize: '1rem' }}>
          {selectedReservation ? 'Edit Reservation' : 'Create New Reservation'}
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2 }}>
          {!selectedKennel || !selectedDate ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReservationFormWrapper 
              selectedKennel={selectedKennel}
              selectedDate={selectedDate}
              selectedReservation={selectedReservation}
              onSubmit={handleFormSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Wrapper component to prevent unnecessary re-renders of the reservation form
// This is a separate component to avoid React hooks rules violations
interface ReservationFormWrapperProps {
  selectedKennel: Resource;
  selectedDate: { start: Date; end: Date };
  selectedReservation: Reservation | null;
  onSubmit: (formData: any) => Promise<void>;
}

const ReservationFormWrapper: React.FC<ReservationFormWrapperProps> = React.memo(({ 
  selectedKennel, 
  selectedDate, 
  selectedReservation, 
  onSubmit 
}) => {
  // Uncomment for debugging if needed
  // console.log('Rendering ReservationFormWrapper with stable props');
  
  // Create the initial data object for the form
  const formInitialData = selectedReservation ? {
    ...selectedReservation,
    // Ensure we pass the resource ID in the format expected by the form
    resourceId: selectedKennel.id
  } : {
    // For new reservations, pre-populate with the selected kennel
    resourceId: selectedKennel.id,
    // Also pass the suite number and type for auto-selection
    // Use suiteType consistently instead of kennelType to avoid field duplication
    suiteNumber: selectedKennel.suiteNumber || '',
    suiteName: selectedKennel.name || '',
    suiteType: selectedKennel.type || selectedKennel.attributes?.suiteType || 'STANDARD_SUITE',
    // Include the start and end dates in the initialData
    startDate: selectedDate.start,
    endDate: selectedDate.end
  };
  
  return (
    <ReservationForm
      onSubmit={onSubmit}
      initialData={formInitialData}
      defaultDates={selectedDate}
    />
  );
});

export default KennelCalendar;
