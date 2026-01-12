/**
 * TypeScript interfaces for all DotPassport SDK API methods
 * These schemas document what each API endpoint returns
 */

// Profile API
export interface GetProfileResponse {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    web?: string;
    discord?: string;
    telegram?: string;
  };
  polkadotIdentities?: Array<{
    address: string;
    display?: string;
    legal?: string;
    web?: string;
    riot?: string;
    email?: string;
    twitter?: string;
    judgements?: Array<{
      index: number;
      judgement: string;
    }>;
  }>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// Scores API
export interface GetScoresResponse {
  address: string;
  totalScore: number;
  normalizedScore: number; // 0-100 scale
  categoryScores: Array<{
    categoryId: string;
    categoryName: string;
    score: number;
    weight: number;
    normalizedScore: number;
  }>;
  rank?: number;
  percentile?: number;
  lastUpdated: string;
  computedAt: string;
}

export interface GetCategoryScoreResponse {
  address: string;
  categoryId: string;
  categoryName: string;
  score: number;
  normalizedScore: number;
  weight: number;
  breakdown: Array<{
    metric: string;
    value: number;
    weight: number;
  }>;
  badges: string[]; // Badge IDs earned in this category
  lastUpdated: string;
}

// Badges API
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: string;
    threshold: number;
    metric: string;
  };
  earnedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface GetBadgesResponse {
  address: string;
  totalBadges: number;
  badges: Badge[];
  progress: Array<{
    badgeId: string;
    currentValue: number;
    targetValue: number;
    percentage: number;
  }>;
}

export interface GetBadgeResponse extends Badge {
  address: string;
  earned: boolean;
  earnedAt?: string;
  progress?: {
    currentValue: number;
    targetValue: number;
    percentage: number;
  };
}

// Badge Definitions API
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type: string;
    threshold: number;
    metric: string;
    description: string;
  };
  totalEarned: number;
  createdAt: string;
}

export interface GetBadgeDefinitionsResponse {
  total: number;
  definitions: BadgeDefinition[];
  categories: string[];
}

// Category Definitions API
export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  weight: number;
  metrics: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    type: 'numeric' | 'boolean' | 'count';
    unit?: string;
  }>;
  badgeCount: number;
  createdAt: string;
}

export interface GetCategoryDefinitionsResponse {
  total: number;
  categories: CategoryDefinition[];
}

// SDK Method Metadata (for documentation)
export interface SDKMethod {
  name: string;
  displayName: string; // Readable name for UI display
  badge: string; // Badge text (usually the method name)
  description: string;
  category: 'Profile' | 'Scores' | 'Badges' | 'Definitions';
  endpoint: string;
  method: 'GET' | 'POST';
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: string | number | boolean;
    example?: string | number | boolean;
  }>;
  responseSchema: string; // Name of the response interface
  exampleResponse: Record<string, unknown>;
  rateLimitInfo: string;
  errors: Array<{
    code: number;
    message: string;
    description: string;
  }>;
}

