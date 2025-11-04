/**
 * Date Utilities Tests
 * Tests for date formatting and manipulation functions
 */

import {
  formatDateToYYYYMMDD,
  getCurrentDateFormatted,
  parseLocalDate,
  getDayOfWeek,
  getDayOfWeekName,
  isWeekend,
  getMonth,
  getYear,
  compareDates,
  addDays,
  daysBetween
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

  describe('parseLocalDate', () => {
    it('should parse date string in local timezone', () => {
      const result = parseLocalDate('2025-11-01');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(10); // November (0-indexed)
      expect(result.getDate()).toBe(1);
    });

    it('should handle different months', () => {
      const jan = parseLocalDate('2025-01-15');
      expect(jan.getMonth()).toBe(0);
      
      const dec = parseLocalDate('2025-12-31');
      expect(dec.getMonth()).toBe(11);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return correct day index for string dates', () => {
      expect(getDayOfWeek('2025-11-01')).toBe(6); // Saturday
      expect(getDayOfWeek('2025-11-02')).toBe(0); // Sunday
      expect(getDayOfWeek('2025-11-03')).toBe(1); // Monday
    });

    it('should work with Date objects', () => {
      const date = new Date(2025, 10, 1); // November 1, 2025
      expect(getDayOfWeek(date)).toBe(6); // Saturday
    });
  });

  describe('getDayOfWeekName', () => {
    it('should return correct day names', () => {
      expect(getDayOfWeekName('2025-11-01')).toBe('SATURDAY');
      expect(getDayOfWeekName('2025-11-02')).toBe('SUNDAY');
      expect(getDayOfWeekName('2025-11-03')).toBe('MONDAY');
      expect(getDayOfWeekName('2025-11-04')).toBe('TUESDAY');
      expect(getDayOfWeekName('2025-11-05')).toBe('WEDNESDAY');
      expect(getDayOfWeekName('2025-11-06')).toBe('THURSDAY');
      expect(getDayOfWeekName('2025-11-07')).toBe('FRIDAY');
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday and Sunday', () => {
      expect(isWeekend('2025-11-01')).toBe(true); // Saturday
      expect(isWeekend('2025-11-02')).toBe(true); // Sunday
      expect(isWeekend('2025-11-08')).toBe(true); // Saturday
      expect(isWeekend('2025-11-09')).toBe(true); // Sunday
    });

    it('should return false for weekdays', () => {
      expect(isWeekend('2025-11-03')).toBe(false); // Monday
      expect(isWeekend('2025-11-04')).toBe(false); // Tuesday
      expect(isWeekend('2025-11-05')).toBe(false); // Wednesday
      expect(isWeekend('2025-11-06')).toBe(false); // Thursday
      expect(isWeekend('2025-11-07')).toBe(false); // Friday
    });
  });

  describe('getMonth', () => {
    it('should return correct month (1-12)', () => {
      expect(getMonth('2025-01-15')).toBe(1);
      expect(getMonth('2025-06-15')).toBe(6);
      expect(getMonth('2025-12-15')).toBe(12);
    });
  });

  describe('getYear', () => {
    it('should return correct year', () => {
      expect(getYear('2025-01-15')).toBe(2025);
      expect(getYear('2024-12-31')).toBe(2024);
    });
  });

  describe('compareDates', () => {
    it('should return -1 when first date is earlier', () => {
      expect(compareDates('2025-11-01', '2025-11-02')).toBe(-1);
    });

    it('should return 1 when first date is later', () => {
      expect(compareDates('2025-11-02', '2025-11-01')).toBe(1);
    });

    it('should return 0 when dates are equal', () => {
      expect(compareDates('2025-11-01', '2025-11-01')).toBe(0);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      expect(addDays('2025-11-01', 1)).toBe('2025-11-02');
      expect(addDays('2025-11-01', 7)).toBe('2025-11-08');
    });

    it('should subtract days with negative values', () => {
      expect(addDays('2025-11-08', -7)).toBe('2025-11-01');
    });

    it('should handle month boundaries', () => {
      expect(addDays('2025-10-31', 1)).toBe('2025-11-01');
      expect(addDays('2025-11-01', -1)).toBe('2025-10-31');
    });

    it('should handle year boundaries', () => {
      expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      expect(daysBetween('2025-11-01', '2025-11-08')).toBe(7);
      expect(daysBetween('2025-11-01', '2025-11-02')).toBe(1);
    });

    it('should return 0 for same date', () => {
      expect(daysBetween('2025-11-01', '2025-11-01')).toBe(0);
    });

    it('should handle negative differences', () => {
      expect(daysBetween('2025-11-08', '2025-11-01')).toBe(-7);
    });

    it('should handle month boundaries', () => {
      expect(daysBetween('2025-10-31', '2025-11-02')).toBe(2);
    });

    it('should handle year boundaries', () => {
      expect(daysBetween('2025-12-30', '2026-01-02')).toBe(3);
    });
  });
});
