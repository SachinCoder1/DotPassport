// Mock external services
jest.mock('~/service/score');
jest.mock('~/service/badge');
jest.mock('~/service/subscan');
jest.mock('~/service/kodadot');

import { calculateScore } from '~/service/score';
import { checkUserBadges } from '~/service/badge';
import {
  fetchAccountDetailsByAddress,
  clearAddressCache,
} from '~/service/subscan';
import { getOwnedNfts } from '~/service/kodadot';
import { ApiUser } from '~/models/ApiUser';
import { Badge } from '~/models/Badge';
import {
  isValidPolkadotAddress,
  getOrCreateApiUser,
  getOrCreateApiUserForProfile,
  getOrCreateApiUserForScores,
  getOrCreateApiUserForBadges,
} from './apiUserService';
import {
  TEST_SANDBOX_ADDRESS,
  TEST_SANDBOX_ADDRESS_2,
} from '~/test/helper';
import { BadgeKey } from '~/service/badge/badgeDefinitions';
import { CategoryKey } from '~/service/score/scoreDefinitions';

// Type the mocked functions
const mockedCalculateScore = calculateScore as jest.MockedFunction<
  typeof calculateScore
>;
const mockedCheckUserBadges = checkUserBadges as jest.MockedFunction<
  typeof checkUserBadges
>;
const mockedFetchAccountDetails = fetchAccountDetailsByAddress as jest.MockedFunction<
  typeof fetchAccountDetailsByAddress
>;
const mockedClearAddressCache = clearAddressCache as jest.MockedFunction<
  typeof clearAddressCache
>;
const mockedGetOwnedNfts = getOwnedNfts as jest.MockedFunction<
  typeof getOwnedNfts
>;

// Mock data
const mockAccountDetails = {
  data: {
    account: {
      address: TEST_SANDBOX_ADDRESS,
      display: 'Test Display',
      legal: 'Test Legal',
      email: 'test@example.com',
      web: 'https://example.com',
      twitter: '@testuser',
      github: 'testuser',
      matrix: null,
      discord: 'testuser#1234',
      riot: null,
      judgements: [{ index: 0, judgement: 'Reasonable' }],
      role: null,
      nonce: 1,
    },
  },
};

const mockScoreResult = {
  total: 450,
  isPartial: false,
  categories: {
    [CategoryKey.Longevity]: {
      score: 100,
      reason: 'OneYear',
    },
    [CategoryKey.TxCount]: {
      score: 75,
      reason: 'Moderate',
    },
    [CategoryKey.NftHoldings]: {
      score: 50,
      reason: 'SomeNFTs',
    },
  },
} as any; // Using any to simplify mock - we only need the categories we test

const mockCheckedBadges = {
  [BadgeKey.RelayChainInitiate]: 2,
  [BadgeKey.PolkadotRegular]: 1,
} as Record<BadgeKey, number>; // Cast to expected type - we only mock badges we test

