import { ApiSuccessResponse, ApiPaginatedResponse } from '../interfaces/ApiResponse';

/**
 * Creates a standardized success response object
 * @param data - The data to include in the response
 * @param message - Optional success message
 * @returns A formatted success response object
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    status: 'success',
    data,
    ...(message && { message })
  };
}

/**
 * Creates a standardized paginated response object
 * @param data - The array of data items to include in the response
 * @param pagination - Pagination information
 * @param message - Optional success message
 * @returns A formatted paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults?: number;
  },
  message?: string
): ApiPaginatedResponse<T> {
  return {
    status: 'success',
    data,
    results: data.length,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalResults: pagination.totalResults,
    ...(message && { message })
  };
}
