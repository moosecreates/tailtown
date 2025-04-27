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
        console.log('Calendar: Setting events:', calendarEvents);
        setEvents(calendarEvents);
        return calendarEvents; // Return the events for immediate use
      } else {
        console.warn('Calendar: Invalid response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      return [];
    }
  }, [serviceCategories]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  /**
   * Get the color for a reservation status
   * @param status - The reservation status
   * @returns The color code for the status
   */
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

  /**
   * Handle date selection in the calendar
   * Opens the reservation form with the selected date range
   * @param selectInfo - Information about the selected date range
   */
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Create a default end time that's 1 hour after the start time
    // This will be overridden by the service duration when a service is selected
    const defaultEnd = new Date(selectInfo.end.getTime());
    if (selectInfo.view.type !== 'dayGridMonth') {
      // For week and day views, we have exact times
      // For month view, we get full days, so we'll add 1 hour as default
      if (selectInfo.start.getTime() === selectInfo.end.getTime()) {
        defaultEnd.setHours(defaultEnd.getHours() + 1);
      }
    }
    
    setSelectedDate({
      start: selectInfo.start,
      end: defaultEnd
    });
    setIsFormOpen(true);
  };

  /**
   * Handle clicking on an existing event
   * Opens the reservation form with the event's data
   * @param clickInfo - Information about the clicked event
   */
  const handleEventClick = (clickInfo: EventClickArg) => {
    const reservation = clickInfo.event.extendedProps.reservation;
    
    // Wait a moment before opening the form to ensure all data is loaded
    setTimeout(() => {
      // Create a clean copy with only the necessary fields from the original reservation
      // We need to follow the exact Reservation interface
      const formattedReservation: Reservation = {
        id: reservation.id || '',
        customerId: reservation.customerId || (reservation.customer?.id || ''),
        petId: reservation.petId || (reservation.pet?.id || ''),
        serviceId: reservation.serviceId || (reservation.service?.id || ''),
        startDate: reservation.startDate || '',
        endDate: reservation.endDate || '',
        status: (reservation.status as any) || 'PENDING',
        notes: reservation.notes || '',
        createdAt: reservation.createdAt || new Date().toISOString(),
        // Include these optional fields if they exist
        customer: reservation.customer,
        pet: reservation.pet,
        service: reservation.service,
        resource: reservation.resource,
        staffNotes: reservation.staffNotes || ''
      };
      
      // Add any custom properties needed by the form but not in the interface
      const formData = {
        ...formattedReservation,
        // Make sure we pass the resource ID and suite type for proper kennel display
        resourceId: reservation.resourceId || reservation.resource?.id || '',
        suiteType: reservation.suiteType || reservation.resource?.type || reservation.resource?.attributes?.suiteType || ''
      };
      
      console.log('Calendar: Formatted reservation for form:', formData);
      setSelectedEvent(formData as any);
      setIsFormOpen(true);
    }, 100);
  };

  /**
   * Handle form submission for creating or updating a reservation
   * @param formData - The form data for the reservation
   */
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
