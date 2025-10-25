/**
 * Formatters Tests
 * Tests for data formatting utility functions
 */

import {
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  formatTime,
  formatDateTime,
  capitalizeFirst,
  truncateText
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-50.25)).toBe('-$50.25');
    });

    it('should handle decimal precision', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(10.999)).toBe('$11.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('should handle phone with dashes', () => {
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    });

    it('should handle phone with spaces', () => {
      expect(formatPhoneNumber('555 123 4567')).toBe('(555) 123-4567');
    });

    it('should handle phone with parentheses', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    });

    it('should return original if not 10 digits', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('12345678901')).toBe('12345678901');
    });

    it('should handle empty string', () => {
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date object', () => {
      const date = new Date('2025-10-24T12:00:00Z');
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format date string', () => {
      const result = formatDate('2025-10-24');
      expect(result).toBeTruthy();
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid');
      expect(result).toBe('Invalid Date');
    });

    it('should handle null', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format time from date', () => {
      const date = new Date('2025-10-24T14:30:00Z');
      const result = formatTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format time string', () => {
      const result = formatTime('14:30:00');
      expect(result).toBeTruthy();
    });

    it('should handle null', () => {
      const result = formatTime(null);
      expect(result).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2025-10-24T14:30:00Z');
      const result = formatDateTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should include both date and time', () => {
      const date = new Date('2025-10-24T14:30:00Z');
      const result = formatDateTime(date);
      expect(result.length).toBeGreaterThan(10); // More than just date
    });

    it('should handle null', () => {
      const result = formatDateTime(null);
      expect(result).toBe('');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
    });

    it('should handle already capitalized', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });

    it('should only capitalize first letter', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world');
    });

    it('should handle all caps', () => {
      expect(capitalizeFirst('HELLO')).toBe('HELLO');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result).toContain('...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
      expect(result).not.toContain('...');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      const result = truncateText(text, 20);
      expect(result).toBe('Exactly twenty chars');
    });

    it('should handle empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    it('should use default length if not provided', () => {
      const text = 'A'.repeat(200);
      const result = truncateText(text);
      expect(result.length).toBeLessThan(200);
    });
  });
});
