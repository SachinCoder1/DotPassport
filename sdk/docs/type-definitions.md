# Type Definitions

Complete TypeScript type reference for the DotPassport SDK.

## Client Types

### DotPassportConfig

Configuration options for initializing the client.

```typescript
interface DotPassportConfig {
  apiKey: string;      // Required: Your API key
  baseUrl?: string;    // Optional: Custom API URL
}
```

### DotPassportError

Custom error class for all API errors.

```typescript
class DotPassportError extends Error {
  statusCode: number;    // HTTP status code
  response: any;         // Full error response
  message: string;       // Error message

  constructor(message: string, statusCode: number, response?: any);
}
```

## Data Types

### UserProfile

User profile information.

```typescript
interface UserProfile {
  address: string;           // Polkadot address
  displayName: string;       // Display name
  bio?: string;              // User biography
  avatar?: string;           // Avatar URL
  identities: Identity[];    // On-chain identities
  socials: UserSocials;      // Social media links
  joinedAt: string;          // ISO 8601 date
  updatedAt: string;         // ISO 8601 date
}

interface Identity {
  chain: string;         // Chain name (polkadot, kusama, etc.)
  address: string;       // Chain-specific address
  displayName?: string;  // On-chain display name
  verified: boolean;     // Verification status
}

interface UserSocials {
  twitter?: string;
  github?: string;
  discord?: string;
  telegram?: string;
  email?: string;
  website?: string;
}
```

### UserScores

User reputation scores.

```typescript
interface UserScores {
  address: string;                           // Polkadot address
  totalScore: number;                        // Total reputation score
  categories: Record<string, CategoryScore>; // Category breakdown
  rank?: number;                             // User rank
  percentile?: number;                       // Percentile ranking
  calculatedAt: string;                      // ISO 8601 date
}

interface CategoryScore {
  score: number;        // Category score
  title: string;        // Category title
  key: string;          // Category key
  reason?: string;      // Scoring reason
  maxPossible?: number; // Maximum possible score
}
```

### SpecificCategoryScore

Detailed category score with definition.

```typescript
interface SpecificCategoryScore {
  address: string;
  category: {
    key: string;
    score: number;
    title: string;
    reason?: string;
  };
  definition: CategoryDefinition;
  calculatedAt: string;
}
```

### UserBadges

User badges collection.

```typescript
interface UserBadges {
  address: string;       // Polkadot address
  count: number;         // Total badges earned
  badges: Badge[];       // Badge array
}

interface Badge {
  key: string;                                              // Badge key
  title: string;                                            // Badge title
  description: string;                                      // Description
  icon: string;                                             // Icon URL
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'; // Badge tier
  earned: boolean;                                          // Earned status
  earnedAt?: string;                                        // ISO 8601 date
  progress?: number;                                        // Progress (0-100)
}
```

### SpecificUserBadge

Specific badge with definition.

```typescript
interface SpecificUserBadge {
  address: string;
  badge: Badge;
  definition: BadgeDefinition;
}
```

## Definition Types

### CategoryDefinition

Category metadata and scoring rules.

```typescript
interface CategoryDefinition {
  key: string;                  // Category key
  displayName: string;          // Display name
  short_description: string;    // Short description
  long_description: string;     // Detailed description
  order: number;                // Display order
  active: boolean;              // Active status
  reasons: ScoringReason[];     // Scoring reasons
}

interface ScoringReason {
  key: string;                  // Reason key
  points: number;               // Points awarded
  title: string;                // Reason title
  description: string;          // Description
  thresholds: Threshold[];      // Achievement thresholds
  advices: string[];            // Improvement advice
}

interface Threshold {
  label: string;       // Threshold label
  description: string; // Description
}
```

### CategoryDefinitions

Collection of all category definitions.

```typescript
interface CategoryDefinitions {
  count: number;                      // Total categories
  categories: CategoryDefinition[];   // Category array
}
```

### BadgeDefinition

Badge metadata and requirements.

