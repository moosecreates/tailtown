/**
 * Utility functions for suite status determination
 */
import { Resource } from '../services/resourceService';

/**
 * Determine the status of a suite based on maintenance status and reservations
 * @param suite The suite resource object
 * @returns Status string: 'OCCUPIED', 'MAINTENANCE', or 'AVAILABLE'
 */
export const determineSuiteStatus = (suite: Resource): 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' => {
  // Check if suite is in maintenance
  if (suite.attributes?.maintenanceStatus === 'MAINTENANCE') {
    return 'MAINTENANCE';
  }
  
  // Check if suite has active reservations
  if (suite.reservations && suite.reservations.length > 0) {
    // Check for active reservations (CONFIRMED or CHECKED_IN)
    const hasActiveReservation = suite.reservations.some(res => 
      ['CONFIRMED', 'CHECKED_IN'].includes(res.status)
    );
    
    if (hasActiveReservation) {
      return 'OCCUPIED';
    }
  }
  
  // Default status
  return 'AVAILABLE';
};

/**
 * Check if a suite is occupied based on its reservations
 * @param suite The suite resource object
 * @returns Boolean indicating if the suite is occupied
 */
export const isSuiteOccupied = (suite: Resource): boolean => {
  return determineSuiteStatus(suite) === 'OCCUPIED';
};
