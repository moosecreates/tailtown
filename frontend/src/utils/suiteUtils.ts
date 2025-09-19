/**
 * Utility functions for suite status determination
 */
import { Resource } from '../services/resourceService';

/**
 * Extended Resource type that includes reservations
 */
interface ResourceWithReservations extends Resource {
  reservations?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

/**
 * Determine the status of a suite based on maintenance status and reservations
 * @param suite The suite resource object
 * @returns Status string: 'OCCUPIED', 'MAINTENANCE', or 'AVAILABLE'
 */
export const determineSuiteStatus = (suite: ResourceWithReservations): 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' => {
  // Log suite ID and basic info for debugging
  console.log(`Determining status for suite: ${suite.id}, ${suite.name}`, {
    maintenanceStatus: suite.attributes?.maintenanceStatus,
    hasReservations: suite.reservations ? suite.reservations.length > 0 : false,
    reservationsCount: suite.reservations?.length || 0,
    // Log first reservation status if it exists
    firstReservationStatus: suite.reservations?.[0]?.status || 'none'
  });

  // Check if suite is in maintenance
  if (suite.attributes?.maintenanceStatus === 'MAINTENANCE') {
    console.log(`Suite ${suite.id} is in MAINTENANCE`);
    return 'MAINTENANCE';
  }
  
  // Check if suite has active reservations
  if (suite.reservations && suite.reservations.length > 0) {
    console.log(`Suite ${suite.id} has ${suite.reservations.length} reservations:`, 
      suite.reservations.map((res: { id: string; status: string; startDate: string; endDate: string }) => ({ 
        id: res.id, 
        status: res.status, 
        startDate: res.startDate,
        endDate: res.endDate
      })));
      
    // Check for active reservations (PENDING, CONFIRMED or CHECKED_IN)
    const hasActiveReservation = suite.reservations.some((res: { status: string }) => 
      ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(res.status)
    );
    
    if (hasActiveReservation) {
      console.log(`Suite ${suite.id} is OCCUPIED due to active reservation`);
      return 'OCCUPIED';
    }
    
    // Check for upcoming reservation (not yet checked in)
    const hasUpcomingReservation = suite.reservations.some((res: { status: string; startDate: string }) => 
      res.status === 'CONFIRMED' && new Date(res.startDate) > new Date()
    );
    
    if (hasUpcomingReservation) {
      console.log(`Suite ${suite.id} is RESERVED for upcoming stay`);
      return 'RESERVED';
    }
  }
  
  // Default status
  console.log(`Suite ${suite.id} is AVAILABLE (no active reservations)`);
  return 'AVAILABLE';
};

/**
 * Check if a suite is occupied based on its reservations
 * @param suite The suite resource object
 * @returns Boolean indicating if the suite is occupied
 */
export const isSuiteOccupied = (suite: ResourceWithReservations): boolean => {
  return determineSuiteStatus(suite) === 'OCCUPIED';
};