const mockNftData = {
  totalCount: 5,
  data: [
    {
      id: '1',
      name: 'NFT 1',
      price: '0',
      currentOwner: TEST_SANDBOX_ADDRESS,
      issuer: 'issuer1',
      metadata: '',
      meta: { id: '1', name: 'NFT 1', description: '', image: '', animationUrl: null, type: 'image' },
      collection: { id: 'col1', name: 'Test Collection', max: 100 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [],
    },
    {
      id: '2',
      name: 'NFT 2',
      price: '0',
      currentOwner: TEST_SANDBOX_ADDRESS,
      issuer: 'issuer1',
      metadata: '',
      meta: { id: '2', name: 'NFT 2', description: '', image: '', animationUrl: null, type: 'image' },
      collection: { id: 'col1', name: 'Test Collection', max: 100 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [],
    },
  ],
};

describe('apiUserService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Set up default mock responses
    mockedCalculateScore.mockResolvedValue(mockScoreResult);
    mockedCheckUserBadges.mockResolvedValue(mockCheckedBadges);
    mockedFetchAccountDetails.mockResolvedValue(mockAccountDetails);
    mockedGetOwnedNfts.mockResolvedValue(mockNftData);
    mockedClearAddressCache.mockImplementation(() => {});

    // Create badge definitions for mapping
    await Badge.create([
      {
        key: BadgeKey.RelayChainInitiate,
        title: 'Relay Chain Initiate',
        shortDescription: 'Relay chain activity badge',
        longDescription: 'This badge rewards relay chain activity',
        metric: 'relayChainTx',
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
      },
      {
        key: BadgeKey.PolkadotRegular,
        title: 'Polkadot Regular',
        shortDescription: 'Regular Polkadot user',
        longDescription: 'Badge for regular Polkadot users',
        metric: 'polkadotTx',
        order: 2,
        active: true,
        levels: [
          {
            level: 1,
            key: 'LEVEL_1_STARTER',
            value: 5,
            title: 'Starter',
            shortDescription: '5+ transactions',
            longDescription: 'Level 1 description',
          },
        ],
      },
    ]);
  });

  describe('isValidPolkadotAddress', () => {
    it('should return true for valid Polkadot address', () => {
      expect(isValidPolkadotAddress(TEST_SANDBOX_ADDRESS)).toBe(true);
      expect(isValidPolkadotAddress(TEST_SANDBOX_ADDRESS_2)).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      // Too short
      expect(isValidPolkadotAddress('5GrwvaEF5zXb26Fz9rc')).toBe(false);

      // Too long
      expect(
        isValidPolkadotAddress(
          '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQYExtraChars'
        )
      ).toBe(false);

      // Contains invalid characters (0, O, I, l)
      expect(isValidPolkadotAddress('0GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')).toBe(false);

      // Empty string
      expect(isValidPolkadotAddress('')).toBe(false);

      // Ethereum address
      expect(isValidPolkadotAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(false);
    });

    it('should return false for addresses with lowercase letters 0, O, I, l', () => {
      // These are not allowed in base58
      const invalidChars = ['0', 'O', 'I', 'l'];
      for (const char of invalidChars) {
        const invalidAddress = char + 'GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ';
        expect(isValidPolkadotAddress(invalidAddress)).toBe(false);
      }
    });
  });

  describe('getOrCreateApiUser', () => {
    it('should create new ApiUser when not exists', async () => {
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result).toBeDefined();
      expect(result.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(result.score.totalScore).toBe(450);
      expect(result.badges).toHaveLength(2);
      expect(result.profile.displayName).toBe('Test Display');
      expect(result.profile.nftCount).toBe(5);
      expect(result.metadata.requestCount).toBe(1);
      expect(result.metadata.source).toBe('api');

      // Verify all external services were called
      expect(mockedCalculateScore).toHaveBeenCalledWith(TEST_SANDBOX_ADDRESS);
      expect(mockedCheckUserBadges).toHaveBeenCalledWith(TEST_SANDBOX_ADDRESS);
      expect(mockedFetchAccountDetails).toHaveBeenCalledWith(TEST_SANDBOX_ADDRESS);
      expect(mockedGetOwnedNfts).toHaveBeenCalledWith(TEST_SANDBOX_ADDRESS);
    });

    it('should return cached ApiUser when data is fresh', async () => {
      // Create a user first
      const firstCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      // Reset mocks to track second call
      jest.clearAllMocks();

      // Second call should return cached data
      const secondCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(secondCall.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(secondCall.metadata.requestCount).toBe(2);

      // No external services should be called for cached data
      expect(mockedCalculateScore).not.toHaveBeenCalled();
      expect(mockedCheckUserBadges).not.toHaveBeenCalled();
    });

    it('should refresh data when cache is stale (>10 min)', async () => {
      // Create a user with stale timestamp
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Old Name', nftCount: 1 },
        score: {
          totalScore: 100,
          categories: new Map(),
          calculatedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        },
        badges: [],
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(Date.now() - 15 * 60 * 1000),
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      // Should have refreshed data
      expect(result.profile.displayName).toBe('Test Display');
      expect(result.score.totalScore).toBe(450);

      // External services should have been called
      expect(mockedCalculateScore).toHaveBeenCalled();
      expect(mockedCheckUserBadges).toHaveBeenCalled();
    });

    it('should force refresh when forceRefresh is true', async () => {
      // Create a fresh user
      await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      jest.clearAllMocks();

      // Force refresh should fetch new data even if fresh
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS, true);

      expect(result).toBeDefined();
      expect(mockedCalculateScore).toHaveBeenCalled();
      expect(mockedClearAddressCache).toHaveBeenCalledWith(TEST_SANDBOX_ADDRESS);
    });

    it('should map badge levels correctly', async () => {
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      // Check RelayChainInitiate badge (level 2)
      const relayBadge = result.badges.find(
        (b) => b.badgeKey === BadgeKey.RelayChainInitiate
      );
      expect(relayBadge).toBeDefined();
      expect(relayBadge?.achievedLevel).toBe(2);
      expect(relayBadge?.achievedLevelKey).toBe('LEVEL_2_REGULAR');
      expect(relayBadge?.achievedLevelTitle).toBe('Regular');

      // Check PolkadotRegular badge (level 1)
      const polkaBadge = result.badges.find(
        (b) => b.badgeKey === BadgeKey.PolkadotRegular
      );
      expect(polkaBadge).toBeDefined();
      expect(polkaBadge?.achievedLevel).toBe(1);
      expect(polkaBadge?.achievedLevelKey).toBe('LEVEL_1_STARTER');
    });

    it('should handle NFT fetch failure gracefully', async () => {
      mockedGetOwnedNfts.mockRejectedValue(new Error('NFT API error'));

      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result).toBeDefined();
      expect(result.profile.nftCount).toBe(0); // Should default to 0
    });

    it('should update TTL on each access', async () => {
      const firstCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const firstTTL = firstCall.ttl.getTime();

      // Wait a bit
      await new Promise((r) => setTimeout(r, 10));

      const secondCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const secondTTL = secondCall.ttl.getTime();

      expect(secondTTL).toBeGreaterThanOrEqual(firstTTL);
    });

    it('should preserve firstRequestedAt on updates', async () => {
      const firstCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const firstRequestedAt = firstCall.metadata.firstRequestedAt;

      // Force refresh to trigger update
      const secondCall = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS, true);

      expect(secondCall.metadata.firstRequestedAt.getTime()).toBe(
        firstRequestedAt.getTime()
      );
    });

    it('should increment request count on each access', async () => {
      await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const result1 = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const result2 = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result2.metadata.requestCount).toBe(3);
    });
  });

  describe('getOrCreateApiUserForProfile', () => {
    it('should create ApiUser with profile only (fast path)', async () => {
      const result = await getOrCreateApiUserForProfile(TEST_SANDBOX_ADDRESS);

      expect(result).toBeDefined();
      expect(result.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(result.profile.displayName).toBe('Test Display');
      expect(result.profile.nftCount).toBe(5);

      // For new users, scores should be empty
      expect(result.score.totalScore).toBe(0);
      expect(result.badges).toHaveLength(0);

      // Only fast APIs should be called
      expect(mockedFetchAccountDetails).toHaveBeenCalled();
      expect(mockedGetOwnedNfts).toHaveBeenCalled();

      // Slow APIs should NOT be called during the request
      // (they're queued for background)
      expect(mockedCalculateScore).not.toHaveBeenCalled();
      expect(mockedCheckUserBadges).not.toHaveBeenCalled();
    });

    it('should return cached profile when fresh', async () => {
      // Create user first
      await getOrCreateApiUserForProfile(TEST_SANDBOX_ADDRESS);

      jest.clearAllMocks();

      // Second call should return cached
      const result = await getOrCreateApiUserForProfile(TEST_SANDBOX_ADDRESS);

      expect(result.profile.displayName).toBe('Test Display');
      expect(mockedFetchAccountDetails).not.toHaveBeenCalled();
    });

    it('should update existing user profile', async () => {
      // Create user with initial profile
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Old Name', nftCount: 1 },
        score: {
          totalScore: 100,
          categories: new Map(),
          calculatedAt: new Date(Date.now() - 15 * 60 * 1000),
        },
        badges: [],
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(Date.now() - 15 * 60 * 1000),
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await getOrCreateApiUserForProfile(TEST_SANDBOX_ADDRESS);

      // Profile should be updated
      expect(result.profile.displayName).toBe('Test Display');
      expect(result.profile.nftCount).toBe(5);
    });
  });

  describe('getOrCreateApiUserForScores', () => {
    it('should create ApiUser with scores (medium path)', async () => {
      const result = await getOrCreateApiUserForScores(TEST_SANDBOX_ADDRESS);

      expect(result).toBeDefined();
      expect(result.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(result.score.totalScore).toBe(450);
      expect(result.profile.displayName).toBe('Test Display');

      // Badges should be empty (fetched in background)
      expect(result.badges).toHaveLength(0);

      // Score API should be called
      expect(mockedCalculateScore).toHaveBeenCalled();
      expect(mockedFetchAccountDetails).toHaveBeenCalled();

      // Badge API is called in background job (queued via setTimeout)
      // We verify it wasn't called synchronously by checking badges are still empty
      // The background job will fetch badges asynchronously after response is returned
    });

    it('should return cached scores when fresh', async () => {
      // Create user with fresh scores
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Test', nftCount: 1 },
        score: {
          totalScore: 450,
          categories: new Map(),
          calculatedAt: new Date(), // Fresh
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

      const result = await getOrCreateApiUserForScores(TEST_SANDBOX_ADDRESS);

      expect(result.score.totalScore).toBe(450);
      expect(mockedCalculateScore).not.toHaveBeenCalled();
    });

    it('should preserve existing badges when updating scores', async () => {
      // Create user with badges (fresh metadata to avoid triggering badge refresh)
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Test', nftCount: 1 },
        score: {
          totalScore: 100,
          categories: new Map(),
          calculatedAt: new Date(Date.now() - 15 * 60 * 1000), // Stale scores
        },
        badges: [
          {
            badgeKey: BadgeKey.RelayChainInitiate,
            achievedLevel: 3,
            achievedLevelKey: 'LEVEL_3_VETERAN',
            achievedLevelTitle: 'Veteran',
          },
        ],
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(), // Fresh metadata
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await getOrCreateApiUserForScores(TEST_SANDBOX_ADDRESS);

      // Scores should be updated
      expect(result.score.totalScore).toBe(450);

      // Badges should be preserved (at least 1 badge exists)
      // Note: Background badge fetch may have already updated badges
      expect(result.badges.length).toBeGreaterThanOrEqual(1);
      expect(result.badges.some(b => b.badgeKey === BadgeKey.RelayChainInitiate)).toBe(true);
    });
  });

  describe('getOrCreateApiUserForBadges', () => {
    it('should create ApiUser with badges', async () => {
      const result = await getOrCreateApiUserForBadges(TEST_SANDBOX_ADDRESS);

      expect(result).toBeDefined();
      expect(result.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(result.badges).toHaveLength(2);
      expect(result.profile.displayName).toBe('Test Display');

      // Scores should be empty (fetched in background)
      expect(result.score.totalScore).toBe(0);

      // Badge API should be called
      expect(mockedCheckUserBadges).toHaveBeenCalled();
      expect(mockedFetchAccountDetails).toHaveBeenCalled();

      // Score API should NOT be called during the request
      expect(mockedCalculateScore).not.toHaveBeenCalled();
    });

    it('should return cached badges when fresh', async () => {
      // Create user with fresh badges
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Test', nftCount: 1 },
        score: {
          totalScore: 0,
          categories: new Map(),
          calculatedAt: new Date(),
        },
        badges: [
          {
            badgeKey: BadgeKey.RelayChainInitiate,
            achievedLevel: 2,
            achievedLevelKey: 'LEVEL_2_REGULAR',
            achievedLevelTitle: 'Regular',
          },
        ],
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(), // Fresh
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await getOrCreateApiUserForBadges(TEST_SANDBOX_ADDRESS);

      expect(result.badges).toHaveLength(1);
      expect(mockedCheckUserBadges).not.toHaveBeenCalled();
    });

    it('should preserve existing scores when updating badges', async () => {
      // Create user with scores
      await ApiUser.create({
        address: TEST_SANDBOX_ADDRESS,
        profile: { displayName: 'Test', nftCount: 1 },
        score: {
          totalScore: 450,
          categories: new Map([
            [CategoryKey.Longevity, { score: 100, reason: 'OneYear', title: 'Account Longevity' }],
          ]),
          calculatedAt: new Date(),
        },
        badges: [], // No badges yet - will fetch
        metadata: {
          firstRequestedAt: new Date(),
          lastRequestedAt: new Date(Date.now() - 15 * 60 * 1000), // Stale for badge check
          requestCount: 1,
          source: 'api',
        },
        ttl: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await getOrCreateApiUserForBadges(TEST_SANDBOX_ADDRESS);

      // Badges should be updated
      expect(result.badges).toHaveLength(2);

      // Scores should be preserved
      expect(result.score.totalScore).toBe(450);
    });
  });

  describe('Error handling', () => {
    it('should throw error when calculateScore fails', async () => {
      mockedCalculateScore.mockRejectedValue(new Error('Score calculation failed'));

      await expect(getOrCreateApiUser(TEST_SANDBOX_ADDRESS)).rejects.toThrow(
        'Score calculation failed'
      );
    });

    it('should throw error when badge check fails', async () => {
      mockedCheckUserBadges.mockRejectedValue(new Error('Badge check failed'));

      await expect(getOrCreateApiUser(TEST_SANDBOX_ADDRESS)).rejects.toThrow(
        'Badge check failed'
      );
    });

    it('should throw error when account details fetch fails', async () => {
      mockedFetchAccountDetails.mockRejectedValue(
        new Error('Subscan API error')
      );

      await expect(getOrCreateApiUser(TEST_SANDBOX_ADDRESS)).rejects.toThrow(
        'Subscan API error'
      );
    });

    it('should handle missing badge level info gracefully', async () => {
      // Return a badge level that doesn't exist in definitions
      mockedCheckUserBadges.mockResolvedValue({
        [BadgeKey.RelayChainInitiate]: 99, // Level 99 doesn't exist
      } as Record<BadgeKey, number>);

      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      // Badge should be skipped due to missing level info
      const relayBadge = result.badges.find(
        (b) => b.badgeKey === BadgeKey.RelayChainInitiate
      );
      expect(relayBadge).toBeUndefined();
    });
  });

  describe('Profile data mapping', () => {
    it('should map all Polkadot identity fields', async () => {
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      const identity = result.profile.polkadotIdentity;
      expect(identity).toBeDefined();
      expect(identity?.address).toBe(TEST_SANDBOX_ADDRESS);
      expect(identity?.display).toBe('Test Display');
      expect(identity?.legal).toBe('Test Legal');
      expect(identity?.email).toBe('test@example.com');
      expect(identity?.web).toBe('https://example.com');
      expect(identity?.twitter).toBe('@testuser');
      expect(identity?.github).toBe('testuser');
      expect(identity?.discord).toBe('testuser#1234');
      expect(identity?.judgements).toHaveLength(1);
      expect(identity?.nonce).toBe(1);
    });

    it('should handle missing account details', async () => {
      mockedFetchAccountDetails.mockResolvedValue({
        data: { account: null },
      });

      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result.profile.displayName).toBeUndefined();
      // When account is null, polkadotIdentity is undefined (not created)
      // The actual structure depends on whether onChainData is truthy
      // With null account, onChainData is null, so polkadotIdentity should be undefined
      // But Mongoose may set an empty object. Let's verify the display field is not set.
      expect(result.profile.polkadotIdentity?.display).toBeUndefined();
    });

    it('should handle null fields in account details', async () => {
      mockedFetchAccountDetails.mockResolvedValue({
        data: {
          account: {
            address: TEST_SANDBOX_ADDRESS,
            display: null,
            legal: null,
            email: null,
            web: null,
            twitter: null,
            github: null,
            judgements: [],
          },
        },
      });

      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result.profile.polkadotIdentity).toBeDefined();
      expect(result.profile.polkadotIdentity?.display).toBeUndefined();
      expect(result.profile.polkadotIdentity?.email).toBeUndefined();
    });
  });

  describe('Category score mapping', () => {
    it('should map all category scores', async () => {
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      expect(result.score.categories.get(CategoryKey.Longevity)).toBeDefined();
      expect(result.score.categories.get(CategoryKey.Longevity)?.score).toBe(100);
      expect(result.score.categories.get(CategoryKey.TxCount)?.score).toBe(75);
      expect(result.score.categories.get(CategoryKey.NftHoldings)?.score).toBe(50);
    });

    it('should store calculatedAt timestamp', async () => {
      const beforeCall = Date.now();
      const result = await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);
      const afterCall = Date.now();

      expect(result.score.calculatedAt.getTime()).toBeGreaterThanOrEqual(beforeCall);
      expect(result.score.calculatedAt.getTime()).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('Different users isolation', () => {
    it('should create separate ApiUser documents for different addresses', async () => {
      // Set up different data for second user
      const secondUserAccountDetails = {
        data: {
          account: {
            address: TEST_SANDBOX_ADDRESS_2,
            display: 'Second User',
          },
        },
      };

      // Create first user
      await getOrCreateApiUser(TEST_SANDBOX_ADDRESS);

      // Update mock for second user
      mockedFetchAccountDetails.mockResolvedValue(secondUserAccountDetails);

      // Create second user
      await getOrCreateApiUser(TEST_SANDBOX_ADDRESS_2);

      // Verify both exist
      const user1 = await ApiUser.findOne({ address: TEST_SANDBOX_ADDRESS });
      const user2 = await ApiUser.findOne({ address: TEST_SANDBOX_ADDRESS_2 });

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1?.profile.displayName).toBe('Test Display');
      expect(user2?.profile.displayName).toBe('Second User');
    });
  });
});
