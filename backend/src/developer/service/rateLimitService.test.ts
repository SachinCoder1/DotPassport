import { checkRateLimit, trackApiKeyUsage } from './rateLimitService';
import { createApiKey } from './apiKeyService';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';

describe('rateLimitService', () => {
  describe('checkRateLimit', () => {
    it('should allow requests within hourly limit', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(100); // Free tier hourly limit
      expect(result.remaining).toBe(100);
      expect(result.window).toBe('hour');
    });

    it('should deny requests exceeding hourly limit', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to exceed hourly limit
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 100,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(0);
      expect(result.window).toBe('hour');
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should deny requests exceeding daily limit', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to exceed daily limit (but not hourly)
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 50,
        'usage.currentDayRequests': 1000,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(false);
      expect(result.window).toBe('day');
    });

    it('should deny requests exceeding monthly limit', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to exceed monthly limit (but not hourly/daily)
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 50,
        'usage.currentDayRequests': 500,
        'usage.currentMonthRequests': 10000,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(false);
      expect(result.window).toBe('month');
    });

    it('should reset hour window after 1 hour', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to max and set window start to 1 hour ago
      const oneHourAgo = new Date(Date.now() - 61 * 60 * 1000);
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentHourRequests': 100,
        'usage.currentHourWindowStart': oneHourAgo,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      // Should be allowed since window was reset
      expect(result.allowed).toBe(true);

      // Verify reset happened
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.currentHourRequests).toBe(0);
    });

    it('should reset day window after 1 day', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to max and set window start to 1 day ago
      const oneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentDayRequests': 1000,
        'usage.currentDayStart': oneDayAgo,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      // Verify reset happened
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.currentDayRequests).toBe(0);
    });

    it('should reset month window after 30 days', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Set usage to max and set window start to 31 days ago
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      await ApiKey.findByIdAndUpdate(created.apiKeyDoc.id, {
        'usage.currentMonthRequests': 10000,
        'usage.currentMonthStart': thirtyOneDaysAgo,
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      // Verify reset happened
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.currentMonthRequests).toBe(0);
    });

    it('should handle Pro tier rate limits correctly', async () => {
      const created = await createApiKey({
        appName: 'Pro App',
        contactEmail: 'pro@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: 'admin123',
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(1000); // Pro tier hourly limit
      expect(result.remaining).toBe(1000);
    });

    it('should handle Enterprise tier rate limits correctly', async () => {
      const created = await createApiKey({
        appName: 'Enterprise App',
        contactEmail: 'enterprise@example.com',
        tier: ApiKeyTier.ENTERPRISE,
        createdBy: 'admin123',
      });

      const result = await checkRateLimit(created.apiKeyDoc.id);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10000); // Enterprise tier hourly limit
      expect(result.remaining).toBe(10000);
    });

    it('should throw error for non-existent API key', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(checkRateLimit(fakeId)).rejects.toThrow(
        'API key not found'
      );
    });
  });

  describe('trackApiKeyUsage', () => {
    it('should increment usage counters', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      await trackApiKeyUsage(created.apiKeyDoc.id);

      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.totalRequests).toBe(1);
      expect(updatedKey!.usage.currentHourRequests).toBe(1);
      expect(updatedKey!.usage.currentDayRequests).toBe(1);
      expect(updatedKey!.usage.currentMonthRequests).toBe(1);
      expect(updatedKey!.usage.lastRequestAt).toBeDefined();
      expect(updatedKey!.lastUsedAt).toBeDefined();
    });

    it('should increment counters on multiple calls', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      await trackApiKeyUsage(created.apiKeyDoc.id);
      await trackApiKeyUsage(created.apiKeyDoc.id);
      await trackApiKeyUsage(created.apiKeyDoc.id);

      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.totalRequests).toBe(3);
      expect(updatedKey!.usage.currentHourRequests).toBe(3);
      expect(updatedKey!.usage.currentDayRequests).toBe(3);
      expect(updatedKey!.usage.currentMonthRequests).toBe(3);
    });

    it('should update lastRequestAt timestamp', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      const before = Date.now();
      await trackApiKeyUsage(created.apiKeyDoc.id);
      const after = Date.now();

      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      const lastRequestTime = updatedKey!.usage.lastRequestAt!.getTime();

      expect(lastRequestTime).toBeGreaterThanOrEqual(before);
      expect(lastRequestTime).toBeLessThanOrEqual(after);
    });

    it('should not throw error for non-existent key (fail silently)', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      // Should not throw - tracking failures should not block requests
      await expect(trackApiKeyUsage(fakeId)).resolves.not.toThrow();
    });
  });

  describe('Rate limit integration', () => {
    it('should track usage and check limits correctly together', async () => {
      const created = await createApiKey({
        appName: 'Test App',
        contactEmail: 'test@example.com',
        tier: ApiKeyTier.FREE,
        createdBy: 'admin123',
      });

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const limitCheck = await checkRateLimit(created.apiKeyDoc.id);
        expect(limitCheck.allowed).toBe(true);
        expect(limitCheck.remaining).toBe(100 - i);

        await trackApiKeyUsage(created.apiKeyDoc.id);
      }

      // Verify final state
      const updatedKey = await ApiKey.findById(created.apiKeyDoc.id);
      expect(updatedKey!.usage.totalRequests).toBe(5);

      // Check remaining limit
      const finalCheck = await checkRateLimit(created.apiKeyDoc.id);
      expect(finalCheck.remaining).toBe(95);
    });

    it('should deny requests after reaching limit', async () => {
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

      // This should be allowed
      const beforeLimit = await checkRateLimit(created.apiKeyDoc.id);
      expect(beforeLimit.allowed).toBe(true);
      expect(beforeLimit.remaining).toBe(1);

      // Track usage
      await trackApiKeyUsage(created.apiKeyDoc.id);

      // This should be denied
      const atLimit = await checkRateLimit(created.apiKeyDoc.id);
      expect(atLimit.allowed).toBe(false);
      expect(atLimit.remaining).toBe(0);
    });
  });
});
