# Error Recovery

Handle errors gracefully and provide a great user experience.

## Error Types

The SDK provides typed errors for better handling:

```typescript
import { DotPassportError } from '@dotpassport/sdk';

try {
  const scores = await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
  }
}
```

---

## Common Error Codes

| Status Code | Meaning | Recovery Strategy |
|-------------|---------|-------------------|
| `400` | Invalid request | Validate input parameters |
| `401` | Invalid API key | Check API key configuration |
| `404` | Address not found | Show "new user" state |
| `429` | Rate limited | Implement retry with backoff |
| `500` | Server error | Retry after delay |
| `503` | Service unavailable | Retry with exponential backoff |

---

## Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (except rate limits)
      if (error instanceof DotPassportError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Usage
const scores = await withRetry(() => client.getScores(address));
```

---

## Graceful Degradation

Show fallback UI when data can't be loaded:

```typescript
interface FallbackState {
  totalScore: number;
  message: string;
}

async function getScoresWithFallback(address: string): Promise<ScoresResponse | FallbackState> {
  try {
    return await client.getScores(address);
  } catch (error) {
    if (error instanceof DotPassportError) {
      if (error.statusCode === 404) {
        return {
          totalScore: 0,
          message: 'New user - no reputation data yet'
        };
      }
    }

    // Return cached data if available
    const cached = localStorage.getItem(`scores:${address}`);
    if (cached) {
      return {
        ...JSON.parse(cached),
        message: 'Showing cached data'
      };
    }

    return {
      totalScore: 0,
      message: 'Unable to load reputation data'
    };
  }
}
```

---

## React Error Boundary

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DotPassportErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DotPassport widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-state">
          <p>Unable to load reputation data</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<DotPassportErrorBoundary fallback={<FallbackWidget />}>
  <DotPassportWidget address={address} />
</DotPassportErrorBoundary>
```

---

## Widget Error Handling

Handle errors directly in widget callbacks:

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  onError: (error) => {
    if (error instanceof DotPassportError) {
      switch (error.statusCode) {
        case 404:
          showNewUserMessage();
          break;
        case 429:
          showRateLimitMessage();
          scheduleRetry();
          break;
        default:
          showGenericError();
          logError(error);
      }
    }
  }
});
```

---

## Network Error Handling

Detect and handle network issues:

```typescript
async function fetchWithNetworkHandling<T>(fn: () => Promise<T>): Promise<T> {
  // Check if online
  if (!navigator.onLine) {
    throw new Error('No internet connection');
  }

  try {
    return await fn();
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}

// Listen for online/offline events
window.addEventListener('online', () => {
  // Refresh widgets when connection restored
  widget.refresh();
});

window.addEventListener('offline', () => {
  // Show offline indicator
  showOfflineMessage();
});
```

---

## Timeout Handling

Add timeouts to prevent hanging requests:

```typescript
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });

  return Promise.race([promise, timeout]);
}

// Usage
try {
  const scores = await withTimeout(
    client.getScores(address),
    10000 // 10 second timeout
  );
} catch (error) {
  if (error.message === 'Request timeout') {
    // Handle timeout
    showTimeoutMessage();
  }
}
```

---

## Error Logging

Log errors for debugging and monitoring:

```typescript
interface ErrorLog {
  timestamp: string;
  error: string;
  statusCode?: number;
  address?: string;
  context?: Record<string, unknown>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];

  log(error: unknown, context?: Record<string, unknown>) {
    const entry: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      context
    };

    if (error instanceof DotPassportError) {
      entry.statusCode = error.statusCode;
    }

    this.logs.push(entry);

    // Send to monitoring service
    this.send(entry);
  }

  private async send(entry: ErrorLog) {
    // Send to your error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  getRecentErrors(count = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }
}

const errorLogger = new ErrorLogger();

// Usage with widget
createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  onError: (error) => {
    errorLogger.log(error, { address, widgetType: 'reputation' });
  }
});
```

---

## Complete Error Recovery Example

```typescript
import { DotPassportClient, DotPassportError, createWidget } from '@dotpassport/sdk';

class RobustDotPassportClient {
  private client: DotPassportClient;
  private retryConfig = { maxRetries: 3, baseDelay: 1000 };

  constructor(apiKey: string) {
    this.client = new DotPassportClient({ apiKey });
  }

  async getScores(address: string) {
    return this.withErrorHandling(
      () => this.client.getScores(address),
      { address, operation: 'getScores' }
    );
  }

  private async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: Record<string, unknown>
  ): Promise<T> {
    // Check online status
    if (!navigator.onLine) {
      throw new Error('No internet connection');
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.withTimeout(fn(), 10000);
      } catch (error) {
        lastError = error as Error;

        // Log error
        console.error(`Attempt ${attempt + 1} failed:`, error);

        // Don't retry certain errors
        if (error instanceof DotPassportError) {
          if ([400, 401, 404].includes(error.statusCode)) {
            throw error;
          }
        }

        // Wait before retry
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      )
    ]);
  }
}
```

---

## Related

- [Error Handling](../api-client/error-handling.md)
- [Rate Limiting](../api-client/rate-limiting.md)
- [Caching Strategies](./caching.md)
