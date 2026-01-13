/**
 * TypeScript interfaces for all DotPassport SDK API methods
 * These schemas document what each API endpoint returns
 *
 * IMPORTANT: All responses are wrapped in { success: boolean, data: <Response> }
 * The schemas below represent the `data` field content.
 */

// ============================================================================
// Profile API Response
// ============================================================================
export interface GetProfileResponse {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: {
    web?: string;
    twitter?: string;
    github?: string;
    email?: string;
    matrix?: string;
    discord?: string;
    riot?: string;
  };
  polkadotIdentities?: Array<{
    address: string;
    display?: string;
    legal?: string;
    email?: string;
    web?: string;
    twitter?: string;
    github?: string;
    matrix?: string;
    discord?: string;
    riot?: string;
    judgements?: Array<{
      index: number;
      judgement: string;
    }>;
    role?: string;
    nonce?: number;
  }>;
  nftCount?: number;
  source: 'app' | 'api';
}

// ============================================================================
// Scores API Responses
// ============================================================================
export interface CategoryScore {
  governance: number;
  development: number;
  community: number;
  staking: number;
  defi: number;
  identity: number;
  nft: number;
  treasury: number;
}

export interface GetScoresResponse {
  address: string;
  totalScore: number;
  categories: Record<string, number>; // Category key -> score (0-100)
  calculatedAt: string; // ISO date string
  source: 'app' | 'api';
}

export interface CategoryDefinitionDetails {
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  reasons?: Array<{
    label: string;
    description: string;
  }>;
}

export interface GetCategoryScoreResponse {
  address: string;
  category: {
    key: string;
    score: number; // 0-100
  };
  definition: CategoryDefinitionDetails | null;
  calculatedAt: string; // ISO date string
  source: 'app' | 'api';
}

// ============================================================================
// Badges API Responses
// ============================================================================
export interface UserBadge {
  badgeKey: string;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
  earnedAt?: string; // ISO date string (may not be present for API users)
}

export interface BadgeLevel {
  level: number;
  key: string;
  value: number;
  title: string;
  shortDescription: string;
  longDescription?: string;
  constraints?: Array<{
    label: string;
    description: string;
  }>;
  advice?: string[];
}

export interface BadgeDefinitionDetails {
  title: string;
  shortDescription: string;
  longDescription?: string;
  metric: string;
  imageUrl?: string | null;
  levels: BadgeLevel[];
}

export interface GetBadgesResponse {
  address: string;
  badges: UserBadge[];
  count: number;
  source: 'app' | 'api';
}

export interface GetBadgeResponse {
  address: string;
  badge: UserBadge | null; // null if not earned
  earned?: boolean; // Present when badge is not earned (earned: false)
  definition: BadgeDefinitionDetails | null;
  source: 'app' | 'api';
}

// ============================================================================
// Metadata/Definitions API Responses
// ============================================================================
export interface BadgeDefinition {
  key: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  metric: string;
  imageUrl?: string | null;
  levels: BadgeLevel[];
}

export interface GetBadgeDefinitionsResponse {
  badges: BadgeDefinition[];
}

export interface CategoryDefinition {
  key: string;
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  reasons?: Array<{
    label: string;
    description: string;
  }>;
}

export interface GetCategoryDefinitionsResponse {
  categories: CategoryDefinition[];
}

// ============================================================================
// SDK Method Metadata (for documentation UI)
// ============================================================================
export interface SDKMethod {
  name: string;
  displayName: string;
  badge: string;
  description: string;
  category: 'Profile' | 'Scores' | 'Badges' | 'Metadata';
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
  responseSchema: string;
  exampleResponse: Record<string, unknown>;
  rateLimitInfo: string;
  errors: Array<{
    code: number;
    message: string;
    description: string;
  }>;
}

