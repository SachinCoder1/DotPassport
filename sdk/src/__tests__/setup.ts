/**
 * Global test setup for jsdom environment
 */
import '@testing-library/jest-dom';

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Reset DOM between tests
beforeEach(() => {
  document.body.innerHTML = '';
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
