# Badges Methods

Retrieve badges earned by Polkadot addresses.

## Available Methods

| Method | Description |
|--------|-------------|
| `getBadges()` | Get all badges for a user |
| `getBadge()` | Get a specific badge |

---

## getBadges()

Retrieves all badges earned by a user.

### Usage

```typescript
const badges = await client.getBadges(address);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Polkadot address of the user |
| `signal` | `AbortSignal` | No | Optional abort signal for request cancellation |

### Response Type

```typescript
interface UserBadges {
  address: string;
  badges: UserBadge[];
  count: number;
  source?: 'app' | 'api';
}

interface UserBadge {
  badgeKey: string;
  achievedLevel: number;
  achievedLevelKey: string;
  achievedLevelTitle: string;
  earnedAt?: string;  // ISO 8601 date
}
```

### Example

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

const badges = await client.getBadges(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(`Total Badges: ${badges.count}`);

badges.badges.forEach(badge => {
  console.log(`${badge.achievedLevelTitle} (Level ${badge.achievedLevel})`);
  if (badge.earnedAt) {
    console.log(`  Earned: ${badge.earnedAt}`);
  }
});
```

### Example Response

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "badges": [
    {
      "badgeKey": "early_adopter",
      "achievedLevel": 3,
      "achievedLevelKey": "gold",
      "achievedLevelTitle": "Gold Early Adopter",
      "earnedAt": "2024-01-10T10:00:00Z"
    },
    {
      "badgeKey": "governance_voter",
      "achievedLevel": 2,
      "achievedLevelKey": "silver",
      "achievedLevelTitle": "Silver Governance Voter",
      "earnedAt": "2024-01-12T14:30:00Z"
    }
  ],
  "count": 2,
  "source": "api"
}
```

### Badge Level Keys

Badges have multiple levels with different keys:

| Level | Common Keys | Description |
|-------|-------------|-------------|
| 1 | `bronze` | Entry-level achievement |
| 2 | `silver` | Intermediate achievement |
| 3 | `gold` | Advanced achievement |
| 4 | `platinum` | Expert achievement |
| 5 | `diamond` | Legendary achievement |

---

## getBadge()

Retrieves a specific badge with full definition details.

### Usage

```typescript
const badge = await client.getBadge(address, badgeKey);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Polkadot address of the user |
| `badgeKey` | `string` | Yes | Badge identifier |
| `signal` | `AbortSignal` | No | Optional abort signal for request cancellation |

### Response Type

```typescript
interface SpecificUserBadge {
  address: string;
  badge: UserBadge | null;
  earned?: boolean;
  definition: BadgeDefinition | null;
  source?: 'app' | 'api';
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
const badge = await client.getBadge(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'governance_voter'
);

if (badge.badge) {
  console.log(`Badge: ${badge.badge.achievedLevelTitle}`);
  console.log(`Level: ${badge.badge.achievedLevel}`);
  console.log(`Earned: ${badge.badge.earnedAt}`);
}

if (badge.definition) {
  console.log(`Description: ${badge.definition.longDescription}`);
  console.log(`\nAvailable Levels:`);
  badge.definition.levels.forEach(level => {
    console.log(`  Level ${level.level}: ${level.title} (${level.value} ${badge.definition.metric})`);
  });
}
```

### Example Response

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "badge": {
    "badgeKey": "governance_voter",
    "achievedLevel": 2,
    "achievedLevelKey": "silver",
    "achievedLevelTitle": "Silver Governance Voter",
    "earnedAt": "2024-01-12T14:30:00Z"
  },
  "earned": true,
  "definition": {
    "key": "governance_voter",
    "title": "Governance Voter",
    "shortDescription": "Active participant in governance",
    "longDescription": "Awarded for voting on governance proposals",
    "metric": "votes",
    "levels": [
      { "level": 1, "key": "bronze", "value": 5, "title": "Bronze Voter", "shortDescription": "5 votes", "longDescription": "Cast at least 5 votes" },
      { "level": 2, "key": "silver", "value": 25, "title": "Silver Voter", "shortDescription": "25 votes", "longDescription": "Cast at least 25 votes" },
      { "level": 3, "key": "gold", "value": 100, "title": "Gold Voter", "shortDescription": "100 votes", "longDescription": "Cast at least 100 votes" }
    ]
  },
  "source": "api"
}
```

### Common Badge Keys

| Key | Title | Description |
|-----|-------|-------------|
| `early_adopter` | Early Adopter | Early network participation |
| `governance_voter` | Governance Voter | Voting participation |
| `staking_champion` | Staking Champion | Staking activity |
| `identity_verified` | Identity Verified | On-chain identity |
| `parachain_explorer` | Parachain Explorer | Cross-chain activity |

---

## Filtering Badges

### By Badge Key

```typescript
const badges = await client.getBadges(address);

const governanceBadges = badges.badges.filter(b =>
  b.badgeKey.includes('governance')
);
```

### By Level

```typescript
const badges = await client.getBadges(address);

const highLevelBadges = badges.badges.filter(b => b.achievedLevel >= 3);
console.log(`Gold+ badges: ${highLevelBadges.length}`);
```

### Sort by Achievement Date

```typescript
const badges = await client.getBadges(address);

const sortedBadges = badges.badges
  .filter(b => b.earnedAt)
  .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime());

console.log('Recent achievements:', sortedBadges.slice(0, 5));
```

---

## Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

try {
  const badge = await client.getBadge(address, 'invalid_badge');
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 404:
        console.log('Badge not found');
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

- [Scores Methods](./scores.md)
- [Metadata Methods](./metadata.md)
- [Badge Widget](../widgets/badge.md)
