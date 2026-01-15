# Badge Widget

Display badges earned by a user.

<div align="center">
  <img src="https://i.ibb.co/Wp7Q7408/dotpassport-badge-widget-light.png" alt="Badge Widget Light" width="300" />
  <img src="https://i.ibb.co/Pvwj1qQR/dotpassport-badge-widget-dark.png" alt="Badge Widget Dark" width="300" />
</div>

## Quick Start

```typescript
import { createWidget } from '@dotpassport/sdk';

const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge'
});

widget.mount('#container');
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your DotPassport API key |
| `address` | `string` | *required* | Polkadot address to display |
| `type` | `'badge' \| 'badges'` | *required* | Widget type |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `badgeKey` | `string` | - | Show single specific badge |
| `maxBadges` | `number` | `6` | Max badges to display |
| `showProgress` | `boolean` | `false` | Show earned dates |
| `className` | `string` | `''` | Custom CSS class |
| `baseUrl` | `string` | - | Custom API base URL |
| `onLoad` | `() => void` | - | Callback when loaded |
| `onError` | `(error: Error) => void` | - | Error callback |

---

## Examples

### All Badges

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  maxBadges: 10
}).mount('#container');
```

### With Earned Dates

<div align="center">
  <img src="https://i.ibb.co/pjtrCbtR/dotpassport-badge-widget-light-with-date.png" alt="Badge Widget with Dates" width="400" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  showProgress: true
}).mount('#container');
```

### Single Badge

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  badgeKey: 'governance_voter'
}).mount('#container');
```

### Limited Display

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  maxBadges: 4,
  showProgress: false
}).mount('#container');
```

### Dark Theme

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  theme: 'dark'
}).mount('#container');
```

---

## React Integration

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

interface BadgeWidgetProps {
  address: string;
  maxBadges?: number;
  theme?: 'light' | 'dark' | 'auto';
}

function BadgeWidget({ address, maxBadges = 6, theme = 'light' }: BadgeWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: process.env.REACT_APP_DOTPASSPORT_API_KEY!,
      address,
      type: 'badge',
      theme,
      maxBadges,
      showProgress: true
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address, theme, maxBadges]);

  return <div ref={containerRef} />;
}
```

---

## Vue Integration

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createWidget } from '@dotpassport/sdk';

const props = defineProps({
  address: { type: String, required: true },
  maxBadges: { type: Number, default: 6 }
});

const container = ref(null);
let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: props.address,
    type: 'badge',
    maxBadges: props.maxBadges
  });
  widget.mount(container.value);
});

onUnmounted(() => widget?.destroy());

watch(() => props.address, (newAddress) => {
  widget?.update({ address: newAddress });
});
</script>
```

---

## Badge Tiers

Badges are displayed with tier-based styling:

| Tier | Color | Description |
|------|-------|-------------|
| Bronze | #CD7F32 | Entry-level achievements |
| Silver | #C0C0C0 | Intermediate achievements |
| Gold | #FFD700 | Advanced achievements |
| Platinum | #E5E4E2 | Expert achievements |
| Diamond | #B9F2FF | Legendary achievements |

---

## Event Handling

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'badge',
  onLoad: () => {
    console.log('Badges loaded');
  },
  onError: (error) => {
    console.error('Failed to load badges:', error);
  }
});
```

---

## Dynamic Updates

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: initialAddress,
  type: 'badge'
});

widget.mount('#container');

// Update when address changes
function onAddressChange(newAddress: string) {
  widget.update({ address: newAddress });
}

// Refresh badges
function refreshBadges() {
  widget.refresh();
}
```

---

## Related

- [Reputation Widget](./reputation.md)
- [Profile Widget](./profile.md)
- [Lifecycle Methods](./lifecycle.md)
- [Badges API Methods](../api-client/badges.md)
