import React, { useState, useEffect, useCallback } from 'react';
import './Calendar.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { Box, Paper, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { reservationService } from '../../services/reservationService';
import ReservationForm from '../reservations/ReservationForm';
import { Reservation } from '../../services/reservationService';

interface CalendarProps {
  onEventUpdate?: (reservation: Reservation) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEventUpdate }) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);

  const loadReservations = useCallback(async () => {
    try {
      const response = await reservationService.getAllReservations();
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        const calendarEvents = response.data.map(reservation => ({
          id: reservation.id,
          title: `${reservation.pet?.name || 'Pet'} - ${reservation.service?.name || 'Service'}`,
          start: reservation.startDate,
          end: reservation.endDate,
          backgroundColor: getStatusColor(reservation.status),
          extendedProps: {
            reservation
          }
        }));
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return '#4caf50';
      case 'PENDING':
        return '#ff9800';
      case 'CHECKED_IN':
        return '#2196f3';
      case 'CHECKED_OUT':
        return '#9e9e9e';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate({
      start: selectInfo.start,
      end: selectInfo.end
    });
    setIsFormOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const reservation = clickInfo.event.extendedProps.reservation;
    setSelectedEvent(reservation);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      let updatedReservation;
      if (selectedEvent) {
        // Update existing reservation
        updatedReservation = await reservationService.updateReservation(
          selectedEvent.id,
          formData
        );
      } else {
        // Create new reservation
        updatedReservation = await reservationService.createReservation(formData);
      }

      if (updatedReservation) {
        loadReservations();
        if (onEventUpdate) {
          onEventUpdate(updatedReservation);
        }
      }

      setIsFormOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', p: 2 }}>
      <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          eventColor="#4c8bf5"
          eventTextColor="#ffffff"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
          }}
          views={{
            timeGrid: {
              nowIndicator: true
            }
          }}
          dayHeaderFormat={{
            weekday: 'short',
            month: 'numeric',
            day: 'numeric',
            omitCommas: true
          }}
        />
      </Paper>

      <Dialog 
        open={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Edit Reservation' : 'Create New Reservation'}
        </DialogTitle>
        <DialogContent>
          <ReservationForm
            onSubmit={handleFormSubmit}
            initialData={selectedEvent || undefined}
            defaultDates={selectedDate || undefined}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Calendar;
