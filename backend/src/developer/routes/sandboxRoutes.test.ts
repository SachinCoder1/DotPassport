// Mock the signature verification module before importing
jest.mock('@polkadot/util-crypto', () => ({
  signatureVerify: jest.fn(),
}));

import request from 'supertest';
import { signatureVerify } from '@polkadot/util-crypto';
import { createApp } from '~/app';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';
import { RequestLog } from '../models/RequestLog';
import {
  TEST_SANDBOX_ADDRESS,
  TEST_SANDBOX_ADDRESS_2,
  generateSandboxTokens,
  generateExpiredSandboxToken,
  generateSandboxRefreshTokenOnly,
  createSandboxUser,
} from '~/test/helper';

const app = createApp();
const mockedSignatureVerify = signatureVerify as jest.Mock;

describe('Sandbox API Routes (/api/v1/sandbox)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: signature verification passes
    mockedSignatureVerify.mockReturnValue({ isValid: true });
  });

  describe('POST /api/v1/sandbox/challenge', () => {
    it('should return a challenge for valid Polkadot address', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('Sign this message');
      expect(response.body.message).toContain('Nonce:');
      expect(response.body.message).toContain('Timestamp:');
      expect(typeof response.body.isRegistered).toBe('boolean');
    });

    it('should indicate isRegistered=false for new user', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(response.body.isRegistered).toBe(false);
    });

    it('should indicate isRegistered=true for existing user', async () => {
      // Create a user first
      await createSandboxUser({ polkadotAddress: TEST_SANDBOX_ADDRESS });

      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(response.body.isRegistered).toBe(true);
    });

    it('should reject invalid Polkadot address format', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: 'invalid-address' })
        .expect(400);

      expect(response.body.message).toContain('Invalid Polkadot address');
    });

    it('should reject request without address', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    it('should return different nonce for each request', async () => {
      const response1 = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      const response2 = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(response1.body.message).not.toBe(response2.body.message);
    });
  });

  describe('POST /api/v1/sandbox/auth', () => {
    let challengeMessage: string;

    beforeEach(async () => {
      // Request a challenge first (required for auth)
      const challengeResponse = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS });
      challengeMessage = challengeResponse.body.message;
    });

    it('should authenticate new user with valid signature and create API key', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeMessage,
          contactEmail: 'test@example.com',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.isNew).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.user.contactEmail).toBe('test@example.com');
      expect(response.body.user.tier).toBe('FREE');
      expect(response.body.user.apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(response.body.user.keyPrefix).toMatch(/^dp_live_/);
      expect(response.body.user.isActive).toBe(true);
      expect(response.body.user.rateLimits).toBeDefined();
      expect(response.body.user.usage).toBeDefined();

      // Verify signature verification was called
      expect(mockedSignatureVerify).toHaveBeenCalledWith(
        challengeMessage,
        'valid-signature',
        TEST_SANDBOX_ADDRESS
      );
    });

    it('should authenticate existing user and return 200', async () => {
      // First create a user
      await createSandboxUser({ polkadotAddress: TEST_SANDBOX_ADDRESS });

      // Request a new challenge
      const challengeResponse = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS });
      const newChallenge = challengeResponse.body.message;

      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: newChallenge,
          contactEmail: '', // Empty for existing user
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isNew).toBe(false);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject without a challenge', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS_2, // Different address, no challenge
          signature: 'valid-signature',
          message: 'some message',
          contactEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body.message).toContain('No challenge found');
    });

    it('should reject message mismatch', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: 'wrong message',
          contactEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body.message).toContain('mismatch');
    });

    it('should reject invalid signature', async () => {
      mockedSignatureVerify.mockReturnValue({ isValid: false });

      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'invalid-signature',
          message: challengeMessage,
          contactEmail: 'test@example.com',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid signature');
    });

    it('should require email for new users', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeMessage,
          contactEmail: '', // Empty email for new user
        })
        .expect(400);

      expect(response.body.message).toContain('Email is required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeMessage,
          contactEmail: 'not-an-email',
        })
        .expect(400);

      expect(response.body.message).toContain('valid email');
    });

    it('should clear challenge after successful auth', async () => {
      // First successful auth
      await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeMessage,
          contactEmail: 'test@example.com',
        })
        .expect(201);

      // Try to use the same challenge again
      const response = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeMessage,
          contactEmail: '',
        })
        .expect(400);

      expect(response.body.message).toContain('No challenge found');
    });
  });

  describe('POST /api/v1/sandbox/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const { refreshToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);

      const response = await request(app)
        .post('/api/v1/sandbox/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    it('should reject request without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/refresh')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('required');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should reject access token used as refresh token', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);

      const response = await request(app)
        .post('/api/v1/sandbox/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/v1/sandbox/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });
  });

  describe('GET /api/v1/sandbox/me/:address', () => {
    let accessToken: string;
    let apiKey: string;

    beforeEach(async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        contactEmail: 'me@example.com',
      });
      accessToken = result.accessToken;
      apiKey = result.apiKey;
    });

    it('should return user info with valid JWT', async () => {
      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.contactEmail).toBe('me@example.com');
      expect(response.body.data.tier).toBe('FREE');
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.rateLimits).toBeDefined();
      expect(response.body.data.rateLimits.hourly).toBeDefined();
      expect(response.body.data.rateLimits.daily).toBeDefined();
      expect(response.body.data.rateLimits.monthly).toBeDefined();
      expect(response.body.data.usage).toBeDefined();
      expect(response.body.data.apiKey).toBe(apiKey);
    });

    it('should reject request without JWT', async () => {
      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .expect(401);

      expect(response.body.message).toContain('No token');
    });

    it('should reject request with invalid JWT', async () => {
      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    it('should reject request with expired JWT', async () => {
      const expiredToken = generateExpiredSandboxToken(TEST_SANDBOX_ADDRESS);

      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toContain('expired');
    });

    it('should reject refresh token instead of access token', async () => {
      const refreshToken = generateSandboxRefreshTokenOnly(TEST_SANDBOX_ADDRESS);

      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);

      expect(response.body.message).toContain('Invalid token type');
    });

    it('should return 404 for non-existent address', async () => {
      const { accessToken: otherToken } = generateSandboxTokens(
        TEST_SANDBOX_ADDRESS_2
      );

      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS_2}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.message).toContain('No API key found');
    });
  });

  describe('POST /api/v1/sandbox/regenerate-key', () => {
    let accessToken: string;
    let originalApiKey: string;

    beforeEach(async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
      });
      accessToken = result.accessToken;
      originalApiKey = result.apiKey;
    });

    it('should regenerate API key with valid signature', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/regenerate-key')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: 'regenerate key message',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('regenerated');
      expect(response.body.apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(response.body.apiKey).not.toBe(originalApiKey);
      expect(response.body.keyPrefix).toMatch(/^dp_live_/);
    });

    it('should reject without JWT', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/regenerate-key')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: 'regenerate key message',
        })
        .expect(401);

      expect(response.body.message).toContain('No token');
    });

    it('should reject invalid signature', async () => {
      mockedSignatureVerify.mockReturnValue({ isValid: false });

      const response = await request(app)
        .post('/api/v1/sandbox/regenerate-key')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'invalid-signature',
          message: 'regenerate key message',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid signature');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/regenerate-key')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          // Missing signature and message
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject for non-existent user', async () => {
      const { accessToken: otherToken } = generateSandboxTokens(
        TEST_SANDBOX_ADDRESS_2
      );

      const response = await request(app)
        .post('/api/v1/sandbox/regenerate-key')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS_2,
          signature: 'valid-signature',
          message: 'regenerate key message',
        })
        .expect(404);

      expect(response.body.message).toContain('No API key found');
    });
  });

  describe('GET /api/v1/sandbox/logs', () => {
    let accessToken: string;
    let apiKeyId: string;

    beforeEach(async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
      });
      accessToken = result.accessToken;
      apiKeyId = (result.apiKeyDoc as any)._id.toString();

      // Create some request logs
      const logs = [
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/profiles/test',
          method: 'GET',
          isWidget: false,
          statusCode: 200,
          responseTime: 100,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/scores/test',
          method: 'GET',
          isWidget: false,
          statusCode: 200,
          responseTime: 150,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/badges/test',
          method: 'POST',
          isWidget: false,
          statusCode: 404,
          responseTime: 50,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        },
      ];

      for (const log of logs) {
        await RequestLog.create(log);
      }
    });

    it('should return paginated request logs', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toBeDefined();
      expect(response.body.data.logs.length).toBe(3);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.totalPages).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBe(2);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs?endpoint=profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBe(1);
      expect(response.body.data.logs[0].endpoint).toContain('profiles');
    });

    it('should filter by method', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs?method=POST')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBe(1);
      expect(response.body.data.logs[0].method).toBe('POST');
    });

    it('should filter by status code', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs?statusCode=200')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBe(2);
      expect(
        response.body.data.logs.every((l: any) => l.statusCode === 200)
      ).toBe(true);
    });

    it('should reject request without JWT', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs')
        .expect(401);

      expect(response.body.message).toContain('No token');
    });

    it('should only return logs for authenticated user', async () => {
      // Create another user with logs
      const otherResult = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS_2,
      });

      await RequestLog.create({
        apiKeyId: (otherResult.apiKeyDoc as any)._id.toString(),
        polkadotAddress: TEST_SANDBOX_ADDRESS_2,
        endpoint: '/api/v2/other',
        method: 'GET',
        isWidget: false,
        statusCode: 200,
        responseTime: 100,
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      // Fetch logs for first user - should only get their logs
      const response = await request(app)
        .get('/api/v1/sandbox/logs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBe(3);
      expect(
        response.body.data.logs.every(
          (l: any) => l.polkadotAddress === TEST_SANDBOX_ADDRESS
        )
      ).toBe(true);
    });
  });

  describe('GET /api/v1/sandbox/stats', () => {
    let accessToken: string;
    let apiKeyId: string;

    beforeEach(async () => {
      const result = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
      });
      accessToken = result.accessToken;
      apiKeyId = (result.apiKeyDoc as any)._id.toString();

      // Create request logs for statistics
      const logs = [
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/profiles/test',
          method: 'GET',
          isWidget: false,
          statusCode: 200,
          responseTime: 100,
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/profiles/test2',
          method: 'GET',
          isWidget: false,
          statusCode: 200,
          responseTime: 200,
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/scores/test',
          method: 'POST',
          isWidget: false,
          statusCode: 400,
          responseTime: 50,
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/badges/test',
          method: 'GET',
          isWidget: false,
          statusCode: 500,
          responseTime: 300,
        },
        // Widget log should be excluded from stats
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/widget/badge',
          method: 'GET',
          isWidget: true,
          statusCode: 200,
          responseTime: 100,
        },
      ];

      for (const log of logs) {
        await RequestLog.create({
          ...log,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        });
      }
    });

    it('should return request statistics', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.total).toBe(4); // Excluding widget log
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.avgResponseTime).toBeDefined();
      expect(response.body.data.byEndpoint).toBeDefined();
      expect(response.body.data.byMethod).toBeDefined();
    });

    it('should correctly categorize status codes', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.byStatus['2xx']).toBe(2);
      expect(response.body.data.byStatus['4xx']).toBe(1);
      expect(response.body.data.byStatus['5xx']).toBe(1);
    });

    it('should calculate average response time', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // (100 + 200 + 50 + 300) / 4 = 162.5
      expect(response.body.data.avgResponseTime).toBeCloseTo(162.5, 0);
    });

    it('should include recent logs', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.recentLogs).toBeDefined();
      expect(Array.isArray(response.body.data.recentLogs)).toBe(true);
    });

    it('should reject request without JWT', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .expect(401);

      expect(response.body.message).toContain('No token');
    });

    it('should return zeros for user with no logs', async () => {
      const newUser = await createSandboxUser({
        polkadotAddress: TEST_SANDBOX_ADDRESS_2,
      });

      const response = await request(app)
        .get('/api/v1/sandbox/stats')
        .set('Authorization', `Bearer ${newUser.accessToken}`)
        .expect(200);

      expect(response.body.data.total).toBe(0);
      expect(response.body.data.byStatus['2xx']).toBe(0);
      expect(response.body.data.avgResponseTime).toBe(0);
    });
  });

  describe('Authentication flow integration', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Request challenge
      const challengeResponse = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(challengeResponse.body.isRegistered).toBe(false);
      const challenge = challengeResponse.body.message;

      // Step 2: Authenticate with signature
      const authResponse = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challenge,
          contactEmail: 'flow@example.com',
        })
        .expect(201);

      expect(authResponse.body.isNew).toBe(true);
      const { accessToken, refreshToken } = authResponse.body;

      // Step 3: Get user info
      const meResponse = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meResponse.body.data.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);

      // Step 4: Refresh token
      const refreshResponse = await request(app)
        .post('/api/v1/sandbox/refresh')
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;

      // Step 5: Use new access token
      const me2Response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(me2Response.body.data.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);

      // Step 6: Logout
      await request(app).post('/api/v1/sandbox/logout').expect(200);
    });

    it('should handle returning user flow', async () => {
      // Create existing user
      await createSandboxUser({ polkadotAddress: TEST_SANDBOX_ADDRESS });

      // Step 1: Request challenge (should indicate registered)
      const challengeResponse = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({ polkadotAddress: TEST_SANDBOX_ADDRESS })
        .expect(200);

      expect(challengeResponse.body.isRegistered).toBe(true);

      // Step 2: Authenticate without email (existing user)
      const authResponse = await request(app)
        .post('/api/v1/sandbox/auth')
        .send({
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          signature: 'valid-signature',
          message: challengeResponse.body.message,
          contactEmail: '', // Empty for returning user
        })
        .expect(200);

      expect(authResponse.body.isNew).toBe(false);
      expect(authResponse.body.accessToken).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should return consistent error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/sandbox/challenge')
        .send({})
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe('string');
    });

    it('should return consistent error format for auth errors', async () => {
      const response = await request(app)
        .get('/api/v1/sandbox/logs')
        .expect(401);

      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe('string');
    });

    it('should return consistent error format for not found errors', async () => {
      const { accessToken } = generateSandboxTokens(TEST_SANDBOX_ADDRESS);

      const response = await request(app)
        .get(`/api/v1/sandbox/me/${TEST_SANDBOX_ADDRESS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe('string');
    });
  });
});
