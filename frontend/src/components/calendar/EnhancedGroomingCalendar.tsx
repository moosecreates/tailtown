import React from 'react';
import { Dialog, DialogTitle, DialogContent, Container, Typography, Box } from '@mui/material';
import { 
  BaseCalendar, 
  useCalendarEvents, 
  useReservationForm
} from './base';
import ReservationForm from '../reservations/ReservationForm';

/**
 * Enhanced grooming calendar using the base calendar components
 */
const EnhancedGroomingCalendar: React.FC = () => {
  // Use calendar events hook for loading grooming reservations
  const { 
    events, 
    loading, 
    error, 
    refreshEvents,
    getStatusColor
  } = useCalendarEvents({
    serviceCategories: ['GROOMING'],
    initialDate: new Date()
  });
  
  // Use reservation form hook for handling reservation creation/editing
  const {
    isFormOpen,
    selectedReservation,
    selectedDate,
    loading: formLoading,
    error: formError,
    openNewReservationForm,
    openEditReservationForm,
    closeForm,
    handleFormSubmit,
    setError
  } = useReservationForm({
    onReservationChange: refreshEvents,
    closeOnSubmit: false,
    showAddOns: true
  });
  
  // Event handlers
  const handleDateSelect = (selectInfo: any) => {
    openNewReservationForm({
      start: selectInfo.start,
      end: selectInfo.end
    });
  };
  
  const handleEventClick = (clickInfo: any) => {
    const reservation = clickInfo.event.extendedProps.reservation;
    if (reservation && reservation.id) {
      openEditReservationForm(reservation.id);
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Grooming Calendar
        </Typography>
      </Box>
      
      <BaseCalendar
        calendarTitle="Grooming Calendar"
        serviceCategories={['GROOMING']}
        initialView="timeGridWeek"
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
      />
      
      <Dialog 
        open={isFormOpen} 
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ py: 1, px: 2, fontSize: '1rem' }}>
          {selectedReservation ? 'Edit Reservation' : 'Create New Reservation'}
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2 }}>
          {selectedDate && (
            <ReservationForm
              onSubmit={handleFormSubmit}
              initialData={selectedReservation || undefined}
              defaultDates={selectedDate}
              showAddOns={true}
              serviceCategories={['GROOMING']}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EnhancedGroomingCalendar;
