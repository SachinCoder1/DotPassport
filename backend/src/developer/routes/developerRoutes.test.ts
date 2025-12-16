import request from 'supertest';
import { createApp } from '~/app';
import { User } from '~/models/User';
import { Profile } from '~/models/Profile';
import { Score } from '~/models/Score';
import { UserBadge } from '~/models/UserBadge';
import { Badge } from '~/models/Badge';
import { Category } from '~/models/Category';
import { createApiKey } from '../service/apiKeyService';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';
import { BadgeKey } from '~/service/badge/badgeDefinitions';
import { CategoryKey } from '~/service/score/scoreDefinitions';

const app = createApp();

describe('Developer API Routes (/api/v2)', () => {
  let apiKey: string;
  let testUser: any;
  let testProfile: any;

  beforeEach(async () => {
    // Create an API key
    const created = await createApiKey({
      appName: 'Test App',
      contactEmail: 'test@example.com',
      tier: ApiKeyTier.FREE,
      createdBy: 'admin123',
    });
    apiKey = created.apiKey;

    // Create test data
    testUser = await User.create({
      addresses: ['test-address-123'],
    });

    testProfile = await Profile.create({
      user: testUser._id,
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Test bio',
      socialLinks: new Map([
        ['twitter', 'https://twitter.com/testuser'],
        ['github', 'https://github.com/testuser'],
      ]),
      polkadotIdentities: [
        {
          address: 'test-address-123',
          display: 'Test Display',
          web: 'https://example.com',
          twitter: '@testuser',
          github: 'testuser',
          judgements: [{ index: 0, judgement: 'Reasonable' }],
        },
      ],
    });

    testUser.profile = testProfile._id;
    await testUser.save();

    await Score.create({
      user: testUser._id,
      totalScore: 850,
      categories: new Map([
        [CategoryKey.Longevity, { score: 100, reason: 'OneYear', title: 'Account Longevity' }],
        [CategoryKey.TxCount, { score: 80, reason: 'Moderate', title: 'Transaction Count' }],
      ]),
    });

    await UserBadge.create({
      user: testUser._id,
      badgeKey: BadgeKey.RelayChainInitiate,
      achievedLevel: 3,
      achievedLevelKey: 'LEVEL_3_VETERAN',
      achievedLevelTitle: 'Veteran',
      earnedAt: new Date(),
    });

    // Create badge definitions
    await Badge.create({
      key: BadgeKey.RelayChainInitiate,
      title: 'Account Age Badge',
      shortDescription: 'Rewards account longevity',
      longDescription: 'This badge recognizes users...',
      metric: 'accountAgeDays',
      order: 1,
      active: true,
      levels: [
        {
          level: 1,
          key: 'LEVEL_1_NEWBIE',
          value: 30,
          title: 'Newbie',
          shortDescription: '30+ Days Active',
          longDescription: 'This level is awarded for having an account for 30+ days',
        },
      ],
    });

    // Create category definitions
    await Category.create({
      key: CategoryKey.Longevity,
      displayName: 'Account Longevity',
      short_description: 'Measures account age',
      long_description: 'This category evaluates...',
      order: 1,
      active: true,
      reasons: [
        {
          key: 'OneWeek',
          points: 25,
          title: 'One Week Milestone',
          description: 'Account is at least 7 days old',
          thresholds: [
            {
              label: '≥ 7 days',
              description: 'You must have maintained an account for at least one calendar week',
            },
          ],
          advices: ['Keep your account active to maintain this milestone'],
        },
      ],
    });
  });

  describe('GET /api/v2/profiles/:address', () => {
    it('should get user profile with valid API key', async () => {
      const response = await request(app)
        .get('/api/v2/profiles/test-address-123')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('test-address-123');
      expect(response.body.data.displayName).toBe('Test User');
      expect(response.body.data.bio).toBe('Test bio');
      expect(response.body.data.socialLinks.twitter).toBe(
        'https://twitter.com/testuser'
      );
      expect(response.body.data.polkadotIdentities).toHaveLength(1);

      // Verify rate limit headers are present
      expect(response.headers['x-ratelimit-limit']).toBe('100');
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .get('/api/v2/profiles/non-existent-address')
        .set('X-API-Key', apiKey)
        .expect(404);

      expect(response.body.message).toBe('Profile not found');
    });

    it('should reject request without API key', async () => {
      await request(app).get('/api/v2/profiles/test-address-123').expect(401);
    });

    it('should reject request with invalid API key', async () => {
      await request(app)
        .get('/api/v2/profiles/test-address-123')
        .set('X-API-Key', 'dp_live_invalid_key')
        .expect(401);
    });

    it('should reject request with revoked API key', async () => {
      const { revokeApiKey } = await import('../service/apiKeyService');
      const keyDoc = await ApiKey.findOne({ keyHash: { $exists: true } });
      await revokeApiKey(keyDoc!.id, 'admin123', 'Test revocation');

      await request(app)
        .get('/api/v2/profiles/test-address-123')
        .set('X-API-Key', apiKey)
        .expect(401);
    });
  });

  describe('GET /api/v2/scores/:address', () => {
    it('should get user scores with valid API key', async () => {
      const response = await request(app)
        .get('/api/v2/scores/test-address-123')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('test-address-123');
      expect(response.body.data.totalScore).toBe(850);
      expect(response.body.data.categories[CategoryKey.Longevity]).toBeDefined();
      expect(response.body.data.categories[CategoryKey.Longevity].score).toBe(100);
      expect(response.body.data.calculatedAt).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v2/scores/non-existent-address')
        .set('X-API-Key', apiKey)
        .expect(404);
    });
  });

  describe('GET /api/v2/scores/:address/:categoryKey', () => {
    it('should get specific category score for user', async () => {
      const response = await request(app)
        .get(`/api/v2/scores/test-address-123/${CategoryKey.Longevity}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('test-address-123');
      expect(response.body.data.category.key).toBe(CategoryKey.Longevity);
      expect(response.body.data.category.score).toBeDefined();
      expect(response.body.data.category.score.score).toBe(100);
      expect(response.body.data.definition).toBeDefined();
      expect(response.body.data.definition.displayName).toBe('Account Longevity');
      expect(response.body.data.calculatedAt).toBeDefined();
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get(`/api/v2/scores/test-address-123/nonexistentcategory`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get(`/api/v2/scores/non-existent-address/Longevity`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });
  });

  describe('GET /api/v2/badges/:address', () => {
    it('should get user badges with valid API key', async () => {
      const response = await request(app)
        .get('/api/v2/badges/test-address-123')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('test-address-123');
      expect(response.body.data.badges).toHaveLength(1);
      expect(response.body.data.badges[0].badgeKey).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.badges[0].achievedLevel).toBe(3);
      expect(response.body.data.count).toBe(1);
    });

    it('should return empty array for user with no badges', async () => {
      const newUser = await User.create({
        addresses: ['new-address'],
      });

      const response = await request(app)
        .get('/api/v2/badges/new-address')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.data.badges).toHaveLength(0);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /api/v2/badges/:address/:badgeKey', () => {
    it('should get specific badge for user', async () => {
      const response = await request(app)
        .get(`/api/v2/badges/test-address-123/${BadgeKey.RelayChainInitiate}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe('test-address-123');
      expect(response.body.data.badge.badgeKey).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.badge.achievedLevel).toBe(3);
      expect(response.body.data.badge.achievedLevelKey).toBe('LEVEL_3_VETERAN');
      expect(response.body.data.definition).toBeDefined();
      expect(response.body.data.definition.title).toBe('Account Age Badge');
    });

    it('should return 404 for non-existent badge', async () => {
      await request(app)
        .get(`/api/v2/badges/test-address-123/${BadgeKey.PolkadotRegular}`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get(`/api/v2/badges/non-existent-address/${BadgeKey.RelayChainInitiate}`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });
  });

  describe('GET /api/v2/metadata/badges', () => {
    it('should get badge definitions', async () => {
      const response = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.badges).toHaveLength(1);
      expect(response.body.data.badges[0].key).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.badges[0].title).toBe('Account Age Badge');
      expect(response.body.data.badges[0].levels).toHaveLength(1);
    });

    it('should only return active badges', async () => {
      await Badge.create({
        key: BadgeKey.PolkadotRegular,
        title: 'Inactive Badge',
        shortDescription: 'Should not appear',
        longDescription: 'Should not appear',
        metric: 'test',
        order: 2,
        active: false,
        levels: [],
      });

      const response = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.data.badges).toHaveLength(1);
      expect(response.body.data.badges[0].key).toBe(BadgeKey.RelayChainInitiate);
    });
  });

  describe('GET /api/v2/metadata/categories', () => {
    it('should get category definitions', async () => {
      const response = await request(app)
        .get('/api/v2/metadata/categories')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].key).toBe(CategoryKey.Longevity);
      expect(response.body.data.categories[0].displayName).toBe('Account Longevity');
      expect(response.body.data.categories[0].reasons).toHaveLength(1);
    });

    it('should only return active categories', async () => {
      await Category.create({
        key: CategoryKey.TxCount,
        displayName: 'Inactive Category',
        short_description: 'Should not appear',
        long_description: 'Should not appear',
        order: 2,
        active: false,
        reasons: [],
      });

      const response = await request(app)
        .get('/api/v2/metadata/categories')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories[0].key).toBe(CategoryKey.Longevity);
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits per API key', async () => {
      // Set usage to one below limit
      const keyDoc = await ApiKey.findOne({ keyHash: { $exists: true } });
      await ApiKey.findByIdAndUpdate(keyDoc!.id, {
        'usage.currentHourRequests': 99,
      });

      // This should succeed
      const response1 = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response1.headers['x-ratelimit-remaining']).toBe('0');

      // This should fail (rate limit exceeded)
      const response2 = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(429);

      expect(response2.body.message).toContain('Rate limit exceeded');
      expect(response2.headers['x-ratelimit-remaining']).toBe('0');
    });

    it('should track usage across multiple requests', async () => {
      // Make 3 requests
      await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      await request(app)
        .get('/api/v2/metadata/categories')
        .set('X-API-Key', apiKey)
        .expect(200);

      const response3 = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      // Verify usage was tracked
      const keyDoc = await ApiKey.findOne({ keyHash: { $exists: true } });
      expect(keyDoc!.usage.totalRequests).toBe(3);
      expect(keyDoc!.usage.currentHourRequests).toBe(3);

      // Verify remaining count in headers
      expect(response3.headers['x-ratelimit-remaining']).toBe('97');
    });

    it('should have different limits for different tiers', async () => {
      // Create a Pro tier API key
      const proCreated = await createApiKey({
        appName: 'Pro App',
        contactEmail: 'pro@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: 'admin123',
      });

      const response = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', proCreated.apiKey)
        .expect(200);

      // Pro tier should have 1000 requests per hour
      expect(response.headers['x-ratelimit-limit']).toBe('1000');
      expect(response.headers['x-ratelimit-remaining']).toBe('999');
    });
  });

  describe('CORS origin validation', () => {
    it('should allow request from allowed origin', async () => {
      const corsCreated = await createApiKey({
        appName: 'CORS App',
        contactEmail: 'cors@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', corsCreated.apiKey)
        .set('Origin', 'https://example.com')
        .expect(200);
    });

    it('should reject request from disallowed origin', async () => {
      const corsCreated = await createApiKey({
        appName: 'CORS App',
        contactEmail: 'cors@example.com',
        tier: ApiKeyTier.FREE,
        allowedOrigins: ['https://example.com'],
        createdBy: 'admin123',
      });

      await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', corsCreated.apiKey)
        .set('Origin', 'https://malicious.com')
        .expect(403);
    });
  });

  describe('Error responses', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .get('/api/v2/profiles/non-existent')
        .set('X-API-Key', apiKey)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should handle internal errors gracefully', async () => {
      // Force an error by using an invalid MongoDB ID format
      const response = await request(app)
        .get('/api/v2/profiles/invalid-id-format-but-long-enough')
        .set('X-API-Key', apiKey)
        .expect(404);

      expect(response.body.message).toBeDefined();
    });
  });
});
