import { Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from './apiKeyAuth';
import { createApiKey } from '../service/apiKeyService';
import { ApiKeyTier } from '../models/ApiKey';
import { HttpError } from '~/errors/HttpError';

describe('apiKeyAuth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      path: '/api/v2/test',
      ip: '127.0.0.1',
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('API key validation', () => {
    it('should authenticate with valid API key', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
      expect(mockRequest.apiKey?.appName).toBe('Test App');
      expect(mockRequest.apiKey?.tier).toBe(ApiKeyTier.FREE);
    });

    it('should reject request without API key', async () => {
      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'API key is required',
        })
      );
      expect(mockRequest.apiKey).toBeUndefined();
    });

    it('should reject request with invalid API key format (no prefix)', async () => {
      mockRequest.headers = {
        'x-api-key': 'invalid_key_format',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid API key format',
        })
      );
    });

    it('should reject request with non-existent API key', async () => {
      mockRequest.headers = {
        'x-api-key':
          'dp_live_000000000000000000000000000000000000000000000000',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid or revoked API key',
        })
      );
    });

    it('should reject request with revoked API key', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Revoke the key
      const { revokeApiKey } = await import('../service/apiKeyService');
      await revokeApiKey(created.apiKeyDoc.id, 'admin123', 'Test revocation');

      mockRequest.headers = {
        'x-api-key': created.apiKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid or revoked API key',
        })
      );
    });

    it('should reject request with inactive API key', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Deactivate the key
      const { updateApiKey } = await import('../service/apiKeyService');
      await updateApiKey(created.apiKeyDoc.id, { isActive: false });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid or revoked API key',
        })
      );
    });
  });

  describe('CORS origin validation', () => {
    it('should allow request from allowed origin', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
        origin: 'https://example.com',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
    });

    it('should reject request from disallowed origin', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
        origin: 'https://malicious.com',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Origin not allowed',
        })
      );
    });

    it('should allow wildcard subdomain matching', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['*.example.com'],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
        origin: 'https://app.example.com',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
    });

    it('should allow request without origin if no origins configured', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: [],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
    });

    it('should check referer header if origin is not present', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
        referer: 'https://example.com/page',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
    });
  });

  describe('Request context', () => {
    it('should attach API key info to request', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.PRO,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': created.apiKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.apiKey).toEqual({
        id: created.apiKeyDoc.id,
        appName: 'Test App',
        tier: ApiKeyTier.PRO,
        allowedOrigins: ['https://example.com'],
      });
    });

    it('should work with test API keys', async () => {
      const { generateApiKey, hashApiKey } = await import(
        '../service/apiKeyService'
      );
      const { ApiKey } = await import('../models/ApiKey');

      const testKey = generateApiKey('test');
      const keyHash = hashApiKey(testKey);

      await ApiKey.create({
        keyHash,
        keyPrefix: 'dp_test_',
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        isActive: true,
        allowedOrigins: [],
        rateLimits: {
          requestsPerHour: 100,
          requestsPerDay: 1000,
          requestsPerMonth: 10000,
        },
        createdBy: 'admin123',
      });

      mockRequest.headers = {
        'x-api-key': testKey,
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.apiKey).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Disconnect mongoose to simulate DB error
      const mongoose = await import('mongoose');
      await mongoose.disconnect();

      mockRequest.headers = {
        'x-api-key':
          'dp_live_123456789abcdef123456789abcdef123456789abcdef',
      };

      await apiKeyAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Authentication failed',
        })
      );

      // Reconnect for other tests
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    });
  });
});
