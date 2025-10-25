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
 * Parse a date string (YYYY-MM-DD) in local timezone
 * This avoids timezone shifts that occur with new Date('YYYY-MM-DD')
 * which interprets the string as UTC midnight
 * 
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day);
};

/**
 * Get day of week from a date string, timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (dateString: string | Date): number => {
  if (typeof dateString === 'string') {
    const date = parseLocalDate(dateString);
    return date.getDay();
  }
  return dateString.getDay();
};

/**
 * Get day of week name from a date string, timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns Day name (e.g., 'MONDAY', 'TUESDAY')
 */
export const getDayOfWeekName = (dateString: string | Date): string => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayIndex = getDayOfWeek(dateString);
  return days[dayIndex];
};

/**
 * Check if a date is a weekend (Saturday or Sunday), timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns True if weekend, false otherwise
 */
export const isWeekend = (dateString: string | Date): boolean => {
  const dayIndex = getDayOfWeek(dateString);
  return dayIndex === 0 || dayIndex === 6; // Sunday or Saturday
};

/**
 * Get the month number (1-12) from a date string, timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns Month number (1-12)
 */
export const getMonth = (dateString: string | Date): number => {
  if (typeof dateString === 'string') {
    const date = parseLocalDate(dateString);
    return date.getMonth() + 1; // Convert from 0-indexed to 1-indexed
  }
  return dateString.getMonth() + 1;
};

/**
 * Get the year from a date string, timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns Year
 */
export const getYear = (dateString: string | Date): number => {
  if (typeof dateString === 'string') {
    const date = parseLocalDate(dateString);
    return date.getFullYear();
  }
  return dateString.getFullYear();
};

/**
 * Compare two dates (ignoring time), timezone-safe
 * 
 * @param date1 First date
 * @param date2 Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? parseLocalDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseLocalDate(date2) : date2;
  
  const time1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const time2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  
  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
};

/**
 * Add days to a date, timezone-safe
 * 
 * @param dateString Date string in YYYY-MM-DD format
 * @param days Number of days to add (can be negative)
 * @returns New date string in YYYY-MM-DD format
 */
export const addDays = (dateString: string, days: number): string => {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDateToYYYYMMDD(date) as string;
};

/**
 * Calculate difference in days between two dates, timezone-safe
 * 
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days between dates
 */
export const daysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseLocalDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseLocalDate(endDate) : endDate;
  
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  
  const diffTime = endTime - startTime;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};
