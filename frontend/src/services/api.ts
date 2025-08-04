import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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

// Add request interceptor for logging
const addRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        params: config.params,
        data: config.data
      });
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
};

// Add response interceptor for logging
const addResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
      return response;
    },
    (error: AxiosError) => {
      console.error('API Response Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return Promise.reject(error);
    }
  );
};

/**
 * Customer Service API client
 * Handles customer and pet data operations
 */
const customerApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4004',
  headers: defaultHeaders,
  validateStatus: defaultValidateStatus
});

// Add interceptors to customer API
addRequestInterceptor(customerApi);
addResponseInterceptor(customerApi);

/**
 * Reservation Service API client
 * Handles reservation and resource operations
 */
const reservationApi = axios.create({
  baseURL: process.env.REACT_APP_RESERVATION_API_URL || 'http://localhost:4003',
  headers: {
    ...defaultHeaders,
    'x-tenant-id': 'default' // Add default tenant ID header for all requests
  },
  validateStatus: defaultValidateStatus
});

// Add interceptors to reservation API
addRequestInterceptor(reservationApi);
addResponseInterceptor(reservationApi);

/**
 * Legacy API client for backward compatibility
 * @deprecated Use the specific service clients instead
 */
const api = customerApi;

// Helper function to make API requests with better error handling
export const safeApiCall = async <T>(apiCall: Promise<AxiosResponse<T>>): Promise<T | null> => {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error: any) {
    console.error('API call failed:', error.message);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};

export { customerApi, reservationApi };
export default api;
