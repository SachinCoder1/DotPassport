# Error Handling

Handle errors gracefully when using the DotPassport SDK.

## DotPassportError

All API errors throw a `DotPassportError` instance with detailed information.

### Import

```typescript
import { DotPassportError } from '@dotpassport/sdk';
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error message |
| `statusCode` | `number` | HTTP status code |
| `response` | `any` | Full error response from API |

### Example

```typescript
try {
  const scores = await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    console.log('Status:', error.statusCode);    // 404
    console.log('Message:', error.message);       // "User not found"
    console.log('Response:', error.response);     // Full error details
  }
}
```

---

## Error Codes Reference

| Status | Error | Description | Solution |
|--------|-------|-------------|----------|
| **400** | Bad Request | Invalid parameters | Check request format |
| **401** | Unauthorized | Invalid/missing API key | Verify API key |
| **403** | Forbidden | Insufficient permissions | Check key permissions |
| **404** | Not Found | Resource doesn't exist | Verify address/key |
| **429** | Too Many Requests | Rate limit exceeded | Implement backoff |
| **500** | Internal Server Error | Server error | Retry with backoff |
| **503** | Service Unavailable | API is down | Retry later |

---

## Basic Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

try {
  const scores = await client.getScores(address);
  console.log(scores.totalScore);
} catch (error) {
  if (error instanceof DotPassportError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Specific Error Handling

Handle different error types with specific responses:

```typescript
try {
  const profile = await client.getProfile(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 400:
        console.log('Invalid address format');
        break;
      case 401:
        console.log('Please check your API key');
        break;
      case 404:
        console.log('User not found - they may not have a DotPassport profile');
        break;
      case 429:
        console.log('Too many requests - please slow down');
        break;
      case 500:
      case 503:
        console.log('Server error - please try again later');
        break;
      default:
        console.log(`Unknown error: ${error.message}`);
    }
  }
}
```

---

## Retry Logic

Implement automatic retries for transient failures:

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000 } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DotPassportError) {
        // Don't retry client errors (4xx except 429)
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }

        // Last attempt - throw error
        if (attempt === retries - 1) {
          throw error;
        }

        // Wait before retry with exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`Retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const scores = await fetchWithRetry(
  () => client.getScores(address),
  { retries: 3, delay: 1000 }
);
```

---

## Error Recovery Patterns

### Fallback Values

```typescript
async function getScoresWithFallback(address: string) {
  try {
    return await client.getScores(address);
  } catch (error) {
    if (error instanceof DotPassportError && error.statusCode === 404) {
      // Return default scores for new users
      return {
        address,
        totalScore: 0,
        categories: {},
        calculatedAt: new Date().toISOString()
      };
    }
    throw error;
  }
}
```

### Graceful Degradation

```typescript
async function loadDashboard(address: string) {
  const results = await Promise.allSettled([
    client.getProfile(address),
    client.getScores(address),
    client.getBadges(address)
  ]);

  return {
    profile: results[0].status === 'fulfilled' ? results[0].value : null,
    scores: results[1].status === 'fulfilled' ? results[1].value : null,
    badges: results[2].status === 'fulfilled' ? results[2].value : null,
    errors: results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason)
  };
}
```

---

## React Error Boundary

```tsx
import { Component, ReactNode } from 'react';
import { DotPassportError } from '@dotpassport/sdk';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: DotPassportError | null;
}

class DotPassportErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    if (error instanceof DotPassportError) {
      return { error };
    }
    throw error;
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div className="error-container">
          <h3>Unable to load DotPassport data</h3>
          <p>Error: {this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<DotPassportErrorBoundary fallback={<div>Loading failed...</div>}>
  <ReputationWidget address={address} />
</DotPassportErrorBoundary>
```

---

## Logging Errors

```typescript
function logError(error: DotPassportError, context: Record<string, any>) {
  console.error('DotPassport API Error', {
    statusCode: error.statusCode,
    message: error.message,
    response: error.response,
    ...context
  });

  // Send to error tracking service
  // errorTracker.captureException(error, { extra: context });
}

// Usage
try {
  await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    logError(error, { address, action: 'getScores' });
  }
  throw error;
}
```

---

## Related

- [Rate Limiting](./rate-limiting.md)
- [API Overview](./overview.md)
