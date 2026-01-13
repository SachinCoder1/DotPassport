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

### Response Type

```typescript
interface UserScores {
  address: string;
  totalScore: number;
  categories: Record<string, CategoryScore>;
  rank?: number;
  percentile?: number;
  calculatedAt: string;  // ISO 8601 date
}

interface CategoryScore {
  score: number;
  title: string;
  key: string;
  reason?: string;
  maxPossible?: number;
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
console.log(`Rank: #${scores.rank}`);
console.log(`Top ${100 - scores.percentile}%`);

// Access category scores
Object.entries(scores.categories).forEach(([key, category]) => {
  console.log(`${category.title}: ${category.score}/${category.maxPossible}`);
});
```

### Available Categories

| Key | Title | Description |
|-----|-------|-------------|
| `longevity` | Account Longevity | Account age and history |
| `tx_count` | Transaction Count | On-chain transaction volume |
| `governance` | Governance | Governance participation |
| `identity` | Identity | On-chain identity verification |
| `unique_interactions` | Unique Interactions | Network diversity |
| `technical_contributions` | Technical Contributions | Developer activity |

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

### Response Type

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

interface CategoryDefinition {
  key: string;
  displayName: string;
  short_description: string;
  long_description: string;
  order: number;
  active: boolean;
  reasons: ScoringReason[];
}

interface ScoringReason {
  key: string;
  points: number;
  title: string;
  description: string;
  thresholds: { label: string; description: string }[];
  advices: string[];
}
```

### Example

```typescript
const categoryScore = await client.getCategoryScore(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'governance'
);

console.log(`Category: ${categoryScore.category.title}`);
console.log(`Score: ${categoryScore.category.score}`);
console.log(`Description: ${categoryScore.definition.long_description}`);

// Display improvement advice
categoryScore.definition.reasons.forEach(reason => {
  console.log(`\n${reason.title}: +${reason.points} points`);
  reason.advices.forEach(advice => console.log(`  - ${advice}`));
});
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

## Related

- [Profile Methods](./profile.md)
- [Badges Methods](./badges.md)
- [Error Handling](./error-handling.md)
