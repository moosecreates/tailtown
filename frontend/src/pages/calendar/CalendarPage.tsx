import React, { useState } from 'react';
import { Container, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Calendar from '../../components/calendar/Calendar';
import KennelCalendar from '../../components/calendar/KennelCalendar';
import { ServiceCategory } from '../../types/service';

const CalendarPage: React.FC = () => {
  // State to toggle between grid view and traditional calendar view
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', py: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Boarding & Daycare Calendar
        </Typography>
        
        {/* Toggle between grid and traditional calendar views */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newValue) => {
            if (newValue) setViewMode(newValue);
          }}
          size="small"
        >
          <ToggleButton value="grid">
            Kennel Grid
          </ToggleButton>
          <ToggleButton value="calendar">
            Traditional Calendar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Show either the grid view or traditional calendar view based on the selected mode */}
      <Box sx={{ flexGrow: 1 }}>
        {viewMode === 'grid' ? (
          <KennelCalendar />
        ) : (
          <Calendar 
            serviceCategories={[ServiceCategory.BOARDING, ServiceCategory.DAYCARE]} 
            calendarTitle="Boarding & Daycare Calendar"
          />
        )}
      </Box>
    </Container>
  );
};

export default CalendarPage;
