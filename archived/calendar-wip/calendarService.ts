import { Reservation } from './reservationService';
import api from './api';

// Define the Resource interface
export interface Resource {
  id: string;
  name: string;
  type?: string;
  suiteNumber?: string;
  notes?: string;
  attributes?: {
    suiteType?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Format a date to YYYY-MM-DD string
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if a date is within a range (inclusive)
 */
/**
 * Check if a date is within a range (inclusive)
 */
/**
 * Check if a date is within a range (inclusive)
 */
/**
 * Check if a date is within a range (inclusive)
 */


export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  // Normalize all dates to start of day for comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);
  
  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(0, 0, 0, 0);
  
  // Date must be >= start date and <= end date
  return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
};
export const getReservationSuiteType = (reservation: Reservation): string => {
  if (!reservation) return '';
  
  // Check for suite type in multiple possible locations
  let suiteType = reservation.suiteType || '';
  
  // Check resource type if available - this is the primary location in real API data
  if (!suiteType && reservation.resource?.type) {
    suiteType = String(reservation.resource.type);
  }
  
  // Check resource attributes.suiteType if available - this is used in real API data
  if (!suiteType && reservation.resource) {
    // Use type assertion to safely access potentially missing properties
    const resource = reservation.resource as any;
    if (resource.attributes && resource.attributes.suiteType) {
      suiteType = String(resource.attributes.suiteType);
      
      // Handle the case where attributes.suiteType is "STANDARD_PLUS" but we need "STANDARD_PLUS_SUITE"
      if (suiteType === 'STANDARD_PLUS') {
        suiteType = 'STANDARD_PLUS_SUITE';
      }
    }
  }
  
  // If we have a resourceId but no suiteType yet, try to infer from the resource name
  if (!suiteType && reservation.resource?.name) {
    const name = reservation.resource.name.toUpperCase();
    if (name.includes('VIP')) suiteType = 'VIP_SUITE';
    else if (name.includes('STANDARD PLUS')) suiteType = 'STANDARD_PLUS_SUITE';
    else if (name.includes('STANDARD')) suiteType = 'STANDARD_SUITE';
  }
  
  // Check for suite type mentions in notes fields
  if (!suiteType) {
    const notes = [
      reservation.staffNotes || '',
      reservation.notes || '',
      // Safely access resource notes if available
      (reservation.resource && (reservation.resource as any).notes) ? 
        (reservation.resource as any).notes || '' : ''
    ].join(' ').toUpperCase();
    
    if (notes.includes('STANDARD_PLUS_SUITE') || notes.includes('STANDARD PLUS')) {
      suiteType = 'STANDARD_PLUS_SUITE';
    } else if (notes.includes('STANDARD_SUITE') || notes.includes('STANDARD SUITE')) {
      suiteType = 'STANDARD_SUITE';
    } else if (notes.includes('VIP_SUITE') || notes.includes('VIP SUITE')) {
      suiteType = 'VIP_SUITE';
    }
  }
  
  // Check service category as last resort
  if (!suiteType && reservation.service?.serviceCategory === 'BOARDING') {
    // Default to standard suite if we can't determine the type but it's a boarding service
    suiteType = 'STANDARD_SUITE';
  }
  
  return suiteType || '';
};

/**
 * Check if a kennel is occupied by a reservation on a specific date
 * Enhanced with robust handling of different data formats and edge cases
 */
/**
 * Check if a kennel is occupied by a reservation on a specific date
 * Enhanced with robust handling of different data formats and edge cases
 */
/**
 * Check if a kennel is occupied by a reservation on a specific date
 * Enhanced with robust handling of different data formats and edge cases
 */
/**
 * Check if a kennel is occupied by a reservation on a specific date
 * Enhanced with robust handling of different data formats and edge cases
 */


export const isKennelOccupied = (
  kennel: Resource, 
  date: Date, 
  reservations: Reservation[],
  allKennels: Resource[]
): Reservation | undefined => {
  // Add detailed logging for debugging
  console.log(`Checking occupancy for kennel ${kennel.id} (${kennel.name}) on date ${date.toISOString().split('T')[0]}`);
  
  // Normalize the target date to start of day for comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  // Only consider these statuses as valid for occupancy - EXPANDED to include more statuses
  const validStatuses = ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT', 'PENDING'];
  
  // Only consider these service categories for kennel occupancy
  const validServiceCategories = ['BOARDING', 'DAYCARE'];
  
  // Filter reservations to only those that:
  // 1. Have a valid status
  // 2. Are for boarding or daycare
  // 3. Have a date range that includes the target date
  const matchingReservations = reservations.filter(reservation => {
    try {
      // Log each reservation being considered
      console.log(`Evaluating reservation ${reservation.id} with status ${reservation.status} for kennel ${kennel.id}`);
      console.log(`Reservation details: resourceId=${reservation.resourceId}, kennelId=${reservation.kennelId}, suiteType=${reservation.suiteType}`);
      
      // Skip reservations with invalid statuses
      if (!reservation.status || !validStatuses.includes(reservation.status)) {
        console.log(`Skipping reservation ${reservation.id} due to invalid status: ${reservation.status}`);
        return false;
      }
      
      // Skip reservations for services other than boarding/daycare
      // Only check if serviceCategory is explicitly set to something other than boarding/daycare
      if (reservation.service?.serviceCategory && 
          !validServiceCategories.includes(reservation.service.serviceCategory)) {
        console.log(`Skipping reservation ${reservation.id} due to invalid service category: ${reservation.service.serviceCategory}`);
        return false;
      }
      
      // Normalize reservation dates for comparison
      const startDate = new Date(reservation.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(reservation.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      // Check if the target date falls within the reservation period
      // The date must be >= start date and <= end date
      const isInDateRange = normalizedDate >= startDate && normalizedDate <= endDate;
      
      if (!isInDateRange) {
        console.log(`Skipping reservation ${reservation.id} due to date range mismatch: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        return false;
      }
      
      // Get the reservation's suite type
      const reservationSuiteType = getReservationSuiteType(reservation);
      console.log(`Reservation ${reservation.id} has suite type: ${reservationSuiteType}`);
      
      // Check if this reservation is for this specific kennel
      // We check multiple ID fields that might be used
      const kennelId = kennel.id;
      const reservationKennelId = reservation.kennelId || 
                                  reservation.resourceId || 
                                  (reservation.resource ? reservation.resource.id : null) ||
                                  reservation.suiteId;
      
      console.log(`Comparing kennel IDs: reservation=${reservationKennelId}, kennel=${kennelId}`);
      
      // Direct match by ID
      if (reservationKennelId && reservationKennelId === kennelId) {
        console.log(`MATCH FOUND: Direct ID match for reservation ${reservation.id} with kennel ${kennelId}`);
        return true;
      }
      
      // Special case for Standard Plus Suite
      // If this is a Standard Plus Suite reservation without a specific kennel assigned,
      // and this kennel is a Standard Plus Suite, consider it a match
      if (reservationSuiteType === 'STANDARD_PLUS_SUITE' && 
          kennel.type === 'STANDARD_PLUS_SUITE') {
        console.log(`MATCH FOUND: Standard Plus Suite match for reservation ${reservation.id} with kennel ${kennelId}`);
        return true;
      }
      
      // Special case for any suite type
      // If the reservation has a suiteType that matches the kennel's type, consider it a match
      // This helps with new reservations that might not have a specific kennel assigned yet
      if (reservationSuiteType && kennel.type && reservationSuiteType === kennel.type) {
        console.log(`MATCH FOUND: Suite type match for reservation ${reservation.id} with kennel ${kennelId}`);
        return true;
      }
      
      console.log(`No match found for reservation ${reservation.id} with kennel ${kennelId}`);
      return false;
    } catch (error) {
      console.error('Error in isKennelOccupied:', error);
      return false;
    }
  });
  
  // Return the first matching reservation, if any
  if (matchingReservations.length > 0) {
    console.log(`Found ${matchingReservations.length} matching reservations for kennel ${kennel.id} on ${date.toISOString().split('T')[0]}`);
  }
  return matchingReservations[0];
};
export const groupKennelsByType = (kennels: Resource[]): Record<string, Resource[]> => {
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
};

/**
 * Get the status color for a reservation status
 */
export const getStatusColor = (status: string): string => {
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

/**
 * Fetch reservations for a date range
 */
export const fetchReservationsForDateRange = async (
  startDate: Date, 
  endDate: Date
): Promise<Reservation[]> => {
  try {
    // Use ISO date strings with time components to ensure proper date range matching
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Set start time to beginning of day and end time to end of day
    startDateTime.setHours(0, 0, 0, 0);
    endDateTime.setHours(23, 59, 59, 999);
    
    const formattedStartDate = startDateTime.toISOString();
    const formattedEndDate = endDateTime.toISOString();
    
    console.log(`CalendarService: Fetching reservations from ${formattedStartDate} to ${formattedEndDate}`);
    console.log(`CalendarService: API URL: /api/reservations with params: startDate=${formattedStartDate}, endDate=${formattedEndDate}`);
    
    // Call the API to get reservations
    const response = await api.get('/api/reservations', {
      params: {
        page: 1,
        limit: 1000,
        sortBy: 'startDate',
        sortOrder: 'asc',
        status: 'PENDING,CONFIRMED,CHECKED_IN', // Only get active reservations
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        serviceCategory: 'BOARDING,DAYCARE' // Only get boarding and daycare reservations
      }
    });
    
    console.log('CalendarService: API response received:', response.status, response.statusText);
    
    // Check if we need to navigate the response object to get to the actual data array
    let reservationsData: Reservation[] = [];
    
    if (response && response.data) {
      console.log('CalendarService: Response data type:', typeof response.data);
      console.log('CalendarService: Response data is array?', Array.isArray(response.data));
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        // API returns {status: 'success', data: [...]} format
        console.log('CalendarService: Found success/data format');
        reservationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // API returns direct array format
        console.log('CalendarService: Found direct array format');
        reservationsData = response.data;
      } else {
        // Unknown format, log and use empty array
        console.error('CalendarService: Unexpected reservation data format:', JSON.stringify(response.data).substring(0, 200) + '...');
        reservationsData = [];
      }
    }
    
    console.log(`CalendarService: Loaded ${reservationsData.length} reservations`);
    
    // Log the first few reservations for debugging
    if (reservationsData.length > 0) {
      console.log('CalendarService: First reservation:', JSON.stringify(reservationsData[0]).substring(0, 200) + '...');
      console.log('CalendarService: Reservation dates:', reservationsData.slice(0, 3).map(r => ({ 
        id: r.id, 
        startDate: r.startDate, 
        endDate: r.endDate,
        status: r.status,
        resourceId: r.resourceId,
        resource: r.resource ? { id: r.resource.id, name: r.resource.name, type: r.resource.type } : null
      })));
    } else {
      console.log('CalendarService: No reservations found for the date range');
    }
    
    return reservationsData;
  } catch (error) {
    console.error('CalendarService: Error fetching reservations:', error);
    throw error;
  }
};

/**
 * Categorize reservations by suite type for debugging
 */
export const categorizeReservationsBySuiteType = (reservations: Reservation[]): {
  standardPlusSuite: Reservation[];
  standardSuite: Reservation[];
  vipSuite: Reservation[];
  unclassified: Reservation[];
} => {
  const standardPlusSuiteReservations = reservations.filter((res: Reservation) => 
    (res.staffNotes?.includes('STANDARD_PLUS_SUITE') || false) ||
    (res.notes?.includes('STANDARD_PLUS_SUITE') || false) ||
    (res.resource?.type === 'STANDARD_PLUS_SUITE') ||
    (res.suiteType === 'STANDARD_PLUS_SUITE')
  );
  
  const standardSuiteReservations = reservations.filter((res: Reservation) => 
    (res.staffNotes?.includes('STANDARD_SUITE') || false) ||
    (res.notes?.includes('STANDARD_SUITE') || false) ||
    (res.resource?.type === 'STANDARD_SUITE') ||
    (res.suiteType === 'STANDARD_SUITE')
  );
  
  const vipSuiteReservations = reservations.filter((res: Reservation) => 
    (res.staffNotes?.includes('VIP_SUITE') || false) ||
    (res.notes?.includes('VIP_SUITE') || false) ||
    (res.resource?.type === 'VIP_SUITE') ||
    (res.suiteType === 'VIP_SUITE')
  );
  
  // Log reservations without suite type for debugging
  const unclassifiedReservations = reservations.filter((res: Reservation) => 
    !((res.staffNotes?.includes('STANDARD_PLUS_SUITE') || false) ||
      (res.notes?.includes('STANDARD_PLUS_SUITE') || false) ||
      (res.resource?.type === 'STANDARD_PLUS_SUITE') ||
      (res.suiteType === 'STANDARD_PLUS_SUITE') ||
      (res.staffNotes?.includes('STANDARD_SUITE') || false) ||
      (res.notes?.includes('STANDARD_SUITE') || false) ||
      (res.resource?.type === 'STANDARD_SUITE') ||
      (res.suiteType === 'STANDARD_SUITE') ||
      (res.staffNotes?.includes('VIP_SUITE') || false) ||
      (res.notes?.includes('VIP_SUITE') || false) ||
      (res.resource?.type === 'VIP_SUITE') ||
      (res.suiteType === 'VIP_SUITE'))
  );
  
  return {
    standardPlusSuite: standardPlusSuiteReservations,
    standardSuite: standardSuiteReservations,
    vipSuite: vipSuiteReservations,
    unclassified: unclassifiedReservations
  };
};

/**
 * Filter reservations to only those that fall within the specified month
 */
export const filterReservationsByMonth = (
  reservations: Reservation[],
  year: number,
  month: number
): Reservation[] => {
  // Create date range for the specified month with buffer days
  const startOfMonth = new Date(year, month - 1, 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(year, month, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  // Add a buffer day before and after the month to catch edge cases
  const startBuffer = new Date(startOfMonth);
  startBuffer.setDate(startBuffer.getDate() - 1);
  
  const endBuffer = new Date(endOfMonth);
  endBuffer.setDate(endBuffer.getDate() + 1);
  
  console.log('FilterReservationsByMonth: Filtering for month range:', 
    startBuffer.toISOString(), 'to', endBuffer.toISOString());
  
  return reservations.filter(reservation => {
    try {
      // Normalize reservation dates
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug('Checking reservation:', reservation.id, 
          'Start:', reservationStart.toISOString(), 
          'End:', reservationEnd.toISOString());
      }
      
      // Check if reservation overlaps with the month (with buffer)
      // Either:
      // 1. Reservation starts during the month or buffer
      // 2. Reservation ends during the month or buffer
      // 3. Reservation spans the entire month
      const isInRange = (
        (reservationStart >= startBuffer && reservationStart <= endBuffer) ||
        (reservationEnd >= startBuffer && reservationEnd <= endBuffer) ||
        (reservationStart <= startBuffer && reservationEnd >= endBuffer)
      );
      
      // Additional check for valid reservation status
      const validStatuses = ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT'];
      const hasValidStatus = validStatuses.includes(reservation.status);
      
      return isInRange && hasValidStatus;
    } catch (error) {
      console.error('Error filtering reservation by month:', error);
      return false;
    }
  });
};

// Export the calendar service
export const calendarService = {
  formatDateToYYYYMMDD,
  isDateInRange,
  getReservationSuiteType,
  isKennelOccupied,
  groupKennelsByType,
  getStatusColor,
  fetchReservationsForDateRange,
  categorizeReservationsBySuiteType,
  filterReservationsByMonth
};

export default calendarService;
