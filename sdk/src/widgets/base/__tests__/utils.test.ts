/**
 * Tests for widget utility functions
 */
import {
  resolveContainer,
  formatNumber,
  formatDate,
  escapeHtml,
  truncate,
  resolveTheme,
  debounce,
} from '../utils';

describe('Widget Utils', () => {
  describe('resolveContainer', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="test-container"></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should resolve container by selector string', () => {
      const container = resolveContainer('#test-container');
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.id).toBe('test-container');
    });

    it('should resolve container by class selector', () => {
      document.body.innerHTML = '<div class="widget-container"></div>';
      const container = resolveContainer('.widget-container');
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.classList.contains('widget-container')).toBe(true);
    });

    it('should return HTMLElement directly when passed', () => {
      const element = document.createElement('div');
      const result = resolveContainer(element);
      expect(result).toBe(element);
    });

    it('should throw error when selector not found', () => {
      expect(() => resolveContainer('#nonexistent')).toThrow(
        'Container not found: #nonexistent'
      );
    });

    it('should throw error for empty selector', () => {
      // jsdom throws SyntaxError for empty selector
      expect(() => resolveContainer('')).toThrow();
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should handle decimal numbers', () => {
      // The result depends on the locale, but should have separators
      const result = formatNumber(1234.56);
      expect(result).toContain('1,234');
    });

    it('should handle very large numbers', () => {
      expect(formatNumber(1000000000)).toBe('1,000,000,000');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to human-readable format', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should format date-only strings', () => {
      const result = formatDate('2024-12-25');
      expect(result).toMatch(/Dec 25, 2024/);
    });

    it('should format different months correctly', () => {
      expect(formatDate('2024-03-01')).toMatch(/Mar 1, 2024/);
      expect(formatDate('2024-06-15')).toMatch(/Jun 15, 2024/);
      expect(formatDate('2024-09-30')).toMatch(/Sep 30, 2024/);
    });

    it('should handle different years', () => {
      expect(formatDate('2023-01-01')).toMatch(/Jan 1, 2023/);
      expect(formatDate('2025-12-31')).toMatch(/Dec 31, 2025/);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape less than and greater than', () => {
      expect(escapeHtml('a < b > c')).toBe('a &lt; b &gt; c');
    });

    it('should pass through quotes unchanged', () => {
      // The DOM textContent/innerHTML approach doesn't escape quotes
      expect(escapeHtml('"quoted"')).toBe('"quoted"');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle plain text without modification', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should handle multiple special characters', () => {
      const input = '<a href="test">Link & Text</a>';
      // DOM textContent/innerHTML doesn't escape quotes, only <, >, and &
      const expected = '&lt;a href="test"&gt;Link &amp; Text&lt;/a&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should handle nested tags', () => {
      const input = '<div><span>text</span></div>';
      const expected = '&lt;div&gt;&lt;span&gt;text&lt;/span&gt;&lt;/div&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
  });

  describe('truncate', () => {
    it('should truncate text longer than maxLength', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate text shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle very short maxLength', () => {
      expect(truncate('Hello World', 4)).toBe('H...');
    });

    it('should handle maxLength of 3 (minimum for ellipsis)', () => {
      expect(truncate('Hello', 3)).toBe('...');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should handle long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      const result = truncate(longText, 20);
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });
  });

  describe('resolveTheme', () => {
    // Store original matchMedia
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      // Restore original matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    });

    it('should return "light" when theme is "light"', () => {
      expect(resolveTheme('light')).toBe('light');
    });

    it('should return "dark" when theme is "dark"', () => {
      expect(resolveTheme('dark')).toBe('dark');
    });

    it('should detect system theme when "auto" with light preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: false, // Light mode
          media: query,
        })),
      });

      expect(resolveTheme('auto')).toBe('light');
    });

    it('should detect system theme when "auto" with dark preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
        })),
      });

      expect(resolveTheme('auto')).toBe('dark');
    });

    it('should default to light when theme is undefined', () => {
      expect(resolveTheme(undefined)).toBe('light');
    });

    it('should default to light when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });

      expect(resolveTheme('auto')).toBe('light');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should reset timer on subsequent calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use latest arguments when called multiple times', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should handle different wait times', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      jest.advanceTimersByTime(499);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple separate debounced calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      debouncedFn();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