```typescript
interface BadgeDefinition {
  key: string;                                              // Badge key
  title: string;                                            // Badge title
  description: string;                                      // Description
  icon: string;                                             // Icon URL
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'; // Badge tier
  category: string;                                         // Category
  requirements: string;                                     // Requirements
  order: number;                                            // Display order
  active: boolean;                                          // Active status
}
```

### BadgeDefinitions

Collection of all badge definitions.

```typescript
interface BadgeDefinitions {
  count: number;                    // Total badges
  badges: BadgeDefinition[];        // Badge array
}
```

## Widget Types

### BaseWidgetConfig

Base configuration for all widgets.

```typescript
interface BaseWidgetConfig {
  apiKey: string;                    // Required: API key
  address: string;                   // Required: User address
  baseUrl?: string;                  // Optional: API URL
  theme?: 'light' | 'dark' | 'auto'; // Theme mode
  className?: string;                // Additional CSS class
  onError?: (error: Error) => void;  // Error callback
  onLoad?: () => void;               // Load callback
}
```

### ReputationWidgetConfig

Reputation widget configuration.

```typescript
interface ReputationWidgetConfig extends BaseWidgetConfig {
  type?: 'reputation';     // Widget type
  showCategories?: boolean; // Show category breakdown
  maxCategories?: number;   // Max categories to display
  compact?: boolean;        // Compact layout
}
```

### BadgeWidgetConfig

Badge widget configuration.

```typescript
interface BadgeWidgetConfig extends BaseWidgetConfig {
  type: 'badge' | 'badges'; // Widget type
  badgeKey?: string;        // Specific badge key
  maxBadges?: number;       // Max badges to display
  showProgress?: boolean;   // Show progress indicators
}
```

### ProfileWidgetConfig

Profile widget configuration.

```typescript
interface ProfileWidgetConfig extends BaseWidgetConfig {
  type: 'profile';          // Widget type
  showIdentities?: boolean; // Show identities
  showSocials?: boolean;    // Show social links
  showBio?: boolean;        // Show biography
}
```

### CategoryWidgetConfig

Category widget configuration.

```typescript
interface CategoryWidgetConfig extends BaseWidgetConfig {
  type: 'category';         // Widget type
  categoryKey: string;      // Required: Category key
  showBreakdown?: boolean;  // Show score breakdown
  showAdvice?: boolean;     // Show improvement advice
}
```

### WidgetConfig

Union type of all widget configurations.

```typescript
type WidgetConfig =
  | ReputationWidgetConfig
  | BadgeWidgetConfig
  | ProfileWidgetConfig
  | CategoryWidgetConfig;
```

### WidgetState

Widget internal state.

```typescript
interface WidgetState<TData = any> {
  loading: boolean;      // Loading state
  error: Error | null;   // Error state
  data: TData | null;    // Widget data
}
```

## Enums

### Badge Tiers

```typescript
type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
```

### Theme Modes

```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

### Widget Types

```typescript
type WidgetType = 'reputation' | 'badge' | 'badges' | 'profile' | 'category';
```

## Usage Examples

### Type Imports

```typescript
import type {
  DotPassportConfig,
  UserProfile,
  UserScores,
  WidgetConfig
} from '@dotpassport/sdk';

const config: DotPassportConfig = {
  apiKey: 'live_key'
};

const widgetConfig: WidgetConfig = {
  apiKey: 'live_key',
  address: '5Grw...',
  type: 'reputation'
};
```

### Type Guards

```typescript
import { DotPassportError } from '@dotpassport/sdk';

function handleError(error: unknown) {
  if (error instanceof DotPassportError) {
    console.log(error.statusCode);
    console.log(error.message);
  }
}
```

### Generic Types

```typescript
async function fetchData<T>(
  fetcher: () => Promise<T>
): Promise<T | null> {
  try {
    return await fetcher();
  } catch (error) {
    return null;
  }
}

const scores = await fetchData(() => client.getScores(address));
```

## Next Steps

- [TypeScript Support Guide](./advanced/typescript.md)
- [API Reference](./api-reference.md)
- [Error Handling](./api-client/error-handling.md)
