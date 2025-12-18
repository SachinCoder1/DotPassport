import {
  generateApiKey,
  hashApiKey,
  createApiKey,
  listApiKeys,
  getApiKeyById,
  updateApiKey,
  revokeApiKey,
  getUsageStats,
} from './apiKeyService';
import { ApiKey, ApiKeyTier, TIER_RATE_LIMITS } from '../models/ApiKey';
import { HttpError } from '~/errors/HttpError';

describe('apiKeyService', () => {
  describe('generateApiKey', () => {
    it('should generate a live API key with correct format', () => {
      const apiKey = generateApiKey('live');
      expect(apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
    });

    it('should generate a test API key with correct format', () => {
      const apiKey = generateApiKey('test');
      expect(apiKey).toMatch(/^dp_test_[a-f0-9]{48}$/);
    });

    it('should generate unique keys on multiple calls', () => {
      const key1 = generateApiKey('live');
      const key2 = generateApiKey('live');
      expect(key1).not.toBe(key2);
    });
  });

  describe('hashApiKey', () => {
    it('should hash API key consistently', () => {
      const apiKey = 'dp_live_123456789abcdef123456789abcdef123456789abcdef';
      const hash1 = hashApiKey(apiKey);
      const hash2 = hashApiKey(apiKey);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('dp_live_111111111111111111111111111111111111111111111111');
      const hash2 = hashApiKey('dp_live_222222222222222222222222222222222222222222222222');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createApiKey', () => {
    it('should create a new API key with Free tier', async () => {
      const data = {
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      };

      const result = await createApiKey(data);

      expect(result.apiKey).toMatch(/^dp_live_[a-f0-9]{48}$/);
      expect(result.apiKeyDoc).toBeDefined();
      expect(result.apiKeyDoc.appName).toBe(data.appName);
      expect(result.apiKeyDoc.contactEmail).toBe(data.contactEmail);
      expect(result.apiKeyDoc.tier).toBe(ApiKeyTier.FREE);
      expect(result.apiKeyDoc.isActive).toBe(true);
      expect(result.apiKeyDoc.rateLimits).toMatchObject(TIER_RATE_LIMITS[ApiKeyTier.FREE]);
    });

    it('should create a new API key with Pro tier', async () => {
      const data = {
        appName: 'Pro App',
        contactEmail: 'pro@example.com',
        tier: ApiKeyTier.PRO,
        allowedOrigins: ['https://example.com'],
        metadata: { plan: 'monthly' },
        createdBy: 'admin123',
      };

      const result = await createApiKey(data);

      expect(result.apiKeyDoc.tier).toBe(ApiKeyTier.PRO);
      expect(result.apiKeyDoc.allowedOrigins).toEqual(['https://example.com']);
      expect(result.apiKeyDoc.rateLimits).toMatchObject(TIER_RATE_LIMITS[ApiKeyTier.PRO]);
      expect(result.apiKeyDoc.metadata.get('plan')).toBe('monthly');
    });

    it('should hash the API key before storing', async () => {
      const data = {
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      };

      const result = await createApiKey(data);
      const expectedHash = hashApiKey(result.apiKey);

      expect(result.apiKeyDoc.keyHash).toBe(expectedHash);
      expect(result.apiKeyDoc.keyPrefix).toBe('dp_live_');
    });
  });

  describe('listApiKeys', () => {
    beforeEach(async () => {
      // Create multiple API keys for testing
      await createApiKey({
        appName: 'App 1',
        contactEmail: 'app1@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });
      await createApiKey({
        appName: 'App 2',
        contactEmail: 'app2@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: 'admin123',
      });
      await createApiKey({
        appName: 'App 3',
        contactEmail: 'app3@example.com',
        tier: ApiKeyTier.ENTERPRISE,
        createdBy: 'admin123',
      });
    });

    it('should list all API keys with default pagination', async () => {
      const result = await listApiKeys({});

      expect(result.apiKeys).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should paginate results correctly', async () => {
      const result = await listApiKeys({ page: 1, limit: 2 });

      expect(result.apiKeys).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by tier', async () => {
      const result = await listApiKeys({ tier: ApiKeyTier.PRO });

      expect(result.apiKeys).toHaveLength(1);
      expect(result.apiKeys[0].tier).toBe(ApiKeyTier.PRO);
    });

    it('should search by app name', async () => {
      const result = await listApiKeys({ search: 'App 2' });

      expect(result.apiKeys).toHaveLength(1);
      expect(result.apiKeys[0].appName).toBe('App 2');
    });

    it('should search by email', async () => {
      const result = await listApiKeys({ search: 'app3@example.com' });

      expect(result.apiKeys).toHaveLength(1);
      expect(result.apiKeys[0].contactEmail).toBe('app3@example.com');
    });

    it('should not return keyHash in results', async () => {
      const result = await listApiKeys({});

      result.apiKeys.forEach((key) => {
        expect(key).not.toHaveProperty('keyHash');
      });
    });
  });

  describe('getApiKeyById', () => {
    it('should retrieve an API key by ID', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const retrieved = await getApiKeyById(created.apiKeyDoc.id);

      expect(retrieved.id).toBe(created.apiKeyDoc.id);
      expect(retrieved.appName).toBe('Test App');
    });

    it('should throw 404 error for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(getApiKeyById(fakeId)).rejects.toThrow(HttpError);
      await expect(getApiKeyById(fakeId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'API key not found',
      });
    });

    it('should not return keyHash', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const retrieved = await getApiKeyById(created.apiKeyDoc.id);

      const plainObject = retrieved.toObject();
      expect(plainObject).not.toHaveProperty('keyHash');
    });
  });

  describe('updateApiKey', () => {
    it('should update app name', async () => {
      const created = await createApiKey({
        appName: 'Old Name',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const updated = await updateApiKey(created.apiKeyDoc.id, {
        appName: 'New Name',
      });

      expect(updated.appName).toBe('New Name');
    });

    it('should update tier and rate limits', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const updated = await updateApiKey(created.apiKeyDoc.id, {
        tier: ApiKeyTier.PRO,
      });

      expect(updated.tier).toBe(ApiKeyTier.PRO);
      expect(updated.rateLimits).toMatchObject(TIER_RATE_LIMITS[ApiKeyTier.PRO]);
    });

    it('should update allowed origins', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const updated = await updateApiKey(created.apiKeyDoc.id, {
        allowedOrigins: ['https://example.com', 'https://app.example.com'],
      });

      expect(updated.allowedOrigins).toHaveLength(2);
      expect(updated.allowedOrigins).toContain('https://example.com');
    });

    it('should update active status', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const updated = await updateApiKey(created.apiKeyDoc.id, {
        isActive: false,
      });

      expect(updated.isActive).toBe(false);
    });

    it('should throw 404 error for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(
        updateApiKey(fakeId, { appName: 'New Name' })
      ).rejects.toThrow(HttpError);
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const revoked = await revokeApiKey(
        created.apiKeyDoc.id,
        'admin456',
        'No longer needed'
      );

      expect(revoked.isActive).toBe(false);
      expect(revoked.revokedAt).toBeDefined();
      expect(revoked.revokedBy).toBe('admin456');
      expect(revoked.revokedReason).toBe('No longer needed');
    });

    it('should throw error if already revoked', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      await revokeApiKey(created.apiKeyDoc.id, 'admin456', 'First revoke');

      await expect(
        revokeApiKey(created.apiKeyDoc.id, 'admin456', 'Second revoke')
      ).rejects.toThrow(HttpError);
      await expect(
        revokeApiKey(created.apiKeyDoc.id, 'admin456', 'Second revoke')
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'API key already revoked',
      });
    });

    it('should throw 404 error for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(revokeApiKey(fakeId, 'admin456')).rejects.toThrow(HttpError);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const stats = await getUsageStats(created.apiKeyDoc.id);

      expect(stats.keyId).toBe(created.apiKeyDoc.id);
      expect(stats.appName).toBe('Test App');
      expect(stats.tier).toBe(ApiKeyTier.FREE);
      expect(stats.usage.totalRequests).toBe(0);
      expect(stats.rateLimits).toMatchObject(TIER_RATE_LIMITS[ApiKeyTier.FREE]);
      expect(stats.utilizationPercentage.hour).toBe(0);
      expect(stats.utilizationPercentage.day).toBe(0);
      expect(stats.utilizationPercentage.month).toBe(0);
    });

    it('should calculate utilization percentage correctly', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Manually update usage for testing
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 50,
        'usage.currentDayRequests': 500,
        'usage.currentMonthRequests': 5000,
      });

      const stats = await getUsageStats(created.apiKeyDoc.id);

      expect(stats.utilizationPercentage.hour).toBe(50); // 50/100 * 100
      expect(stats.utilizationPercentage.day).toBe(50); // 500/1000 * 100
      expect(stats.utilizationPercentage.month).toBe(50); // 5000/10000 * 100
    });

    it('should throw 404 error for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(getUsageStats(fakeId)).rejects.toThrow(HttpError);
    });
  });
});
