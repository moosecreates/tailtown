import axios, { AxiosInstance } from 'axios';

/**
 * API service layer for Tailtown microservices
 * This module provides configured Axios instances for each service
 */

// Default headers for all API instances
const defaultHeaders = {
  'Content-Type': 'application/json'
};

// Default validation for all API instances
const defaultValidateStatus = (status: number) => status < 500;

/**
 * Customer Service API client
 * Handles customer and pet data operations
 */
const customerApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3003',
  headers: defaultHeaders,
  validateStatus: defaultValidateStatus
});

/**
 * Reservation Service API client
 * Handles reservation and resource operations
 */
const reservationApi = axios.create({
  baseURL: process.env.REACT_APP_RESERVATION_API_URL || 'http://localhost:4004',
  headers: {
    ...defaultHeaders,
    'X-Tenant-ID': 'tailtown' // Add tenant ID header required by reservation service
  },
  validateStatus: defaultValidateStatus
});

/**
 * Legacy API client for backward compatibility
 * @deprecated Use the specific service clients instead
 */
const api = customerApi;

export { customerApi, reservationApi };
export default api;
