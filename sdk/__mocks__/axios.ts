/**
 * Jest manual mock for axios
 * This file is automatically used when jest.mock('axios') is called
 */

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

const axios = {
  create: jest.fn(() => mockAxiosInstance),
  isAxiosError: jest.fn((error: any) => error?.isAxiosError === true),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

/**
 * Reset all axios mock functions
 */
const resetAxiosMock = (): void => {
  mockAxiosInstance.get.mockReset();
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.put.mockReset();
  mockAxiosInstance.delete.mockReset();
  mockAxiosInstance.patch.mockReset();
  mockAxiosInstance.request.mockReset();
};

/**
 * Helper to create a successful mock response
 */
const createMockResponse = <T>(data: T, status = 200) => ({
  data: { success: true, data },
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * Helper to create a mock error response
 */
const createMockError = (message: string, status: number, data?: any) => {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  error.response = {
    status,
    data: data || { message },
  };
  return error;
};

export default axios;
export { mockAxiosInstance, resetAxiosMock, createMockResponse, createMockError };
