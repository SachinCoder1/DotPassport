import { Request, Response, NextFunction } from 'express';
import { sandboxAuth } from './sandboxAuth';
import {
  generateSandboxTokens,
  generateExpiredSandboxToken,
  generateSandboxRefreshTokenOnly,
  TEST_SANDBOX_ADDRESS,
} from '~/test/helper';

describe('sandboxAuth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('Token validation', () => {
    it('should authenticate with valid access token', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: `Bearer ${accessToken}`,
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.sandboxUser).toBeDefined();
      expect(mockRequest.sandboxUser?.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
    });

    it('should reject request without authorization header', async () => {
      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided',
        })
      );
      expect(mockRequest.sandboxUser).toBeUndefined();
    });

    it('should reject request with malformed authorization header (no Bearer prefix)', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: accessToken, // Missing 'Bearer ' prefix
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided',
        })
      );
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid token',
        })
      );
    });

    it('should reject expired access token', async () => {
      const expiredToken = generateExpiredSandboxToken(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token expired',
        })
      );
    });

    it('should reject refresh token when access token is expected', async () => {
      const refreshToken = generateSandboxRefreshTokenOnly(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: `Bearer ${refreshToken}`,
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid token type',
        })
      );
    });
  });

  describe('Request context', () => {
    it('should attach polkadotAddress to request.sandboxUser', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: `Bearer ${accessToken}`,
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.sandboxUser).toEqual({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
      });
    });

    it('should work with different Polkadot addresses', async () => {
      const differentAddress = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
      const { accessToken } = generateSandboxTokens(differentAddress);
      mockRequest.headers = {
        authorization: `Bearer ${accessToken}`,
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.sandboxUser?.polkadotAddress).toBe(differentAddress);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty Bearer token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });

    it('should handle lowercase bearer prefix', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);
      mockRequest.headers = {
        authorization: `bearer ${accessToken}`, // lowercase
      };

      // The middleware uses startsWith('Bearer ') which is case-sensitive
      await sandboxAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'No token provided',
        })
      );
    });
  });
});
