import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Calendar.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { formatISO, parseISO } from 'date-fns';

import { Box, Paper, Snackbar, Alert, Typography } from '@mui/material';
import { reservationService } from '../../services/reservationService';
import { serviceManagement } from '../../services/serviceManagement';
import { Reservation } from '../../services/reservationService';
import { Service, ServiceCategory } from '../../types/service';
import AddOnSelectionDialog from '../reservations/AddOnSelectionDialog';
import EnhancedReservationModal from '../reservations/EnhancedReservationModal';
import { ExtendedReservation, toExtendedReservation } from '../../types/reservation';
import ReservationWizardModal from '../reservations/wizard/ReservationWizardModal';

/**
 * Props for the EnhancedCalendar component
 */
interface EnhancedCalendarProps {
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
 * Enhanced Calendar component for managing reservations
 * 
 * This component provides a full-featured calendar interface for managing reservations
 * with enhanced pet care management, including detailed pet care tracking and 
 * a tab-based wizard interface.
 * 
 * Features include:
 * - Month, week, and day views
 * - Interactive event creation by clicking time slots
 * - Event editing with detailed pet care management
 * - Color-coded events based on reservation status
 * - Support for medication and feeding preferences
 * 
 * @component
 */
const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ 
  onEventUpdate, 
  serviceCategories, 
  calendarTitle 
}) => {
  // Calendar events state
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  
  // Enhanced reservation modal state (for viewing/editing)
  const [isEnhancedModalOpen, setIsEnhancedModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  
  // Reservation wizard modal state (for creating new with pet care details)
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Add-on dialog state
  const [isAddOnDialogOpen, setIsAddOnDialogOpen] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<string>('');
  const [currentServiceId, setCurrentServiceId] = useState<string>('');
  
  // Notification state
  const [notification, setNotification] = useState<{
    message: string; 
    severity: 'success' | 'error' | 'info' | 'warning'
  } | null>(null);

  // Add event listener for reservation creation events
  useEffect(() => {
    const handleReservationCreated = (event: CustomEvent) => {
      console.log('EnhancedCalendar: Reservation created event received:', event.detail);
      loadReservations();
    };
    
    window.addEventListener('reservation-created', 
      handleReservationCreated as EventListener);
    
    return () => {
      window.removeEventListener('reservation-created', 
        handleReservationCreated as EventListener);
    };
  }, []);

  // Load reservations on component mount and when dependencies change
  const loadReservations = useCallback(async () => {
    // Prevent multiple simultaneous loading requests
    if (loadingRef.current) {
      console.log('EnhancedCalendar: Already loading reservations, skipping');
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('EnhancedCalendar: Loading reservations...');
      console.log('EnhancedCalendar: Filtering by service categories:', serviceCategories);
      
      // Get the current date and calendar range
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Format dates for API request - use ISO format for consistency
      const startDateStr = formatISO(startOfMonth, { representation: 'date' });
      const endDateStr = formatISO(endOfMonth, { representation: 'date' });
      
      console.log(`EnhancedCalendar: Fetching reservations from ${startDateStr} to ${endDateStr}`);
      
      // Get all relevant reservations for the entire month
      // Include all statuses except DRAFT to ensure we see all reservations
      const response = await reservationService.getAllReservations(
        1,                                          // page
        500,                                        // limit - increased to show all month's reservations
        'startDate',                                // sortBy
        'asc',                                      // sortOrder
        'PENDING,CONFIRMED,CHECKED_IN,CHECKED_OUT,COMPLETED' // status - include all active statuses
      );
      
      const reservations = response.data || [];
      console.log('EnhancedCalendar: Loaded reservations:', reservations);
      
      // Filter reservations by service category if needed
      const filteredReservations = serviceCategories && serviceCategories.length > 0
        ? reservations.filter(res => {
            const category = res.service?.serviceCategory as ServiceCategory;
            return serviceCategories.includes(category);
          })
        : reservations;
      
      // Convert reservations to calendar events
      const calendarEvents = filteredReservations.map(reservation => {
        const petName = reservation.pet?.name || 'Unknown Pet';
        const serviceName = reservation.service?.name || 'Unknown Service';
        const customerName = reservation.customer 
          ? `${reservation.customer.firstName} ${reservation.customer.lastName}`
          : 'Unknown Customer';
        
        return {
          id: reservation.id,
          title: `${petName} - ${serviceName}`,
          start: reservation.startDate,
          end: reservation.endDate,
          backgroundColor: getStatusColor(reservation.status),
          extendedProps: {
            reservation,
            petName,
            serviceName,
            customerName,
            status: reservation.status
          }
        };
      });
      
      console.log('EnhancedCalendar: Converted to calendar events:', calendarEvents);
      setEvents(calendarEvents);
      
    } catch (error) {
      console.error('EnhancedCalendar: Error loading reservations:', error);
      setNotification({
        message: 'Failed to load reservations',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [serviceCategories]);

  // Load reservations on component mount and when dependencies change
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Helper function to convert 24h time to 12h time for UI
  const convertTo12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Helper to update all time displays to 12-hour format after rendering
  const updateTimeDisplay = () => {
    setTimeout(() => {
      const timeElements = document.querySelectorAll('.fc-time');
      
      timeElements.forEach(element => {
        const timeText = element.textContent;
        if (timeText) {
          const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            
            element.textContent = `${hours12}:${minutes}${ampm}`;
          }
        }
      });
    }, 100);
  };

  // Helper to get color for reservation status
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
        return '#607D8B'; // Blue Grey
      case 'CANCELLED':
        return '#F44336'; // Red
      case 'NO_SHOW':
        return '#FF5722'; // Deep Orange
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Handle date selection in the calendar
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    console.log('EnhancedCalendar: Date selected:', selectInfo);
    
    // Create a default end time (1 hour after start for time slots, 9-10am for day slots)
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
    
    // Extract resource information if available from a kennel cell
    // Note: Resource info might not be directly available in DateSelectArg for basic calendar
    // but it would be for KennelCalendar with resource view
    let resourceInfo = null;
    try {
      // This is a type assertion, as resource might exist in some calendar implementations
      const anySelectInfo = selectInfo as any;
      if (anySelectInfo.resource) {
        resourceInfo = {
          id: anySelectInfo.resource.id,
          name: anySelectInfo.resource.title || '',
          type: anySelectInfo.resource.extendedProps?.type || 'STANDARD_SUITE'
        };
      }
    } catch (error) {
      console.warn('EnhancedCalendar: Could not extract resource info:', error);
    }
    
    setSelectedResource(resourceInfo);
    
    // Open the wizard modal for creating a new reservation with enhanced features
    setIsWizardModalOpen(true);
  };

  // Handle clicking on an existing event
  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('EnhancedCalendar: Event clicked:', clickInfo);
    
    // Get the reservation from the event's extendedProps
    const reservation = clickInfo.event.extendedProps?.reservation;
    
    if (reservation) {
      console.log('EnhancedCalendar: Found reservation in event:', reservation);
      
      // Make sure we have complete reservation data
      if (reservation.id) {
        console.log('EnhancedCalendar: Opening enhanced modal with reservation ID:', reservation.id);
        
        // Open the enhanced modal with the reservation ID
        setSelectedReservationId(reservation.id);
        setIsEnhancedModalOpen(true);
      } else {
        console.error('EnhancedCalendar: Reservation is missing ID:', reservation);
        setNotification({
          message: 'Could not open reservation: Missing ID',
          severity: 'error'
        });
      }
    } else {
      console.error('EnhancedCalendar: No reservation data found in event');
      setNotification({
        message: 'Could not open reservation: No data found',
        severity: 'error'
      });
    }
  };

  // Handle form submission from wizard for creating/updating a reservation
  const handleWizardSubmit = async (formData: any) => {
    try {
      console.log('EnhancedCalendar: Wizard submit with form data:', formData);
      
      // This returns an object with the reservationId if successful
      const result = await reservationService.createReservationWithDetails(formData);
      
      console.log('EnhancedCalendar: Wizard reservation created:', result);
      
      setNotification({
        message: 'Reservation details prepared. Redirecting to checkout...',
        severity: 'success'
      });
      
      // Return the reservation ID to the wizard
      return result;
      
    } catch (error) {
      console.error('EnhancedCalendar: Error creating reservation from wizard:', error);
      setNotification({
        message: 'Failed to create reservation',
        severity: 'error'
      });
      throw error;
    }
  };
  
  // Handle updates from the enhanced modal
  const handleReservationUpdate = (updatedReservation: ExtendedReservation) => {
    console.log('EnhancedCalendar: Reservation updated:', updatedReservation);
    
    // Convert ExtendedReservation to Reservation for the event update callback
    const basicReservation: Reservation = {
      id: updatedReservation.id,
      serviceId: updatedReservation.serviceId || '',
      customerId: updatedReservation.customerId || '',
      petId: updatedReservation.petId || '',
      startDate: updatedReservation.startDate,
      endDate: updatedReservation.endDate,
      status: updatedReservation.status as any,
      notes: updatedReservation.notes,
      staffNotes: updatedReservation.staffNotes
    };
    
    // Call the callback if provided
    onEventUpdate?.(basicReservation);
    
    // Refresh calendar data
    loadReservations();
    
    setNotification({
      message: 'Reservation updated successfully',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', p: 2 }}>
      {calendarTitle && (
        <Typography variant="h5" gutterBottom>
          {calendarTitle}
        </Typography>
      )}
      
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
          
          // 12-hour time format settings
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
          
          datesSet={() => {
            // Update time display whenever the calendar dates change
            updateTimeDisplay();
          }}
        />
      </Paper>

      {/* Enhanced Reservation Wizard Modal */}
      <ReservationWizardModal
        open={isWizardModalOpen}
        onClose={() => {
          setIsWizardModalOpen(false);
          setSelectedDate(null);
          setSelectedResource(null);
        }}
        initialData={undefined}
        defaultDates={selectedDate || undefined}
        onSubmit={handleWizardSubmit}
      />

      {/* Enhanced Reservation Modal for viewing/editing existing reservations */}
      <EnhancedReservationModal
        open={isEnhancedModalOpen}
        onClose={() => setIsEnhancedModalOpen(false)}
        reservationId={selectedReservationId}
        onReservationUpdate={handleReservationUpdate}
      />

      {/* Add-On Selection Dialog - keeping for backward compatibility */}
      <AddOnSelectionDialog
        open={isAddOnDialogOpen}
        onClose={() => setIsAddOnDialogOpen(false)}
        reservationId={currentReservationId}
        serviceId={currentServiceId}
        onAddOnsAdded={(success) => {
          setIsAddOnDialogOpen(false);
          if (success) {
            setNotification({
              message: 'Add-on services successfully added to the reservation',
              severity: 'success'
            });
            // Reload reservations to get updated data
            loadReservations();
          } else {
            setNotification({
              message: 'Failed to add services to the reservation',
              severity: 'error'
            });
          }
        }}
      />

      {/* Notification Snackbar */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={5000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification ? notification.severity : 'info'}
          sx={{ width: '100%' }}
        >
          {notification ? notification.message : ''}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedCalendar;
