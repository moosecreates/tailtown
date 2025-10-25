/**
 * Date Utilities Tests
 * Tests for date formatting and manipulation functions
 */

import {
  formatDateToYYYYMMDD,
  getCurrentDateFormatted
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDateToYYYYMMDD', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2025-10-24T12:00:00Z');
      const result = formatDateToYYYYMMDD(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2025-01-05T12:00:00Z');
      const result = formatDateToYYYYMMDD(date);
      expect(result).toContain('-01-');
      expect(result).toContain('-05');
    });

    it('should return undefined for null date', () => {
      const result = formatDateToYYYYMMDD(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined date', () => {
      const result = formatDateToYYYYMMDD(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle dates at year boundaries', () => {
      const date = new Date('2025-12-31T23:59:59Z');
      const result = formatDateToYYYYMMDD(date);
      expect(result).toContain('2025-12-31');
    });
  });

  describe('getCurrentDateFormatted', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const result = getCurrentDateFormatted();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return today\'s date', () => {
      const result = getCurrentDateFormatted();
      const today = new Date();
      const expected = formatDateToYYYYMMDD(today);
      expect(result).toBe(expected);
    });
  });
});
