# Metadata Methods

Retrieve badge and category definitions without user context.

## Available Methods

| Method | Description |
|--------|-------------|
| `getBadgeDefinitions()` | Get all badge definitions |
| `getCategoryDefinitions()` | Get all category definitions |

---

## getBadgeDefinitions()

Retrieves all available badge definitions. Useful for displaying all possible badges or building badge showcase UIs.

### Usage

```typescript
const definitions = await client.getBadgeDefinitions();
```

### Parameters

None required.

### Response Type

```typescript
interface BadgeDefinitions {
  badges: BadgeDefinition[];
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

### Example

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

const definitions = await client.getBadgeDefinitions();

console.log(`Total Badges Available: ${definitions.badges.length}`);

// Display badge information
definitions.badges.forEach(badge => {
  console.log(`\n${badge.title}`);
  console.log(`  ${badge.shortDescription}`);
  console.log(`  Levels: ${badge.levels.length}`);

  // Show level progression
  badge.levels.forEach(level => {
    console.log(`    Level ${level.level}: ${level.title} (${level.value} ${badge.metric})`);
  });
});
```

### Use Cases

1. **Badge Showcase**: Display all badges a user could earn
2. **Progress Tracking**: Show requirements for unearned badges
3. **Gamification UI**: Build achievement systems
4. **Documentation**: Auto-generate badge documentation

---

## getCategoryDefinitions()

Retrieves all scoring category definitions with detailed scoring criteria.

### Usage

```typescript
const definitions = await client.getCategoryDefinitions();
```

### Parameters

None required.

### Response Type

```typescript
interface CategoryDefinitions {
  categories: CategoryDefinition[];
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
const definitions = await client.getCategoryDefinitions();

console.log(`Scoring Categories: ${definitions.categories.length}`);

// Display category info
definitions.categories.forEach(category => {
  console.log(`\n${category.displayName}`);
  console.log(`  ${category.short_description}`);

  // Calculate max possible score for category
  const maxScore = category.reasons.reduce((sum, r) => sum + r.points, 0);
  console.log(`  Max Score: ${maxScore} points`);

  // Show scoring breakdown
  category.reasons.forEach(reason => {
    console.log(`    - ${reason.title}: +${reason.points} points`);
  });
});
```

### Building a Score Improvement Guide

```typescript
const definitions = await client.getCategoryDefinitions();
const scores = await client.getScores(address);

// Find improvement opportunities
definitions.categories.forEach(category => {
  const userScore = scores.categories[category.key];
  const maxScore = category.reasons.reduce((sum, r) => sum + r.points, 0);

  if (userScore && userScore.score < maxScore) {
    console.log(`\n${category.displayName}: ${userScore.score}/${maxScore}`);
    console.log('How to improve:');

    category.reasons.forEach(reason => {
      reason.advices.forEach(advice => {
        console.log(`  - ${advice}`);
      });
    });
  }
});
```

---

## Caching Recommendations

Badge and category definitions change infrequently. Cache these responses to reduce API calls:

```typescript
class MetadataCache {
  private badgeDefinitions: BadgeDefinitions | null = null;
  private categoryDefinitions: CategoryDefinitions | null = null;
  private cacheTime = 24 * 60 * 60 * 1000; // 24 hours
  private lastFetch = 0;

  constructor(private client: DotPassportClient) {}

  async getBadgeDefinitions(): Promise<BadgeDefinitions> {
    if (this.badgeDefinitions && Date.now() - this.lastFetch < this.cacheTime) {
      return this.badgeDefinitions;
    }

    this.badgeDefinitions = await this.client.getBadgeDefinitions();
    this.lastFetch = Date.now();
    return this.badgeDefinitions;
  }

  async getCategoryDefinitions(): Promise<CategoryDefinitions> {
    if (this.categoryDefinitions && Date.now() - this.lastFetch < this.cacheTime) {
      return this.categoryDefinitions;
    }

    this.categoryDefinitions = await this.client.getCategoryDefinitions();
    this.lastFetch = Date.now();
    return this.categoryDefinitions;
  }
}
```

---

## Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

try {
  const definitions = await client.getBadgeDefinitions();
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 401:
        console.log('Invalid API key');
        break;
      case 503:
        console.log('Service unavailable - try again later');
        break;
      default:
        console.log(`Error: ${error.message}`);
    }
  }
}
```

---

## Related

- [Scores Methods](./scores.md)
- [Badges Methods](./badges.md)
- [Category Widget](../widgets/category.md)
