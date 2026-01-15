# Basic Usage Examples

Get started quickly with these simple examples.

## Quick Start - Widget

The fastest way to display reputation data:

```html
<!DOCTYPE html>
<html>
<head>
  <title>DotPassport Widget</title>
</head>
<body>
  <div id="widget"></div>

  <script type="module">
    import { createWidget } from '@dotpassport/sdk';

    createWidget({
      apiKey: 'your_api_key',
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      type: 'reputation'
    }).mount('#widget');
  </script>
</body>
</html>
```

---

## Quick Start - API Client

Fetch reputation data programmatically:

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'your_api_key'
});

// Get reputation scores
const scores = await client.getScores('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

console.log('Total Score:', scores.totalScore);
console.log('Calculated At:', scores.calculatedAt);
```

---

## Widget Types

### Reputation Widget

Shows overall reputation score with category breakdown:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  showCategories: true,
  maxCategories: 6
}).mount('#container');
```

### Badge Widget

Displays earned achievement badges:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  maxBadges: 8,
  showProgress: true
}).mount('#container');
```

### Profile Widget

Shows user profile with identity information:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  showIdentities: true,
  showSocials: true,
  showBio: true
}).mount('#container');
```

### Category Widget

Displays a specific reputation category:

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'category',
  categoryKey: 'governance'
}).mount('#container');
```

---

## API Methods

### Get Scores

```typescript
const scores = await client.getScores(address);

// Response
{
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  totalScore: 847,
  calculatedAt: '2025-01-12T10:30:00Z',
  categories: {
    longevity: { title: 'Account Longevity', score: 85, reason: 'Account active for 3+ years' },
    governance: { title: 'Governance', score: 72, reason: 'Active voter in referenda' },
    // ... more categories
  },
  source: 'api'
}
```

### Get Badges

```typescript
const badges = await client.getBadges(address);

// Response
{
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  badges: [
    { badgeKey: 'early_adopter', achievedLevel: 2, achievedLevelKey: 'gold', achievedLevelTitle: 'Gold Early Adopter', earnedAt: '2024-06-15T10:00:00Z' },
    { badgeKey: 'voter', achievedLevel: 1, achievedLevelKey: 'bronze', achievedLevelTitle: 'Active Voter', earnedAt: '2024-08-20T14:30:00Z' },
    // ... more badges
  ],
  count: 12,
  source: 'api'
}
```

### Get Profile

```typescript
const profile = await client.getProfile(address);

// Response
{
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  displayName: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
  bio: 'Polkadot enthusiast',
  socialLinks: { twitter: 'https://twitter.com/alice', github: 'https://github.com/alice' },
  polkadotIdentities: [
    { address: '1...', display: 'Alice', twitter: '@alice' }
  ],
  nftCount: 5,
  source: 'api'
}
```

---

## React Example

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

function ReputationWidget({ address }: { address: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address,
      type: 'reputation'
    });

    widget.mount(containerRef.current);

    return () => widget.destroy();
  }, [address]);

  return <div ref={containerRef} />;
}

// Usage
<ReputationWidget address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" />
```

---

## Vue Example

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const props = defineProps(['address']);
const container = ref(null);
let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: props.address,
    type: 'reputation'
  });
  widget.mount(container.value);
});

onUnmounted(() => {
  widget?.destroy();
});
</script>
```

---

## Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

try {
  const scores = await client.getScores(address);
  console.log(scores);
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 404:
        console.log('Address not found');
        break;
      case 401:
        console.log('Invalid API key');
        break;
      case 429:
        console.log('Rate limited, please wait');
        break;
      default:
        console.log('Error:', error.message);
    }
  }
}
```

---

## Themes

```typescript
// Light theme (default)
createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  theme: 'light'
});

// Dark theme
createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  theme: 'dark'
});

// Auto (follows system preference)
createWidget({
  apiKey: 'your_api_key',
  address: address,
  type: 'reputation',
  theme: 'auto'
});
```

---

## Related

- [Custom Themes](./custom-themes.md)
- [Dynamic Updates](./dynamic-updates.md)
- [Multiple Widgets](./multiple-widgets.md)
