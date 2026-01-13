# Rate Limiting

Understand and handle API rate limits in the DotPassport SDK.

## Rate Limit Tiers

| Tier | Requests/Hour | Requests/Day | Requests/Month |
|------|---------------|--------------|----------------|
| **Free** | 100 | 1,000 | 10,000 |
| **Pro** | 1,000 | 10,000 | 100,000 |
| **Enterprise** | 10,000 | 100,000 | 1,000,000 |

---

## Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## Handling Rate Limits

### Basic Detection

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

try {
  const scores = await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError && error.statusCode === 429) {
    console.log('Rate limit exceeded');
    console.log('Limit:', error.response.limit);
    console.log('Reset at:', new Date(error.response.resetAt * 1000));
  }
}
```

### Wait and Retry

```typescript
async function fetchWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof DotPassportError && error.statusCode === 429) {
      const resetAt = error.response.resetAt * 1000;
      const waitTime = Math.max(0, resetAt - Date.now());

      console.log(`Rate limited. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      return await fn();
    }
    throw error;
  }
}

// Usage
const scores = await fetchWithRateLimit(() => client.getScores(address));
```

---

## Rate Limit Tracking

Track your rate limit usage to avoid hitting limits:

```typescript
class RateLimitedClient {
  private client: DotPassportClient;
  private remaining: number = Infinity;
  private resetAt: number = 0;

  constructor(config: DotPassportConfig) {
    this.client = new DotPassportClient(config);
  }

  private checkRateLimit(): void {
    if (this.remaining === 0 && Date.now() < this.resetAt) {
      const waitTime = this.resetAt - Date.now();
      throw new Error(`Rate limited. Reset in ${Math.ceil(waitTime / 1000)}s`);
    }
  }

  private updateRateLimit(error: DotPassportError): void {
    if (error.statusCode === 429) {
      this.remaining = 0;
      this.resetAt = error.response.resetAt * 1000;
    }
  }

  async getScores(address: string) {
    this.checkRateLimit();

    try {
      const result = await this.client.getScores(address);
      // Could update remaining from response headers here
      return result;
    } catch (error) {
      if (error instanceof DotPassportError) {
        this.updateRateLimit(error);
      }
      throw error;
    }
  }

  getRateLimitStatus() {
    return {
      remaining: this.remaining,
      resetAt: this.resetAt ? new Date(this.resetAt) : null,
      isLimited: this.remaining === 0 && Date.now() < this.resetAt
    };
  }
}
```

---

## Request Queuing

Queue requests to stay within rate limits:

```typescript
class QueuedClient {
  private client: DotPassportClient;
  private queue: (() => Promise<void>)[] = [];
  private processing = false;
  private requestsPerSecond = 10;

  constructor(config: DotPassportConfig) {
    this.client = new DotPassportClient(config);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      await request();
      await new Promise(r => setTimeout(r, 1000 / this.requestsPerSecond));
    }

    this.processing = false;
  }

  async getScores(address: string): Promise<UserScores> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.client.getScores(address);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }
}
```

---

## Caching to Reduce Requests

Cache responses to minimize API calls:

```typescript
class CachedClient {
  private client: DotPassportClient;
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 60 * 1000; // 1 minute

  constructor(config: DotPassportConfig) {
    this.client = new DotPassportClient(config);
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl || this.defaultTTL)
    });
  }

  async getScores(address: string, options?: { ttl?: number }): Promise<UserScores> {
    const key = `scores:${address}`;
    const cached = this.getCached<UserScores>(key);

    if (cached) {
      return cached;
    }

    const data = await this.client.getScores(address);
    this.setCache(key, data, options?.ttl);
    return data;
  }

  async getBadges(address: string, options?: { ttl?: number }): Promise<UserBadges> {
    const key = `badges:${address}`;
    const cached = this.getCached<UserBadges>(key);

    if (cached) {
      return cached;
    }

    const data = await this.client.getBadges(address);
    this.setCache(key, data, options?.ttl);
    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

---

## Best Practices

### 1. Cache Aggressively

```typescript
// Cache metadata (changes rarely)
const badgeDefinitions = await cachedClient.getBadgeDefinitions({ ttl: 24 * 60 * 60 * 1000 });

// Cache user data (changes occasionally)
const scores = await cachedClient.getScores(address, { ttl: 5 * 60 * 1000 });
```

### 2. Batch When Possible

```typescript
// Instead of multiple individual calls
const addresses = ['5Grwva...', '5FHne...', '5DAAnr...'];

// Use Promise.all to parallelize
const results = await Promise.all(
  addresses.map(addr => client.getScores(addr))
);
```

### 3. Use Conditional Requests

```typescript
// Only fetch if data is stale
async function getScoresIfNeeded(address: string, lastFetch?: Date) {
  if (lastFetch && Date.now() - lastFetch.getTime() < 60000) {
    return null; // Use cached data
  }
  return await client.getScores(address);
}
```

### 4. Implement Backoff

```typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DotPassportError && error.statusCode === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 5. Monitor Usage

```typescript
// Track API calls in your application
let apiCallCount = 0;

const originalGetScores = client.getScores.bind(client);
client.getScores = async (address: string) => {
  apiCallCount++;
  console.log(`API calls this session: ${apiCallCount}`);
  return originalGetScores(address);
};
```

---

## Related

- [Error Handling](./error-handling.md)
- [Caching Strategies](../advanced/caching.md)
- [Performance Optimization](../advanced/performance.md)
