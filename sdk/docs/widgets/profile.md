# Profile Widget

Display a user's profile card with identity and social information.

<div align="center">
  <img src="https://i.ibb.co/bMmjMXp2/dotpassport-profile-widget.png" alt="Profile Widget" width="400" />
</div>

## Quick Start

```typescript
import { createWidget } from '@dotpassport/sdk';

const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile'
});

widget.mount('#container');
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your DotPassport API key |
| `address` | `string` | *required* | Polkadot address to display |
| `type` | `'profile'` | *required* | Widget type |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `showAvatar` | `boolean` | `true` | Display user avatar |
| `showBio` | `boolean` | `true` | Display user bio |
| `showSocials` | `boolean` | `true` | Display social links |
| `showIdentities` | `boolean` | `true` | Display chain identities |
| `compact` | `boolean` | `false` | Compact display mode |
| `className` | `string` | `''` | Custom CSS class |
| `onLoad` | `() => void` | - | Callback when loaded |
| `onError` | `(error: Error) => void` | - | Error callback |

---

## Examples

### Full Profile

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  showAvatar: true,
  showBio: true,
  showSocials: true,
  showIdentities: true
}).mount('#container');
```

### Avatar and Name Only

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  showAvatar: true,
  showBio: false,
  showSocials: false,
  showIdentities: false,
  compact: true
}).mount('#container');
```

### With Social Links

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  showSocials: true,
  showIdentities: false
}).mount('#container');
```

### Dark Theme

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  theme: 'dark'
}).mount('#container');
```

---

## React Integration

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

interface ProfileWidgetProps {
  address: string;
  theme?: 'light' | 'dark' | 'auto';
  compact?: boolean;
}

function ProfileWidget({ address, theme = 'light', compact = false }: ProfileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: process.env.REACT_APP_DOTPASSPORT_API_KEY!,
      address,
      type: 'profile',
      theme,
      compact,
      showAvatar: true,
      showBio: !compact,
      showSocials: !compact
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address, theme, compact]);

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
  theme: { type: String, default: 'light' },
  showSocials: { type: Boolean, default: true }
});

const container = ref(null);
let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: props.address,
    type: 'profile',
    theme: props.theme,
    showSocials: props.showSocials
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

## Profile Data

The profile widget displays:

### User Information
- **Display Name**: On-chain identity name
- **Avatar**: Profile picture (if set)
- **Bio**: User description

### Social Links
- Twitter/X
- GitHub
- Discord
- Telegram
- Email
- Website

### Chain Identities
- Polkadot identity
- Kusama identity
- Other parachain identities

---

## Event Handling

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  onLoad: () => {
    console.log('Profile loaded');
  },
  onError: (error) => {
    console.error('Failed to load profile:', error);
    // Show fallback UI for users without profiles
  }
});
```

---

## Handling Missing Profiles

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'profile',
  onError: (error) => {
    // User may not have a DotPassport profile yet
    document.getElementById('container').innerHTML = `
      <div class="no-profile">
        <p>This address doesn't have a DotPassport profile yet.</p>
        <a href="https://dotpassport.com/create">Create Profile</a>
      </div>
    `;
  }
});
```

---

## Related

- [Reputation Widget](./reputation.md)
- [Badge Widget](./badge.md)
- [Lifecycle Methods](./lifecycle.md)
- [Profile API Methods](../api-client/profile.md)
