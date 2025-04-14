import React, { useState } from 'react';
import { Typography, Container, Box, Paper, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock data for display purposes
  const mockEvents = [
    { 
      id: '1', 
      title: 'Buddy - Boarding', 
      start: new Date(2025, 3, 14, 9, 0), 
      end: new Date(2025, 3, 16, 17, 0),
      type: 'boarding',
      petName: 'Buddy',
      ownerName: 'John Doe'
    },
    { 
      id: '2', 
      title: 'Whiskers - Grooming', 
      start: new Date(2025, 3, 15, 13, 0), 
      end: new Date(2025, 3, 15, 14, 30),
      type: 'grooming',
      petName: 'Whiskers',
      ownerName: 'Jane Smith'
    }
  ];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Get current month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Calendar days
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Styled components
  const CalendarHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  }));
  
  const CalendarGrid = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: theme.spacing(0),
  }));
  
  const CalendarDay = styled(Box)(({ theme }) => ({
    minHeight: '100px',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
  }));
  
  const DayHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  });
  
  const EventChip = styled(Chip)(({ theme }) => ({
    margin: '2px 0',
    width: '100%',
    justifyContent: 'flex-start',
  }));

  // Check if a day has events
  const getEventsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return mockEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  // Get event chip color
  const getEventColor = (type: string) => {
    switch(type) {
      case 'boarding': return 'primary';
      case 'grooming': return 'secondary';
      case 'daycare': return 'info';
      case 'training': return 'success';
      default: return 'default';
    }
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const days = [];
    const totalCalendarCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <Box sx={{ gridColumn: 'span 1' }} key={`empty-${i}`}>
          <CalendarDay sx={{ backgroundColor: 'grey.100' }} />
        </Box>
      );
    }
    
    // Add cells for days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDay(day);
      const isToday = new Date().getDate() === day && 
                       new Date().getMonth() === month && 
                       new Date().getFullYear() === year;
      
      days.push(
        <Box sx={{ gridColumn: 'span 1' }} key={day}>
          <CalendarDay sx={{ 
            backgroundColor: isToday ? 'rgba(63, 81, 181, 0.08)' : 'inherit',
            borderColor: isToday ? 'primary.main' : 'inherit',
          }}>
            <DayHeader>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: isToday ? 'bold' : 'regular',
                  color: isToday ? 'primary.main' : 'inherit'
                }}
              >
                {day}
              </Typography>
            </DayHeader>
            {events.map(event => (
              <EventChip
                key={event.id}
                label={`${event.petName} (${event.type})`}
                size="small"
                color={getEventColor(event.type) as any}
                variant="outlined"
              />
            ))}
          </CalendarDay>
        </Box>
      );
    }
    
    // Add empty cells for days after the end of the month
    const remainingCells = totalCalendarCells - (daysInMonth + firstDayOfMonth);
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <Box sx={{ gridColumn: 'span 1' }} key={`empty-end-${i}`}>
          <CalendarDay sx={{ backgroundColor: 'grey.100' }} />
        </Box>
      );
    }
    
    return days;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <CalendarHeader>
          <Typography variant="h4">
            Calendar
          </Typography>
          <Box>
            <Button onClick={goToPreviousMonth} sx={{ mr: 1 }}>
              Previous
            </Button>
            <Typography variant="h6" component="span" sx={{ mx: 2 }}>
              {monthName} {year}
            </Typography>
            <Button onClick={goToNextMonth} sx={{ ml: 1 }}>
              Next
            </Button>
          </Box>
        </CalendarHeader>
        
        <Paper elevation={3}>
          <Box sx={{ p: 2 }}>
            {/* Weekday Headers */}
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 0,
                mb: 1
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Box 
                  key={day} 
                  sx={{
                    gridColumn: 'span 1',
                    textAlign: 'center',
                    py: 1,
                    backgroundColor: 'grey.200',
                    fontWeight: 'bold'
                  }}
                >
                  <Typography variant="subtitle1">{day}</Typography>
                </Box>
              ))}
            </Box>
            
            {/* Calendar Grid */}
            <CalendarGrid>
              {renderCalendarDays()}
            </CalendarGrid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Legend
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label="Boarding" color="primary" variant="outlined" />
            <Chip label="Grooming" color="secondary" variant="outlined" />
            <Chip label="Daycare" color="info" variant="outlined" />
            <Chip label="Training" color="success" variant="outlined" />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Calendar;