// All SDK methods with full documentation
export const SDK_METHODS: Record<string, SDKMethod> = {
  getProfile: {
    name: 'getProfile',
    displayName: 'Get User Profile',
    badge: 'getProfile',
    description: 'Fetch complete profile information for a Polkadot address',
    category: 'Profile',
    endpoint: '/api/v2/profile',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
      {
        name: 'network',
        type: 'string',
        required: false,
        description: 'Network ID',
        default: 'polkadot',
        example: 'polkadot',
      },
    ],
    responseSchema: 'GetProfileResponse',
    exampleResponse: {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      displayName: 'Alice',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Web3 enthusiast and developer',
      socialLinks: {
        twitter: '@alice_web3',
        github: 'alice',
      },
      polkadotIdentities: [],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid address', description: 'The provided address is not valid' },
      { code: 404, message: 'Profile not found', description: 'No profile exists for this address' },
      { code: 429, message: 'Rate limit exceeded', description: 'Too many requests' },
    ],
  },
  getScores: {
    name: 'getScores',
    displayName: 'Get All Scores',
    badge: 'getScores',
    description: 'Retrieve reputation scores across all categories',
    category: 'Scores',
    endpoint: '/api/v2/scores',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
    ],
    responseSchema: 'GetScoresResponse',
    exampleResponse: {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      totalScore: 850,
      normalizedScore: 85,
      categoryScores: [
        {
          categoryId: 'governance',
          categoryName: 'Governance Participation',
          score: 450,
          weight: 0.3,
          normalizedScore: 90,
        },
      ],
      rank: 123,
      percentile: 95,
      lastUpdated: '2024-01-01T00:00:00Z',
      computedAt: '2024-01-01T00:00:00Z',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid address', description: 'The provided address is not valid' },
      { code: 404, message: 'Scores not found', description: 'No scores exist for this address' },
    ],
  },
  getCategoryScore: {
    name: 'getCategoryScore',
    displayName: 'Get Category Score',
    badge: 'getCategoryScore',
    description: 'Get detailed score breakdown for a specific category',
    category: 'Scores',
    endpoint: '/api/v2/scores/category',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
      {
        name: 'categoryId',
        type: 'string',
        required: true,
        description: 'Category identifier',
        example: 'governance',
      },
    ],
    responseSchema: 'GetCategoryScoreResponse',
    exampleResponse: {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      categoryId: 'governance',
      categoryName: 'Governance Participation',
      score: 450,
      normalizedScore: 90,
      weight: 0.3,
      breakdown: [
        { metric: 'proposals_voted', value: 50, weight: 0.4 },
        { metric: 'proposals_created', value: 5, weight: 0.6 },
      ],
      badges: ['governance_voter', 'proposal_creator'],
      lastUpdated: '2024-01-01T00:00:00Z',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid parameters', description: 'Address or category ID invalid' },
      { code: 404, message: 'Category not found', description: 'Category does not exist' },
    ],
  },
  getBadges: {
    name: 'getBadges',
    displayName: 'Get All Badges',
    badge: 'getBadges',
    description: 'Fetch all earned badges and progress for an address',
    category: 'Badges',
    endpoint: '/api/v2/badges',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
    ],
    responseSchema: 'GetBadgesResponse',
    exampleResponse: {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      totalBadges: 12,
      badges: [
        {
          id: 'governance_voter',
          name: 'Active Voter',
          description: 'Voted on 50+ proposals',
          imageUrl: 'https://example.com/badge.png',
          categoryId: 'governance',
          rarity: 'rare',
          criteria: { type: 'threshold', threshold: 50, metric: 'votes_cast' },
          earnedAt: '2024-01-01T00:00:00Z',
        },
      ],
      progress: [],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid address', description: 'The provided address is not valid' },
    ],
  },
  getBadge: {
    name: 'getBadge',
    displayName: 'Get Specific Badge',
    badge: 'getBadge',
    description: 'Get details for a specific badge including earn status',
    category: 'Badges',
    endpoint: '/api/v2/badges/:badgeId',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
      {
        name: 'badgeId',
        type: 'string',
        required: true,
        description: 'Badge identifier',
        example: 'governance_voter',
      },
    ],
    responseSchema: 'GetBadgeResponse',
    exampleResponse: {
      id: 'governance_voter',
      name: 'Active Voter',
      description: 'Voted on 50+ proposals',
      imageUrl: 'https://example.com/badge.png',
      categoryId: 'governance',
      rarity: 'rare',
      criteria: { type: 'threshold', threshold: 50, metric: 'votes_cast' },
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      earned: true,
      earnedAt: '2024-01-01T00:00:00Z',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid parameters', description: 'Address or badge ID invalid' },
      { code: 404, message: 'Badge not found', description: 'Badge does not exist' },
    ],
  },
  getBadgeDefinitions: {
    name: 'getBadgeDefinitions',
    displayName: 'Get Badge Definitions',
    badge: 'getBadgeDefinitions',
    description: 'List all available badge definitions in the system',
    category: 'Definitions',
    endpoint: '/api/v2/definitions/badges',
    method: 'GET',
    parameters: [
      {
        name: 'categoryId',
        type: 'string',
        required: false,
        description: 'Filter by category',
        example: 'governance',
      },
    ],
    responseSchema: 'GetBadgeDefinitionsResponse',
    exampleResponse: {
      total: 50,
      definitions: [
        {
          id: 'governance_voter',
          name: 'Active Voter',
          description: 'Voted on 50+ proposals',
          imageUrl: 'https://example.com/badge.png',
          categoryId: 'governance',
          categoryName: 'Governance Participation',
          rarity: 'rare',
          criteria: {
            type: 'threshold',
            threshold: 50,
            metric: 'votes_cast',
            description: 'Vote on at least 50 proposals',
          },
          totalEarned: 1250,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
      categories: ['governance', 'development', 'community'],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [],
  },
  getCategoryDefinitions: {
    name: 'getCategoryDefinitions',
    displayName: 'Get Category Definitions',
    badge: 'getCategoryDefinitions',
    description: 'Retrieve all category definitions and their metrics',
    category: 'Definitions',
    endpoint: '/api/v2/definitions/categories',
    method: 'GET',
    parameters: [],
    responseSchema: 'GetCategoryDefinitionsResponse',
    exampleResponse: {
      total: 8,
      categories: [
        {
          id: 'governance',
          name: 'Governance Participation',
          description: 'Engagement in on-chain governance',
          weight: 0.3,
          metrics: [
            {
              id: 'proposals_voted',
              name: 'Proposals Voted',
              description: 'Number of proposals voted on',
              weight: 0.4,
              type: 'count',
              unit: 'votes',
            },
          ],
          badgeCount: 12,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [],
  },
};
