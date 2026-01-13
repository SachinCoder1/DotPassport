# Reputation Widget

Display a user's total reputation score with optional category breakdown.

<div align="center">
  <img src="https://i.ibb.co/fVxDyQFJ/dotpassport-reputation-widget-light.png" alt="Reputation Widget Light" width="300" />
  <img src="https://i.ibb.co/chgG04Ws/dotpassport-reputation-widget-dark.png" alt="Reputation Widget Dark" width="300" />
</div>

## Quick Start

```typescript
import { createWidget } from '@dotpassport/sdk';

const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
});

widget.mount('#container');
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your DotPassport API key |
| `address` | `string` | *required* | Polkadot address to display |
| `type` | `'reputation'` | *required* | Widget type |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Color theme |
| `showCategories` | `boolean` | `true` | Show category breakdown |
| `maxCategories` | `number` | `6` | Max categories to display |
| `compact` | `boolean` | `false` | Compact display mode |
| `className` | `string` | `''` | Custom CSS class |
| `onLoad` | `() => void` | - | Callback when loaded |
| `onError` | `(error: Error) => void` | - | Error callback |

---

## Examples

### Basic Usage

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation'
}).mount('#container');
```

### With Categories

<div align="center">
  <img src="https://i.ibb.co/nsYfjx3g/dotpassport-reputation-widget-6-category-light.png" alt="Reputation with Categories" width="400" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  showCategories: true,
  maxCategories: 6
}).mount('#container');
```

### Score Only (Compact)

<div align="center">
  <img src="https://i.ibb.co/bMZ6FBHH/dotpassport-reputation-widget-only-reputation-score-light.png" alt="Score Only" width="300" />
</div>

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  showCategories: false,
  compact: true
}).mount('#container');
```

### Dark Theme

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  theme: 'dark',
  showCategories: true
}).mount('#container');
```

### Auto Theme (System Preference)

```typescript
createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  theme: 'auto' // Follows system preference
}).mount('#container');
```

---

## React Integration

```tsx
import { useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

function ReputationWidget({ address, theme = 'light' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ReturnType<typeof createWidget>>();

  useEffect(() => {
    if (!containerRef.current) return;

    widgetRef.current = createWidget({
      apiKey: process.env.REACT_APP_DOTPASSPORT_API_KEY!,
      address,
      type: 'reputation',
      theme,
      showCategories: true
    });

    widgetRef.current.mount(containerRef.current);

    return () => widgetRef.current?.destroy();
  }, [address, theme]);

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
  theme: { type: String, default: 'light' }
});

const container = ref(null);
let widget = null;

onMounted(() => {
  widget = createWidget({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
    address: props.address,
    type: 'reputation',
    theme: props.theme
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

## Event Handling

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  type: 'reputation',
  onLoad: () => {
    console.log('Reputation widget loaded');
    document.getElementById('loading')?.remove();
  },
  onError: (error) => {
    console.error('Widget error:', error);
    // Show fallback UI
  }
});
```

---

## Dynamic Updates

```typescript
const widget = createWidget({
  apiKey: 'your_api_key',
  address: initialAddress,
  type: 'reputation'
});

widget.mount('#container');

// Update address when wallet changes
walletProvider.on('accountChanged', (newAddress) => {
  widget.update({ address: newAddress });
});

// Toggle theme
themeToggle.addEventListener('click', () => {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  widget.update({ theme: newTheme });
});

// Refresh data
refreshButton.addEventListener('click', () => {
  widget.refresh();
});
```

---

## Related

- [Badge Widget](./badge.md)
- [Profile Widget](./profile.md)
- [Category Widget](./category.md)
- [Lifecycle Methods](./lifecycle.md)
- [Theming & Customization](./theming.md)
