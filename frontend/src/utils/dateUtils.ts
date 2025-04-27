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
