/**
 * Standard API response interface to ensure consistent response formats across all services
 * 
 * Follows REST best practices and provides consistent structure for client consumption
 */

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  results: number;
  totalPages: number;
  currentPage: number;
  totalResults?: number;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse<T>(response: ApiSuccessResponse<T> | ApiErrorResponse): response is ApiSuccessResponse<T> {
  return response.status === 'success';
}

/**
 * Type guard to check if a response is a paginated response
 */
export function isPaginatedResponse<T>(response: ApiSuccessResponse<T> | ApiPaginatedResponse<T>): response is ApiPaginatedResponse<T> {
  return 'results' in response && 'totalPages' in response && 'currentPage' in response;
}
