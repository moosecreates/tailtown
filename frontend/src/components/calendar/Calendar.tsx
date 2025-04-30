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
 * Props for the Calendar component
 */
interface CalendarProps {
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
 * Calendar component for managing reservations
 * 
 * This component provides a full-featured calendar interface for managing reservations.
 * Features include:
 * - Month, week, and day views
 * - Interactive event creation by clicking time slots
 * - Event editing by clicking existing events
 * - Color-coded events based on reservation status
 * - Drag and drop functionality
 * 
 * @component
 * @example
 * ```tsx
 * <Calendar onEventUpdate={(reservation) => console.log('Updated:', reservation)} />
 * ```
 */
const Calendar: React.FC<CalendarProps> = ({ onEventUpdate, serviceCategories, calendarTitle }) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);

  const loadReservations = useCallback(async () => {
    try {
      console.log('Calendar: Loading reservations...');
      console.log('Calendar: Filtering by service categories:', serviceCategories);
      
      // Get all relevant reservations (PENDING, CONFIRMED or CHECKED_IN)
      // We don't filter by date to ensure we see all current reservations
      const response = await reservationService.getAllReservations(
        1,  // page
        100, // limit - increased to show more reservations
        'startDate', // sortBy
        'asc', // sortOrder
        'PENDING,CONFIRMED,CHECKED_IN' // status - include pending reservations too
      );
      
      console.log('Calendar: Got response:', response);
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        // Filter reservations by service category if specified
        let filteredReservations = response.data;
        if (serviceCategories && serviceCategories.length > 0) {
          filteredReservations = response.data.filter(reservation => {
            // Check if the reservation's service category matches any of the specified categories
            return reservation.service && 
                   typeof reservation.service === 'object' &&
                   'serviceCategory' in reservation.service &&
                   serviceCategories.includes(reservation.service.serviceCategory as ServiceCategory);
          });
          console.log('Calendar: Filtered reservations by service category:', filteredReservations.length);
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
        
        console.log('Calendar: Created calendar events:', calendarEvents.length);
        setEvents(calendarEvents);
        return calendarEvents;
      } else {
        console.warn('Calendar: Invalid response format or no reservations found');
        setEvents([]);
        return [];
      }
    } catch (error) {
      console.error('Calendar: Error loading reservations:', error);
      setEvents([]);
      return [];
    }
  }, [serviceCategories]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Effect to convert time display to 12-hour format
  useEffect(() => {
    // Function to convert 24h time to 12h time
    const convertTo12Hour = (timeStr: string): string => {
      if (!timeStr) return '';
      
      // Check if already in 12-hour format
      if (timeStr.includes('am') || timeStr.includes('pm')) {
        return timeStr;
      }
      
      try {
        // Parse the time (assuming format like "14:00")
        const [hourStr, minuteStr] = timeStr.split(':');
        const hour = parseInt(hourStr, 10);
        
        if (isNaN(hour)) return timeStr;
        
        const ampm = hour >= 12 ? 'pm' : 'am';
        const hour12 = hour % 12 || 12; // Convert 0 to 12
        
        return `${hour12}:${minuteStr} ${ampm}`;
      } catch (e) {
        console.error('Error converting time:', e);
        return timeStr;
      }
    };
    
    // Function to update all time elements in the calendar
    const updateTimeDisplay = () => {
      // Update time slot labels
      const timeSlotLabels = document.querySelectorAll('.fc-timegrid-slot-label-cushion');
      timeSlotLabels.forEach((el) => {
        const timeText = el.textContent;
        if (timeText) {
          el.textContent = convertTo12Hour(timeText.trim());
        }
      });
      
      // Update event times
      const eventTimes = document.querySelectorAll('.fc-event-time');
      eventTimes.forEach((el) => {
        const timeText = el.textContent;
        if (timeText) {
          // Handle ranges like "14:00 - 15:00"
          if (timeText.includes('-')) {
            const [start, end] = timeText.split('-').map(t => t.trim());
            el.textContent = `${convertTo12Hour(start)} - ${convertTo12Hour(end)}`;
          } else {
            el.textContent = convertTo12Hour(timeText.trim());
          }
        }
      });
    };
    
    // Run once after initial render
    updateTimeDisplay();
    
    // Set up a mutation observer to watch for changes in the calendar
    const observer = new MutationObserver((mutations) => {
      updateTimeDisplay();
    });
    
    // Start observing the calendar container
    const calendarEl = document.querySelector('.fc');
    if (calendarEl) {
      observer.observe(calendarEl, { 
        childList: true, 
        subtree: true,
        characterData: true
      });
    }
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [events]); // Re-run when events change

  // Get the color for a reservation status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '#FFA726'; // Orange
      case 'CONFIRMED':
        return '#4CAF50'; // Green
      case 'CHECKED_IN':
        return '#2196F3'; // Blue
      case 'CHECKED_OUT':
        return '#9C27B0'; // Purple
      case 'COMPLETED':
        return '#3F51B5'; // Indigo
      case 'CANCELLED':
        return '#F44336'; // Red
      case 'NO_SHOW':
        return '#795548'; // Brown
      default:
        return '#4c8bf5'; // Default blue
    }
  };

  // Handle date selection in the calendar
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    console.log('Calendar: Date selected:', selectInfo);
    
    // Create a default end time (1 hour after start)
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    // If this is a time slot selection (not all-day), use the exact times
    if (!selectInfo.allDay) {
      setSelectedDate({
        start: startDate,
        end: endDate
      });
    } else {
      // For all-day or month view selections, set default times (9am to 10am)
      startDate.setHours(9, 0, 0);
      endDate.setHours(10, 0, 0);
      setSelectedDate({
        start: startDate,
        end: endDate
      });
    }
    
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  // Handle clicking on an existing event
  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Calendar: Event clicked:', clickInfo);
    
    // Get the reservation from the event's extendedProps
    const reservation = clickInfo.event.extendedProps?.reservation;
    
    if (reservation) {
      console.log('Calendar: Found reservation in event:', reservation);
      
      // Make sure we have complete reservation data
      if (reservation.id) {
        console.log('Calendar: Setting selected event with ID:', reservation.id);
        setSelectedEvent(reservation);
        setSelectedDate(null);
        setIsFormOpen(true);
      } else {
        console.warn('Calendar: Clicked event has no reservation ID');
      }
    } else {
      console.warn('Calendar: Clicked event has no reservation data');
    }
  };

  // Handle form submission for creating or updating a reservation
  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('Calendar: Starting form submission with data:', formData);
      console.log('Calendar: Current events:', events);
      let updatedReservation;
      
      if (selectedEvent) {
        console.log('Calendar: Updating existing reservation:', selectedEvent.id);
        updatedReservation = await reservationService.updateReservation(
          selectedEvent.id,
          formData
        );
      } else {
        console.log('Calendar: Creating new reservation');
        updatedReservation = await reservationService.createReservation(formData);
        console.log('Calendar: Created reservation:', updatedReservation);
      }

      if (updatedReservation) {
        console.log('Calendar: Successfully saved reservation:', updatedReservation);
        console.log('Calendar: Reloading reservations after successful save');
        
        // Load reservations and get the updated events immediately
        const updatedEvents = await loadReservations();
        console.log('Calendar: Events after reload:', updatedEvents);
        
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
        console.warn('Calendar: No reservation returned from server');
        // Do NOT close the dialog if reservation failed
      }
    } catch (error) {
      console.error('Calendar: Error saving reservation:', error);
      // Do NOT close the dialog on error; let the form show the error
      // throw error; // No need to re-throw, ReservationForm will handle error state
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
          
          // 12-hour time format settings using simple string format
          eventTimeFormat="h:mm a"
          slotLabelFormat="h:mm a"
          
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
          }}
          
          views={{
            timeGrid: {
              nowIndicator: true,
              // 12-hour time format for timeGrid view
              slotLabelFormat: "h:mm a"
            },
            timeGridDay: {
              // 12-hour time format for day view
              slotLabelFormat: "h:mm a"
            },
            timeGridWeek: {
              // 12-hour time format for week view
              slotLabelFormat: "h:mm a"
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

export default Calendar;
