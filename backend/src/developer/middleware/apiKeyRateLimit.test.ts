import { Request, Response, NextFunction } from 'express';
import { apiKeyRateLimit } from './apiKeyRateLimit';
import { createApiKey } from '../service/apiKeyService';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';

describe('apiKeyRateLimit middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();
    mockRequest = {
      path: '/api/v2/test',
    };
    mockResponse = {
      setHeader: setHeaderMock,
    };
    nextFunction = jest.fn();
  });

  describe('Rate limiting', () => {
    it('should allow request within rate limit', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '99'); // After tracking
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String)
      );
    });

    it('should deny request when rate limit exceeded', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to max
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 100,
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 429,
          message: expect.stringContaining('Rate limit exceeded'),
        })
      );
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
    });

    it('should track usage after successful rate limit check', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Verify usage was tracked
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.totalRequests).toBe(1);
      expect(updatedKey!.usage.currentHourRequests).toBe(1);
    });

    it('should not track usage when rate limit is exceeded', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to max
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 100,
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Verify usage was NOT incremented
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.currentHourRequests).toBe(100); // Still 100, not 101
    });
  });

  describe('Rate limit headers', () => {
    it('should set correct rate limit headers for Free tier', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '99');
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String)
      );
    });

    it('should set correct rate limit headers for Pro tier', async () => {
      const created = await createApiKey({
        appName: 'Pro App',
        contactEmail: 'pro@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Pro App',
        tier: ApiKeyTier.PRO,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '1000');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '999');
    });

    it('should set correct rate limit headers for Enterprise tier', async () => {
      const created = await createApiKey({
        appName: 'Enterprise App',
        contactEmail: 'enterprise@example.com',
        tier: ApiKeyTier.ENTERPRISE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Enterprise App',
        tier: ApiKeyTier.ENTERPRISE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '10000');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '9999');
    });

    it('should include reset timestamp in headers', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      const resetCallIndex = setHeaderMock.mock.calls.findIndex(
        (call) => call[0] === 'X-RateLimit-Reset'
      );
      expect(resetCallIndex).not.toBe(-1);

      const resetTimestamp = parseInt(
        setHeaderMock.mock.calls[resetCallIndex][1],
        10
      );
      expect(resetTimestamp).toBeGreaterThan(Date.now());
      expect(resetTimestamp).toBeLessThan(Date.now() + 60 * 60 * 1000 + 1000); // Within 1 hour + 1 sec buffer
    });
  });

  describe('Error handling', () => {
    it('should return 401 if API key not authenticated', async () => {
      mockRequest.apiKey = undefined;

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'API key not authenticated',
        })
      );
    });

    it('should handle errors during rate limit check', async () => {
      mockRequest.apiKey = {
        id: 'invalid-id-format',
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Rate limit check failed',
        })
      );
    });
  });

  describe('Multiple requests', () => {
    it('should decrement remaining count on each request', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      // First request
      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '99');

      // Reset mock
      setHeaderMock.mockClear();

      // Second request
      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '98');
    });

    it('should block requests after limit is reached', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set to one below limit
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 99,
      });

      mockRequest.apiKey = {
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
      };

      // This should succeed (request 100)
      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith();

      // Reset mocks
      (nextFunction as jest.Mock).mockClear();
      setHeaderMock.mockClear();

      // This should fail (request 101)
      await apiKeyRateLimit(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 429,
        })
      );
    });
  });
});
