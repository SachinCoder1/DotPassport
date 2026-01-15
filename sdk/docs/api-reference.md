# API Reference

Complete API reference for the DotPassport SDK client.

## Table of Contents

- [Installation](#installation)
- [Client Initialization](#client-initialization)
- [Authentication](#authentication)
- [Profile Methods](#profile-methods)
- [Scores Methods](#scores-methods)
- [Badges Methods](#badges-methods)
- [Metadata Methods](#metadata-methods)
- [Response Types](#response-types)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Installation

```bash
npm install @dotpassport/sdk
```

## Client Initialization

### DotPassportClient

Main client class for interacting with the DotPassport API.

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient(config);
```

**Constructor Parameters:**

```typescript
interface DotPassportConfig {
  apiKey: string;      // Required: Your API key
  baseUrl?: string;    // Optional: API base URL (defaults to production)
}
```

**Example:**

```typescript
// Production
const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here'
});

// Custom base URL (for testing or enterprise)
const client = new DotPassportClient({
  apiKey: 'test_your_api_key_here',
  baseUrl: 'https://api-staging.dotpassport.com'
});
```

## Authentication

All API requests require authentication via API key. Include your API key when initializing the client:

```typescript
const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here'
});
```

**API Key Types:**

| Prefix | Environment | Usage |
|--------|-------------|-------|
| `live_` | Production | Real user data |
| `test_` | Testing | Test data only |

**Getting an API Key:**

1. Sign up at [dotpassport.com/developers](https://dotpassport.com/developers)
2. Navigate to API Keys section
3. Generate a new key for your application
4. Store securely (never commit to version control)

## Profile Methods

### getProfile()

Retrieves a user's complete profile information.

```typescript
async getProfile(address: string): Promise<UserProfile>
```

**Parameters:**
- `address` (string): Polkadot address of the user

**Returns:** Promise resolving to `UserProfile` object

**Example:**

```typescript
const profile = await client.getProfile(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(profile.displayName);                // "Alice"
console.log(profile.bio);                        // "Polkadot enthusiast..."
console.log(profile.polkadotIdentities?.length); // 2
console.log(profile.socialLinks?.twitter);       // "https://twitter.com/alice"
```

**Response Type:**

```typescript
interface UserProfile {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  polkadotIdentities?: PolkadotIdentity[];
  nftCount?: number;
  source?: 'app' | 'api';
}

interface PolkadotIdentity {
  address: string;
  display?: string;
  legal?: string;
  web?: string;
  email?: string;
  twitter?: string;
  github?: string;
  matrix?: string;
  discord?: string;
  riot?: string;
  judgements?: Array<{ index: number; judgement: string }>;
  role?: string;
}
```

**Errors:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `User not found` | Address has no profile |
| 401 | `Invalid API key` | API key is invalid or missing |

## Scores Methods

### getScores()

Retrieves all reputation scores for a user.

```typescript
async getScores(address: string): Promise<UserScores>
```

**Parameters:**
- `address` (string): Polkadot address of the user

**Returns:** Promise resolving to `UserScores` object

**Example:**

```typescript
const scores = await client.getScores(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(scores.totalScore);              // 850
console.log(scores.calculatedAt);            // "2025-01-12T10:30:00Z"
console.log(scores.categories?.longevity);   // { score: 120, title: "Account Longevity", reason: "..." }
```

**Response Type:**

```typescript
interface UserScores {
  address: string;
  totalScore: number;
  calculatedAt: string;  // ISO 8601 date
  categories?: Record<string, CategoryScore>;
  source?: 'app' | 'api';
}

interface CategoryScore {
  score: number;
  reason: string;
  title: string;
}
```

**Available Categories:**

| Key | Title | Description |
|-----|-------|-------------|
| `longevity` | Account Longevity | Account age and history |
| `tx_count` | Transaction Count | On-chain transaction volume |
| `governance` | Governance | Governance participation |
| `identity` | Identity | On-chain identity verification |
| `unique_interactions` | Unique Interactions | Network diversity |
| `technical_contributions` | Technical Contributions | Developer activity |

### getCategoryScore()

Retrieves a specific category score for a user.

```typescript
async getCategoryScore(
  address: string,
  categoryKey: string
): Promise<SpecificCategoryScore>
```

**Parameters:**
- `address` (string): Polkadot address of the user
- `categoryKey` (string): Category identifier (e.g., "longevity")

**Returns:** Promise resolving to `SpecificCategoryScore` object

**Example:**

```typescript
const categoryScore = await client.getCategoryScore(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'longevity'
);

console.log(categoryScore.category.score);          // 120
console.log(categoryScore.category.title);          // "Account Longevity"
console.log(categoryScore.definition.displayName);  // "Account Longevity"
console.log(categoryScore.definition.reasons);      // Array of scoring reasons
```

**Response Type:**

```typescript
interface SpecificCategoryScore {
  address: string;
  category: {
    key: string;
    score: CategoryScore;  // Contains score, reason, title
  };
  definition: CategoryDefinition | null;
  calculatedAt: string;
}

interface CategoryDefinition {
  key: string;
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  reasons: ReasonDetail[];
}

interface ReasonDetail {
  key: string;
  points: number;
  title: string;
  description: string;
  thresholds: ThresholdDetail[];
  advices: string[];
}

interface ThresholdDetail {
  label: string;
  description: string;
}
```

**Errors:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `Category score not found` | User doesn't have this category score |
| 404 | `Category not found` | Invalid category key |

## Badges Methods

### getBadges()

Retrieves all badges earned by a user.

```typescript
async getBadges(address: string): Promise<UserBadges>
```

**Parameters:**
- `address` (string): Polkadot address of the user

**Returns:** Promise resolving to `UserBadges` object

**Example:**

```typescript
const badges = await client.getBadges(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(badges.count);                      // 5
console.log(badges.badges.length);              // 5
console.log(badges.badges[0].achievedLevelTitle); // "Gold Early Adopter"
console.log(badges.badges[0].badgeKey);         // "early_adopter"
```

**Response Type:**

```typescript
interface UserBadges {
  address: string;
  badges: UserBadge[];
  count: number;
  source?: 'app' | 'api';
}

interface UserBadge {
  badgeKey: string;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
  earnedAt?: string;  // ISO 8601 date
}
```

**Note:** All badges in the `badges` array are earned badges. The badge level system allows users to progress through multiple levels within each badge type.

### getBadge()

Retrieves a specific badge for a user.

```typescript
async getBadge(
  address: string,
  badgeKey: string
): Promise<SpecificUserBadge>
```

**Parameters:**
- `address` (string): Polkadot address of the user
- `badgeKey` (string): Badge identifier (e.g., "relay_chain_initiate")

**Returns:** Promise resolving to `SpecificUserBadge` object

**Example:**

```typescript
const badge = await client.getBadge(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'relay_chain_initiate'
);

console.log(badge.badge?.achievedLevelTitle);  // "Gold Early Adopter"
console.log(badge.earned);                     // true
console.log(badge.definition?.title);          // "Relay Chain Initiate"
console.log(badge.definition?.shortDescription); // "Complete transactions on relay chain"
```

**Response Type:**

```typescript
interface SpecificUserBadge {
  address: string;
  badge: UserBadge | null;
  earned?: boolean;
  definition: BadgeDefinition | null;
  source?: 'app' | 'api';
}

interface BadgeDefinition {
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  metric: string;
  imageUrl?: string;
  levels: BadgeLevel[];
}

interface BadgeLevel {
  level: number;
  key: string;
  value: number;
  title: string;
  shortDescription: string;
  longDescription: string;
}
```

**Common Badge Keys:**

| Key | Title | Tier |
|-----|-------|------|
| `relay_chain_initiate` | Relay Chain Initiate | Bronze |
| `governance_voter` | Governance Voter | Silver |
| `parachain_explorer` | Parachain Explorer | Gold |
| `identity_verified` | Identity Verified | Silver |
| `staking_champion` | Staking Champion | Platinum |

**Errors:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | `Badge not found` | User doesn't have this badge |
| 404 | `Badge definition not found` | Invalid badge key |

## Metadata Methods

### getBadgeDefinitions()

Retrieves all badge definitions.

```typescript
async getBadgeDefinitions(): Promise<BadgeDefinitions>
```

**Parameters:** None

**Returns:** Promise resolving to `BadgeDefinitions` object

**Example:**

```typescript
const definitions = await client.getBadgeDefinitions();

console.log(definitions.badges.length);                  // 15
console.log(definitions.badges[0].title);                // "Relay Chain Initiate"
console.log(definitions.badges[0].shortDescription);     // "Complete transactions on relay chain"
console.log(definitions.badges[0].levels.length);        // 5
```

**Response Type:**

```typescript
interface BadgeDefinitions {
  badges: BadgeDefinition[];
}
```

**Use Cases:**
- Display all available badges in UI
- Show badge requirements to users
- Create badge progress indicators

### getCategoryDefinitions()

Retrieves all category definitions.

```typescript
async getCategoryDefinitions(): Promise<CategoryDefinitions>
```

**Parameters:** None

**Returns:** Promise resolving to `CategoryDefinitions` object

**Example:**

```typescript
const definitions = await client.getCategoryDefinitions();

console.log(definitions.categories.length);              // 6
console.log(definitions.categories[0].displayName);      // "Account Longevity"
console.log(definitions.categories[0].reasons.length);   // 5
```

**Response Type:**

```typescript
interface CategoryDefinitions {
  categories: CategoryDefinition[];
}
```

**Use Cases:**
- Display all scoring categories
- Show detailed scoring breakdown
- Provide improvement advice to users

## Response Types

### Success Response

All successful API calls return data directly:

```typescript
const scores = await client.getScores(address);
// scores is UserScores object
```

### Error Response

All errors throw `DotPassportError`:

```typescript
try {
  const scores = await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    console.log(error.statusCode);  // 404
    console.log(error.message);     // "User not found"
    console.log(error.response);    // Full error response
  }
}
```

## Error Handling

### DotPassportError

Custom error class for all API errors.

```typescript
class DotPassportError extends Error {
  statusCode: number;
  response: any;

  constructor(message: string, statusCode: number, response?: any);
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error message |
| `statusCode` | `number` | HTTP status code |
| `response` | `any` | Full error response from API |

### Error Codes

| Status Code | Error | Description | Solution |
|-------------|-------|-------------|----------|
| **400** | Bad Request | Invalid request parameters | Check request format |
| **401** | Unauthorized | Invalid or missing API key | Verify API key |
| **403** | Forbidden | API key lacks permissions | Check key permissions |
| **404** | Not Found | Resource doesn't exist | Verify address/key exists |
| **429** | Too Many Requests | Rate limit exceeded | Implement rate limiting |
| **500** | Internal Server Error | Server error | Retry with backoff |
| **503** | Service Unavailable | API is down | Retry later |

### Error Handling Patterns

**Basic Error Handling:**

```typescript
try {
  const scores = await client.getScores(address);
  console.log(scores.totalScore);
} catch (error) {
  if (error instanceof DotPassportError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

**Specific Error Handling:**

```typescript
try {
  const profile = await client.getProfile(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 404:
        console.log('User not found');
        break;
      case 401:
        console.log('Invalid API key');
        break;
      case 429:
        console.log('Rate limit exceeded');
        break;
      default:
        console.log('API error:', error.message);
    }
  }
}
```

**Retry Logic:**

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DotPassportError && error.statusCode === 429) {
        // Rate limited, wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const scores = await fetchWithRetry(() => client.getScores(address));
```

## Rate Limiting

### Rate Limit Tiers

| Tier | Hourly Limit | Daily Limit | Monthly Limit |
|------|--------------|-------------|---------------|
| **Free** | 100 | 1,000 | 10,000 |
| **Pro** | 1,000 | 10,000 | 100,000 |
| **Enterprise** | 10,000 | 100,000 | 1,000,000 |

### Rate Limit Headers

All API responses include rate limit information in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Monitoring Rate Limits

**Extract from Error Response:**

```typescript
try {
  await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError && error.statusCode === 429) {
    console.log('Rate limit exceeded');
    console.log('Limit:', error.response.limit);
    console.log('Reset at:', new Date(error.response.resetAt));

    // Wait until reset
    const waitTime = error.response.resetAt - Date.now();
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}
```

**Implement Rate Limit Tracking:**

```typescript
class RateLimitedClient {
  private client: DotPassportClient;
  private remaining: number = Infinity;
  private resetAt: number = 0;

  constructor(config: DotPassportConfig) {
    this.client = new DotPassportClient(config);
  }

  async getScores(address: string) {
    // Check if rate limited
    if (this.remaining === 0 && Date.now() < this.resetAt) {
      const waitTime = this.resetAt - Date.now();
      throw new Error(`Rate limited. Reset in ${waitTime}ms`);
    }

    try {
      const result = await this.client.getScores(address);
      return result;
    } catch (error) {
      if (error instanceof DotPassportError && error.statusCode === 429) {
        this.remaining = 0;
        this.resetAt = error.response.resetAt;
      }
      throw error;
    }
  }
}
```

### Best Practices

1. **Cache Responses**: Store frequently accessed data
2. **Batch Requests**: Combine multiple requests when possible
3. **Implement Backoff**: Use exponential backoff for retries
4. **Monitor Usage**: Track remaining requests
5. **Upgrade When Needed**: Switch to higher tier if hitting limits

**Caching Example:**

```typescript
class CachedClient {
  private client: DotPassportClient;
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl = 60000; // 1 minute

  constructor(config: DotPassportConfig) {
    this.client = new DotPassportClient(config);
  }

  async getScores(address: string) {
    const cached = this.cache.get(`scores:${address}`);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await this.client.getScores(address);
    this.cache.set(`scores:${address}`, {
      data,
      expires: Date.now() + this.ttl
    });
    return data;
  }
}
```

---

## Additional Resources

- [Main README](../README.md)
- [Widget Guide](./widgets.md)
- [Examples](../examples/)
- [NPM Package](https://www.npmjs.com/package/@dotpassport/sdk)
- [API Documentation](https://docs.dotpassport.com)
- [Support](https://github.com/dotpassport/sdk/issues)

## Need Help?

- **Documentation**: [docs.dotpassport.com](https://docs.dotpassport.com)
- **GitHub Issues**: [github.com/dotpassport/sdk/issues](https://github.com/dotpassport/sdk/issues)
- **Discord**: [discord.gg/dotpassport](https://discord.gg/dotpassport)
- **Email**: support@dotpassport.com