// ============================================================================
// SDK Methods Configuration
// ============================================================================
export const SDK_METHODS: Record<string, SDKMethod> = {
  getProfile: {
    name: 'getProfile',
    displayName: 'Get User Profile',
    badge: 'getProfile',
    description: 'Fetch profile information for a Polkadot address including on-chain identity data',
    category: 'Profile',
    endpoint: '/api/v2/profiles/:address',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address (path parameter)',
        example: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh from on-chain data instead of cache',
        default: false,
        example: false,
      },
    ],
    responseSchema: 'GetProfileResponse',
    exampleResponse: {
      address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      displayName: 'Alice Validator',
      socialLinks: {
        web: 'https://alice.example.com',
        twitter: 'alice_polkadot',
        email: 'alice@example.com',
      },
      polkadotIdentities: [
        {
          address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
          display: 'Alice Validator',
          web: 'https://alice.example.com',
          twitter: 'alice_polkadot',
          judgements: [{ index: 0, judgement: 'Reasonable' }],
        },
      ],
      nftCount: 12,
      source: 'api',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid Polkadot address format', description: 'The provided address is not a valid SS58 address' },
      { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
      { code: 429, message: 'Rate limit exceeded', description: 'Too many requests - check your quota' },
    ],
  },

  getScores: {
    name: 'getScores',
    displayName: 'Get All Scores',
    badge: 'getScores',
    description: 'Retrieve reputation scores across all categories for an address',
    category: 'Scores',
    endpoint: '/api/v2/scores/:address',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address (path parameter)',
        example: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh scores from on-chain data',
        default: false,
        example: false,
      },
    ],
    responseSchema: 'GetScoresResponse',
    exampleResponse: {
      address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      totalScore: 72,
      categories: {
        governance: 85,
        development: 45,
        community: 60,
        staking: 90,
        defi: 30,
        identity: 100,
        nft: 55,
        treasury: 70,
      },
      calculatedAt: '2024-01-15T10:30:00.000Z',
      source: 'api',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid Polkadot address format', description: 'The provided address is not valid' },
      { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
      { code: 429, message: 'Rate limit exceeded', description: 'Too many requests' },
    ],
  },

  getCategoryScore: {
    name: 'getCategoryScore',
    displayName: 'Get Category Score',
    badge: 'getCategoryScore',
    description: 'Get the score for a specific category with category definition details',
    category: 'Scores',
    endpoint: '/api/v2/scores/:address/:categoryKey',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address (path parameter)',
        example: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      },
      {
        name: 'categoryKey',
        type: 'string',
        required: true,
        description: 'Category key (path parameter): governance, development, community, staking, defi, identity, nft, treasury',
        example: 'governance',
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh from on-chain data',
        default: false,
        example: false,
      },
    ],
    responseSchema: 'GetCategoryScoreResponse',
    exampleResponse: {
      address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      category: {
        key: 'governance',
        score: 85,
      },
      definition: {
        displayName: 'Governance',
        short_description: 'Participation in on-chain governance',
        long_description: 'Measures your involvement in Polkadot OpenGov including referenda voting, delegations, and treasury proposals.',
        order: 1,
        reasons: [
          { label: 'Vote on referenda', description: 'Participate in governance votes' },
          { label: 'Delegate votes', description: 'Delegate your voting power' },
        ],
      },
      calculatedAt: '2024-01-15T10:30:00.000Z',
      source: 'api',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid Polkadot address format', description: 'Address or category key invalid' },
      { code: 404, message: 'Category score not found', description: 'Category does not exist or no score available' },
    ],
  },

  getBadges: {
    name: 'getBadges',
    displayName: 'Get All Badges',
    badge: 'getBadges',
    description: 'Fetch all earned badges for an address',
    category: 'Badges',
    endpoint: '/api/v2/badges/:address',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address (path parameter)',
        example: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh badges from on-chain data',
        default: false,
        example: false,
      },
    ],
    responseSchema: 'GetBadgesResponse',
    exampleResponse: {
      address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      badges: [
        {
          badgeKey: 'GovernanceVoter',
          achievedLevel: 3,
          achievedLevelKey: 'LEVEL_3_50_VOTES',
          achievedLevelTitle: 'Governance Champion',
          earnedAt: '2024-01-10T08:00:00.000Z',
        },
        {
          badgeKey: 'Staker',
          achievedLevel: 2,
          achievedLevelKey: 'LEVEL_2_NOMINATOR',
          achievedLevelTitle: 'Active Nominator',
          earnedAt: '2024-01-05T12:00:00.000Z',
        },
      ],
      count: 2,
      source: 'api',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid Polkadot address format', description: 'The provided address is not valid' },
      { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
    ],
  },

  getBadge: {
    name: 'getBadge',
    displayName: 'Get Specific Badge',
    badge: 'getBadge',
    description: 'Get details for a specific badge including earn status and badge definition',
    category: 'Badges',
    endpoint: '/api/v2/badges/:address/:badgeKey',
    method: 'GET',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address (path parameter)',
        example: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      },
      {
        name: 'badgeKey',
        type: 'string',
        required: true,
        description: 'Badge key (path parameter): GovernanceVoter, Staker, Developer, etc.',
        example: 'GovernanceVoter',
      },
      {
        name: 'forceRefresh',
        type: 'boolean',
        required: false,
        description: 'Force refresh from on-chain data',
        default: false,
        example: false,
      },
    ],
    responseSchema: 'GetBadgeResponse',
    exampleResponse: {
      address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
      badge: {
        badgeKey: 'GovernanceVoter',
        achievedLevel: 3,
        achievedLevelKey: 'LEVEL_3_50_VOTES',
        achievedLevelTitle: 'Governance Champion',
        earnedAt: '2024-01-10T08:00:00.000Z',
      },
      definition: {
        title: 'Governance Voter',
        shortDescription: 'Awarded for active participation in on-chain governance.',
        longDescription: 'This badge recognizes your commitment to decentralized governance by voting on referenda.',
        metric: 'governanceVoteCount',
        imageUrl: null,
        levels: [
          {
            level: 1,
            key: 'LEVEL_1_FIRST_VOTE',
            value: 1,
            title: 'First Vote',
            shortDescription: 'Cast your first governance vote',
          },
          {
            level: 2,
            key: 'LEVEL_2_10_VOTES',
            value: 10,
            title: 'Active Voter',
            shortDescription: 'Cast 10 governance votes',
          },
          {
            level: 3,
            key: 'LEVEL_3_50_VOTES',
            value: 50,
            title: 'Governance Champion',
            shortDescription: 'Cast 50 governance votes',
          },
        ],
      },
      source: 'api',
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 400, message: 'Invalid Polkadot address format', description: 'Address or badge key invalid' },
      { code: 404, message: 'Badge definition not found', description: 'The badge key does not exist in the system' },
    ],
  },

  getBadgeDefinitions: {
    name: 'getBadgeDefinitions',
    displayName: 'Get Badge Definitions',
    badge: 'getBadgeDefinitions',
    description: 'List all available badge definitions with their levels and requirements',
    category: 'Metadata',
    endpoint: '/api/v2/metadata/badges',
    method: 'GET',
    parameters: [],
    responseSchema: 'GetBadgeDefinitionsResponse',
    exampleResponse: {
      badges: [
        {
          key: 'GovernanceVoter',
          title: 'Governance Voter',
          shortDescription: 'Awarded for active participation in on-chain governance.',
          longDescription: 'This badge recognizes your commitment to decentralized governance.',
          metric: 'governanceVoteCount',
          imageUrl: null,
          levels: [
            {
              level: 1,
              key: 'LEVEL_1_FIRST_VOTE',
              value: 1,
              title: 'First Vote',
              shortDescription: 'Cast your first governance vote',
            },
          ],
        },
        {
          key: 'Staker',
          title: 'Staker',
          shortDescription: 'Awarded for staking activities on Polkadot.',
          metric: 'stakingStatus',
          imageUrl: null,
          levels: [
            {
              level: 1,
              key: 'LEVEL_1_NOMINATOR',
              value: 1,
              title: 'Nominator',
              shortDescription: 'Become a nominator',
            },
          ],
        },
      ],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
    ],
  },

  getCategoryDefinitions: {
    name: 'getCategoryDefinitions',
    displayName: 'Get Category Definitions',
    badge: 'getCategoryDefinitions',
    description: 'Retrieve all category definitions with descriptions and improvement tips',
    category: 'Metadata',
    endpoint: '/api/v2/metadata/categories',
    method: 'GET',
    parameters: [],
    responseSchema: 'GetCategoryDefinitionsResponse',
    exampleResponse: {
      categories: [
        {
          key: 'governance',
          displayName: 'Governance',
          short_description: 'Participation in on-chain governance',
          long_description: 'Measures your involvement in Polkadot OpenGov including referenda voting, delegations, and treasury proposals.',
          order: 1,
          reasons: [
            { label: 'Vote on referenda', description: 'Participate in governance votes' },
            { label: 'Delegate votes', description: 'Delegate your voting power to trusted validators' },
            { label: 'Create proposals', description: 'Submit treasury or governance proposals' },
          ],
        },
        {
          key: 'staking',
          displayName: 'Staking',
          short_description: 'Network security participation',
          long_description: 'Tracks your contribution to network security through staking as a validator or nominator.',
          order: 2,
          reasons: [
            { label: 'Become a nominator', description: 'Stake DOT and nominate validators' },
            { label: 'Run a validator', description: 'Operate a validator node' },
          ],
        },
      ],
    },
    rateLimitInfo: 'Counts toward hourly quota',
    errors: [
      { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
    ],
  },
};
