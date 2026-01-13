# Caching Strategies

Optimize performance with intelligent caching.

## Built-in Widget Caching

Widgets include automatic caching with configurable TTL:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  cacheTTL: 300000 // 5 minutes (default)
});
```

---

## Cache Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cacheTTL` | `number` | `300000` | Cache duration in milliseconds |
| `cacheKey` | `string` | Auto-generated | Custom cache key |
| `disableCache` | `boolean` | `false` | Disable caching entirely |

---

## API Client Caching

### Basic In-Memory Cache

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

class CachedDotPassportClient {
  private client: DotPassportClient;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string) {
    this.client = new DotPassportClient({ apiKey });
  }

  private getCacheKey(method: string, address: string): string {
    return `${method}:${address}`;
  }

  private isValid(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp < ttl;
  }

  async getScores(address: string, ttl = this.defaultTTL) {
    const key = this.getCacheKey('scores', address);
    const cached = this.cache.get(key);

    if (cached && this.isValid(cached.timestamp, ttl)) {
      return cached.data;
    }

    const data = await this.client.getScores(address);
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getBadges(address: string, ttl = this.defaultTTL) {
    const key = this.getCacheKey('badges', address);
    const cached = this.cache.get(key);

    if (cached && this.isValid(cached.timestamp, ttl)) {
      return cached.data;
    }

    const data = await this.client.getBadges(address);
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(address?: string) {
    if (address) {
      // Clear specific address
      for (const key of this.cache.keys()) {
        if (key.includes(address)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all
      this.cache.clear();
    }
  }
}
```

---

## localStorage Cache

For persistent caching across sessions:

```typescript
class PersistentCache {
  private prefix = 'dotpassport:';
  private defaultTTL = 30 * 60 * 1000; // 30 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;

    try {
      const item = JSON.parse(raw);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  }

  clear(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

// Usage
const cache = new PersistentCache();
const client = new DotPassportClient({ apiKey: 'your_api_key' });

async function getScoresWithCache(address: string) {
  const cacheKey = `scores:${address}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch fresh data
  const data = await client.getScores(address);
  cache.set(cacheKey, data);
  return data;
}
```

---

## React Cache Hook

```typescript
import { useState, useEffect, useRef } from 'react';
import { DotPassportClient } from '@dotpassport/sdk';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000;

export function useCachedData<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  ttl = DEFAULT_TTL
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // Check cache
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetcher();

        if (!cancelled) {
          cache.set(cacheKey, { data: result, timestamp: Date.now() });
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, ttl]);

  const refresh = async () => {
    cache.delete(cacheKey);
    setLoading(true);

    try {
      const result = await fetcher();
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

// Usage
function ReputationDisplay({ address }: { address: string }) {
  const client = useRef(new DotPassportClient({ apiKey: 'your_api_key' }));

  const { data: scores, loading, error, refresh } = useCachedData(
    () => client.current.getScores(address),
    `scores:${address}`,
    5 * 60 * 1000 // 5 minutes
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Score: {scores?.totalScore}</h2>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

---

## Stale-While-Revalidate Pattern

Return cached data immediately while fetching fresh data:

```typescript
async function getScoresSWR(address: string) {
  const cacheKey = `scores:${address}`;
  const cached = cache.get(cacheKey);

  // Return cached data immediately if available
  if (cached) {
    // Revalidate in background
    fetchAndCache(address, cacheKey).catch(console.error);
    return cached.data;
  }

  // No cache, fetch and wait
  return fetchAndCache(address, cacheKey);
}

async function fetchAndCache(address: string, cacheKey: string) {
  const data = await client.getScores(address);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

---

## Cache Invalidation

### Time-Based Expiration

```typescript
const CACHE_TTL = {
  scores: 5 * 60 * 1000,     // 5 minutes - changes frequently
  badges: 15 * 60 * 1000,    // 15 minutes - changes occasionally
  profile: 30 * 60 * 1000,   // 30 minutes - rarely changes
  metadata: 24 * 60 * 60 * 1000 // 24 hours - static data
};
```

### Manual Invalidation

```typescript
// Clear all cache for an address when user makes changes
function onUserAction(address: string) {
  cache.clearCache(address);
  widget.refresh(); // Re-fetch fresh data
}

// Clear entire cache on logout
function onLogout() {
  cache.clearCache();
}
```

---

## Best Practices

1. **Choose appropriate TTL values** - Balance freshness vs. performance
2. **Cache at the right level** - API responses, not derived data
3. **Handle cache misses gracefully** - Always have a fallback to fetch
4. **Clear cache on relevant user actions** - Keep data consistent
5. **Use SWR for better UX** - Show stale data while loading fresh

---

## Related

- [Performance Optimization](./performance.md)
- [Error Recovery](./error-recovery.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
