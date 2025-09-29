/**
 * Compatibility module for legacy API imports
 * This file ensures that existing code continues to work with the new API client architecture
 */

import { customerApiClient, reservationApiClient } from './api/serviceClients';

// Re-export legacy names for backward compatibility
export const customerApi = customerApiClient;
export const reservationApi = reservationApiClient;
export default customerApiClient; // Default export was customerApi in the old architecture
