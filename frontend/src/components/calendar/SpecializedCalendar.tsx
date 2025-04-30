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
import { ServiceCategory } from '../../types/service';

/**
 * Props for the SpecializedCalendar component
 */
interface SpecializedCalendarProps {
  /**
   * Optional callback function called when a reservation is created or updated
   * @param reservation - The newly created or updated reservation
   */
  onEventUpdate?: (reservation: Reservation) => void;
  
  /**
   * Optional service categories to filter reservations by
   * If provided, only reservations with these service categories will be shown
   */
  serviceCategories?: string[];
  
  /**
   * Optional title for the calendar
   */
  calendarTitle?: string;
}

/**
 * Specialized Calendar component for grooming and training views
 * 
 * This component fixes the time formatting issues with FullCalendar
 * while maintaining the same functionality as the original Calendar component.
 * 
 * @component
 */
const SpecializedCalendar: React.FC<SpecializedCalendarProps> = ({ onEventUpdate, serviceCategories, calendarTitle }) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);

  const loadReservations = useCallback(async () => {
    try {
      console.log('SpecializedCalendar: Loading reservations...');
      console.log('SpecializedCalendar: Filtering by service categories:', serviceCategories);
      
      // Get all relevant reservations (PENDING, CONFIRMED or CHECKED_IN)
      // We don't filter by date to ensure we see all current reservations
      const response = await reservationService.getAllReservations(
        1,  // page
        100, // limit - increased to show more reservations
        'startDate', // sortBy
        'asc', // sortOrder
        'PENDING,CONFIRMED,CHECKED_IN' // status - include pending reservations too
      );
      
      console.log('SpecializedCalendar: Got response:', response);
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        // Filter reservations by service category if specified
        let filteredReservations = response.data;
        if (serviceCategories && serviceCategories.length > 0) {
          filteredReservations = response.data.filter(reservation => {
            // Check if the reservation's service category matches any of the specified categories
            if (!reservation.service || typeof reservation.service !== 'object') {
              return false;
            }
            
            // Safely access the serviceCategory property
            const serviceObj = reservation.service as any;
            if (!serviceObj.serviceCategory) {
              console.log('SpecializedCalendar: No serviceCategory found for reservation:', reservation.id);
              return false;
            }
            
            const serviceCategory = serviceObj.serviceCategory;
            console.log('SpecializedCalendar: Checking service category:', serviceCategory, 'against:', serviceCategories);
            
            return serviceCategories.some(category => {
              const match = serviceCategory === category;
              console.log('SpecializedCalendar: Category match?', category, match);
              return match;
            });
          });
          console.log('SpecializedCalendar: Filtered reservations by service category:', filteredReservations.length);
        }
        
        const calendarEvents = filteredReservations.map(reservation => ({
          id: reservation.id,
          title: `${reservation.pet?.name || 'Pet'} - ${reservation.service?.name || 'Service'}`,
          start: reservation.startDate,
          end: reservation.endDate,
          backgroundColor: getStatusColor(reservation.status),
          extendedProps: {
            reservation
          }
        }));
        
        console.log('SpecializedCalendar: Created calendar events:', calendarEvents.length);
        setEvents(calendarEvents);
        return calendarEvents;
      } else {
        console.warn('SpecializedCalendar: Invalid response format or no reservations found');
        setEvents([]);
        return [];
      }
    } catch (error) {
      console.error('SpecializedCalendar: Error loading reservations:', error);
      setEvents([]);
      return [];
    }
  }, [serviceCategories]);

  // Load reservations when the component mounts or when serviceCategories changes
  useEffect(() => {
    loadReservations();
  }, [loadReservations, serviceCategories]);

  // Get the color for a reservation status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return '#4caf50'; // Green
      case 'PENDING':
        return '#ff9800'; // Orange
      case 'CHECKED_IN':
        return '#2196f3'; // Blue
      case 'CHECKED_OUT':
        return '#9e9e9e'; // Gray
      case 'CANCELLED':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Gray
    }
  };

  // Handle date selection in the calendar
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    
    // Set the selected date range
    setSelectedDate({ start, end });
    
    // Open the form dialog
    setIsFormOpen(true);
  };

  // Handle clicking on an existing event
  const handleEventClick = (clickInfo: EventClickArg) => {
    // Get the reservation from the event's extendedProps
    const reservation = clickInfo.event.extendedProps.reservation as Reservation;
    if (reservation) {
      setSelectedEvent(reservation);
      setSelectedDate({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate)
      });
      setIsFormOpen(true);
    }
  };

  // Handle form submission for creating or updating a reservation
  const handleFormSubmit = async (formData: any) => {
    try {
      let updatedReservation: Reservation | null = null;
      
      if (selectedEvent) {
        console.log('SpecializedCalendar: Updating existing reservation:', selectedEvent.id);
        updatedReservation = await reservationService.updateReservation(
          selectedEvent.id,
          formData
        );
      } else {
        console.log('SpecializedCalendar: Creating new reservation');
        updatedReservation = await reservationService.createReservation(formData);
        console.log('SpecializedCalendar: Created reservation:', updatedReservation);
      }

      if (updatedReservation) {
        console.log('SpecializedCalendar: Successfully saved reservation:', updatedReservation);
        console.log('SpecializedCalendar: Reloading reservations after successful save');
        
        // Load reservations and get the updated events immediately
        const updatedEvents = await loadReservations();
        console.log('SpecializedCalendar: Events after reload:', updatedEvents);
        
        // Force a refresh of the calendar by creating a new reference
        setEvents([...updatedEvents]);
        
        if (onEventUpdate) {
          onEventUpdate(updatedReservation);
        }
        
        // Close the form
        setIsFormOpen(false);
        setSelectedEvent(null);
        setSelectedDate(null);
      } else {
        console.warn('SpecializedCalendar: No reservation returned from server');
        // Do NOT close the dialog if reservation failed
      }
    } catch (error) {
      console.error('SpecializedCalendar: Error saving reservation:', error);
      // Do NOT close the dialog on error; let the form show the error
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
          timeZone="local"
          locale="en-US"
          
          // Fixed time format settings using object notation instead of strings
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
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
            },
            timeGridDay: {},
            timeGridWeek: {}
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
        PaperProps={{
          sx: { maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ py: 1, px: 2, fontSize: '1rem' }}>
          {selectedEvent ? 'Edit Reservation' : 'Create New Reservation'}
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2 }}>
          {selectedEvent || selectedDate ? (
            <ReservationForm
              onSubmit={handleFormSubmit}
              initialData={selectedEvent || undefined}
              defaultDates={selectedDate || undefined}
            />
          ) : (
            <div>Loading reservation form...</div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SpecializedCalendar;
