/**
 * Developer API Routes Test Suite
 *
 * Comprehensive integration tests for the /api/v2 endpoints.
 * Tests authentication, authorization, rate limiting, and all endpoints.
 *
 * NOTE: The Developer API uses the JIT service which validates Polkadot addresses
 * and creates ApiUser records for on-demand data fetching. Invalid addresses
 * return 400 Bad Request.
 */

// Mock the JIT service to prevent real API calls during testing
jest.mock('~/service/jit/apiUserService', () => {
  const actual = jest.requireActual('~/service/jit/apiUserService');
  return {
    ...actual,
    getOrCreateApiUserForProfile: jest.fn().mockImplementation(async (address: string) => {
      // Look up existing ApiUser in test database
      const { ApiUser } = require('~/models/ApiUser');
      const existing = await ApiUser.findOne({ address });
      if (existing) return existing;
      // Return minimal profile for unknown addresses
      return {
        address,
        profile: { displayName: undefined, polkadotIdentity: { judgements: [] }, nftCount: 0 },
        score: { totalScore: 0, categories: new Map(), calculatedAt: new Date() },
        badges: [],
        metadata: { firstRequestedAt: new Date(), lastRequestedAt: new Date(), requestCount: 1 },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),
    getOrCreateApiUserForScores: jest.fn().mockImplementation(async (address: string) => {
      const { ApiUser } = require('~/models/ApiUser');
      const existing = await ApiUser.findOne({ address });
      if (existing) return existing;
      return {
        address,
        profile: { displayName: undefined, polkadotIdentity: { judgements: [] }, nftCount: 0 },
        score: { totalScore: 0, categories: new Map(), calculatedAt: new Date() },
        badges: [],
        metadata: { firstRequestedAt: new Date(), lastRequestedAt: new Date(), requestCount: 1 },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),
    getOrCreateApiUserForBadges: jest.fn().mockImplementation(async (address: string) => {
      const { ApiUser } = require('~/models/ApiUser');
      const existing = await ApiUser.findOne({ address });
      if (existing) return existing;
      return {
        address,
        profile: { displayName: undefined, polkadotIdentity: { judgements: [] }, nftCount: 0 },
        score: { totalScore: 0, categories: new Map(), calculatedAt: new Date() },
        badges: [],
        metadata: { firstRequestedAt: new Date(), lastRequestedAt: new Date(), requestCount: 1 },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),
  };
});

import request from 'supertest';
import { createApp } from '~/app';
import { ApiUser } from '~/models/ApiUser';
import { Badge } from '~/models/Badge';
import { Category } from '~/models/Category';
import { createApiKey } from '../service/apiKeyService';
import { ApiKey, ApiKeyTier } from '../models/ApiKey';
import { BadgeKey } from '~/service/badge/badgeDefinitions';
import { CategoryKey } from '~/service/score/scoreDefinitions';
import { TEST_SANDBOX_ADDRESS, TEST_SANDBOX_ADDRESS_2 } from '~/test/helper';

const app = createApp();

describe('Developer API Routes (/api/v2)', () => {
  let apiKey: string;
  let apiKeyDoc: any;

  beforeEach(async () => {
    // Create an API key for testing
    const created = await createApiKey({
      appName: 'Test App',
      contactEmail: 'test@example.com',
      tier: ApiKeyTier.FREE,
      createdBy: 'admin123',
    });
    apiKey = created.apiKey;
    apiKeyDoc = created.apiKeyDoc;

    // Create test ApiUser with valid Polkadot address
    await ApiUser.create({
      address: TEST_SANDBOX_ADDRESS,
      profile: {
        displayName: 'Test User',
        nftCount: 10,
        polkadotIdentity: {
          address: TEST_SANDBOX_ADDRESS,
          display: 'Test Display',
          web: 'https://example.com',
          twitter: '@testuser',
          github: 'testuser',
          judgements: [{ index: 0, judgement: 'Reasonable' }],
        },
      },
      score: {
        totalScore: 850,
        categories: new Map([
          [CategoryKey.Longevity, { score: 100, reason: 'OneYear', title: 'Account Longevity' }],
          [CategoryKey.TxCount, { score: 80, reason: 'Moderate', title: 'Transaction Count' }],
        ]),
        calculatedAt: new Date(),
      },
      badges: [
        {
          badgeKey: BadgeKey.RelayChainInitiate,
          achievedLevel: 3,
          achievedLevelKey: 'LEVEL_3_VETERAN',
          achievedLevelTitle: 'Veteran',
          earnedAt: new Date(),
        },
      ],
      metadata: {
        firstRequestedAt: new Date(),
        lastRequestedAt: new Date(),
        requestCount: 1,
        source: 'api',
      },
      ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create badge definitions
    await Badge.create({
      key: BadgeKey.RelayChainInitiate,
      title: 'Relay Chain Initiate',
      shortDescription: 'Rewards relay chain activity',
      longDescription: 'This badge recognizes relay chain participation',
      metric: 'extrinsicCount',
      order: 1,
      active: true,
      levels: [
        {
          level: 1,
          key: 'LEVEL_1_NEWBIE',
          value: 10,
          title: 'Newbie',
          shortDescription: '10+ transactions',
          longDescription: 'Level 1 description',
        },
        {
          level: 2,
          key: 'LEVEL_2_REGULAR',
          value: 50,
          title: 'Regular',
          shortDescription: '50+ transactions',
          longDescription: 'Level 2 description',
        },
        {
          level: 3,
          key: 'LEVEL_3_VETERAN',
          value: 100,
          title: 'Veteran',
          shortDescription: '100+ transactions',
          longDescription: 'Level 3 description',
        },
      ],
    });

    // Create category definitions
    await Category.create({
      key: CategoryKey.Longevity,
      displayName: 'Account Longevity',
      short_description: 'Measures account age',
      long_description: 'This category evaluates how long your account has been active',
      order: 1,
      active: true,
      reasons: [
        {
          key: 'OneYear',
          points: 100,
          title: 'One Year',
          description: 'Account is at least 1 year old',
          thresholds: [{ label: '≥ 365 days', description: 'Your account must be at least one year old' }],
          advices: ['Keep your account active'],
        },
      ],
    });
  });

  // ============================================
  // GET /api/v2/profiles/:address
  // ============================================
  describe('GET /api/v2/profiles/:address', () => {
    it('should get user profile with valid API key', async () => {
      const response = await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.source).toBe('api');
    });

    it('should reject request with invalid Polkadot address format', async () => {
      const response = await request(app)
        .get('/api/v2/profiles/invalid-address-format')
        .set('X-API-Key', apiKey)
        .expect(400);

      expect(response.body.message).toContain('Invalid Polkadot address');
    });

    it('should reject request without API key', async () => {
      await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .expect(401);
    });

    it('should reject request with invalid API key', async () => {
      await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', 'dp_live_invalid_key_that_does_not_exist_12345678')
        .expect(401);
    });

    it('should reject request with revoked API key', async () => {
      const { revokeApiKey } = await import('../service/apiKeyService');
      await revokeApiKey(apiKeyDoc.id, 'admin123', 'Test revocation');

      await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', apiKey)
        .expect(401);
    });
  });

  // ============================================
  // GET /api/v2/scores/:address
  // ============================================
  describe('GET /api/v2/scores/:address', () => {
    it('should get user scores with valid API key', async () => {
      const response = await request(app)
        .get(`/api/v2/scores/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.totalScore).toBe(850);
      expect(response.body.data.categories).toBeDefined();
    });

    it('should reject request with invalid Polkadot address', async () => {
      await request(app)
        .get('/api/v2/scores/invalid-address')
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  // ============================================
  // GET /api/v2/scores/:address/:categoryKey
  // ============================================
  describe('GET /api/v2/scores/:address/:categoryKey', () => {
    it('should get specific category score for user', async () => {
      const response = await request(app)
        .get(`/api/v2/scores/${TEST_SANDBOX_ADDRESS}/${CategoryKey.Longevity}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.category.key).toBe(CategoryKey.Longevity);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get(`/api/v2/scores/${TEST_SANDBOX_ADDRESS}/nonexistentcategory`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });

    it('should reject request with invalid Polkadot address', async () => {
      await request(app)
        .get(`/api/v2/scores/invalid-address/${CategoryKey.Longevity}`)
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  // ============================================
  // GET /api/v2/badges/:address
  // ============================================
  describe('GET /api/v2/badges/:address', () => {
    it('should get user badges with valid API key', async () => {
      const response = await request(app)
        .get(`/api/v2/badges/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.badges).toHaveLength(1);
      expect(response.body.data.badges[0].badgeKey).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.count).toBe(1);
    });

    it('should return empty array for user with no badges', async () => {
      // Create ApiUser without badges
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS_2,
        profile: { displayName: 'No Badges User', nftCount: 0 },
        score: {
          totalScore: 0,
          categories: new Map(),
          calculatedAt: new Date(),
        },
        badges: [],
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(),
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .get(`/api/v2/badges/${TEST_SANDBOX_ADDRESS_2}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.data.badges).toHaveLength(0);
      expect(response.body.data.count).toBe(0);
    });

    it('should reject request with invalid Polkadot address', async () => {
      await request(app)
        .get('/api/v2/badges/invalid-address')
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  // ============================================
  // GET /api/v2/badges/:address/:badgeKey
  // ============================================
  describe('GET /api/v2/badges/:address/:badgeKey', () => {
    it('should get specific badge for user', async () => {
      const response = await request(app)
        .get(`/api/v2/badges/${TEST_SANDBOX_ADDRESS}/${BadgeKey.RelayChainInitiate}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(response.body.data.badge.badgeKey).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.badge.achievedLevel).toBe(3);
      expect(response.body.data.definition).toBeDefined();
    });

    it('should return 404 for non-existent badge on user', async () => {
      await request(app)
        .get(`/api/v2/badges/${TEST_SANDBOX_ADDRESS}/${BadgeKey.PolkadotRegular}`)
        .set('X-API-Key', apiKey)
        .expect(404);
    });

    it('should reject request with invalid Polkadot address', async () => {
      await request(app)
        .get(`/api/v2/badges/invalid-address/${BadgeKey.RelayChainInitiate}`)
        .set('X-API-Key', apiKey)
        .expect(400);
    });
  });

  // ============================================
  // GET /api/v2/metadata/badges
  // ============================================
  describe('GET /api/v2/metadata/badges', () => {
    it('should get badge definitions', async () => {
      const response = await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.badges).toHaveLength(1);
      expect(response.body.data.badges[0].key).toBe(BadgeKey.RelayChainInitiate);
      expect(response.body.data.badges[0].title).toBe('Relay Chain Initiate');
      expect(response.body.data.badges[0].levels).toHaveLength(3);
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

  // ============================================
  // GET /api/v2/metadata/categories
  // ============================================
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

  // ============================================
  // Rate Limiting Tests
  // ============================================
  describe('Rate limiting', () => {
    it('should enforce rate limits per API key', async () => {
      // Set usage to at the limit (FREE tier = 100/hour)
      // Must also set currentHourWindowStart to recent time to prevent reset
      const now = new Date();
      await ApiKey.findByIdAndUpdate(apiKeyDoc.id, {
        'usage.currentHourRequests': 100, // At the limit
        'usage.currentHourWindowStart': now,
        'usage.currentDayStart': now,
        'usage.currentMonthStart': now,
      });

      // This should fail (rate limit exceeded)
      const response = await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`) // Use profile endpoint, not metadata (free)
        .set('X-API-Key', apiKey)
        .expect(429);

      expect(response.body.message).toContain('Rate limit exceeded');
    });

    it('should have different limits for different tiers', async () => {
      // Create a Pro tier API key (1000/hour)
      const proCreated = await createApiKey({
        appName: 'Pro App',
        contactEmail: 'pro@example.com',
        tier: ApiKeyTier.PRO,
        createdBy: 'admin123',
      });

      // Set usage to at the limit (Pro tier = 1000/hour)
      const now = new Date();
      await ApiKey.findByIdAndUpdate(proCreated.apiKeyDoc.id, {
        'usage.currentHourRequests': 1000, // At the limit
        'usage.currentHourWindowStart': now,
        'usage.currentDayStart': now,
        'usage.currentMonthStart': now,
      });

      // This should fail (rate limit exceeded)
      const response = await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .set('X-API-Key', proCreated.apiKey)
        .expect(429);

      expect(response.body.message).toContain('Rate limit exceeded');
    });
  });

  // ============================================
  // CORS Origin Validation
  // ============================================
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

    it('should allow request when no origins are specified', async () => {
      // apiKey created in beforeEach has no allowed origins
      await request(app)
        .get('/api/v2/metadata/badges')
        .set('X-API-Key', apiKey)
        .set('Origin', 'https://any-origin.com')
        .expect(200);
    });
  });

  // ============================================
  // Error Response Format Tests
  // ============================================
  describe('Error responses', () => {
    it('should return consistent error format for validation errors', async () => {
      const response = await request(app)
        .get('/api/v2/profiles/invalid-address')
        .set('X-API-Key', apiKey)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should return consistent error format for auth errors', async () => {
      const response = await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should return consistent error format for not found errors', async () => {
      const response = await request(app)
        .get(`/api/v2/badges/${TEST_SANDBOX_ADDRESS}/${BadgeKey.PolkadotRegular}`)
        .set('X-API-Key', apiKey)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

  // ============================================
  // forceRefresh Query Parameter Tests
  // ============================================
  describe('forceRefresh parameter', () => {
    it('should accept forceRefresh query parameter', async () => {
      const response = await request(app)
        .get(`/api/v2/profiles/${TEST_SANDBOX_ADDRESS}?forceRefresh=true`)
        .set('X-API-Key', apiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
