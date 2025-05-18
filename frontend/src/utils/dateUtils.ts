/**
 * Utility functions for date handling
 */

/**
 * Format a date as YYYY-MM-DD using local timezone
 * @param date The date to format, or null/undefined
 * @returns Formatted date string or undefined if no date provided
 */
export const formatDateToYYYYMMDD = (date?: Date | null): string | undefined => {
  if (!date) return undefined;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get the current date formatted as YYYY-MM-DD
 * @returns Current date formatted as YYYY-MM-DD
 */
export const getCurrentDateFormatted = (): string => {
  return formatDateToYYYYMMDD(new Date()) as string;
};

/**
 * Format a date string or Date object into a human-readable format
 * @param dateStr Date string or Date object
 * @param includeTime Whether to include the time in the formatted string
 * @returns Formatted date string (e.g., "May 17, 2025, 2:30 PM")
 */
export const formatDate = (dateStr?: string | Date | null, includeTime: boolean = true): string => {
  if (!dateStr) return 'N/A';
  
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
