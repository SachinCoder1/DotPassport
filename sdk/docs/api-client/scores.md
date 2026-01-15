# Scores Methods

Retrieve reputation scores and category breakdowns for Polkadot addresses.

## Available Methods

| Method | Description |
|--------|-------------|
| `getScores()` | Get all reputation scores for a user |
| `getCategoryScore()` | Get a specific category score |

---

## getScores()

Retrieves all reputation scores for a user, including total score and category breakdown.

### Usage

```typescript
const scores = await client.getScores(address);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Polkadot address of the user |
| `signal` | `AbortSignal` | No | Optional abort signal for request cancellation |

### Response Type

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

### Example

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

const scores = await client.getScores(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(`Total Score: ${scores.totalScore}`);
console.log(`Calculated At: ${scores.calculatedAt}`);

// Access category scores
if (scores.categories) {
  Object.entries(scores.categories).forEach(([key, category]) => {
    console.log(`${category.title}: ${category.score} (${category.reason})`);
  });
}
```

### Example Response

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "totalScore": 450,
  "calculatedAt": "2024-01-15T12:00:00Z",
  "categories": {
    "longevity": { "score": 100, "reason": "TwoYears", "title": "Account Age" },
    "txCount": { "score": 75, "reason": "Moderate", "title": "Transaction Count" },
    "governance": { "score": 125, "reason": "Active", "title": "Governance" },
    "stakingRewards": { "score": 150, "reason": "High", "title": "Staking" }
  },
  "source": "api"
}
```

### Available Categories

| Key | Title | Description |
|-----|-------|-------------|
| `longevity` | Account Longevity | Account age and history |
| `txCount` | Transaction Count | On-chain transaction volume |
| `governance` | Governance | Governance participation |
| `identity` | Identity | On-chain identity verification |
| `uniqueInteractions` | Unique Interactions | Network diversity |
| `stakingRewards` | Staking | Staking activity |

---

## getCategoryScore()

Retrieves a specific category score with detailed breakdown and scoring reasons.

### Usage

```typescript
const categoryScore = await client.getCategoryScore(address, categoryKey);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Polkadot address of the user |
| `categoryKey` | `string` | Yes | Category identifier (e.g., "longevity") |
| `signal` | `AbortSignal` | No | Optional abort signal for request cancellation |

### Response Type

```typescript
interface SpecificCategoryScore {
  address: string;
  category: {
    key: string;
    score: CategoryScore;
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

### Example

```typescript
const categoryScore = await client.getCategoryScore(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'governance'
);

console.log(`Category: ${categoryScore.category.key}`);
console.log(`Score: ${categoryScore.category.score.score}`);
console.log(`Reason: ${categoryScore.category.score.reason}`);

if (categoryScore.definition) {
  console.log(`Description: ${categoryScore.definition.long_description}`);

  // Display improvement advice
  categoryScore.definition.reasons.forEach(reason => {
    console.log(`\n${reason.title}: +${reason.points} points`);
    reason.advices.forEach(advice => console.log(`  - ${advice}`));
  });
}
```

### Example Response

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "category": {
    "key": "longevity",
    "score": { "score": 100, "reason": "TwoYears", "title": "Account Age" }
  },
  "definition": {
    "key": "longevity",
    "displayName": "Account Longevity",
    "short_description": "How long your account has been active",
    "long_description": "This category measures the age of your Polkadot account.",
    "order": 1,
    "reasons": [{
      "key": "TwoYears",
      "points": 100,
      "title": "2+ Years",
      "description": "Account is over 2 years old",
      "thresholds": [{ "label": "2 years", "description": "Account created 2+ years ago" }],
      "advices": ["Keep your account active to maintain this score"]
    }]
  },
  "calculatedAt": "2024-01-15T12:00:00Z"
}
```

---

## Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

try {
  const scores = await client.getScores(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 404:
        console.log('User not found - no scores available');
        break;
      case 401:
        console.log('Invalid API key');
        break;
      default:
        console.log(`Error: ${error.message}`);
    }
  }
}
```

---

## Request Cancellation

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const scores = await client.getScores(address, controller.signal);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```

---

## Related

- [Profile Methods](./profile.md)
- [Badges Methods](./badges.md)
- [Error Handling](./error-handling.md)
