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

### Response Type

```typescript
interface UserBadges {
  address: string;
  count: number;
  badges: Badge[];
}

interface Badge {
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earned: boolean;
  earnedAt?: string;  // ISO 8601 date
  progress?: number;  // 0-100 percentage
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
  const status = badge.earned ? 'Earned' : `${badge.progress}% progress`;
  console.log(`${badge.title} (${badge.tier}) - ${status}`);
});
```

### Badge Tiers

| Tier | Description | Color |
|------|-------------|-------|
| `bronze` | Entry-level achievement | #CD7F32 |
| `silver` | Intermediate achievement | #C0C0C0 |
| `gold` | Advanced achievement | #FFD700 |
| `platinum` | Expert achievement | #E5E4E2 |
| `diamond` | Legendary achievement | #B9F2FF |

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

### Response Type

```typescript
interface SpecificUserBadge {
  address: string;
  badge: Badge;
  definition: BadgeDefinition;
}

interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: string;
  requirements: string;
  order: number;
  active: boolean;
}
```

### Example

```typescript
const badge = await client.getBadge(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  'governance_voter'
);

console.log(`Badge: ${badge.badge.title}`);
console.log(`Tier: ${badge.badge.tier}`);
console.log(`Earned: ${badge.badge.earned ? 'Yes' : 'No'}`);

if (badge.badge.earned) {
  console.log(`Earned on: ${badge.badge.earnedAt}`);
}

console.log(`Requirements: ${badge.definition.requirements}`);
```

### Common Badge Keys

| Key | Title | Tier |
|-----|-------|------|
| `relay_chain_initiate` | Relay Chain Initiate | Bronze |
| `governance_voter` | Governance Voter | Silver |
| `parachain_explorer` | Parachain Explorer | Gold |
| `identity_verified` | Identity Verified | Silver |
| `staking_champion` | Staking Champion | Platinum |

---

## Filtering Badges

### By Earned Status

```typescript
const badges = await client.getBadges(address);

const earnedBadges = badges.badges.filter(b => b.earned);
const inProgressBadges = badges.badges.filter(b => !b.earned && b.progress > 0);
const lockedBadges = badges.badges.filter(b => !b.earned && (!b.progress || b.progress === 0));

console.log(`Earned: ${earnedBadges.length}`);
console.log(`In Progress: ${inProgressBadges.length}`);
console.log(`Locked: ${lockedBadges.length}`);
```

### By Tier

```typescript
const badges = await client.getBadges(address);

const tierOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
const sortedBadges = badges.badges.sort((a, b) =>
  tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
);
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
