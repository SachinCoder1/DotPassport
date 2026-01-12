# TypeScript Support

The SDK is written in TypeScript with complete type definitions.

## Type Imports

```typescript
import type {
  // Client types
  DotPassportConfig,
  DotPassportError,

  // Data types
  UserProfile,
  UserScores,
  UserBadges,
  CategoryScore,

  // Widget types
  WidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,

  // Definition types
  BadgeDefinition,
  CategoryDefinition
} from '@dotpassport/sdk';
```

## Type Safety

All methods are fully typed:

```typescript
const scores: UserScores = await client.getScores(address);
const badges: UserBadges = await client.getBadges(address);

// TypeScript will catch type errors
scores.totalScore;        // ✅ number
scores.invalidProperty;   // ❌ TypeScript error
```

## Generic Types

Client methods use generics for type inference:

```typescript
// Type is inferred automatically
const profile = await client.getProfile(address);
profile.displayName; // TypeScript knows this is a string

// Or explicitly specify types
const scores = await client.getScores<UserScores>(address);
```

## Widget Types

```typescript
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';

const config: WidgetConfig = {
  apiKey: 'key',
  address: 'address',
  type: 'reputation'
};

const widget = createWidget(config);
```

## Custom Type Guards

```typescript
import { DotPassportError } from '@dotpassport/sdk';

function isDotPassportError(error: unknown): error is DotPassportError {
  return error instanceof DotPassportError;
}

try {
  await client.getScores(address);
} catch (error) {
  if (isDotPassportError(error)) {
    console.log(error.statusCode, error.message);
  }
}
```

## Next Steps

- [API Reference](../api-reference.md)
- [Error Handling](../api-client/error-handling.md)
