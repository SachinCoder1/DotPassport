/**
 * Axios mock for testing API calls
 */

// Create a mock axios instance
export const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn((onFulfilled, onRejected) => {
      // Store the error handler so we can use it in tests
      mockAxiosInstance._errorHandler = onRejected;
    }), eject: jest.fn() },
  },
  _errorHandler: null as ((error: any) => any) | null,
};

// Mock axios.create to return our mock instance
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  isAxiosError: jest.fn((error) => error?.isAxiosError === true),
}));

/**
 * Reset all axios mock functions
 */
export const resetAxiosMock = (): void => {
  mockAxiosInstance.get.mockReset();
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.put.mockReset();
  mockAxiosInstance.delete.mockReset();
};

/**
 * Helper to create a successful mock response
 */
export const createMockResponse = <T>(data: T, status = 200) => ({
  data: { success: true, data },
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * Helper to create a mock error response
 */
export const createMockError = (message: string, status: number, data?: any) => {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  error.response = {
    status,
    data: data || { message },
  };
  return error;
};
