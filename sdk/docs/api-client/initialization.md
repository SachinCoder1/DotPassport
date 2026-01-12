# Client Initialization

Learn how to initialize the DotPassportClient.

## Basic Initialization

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here'
});
```

## Configuration Options

```typescript
interface DotPassportConfig {
  apiKey: string;      // Required: Your API key
  baseUrl?: string;    // Optional: API base URL
}
```

### API Key

Your authentication key. Get it from the [developer dashboard](https://dotpassport.com/developers).

```typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});
```

### Base URL

Override the default API URL (useful for testing):

```typescript
const client = new DotPassportClient({
  apiKey: 'test_key',
  baseUrl: 'https://api-staging.dotpassport.com'
});
```

## Environment-Specific Setup

### Development

```typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_TEST_KEY!,
  baseUrl: 'https://api-staging.dotpassport.com'
});
```

### Production

```typescript
const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_LIVE_KEY!
});
```

## Singleton Pattern

Create a single instance for your entire application:

```typescript
// lib/dotpassport.ts
import { DotPassportClient } from '@dotpassport/sdk';

export const dotpassport = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});

// Usage in other files
import { dotpassport } from './lib/dotpassport';

const scores = await dotpassport.getScores(address);
```

## Next Steps

- [Profile Methods](./profile.md)
- [Scores Methods](./scores.md)
- [Error Handling](./error-handling.md)
