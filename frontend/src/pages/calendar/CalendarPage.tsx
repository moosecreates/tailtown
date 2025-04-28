import React, { useState } from 'react';
import { Container, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Calendar from '../../components/calendar/Calendar';
import KennelCalendar from '../../components/calendar/KennelCalendar';
import { ServiceCategory } from '../../types/service';

const CalendarPage: React.FC = () => {
  // State to toggle between grid view and traditional calendar view
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
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
      {viewMode === 'grid' ? (
        <KennelCalendar />
      ) : (
        <Calendar 
          serviceCategories={[ServiceCategory.BOARDING, ServiceCategory.DAYCARE]} 
          calendarTitle="Boarding & Daycare Calendar"
        />
      )}
    </Container>
  );
};

export default CalendarPage;
