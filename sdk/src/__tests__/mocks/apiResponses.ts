/**
 * Mock API response data for testing
 */
import {
  UserProfile,
  UserScores,
  UserBadges,
  SpecificUserBadge,
  SpecificCategoryScore,
  BadgeDefinitions,
  CategoryDefinitions,
} from '../../types';

// Test address used across all mocks
export const TEST_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// Mock User Profile
export const mockUserProfile: UserProfile = {
  address: TEST_ADDRESS,
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'A test user bio for testing purposes',
  socialLinks: {
    twitter: 'testuser',
    github: 'testuser',
  },
  polkadotIdentities: [
    {
      address: TEST_ADDRESS,
      display: 'TestIdentity',
      twitter: '@testuser',
    },
  ],
  nftCount: 5,
  source: 'api',
};

// Mock User Scores
export const mockUserScores: UserScores = {
  address: TEST_ADDRESS,
  totalScore: 450,
  calculatedAt: '2024-01-15T12:00:00Z',
  categories: {
    longevity: { score: 100, reason: 'TwoYears', title: 'Account Age' },
    txCount: { score: 75, reason: 'Moderate', title: 'Transaction Count' },
    governance: { score: 125, reason: 'Active', title: 'Governance' },
    stakingRewards: { score: 150, reason: 'High', title: 'Staking' },
  },
  source: 'api',
};

// Mock User Badges
export const mockUserBadges: UserBadges = {
  address: TEST_ADDRESS,
  badges: [
    {
      badgeKey: 'early_adopter',
      achievedLevel: 3,
      achievedLevelKey: 'gold',
      achievedLevelTitle: 'Gold Early Adopter',
      earnedAt: '2024-01-10T10:00:00Z',
    },
    {
      badgeKey: 'governance_voter',
      achievedLevel: 2,
      achievedLevelKey: 'silver',
      achievedLevelTitle: 'Silver Governance Voter',
      earnedAt: '2024-01-12T14:30:00Z',
    },
  ],
  count: 2,
  source: 'api',
};

// Mock Specific Badge (earned)
export const mockSpecificBadgeEarned: SpecificUserBadge = {
  address: TEST_ADDRESS,
  badge: {
    badgeKey: 'early_adopter',
    achievedLevel: 3,
    achievedLevelKey: 'gold',
    achievedLevelTitle: 'Gold Early Adopter',
    earnedAt: '2024-01-10T10:00:00Z',
  },
  earned: true,
  definition: {
    key: 'early_adopter',
    title: 'Early Adopter',
    shortDescription: 'Joined early in the ecosystem',
    longDescription: 'This badge is awarded to users who joined early.',
    metric: 'join_date',
    levels: [
      { level: 1, key: 'bronze', value: 1, title: 'Bronze', shortDescription: '', longDescription: '' },
      { level: 2, key: 'silver', value: 2, title: 'Silver', shortDescription: '', longDescription: '' },
      { level: 3, key: 'gold', value: 3, title: 'Gold', shortDescription: '', longDescription: '' },
    ],
  },
  source: 'api',
};

// Mock Specific Badge (not earned)
export const mockSpecificBadgeNotEarned: SpecificUserBadge = {
  address: TEST_ADDRESS,
  badge: null,
  earned: false,
  definition: {
    key: 'whale',
    title: 'Whale',
    shortDescription: 'Hold significant assets',
    longDescription: 'Badge for large holders',
    metric: 'balance',
    levels: [
      { level: 1, key: 'bronze', value: 1000, title: 'Bronze Whale', shortDescription: 'Hold 1000+ DOT', longDescription: '' },
    ],
  },
  source: 'api',
};

// Mock Specific Category Score
export const mockCategoryScore: SpecificCategoryScore = {
  address: TEST_ADDRESS,
  category: {
    key: 'longevity',
    score: { score: 100, reason: 'TwoYears', title: 'Account Age' },
  },
  definition: {
    key: 'longevity',
    displayName: 'Account Longevity',
    short_description: 'How long your account has been active',
    long_description: 'This category measures the age of your Polkadot account.',
    order: 1,
    reasons: [
      {
        key: 'TwoYears',
        points: 100,
        title: '2+ Years',
        description: 'Account is over 2 years old',
        thresholds: [{ label: '2 years', description: 'Account created 2+ years ago' }],
        advices: ['Keep your account active to maintain this score'],
      },
    ],
  },
  calculatedAt: '2024-01-15T12:00:00Z',
};

// Mock Badge Definitions
export const mockBadgeDefinitions: BadgeDefinitions = {
  badges: [
    {
      key: 'early_adopter',
      title: 'Early Adopter',
      shortDescription: 'Joined early',
      longDescription: 'Early adopter badge',
      metric: 'join_date',
      levels: [
        { level: 1, key: 'bronze', value: 1, title: 'Bronze', shortDescription: '', longDescription: '' },
      ],
    },
  ],
};

// Mock Category Definitions
export const mockCategoryDefinitions: CategoryDefinitions = {
  categories: [
    {
      key: 'longevity',
      displayName: 'Account Longevity',
      short_description: 'Account age',
      long_description: 'Measures account age',
      order: 1,
      reasons: [],
    },
  ],
};
