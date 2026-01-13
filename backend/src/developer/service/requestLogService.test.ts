import mongoose from 'mongoose';
import {
  createRequestLog,
  getRequestLogs,
  getRequestLogStats,
} from './requestLogService';
import { RequestLog } from '../models/RequestLog';
import { createApiKey } from './apiKeyService';
import { ApiKeyTier } from '../models/ApiKey';
import { TEST_SANDBOX_ADDRESS } from '~/test/helper';

describe('requestLogService', () => {
  let apiKeyId: string;

  beforeEach(async () => {
    // Create an API key for testing
    const { apiKeyDoc } = await createApiKey({
      appName: 'Test App',
      contactEmail: 'test@example.com',
      tier: ApiKeyTier.FREE,
      createdBy: 'admin',
    });
    apiKeyId = apiKeyDoc.id;
  });

  describe('createRequestLog', () => {
    it('should create a request log entry', async () => {
      const log = await createRequestLog({
        apiKeyId,
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        endpoint: '/api/v2/profiles/test',
        method: 'GET',
        isWidget: false,
        statusCode: 200,
        responseTime: 150,
        ipAddress: '127.0.0.1',
        userAgent: 'Jest Test',
      });

      expect(log._id).toBeDefined();
      expect(log.endpoint).toBe('/api/v2/profiles/test');
      expect(log.method).toBe('GET');
      expect(log.statusCode).toBe(200);
      expect(log.responseTime).toBe(150);
      expect(log.polkadotAddress).toBe(TEST_SANDBOX_ADDRESS);
    });

    it('should store optional fields', async () => {
      const log = await createRequestLog({
        apiKeyId,
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        endpoint: '/api/v2/scores/test',
        method: 'GET',
        isWidget: true,
        statusCode: 404,
        responseTime: 50,
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/100',
        requestHeaders: { 'X-Custom': 'header' },
        requestBody: { test: 'data' },
        errorMessage: 'Not found',
      });

      expect(log.isWidget).toBe(true);
      // requestHeaders is a Map in Mongoose schema
      expect((log.requestHeaders as unknown as Map<string, string>)?.get('X-Custom')).toBe('header');
      expect(log.requestBody?.test).toBe('data');
      expect(log.errorMessage).toBe('Not found');
    });

    it('should associate log with API key', async () => {
      const log = await createRequestLog({
        apiKeyId,
        endpoint: '/api/v2/badges/test',
        method: 'GET',
        isWidget: false,
        statusCode: 200,
        responseTime: 100,
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(log.apiKeyId.toString()).toBe(apiKeyId);
    });
  });

  describe('getRequestLogs', () => {
    beforeEach(async () => {
      // Create multiple logs for testing
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
          endpoint: '/api/v2/scores/test',
          method: 'GET',
          isWidget: true,
          statusCode: 200,
          responseTime: 150,
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/badges/test',
          method: 'GET',
          isWidget: false,
          statusCode: 404,
          responseTime: 50,
        },
        {
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          endpoint: '/api/v2/profiles/other',
          method: 'POST',
          isWidget: false,
          statusCode: 500,
          responseTime: 200,
        },
      ];

      for (const log of logs) {
        await createRequestLog({
          ...log,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        });
      }
    });

    it('should return paginated logs', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        page: 1,
        limit: 2,
      });

      expect(result.logs).toHaveLength(2);
      expect(result.pagination.total).toBe(4);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by endpoint', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        endpoint: 'profiles',
      });

      expect(result.logs.every((l) => l.endpoint.includes('profiles'))).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by method', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        method: 'POST',
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].method).toBe('POST');
    });

    it('should filter by status code', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        statusCode: 200,
      });

      expect(result.logs.every((l) => l.statusCode === 200)).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by isWidget', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        isWidget: true,
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].isWidget).toBe(true);
    });

    it('should filter by API key ID', async () => {
      const result = await getRequestLogs({
        apiKeyId,
      });

      expect(result.logs).toHaveLength(4);
    });

    it('should sort by timestamp descending', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
      });

      for (let i = 1; i < result.logs.length; i++) {
        const prev = new Date(result.logs[i - 1].timestamp);
        const curr = new Date(result.logs[i].timestamp);
        expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
      }
    });

    it('should limit page size to 100', async () => {
      const result = await getRequestLogs({
        polkadotAddress: TEST_SANDBOX_ADDRESS,
        limit: 500, // Try to request more than max
      });

      expect(result.pagination.limit).toBe(100);
    });

    it('should return empty result for non-existent address', async () => {
      const result = await getRequestLogs({
        polkadotAddress: 'non-existent-address',
      });

      expect(result.logs).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getRequestLogStats', () => {
    beforeEach(async () => {
      // Create logs with various status codes and endpoints
      const logs = [
        { statusCode: 200, endpoint: '/api/v2/profiles/a', method: 'GET', isWidget: false, responseTime: 100 },
        { statusCode: 200, endpoint: '/api/v2/profiles/b', method: 'GET', isWidget: false, responseTime: 150 },
        { statusCode: 201, endpoint: '/api/v2/scores/a', method: 'POST', isWidget: false, responseTime: 200 },
        { statusCode: 400, endpoint: '/api/v2/badges/a', method: 'GET', isWidget: false, responseTime: 50 },
        { statusCode: 404, endpoint: '/api/v2/profiles/c', method: 'GET', isWidget: false, responseTime: 30 },
        { statusCode: 500, endpoint: '/api/v2/scores/b', method: 'GET', isWidget: false, responseTime: 500 },
        // Widget logs should be excluded from stats
        { statusCode: 200, endpoint: '/api/v2/widget/badge', method: 'GET', isWidget: true, responseTime: 100 },
      ];

      for (const log of logs) {
        await createRequestLog({
          apiKeyId,
          polkadotAddress: TEST_SANDBOX_ADDRESS,
          ...log,
          ipAddress: '127.0.0.1',
          userAgent: 'Jest',
        });
      }
    });

    it('should return correct total (excluding widgets)', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      expect(stats.total).toBe(6); // 7 logs - 1 widget
    });

    it('should correctly categorize status codes', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      expect(stats.byStatus['2xx']).toBe(3); // 200, 200, 201
      expect(stats.byStatus['4xx']).toBe(2); // 400, 404
      expect(stats.byStatus['5xx']).toBe(1); // 500
    });

    it('should calculate average response time', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      // (100 + 150 + 200 + 50 + 30 + 500) / 6 = 171.67
      expect(stats.avgResponseTime).toBeCloseTo(171.67, 0);
    });

    it('should group by endpoint', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      expect(stats.byEndpoint.length).toBeGreaterThan(0);
      // Most common endpoint should be profiles (3 times)
      const profilesEndpoint = stats.byEndpoint.find((e) =>
        e.endpoint.includes('profiles')
      );
      expect(profilesEndpoint).toBeDefined();
    });

    it('should group by method', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      const getMethods = stats.byMethod.find((m) => m.method === 'GET');
      const postMethods = stats.byMethod.find((m) => m.method === 'POST');

      expect(getMethods?.count).toBe(5);
      expect(postMethods?.count).toBe(1);
    });

    it('should return recent logs', async () => {
      const stats = await getRequestLogStats(TEST_SANDBOX_ADDRESS);

      expect(stats.recentLogs).toBeDefined();
      expect(stats.recentLogs.length).toBeLessThanOrEqual(10);
    });

    it('should return zeros for non-existent address', async () => {
      const stats = await getRequestLogStats('non-existent-address');

      expect(stats.total).toBe(0);
      expect(stats.byStatus['2xx']).toBe(0);
      expect(stats.byStatus['4xx']).toBe(0);
      expect(stats.byStatus['5xx']).toBe(0);
      expect(stats.avgResponseTime).toBe(0);
    });
  });
});
